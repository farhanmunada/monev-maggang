"use client";

import { useEffect, useState } from "react";
import { 
  BookOpen, TrendingUp, Calendar, ArrowRight, FileText, CheckCircle2, 
  Clock, Flame, Zap, Award, Trophy, Star, ShieldCheck, Sparkles, Target,
  Gift, Check, Lock, PartyPopper, RefreshCw, Compass
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { 
  calculateStreak, 
  calculateLevelAndExp, 
  getInteractiveQuests, 
  generateHeatmap,
  formatYMD 
} from "@/lib/gamification";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLogs: 0,
    totalActivities: 0,
    attendanceRate: 100,
  });

  const [gamification, setGamification] = useState({
    streak: { count: 0, isActiveToday: false, isSunday: false, message: "" },
    level: { currentLevel: 1, title: "Trainee Intern", totalExp: 0, minExp: 0, maxExp: 150, progressPercent: 0, color: "from-blue-500 to-cyan-500", badgeColor: "bg-blue-100 text-blue-700" },
    quests: [],
    heatmap: []
  });
  
  const [recentLogs, setRecentLogs] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gamifikasi Interaktif: Daily Chest & Claimed Quests
  const [dailyChest, setDailyChest] = useState(() => {
    if (typeof window === "undefined") return { opened: false, exp: 0, message: "" };
    try {
      const saved = localStorage.getItem(`monev_chest_${formatYMD(new Date())}`);
      return saved ? JSON.parse(saved) : { opened: false, exp: 0, message: "" };
    } catch {
      return { opened: false, exp: 0, message: "" };
    }
  });

  const [claimedQuestIds, setClaimedQuestIds] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(`monev_claimed_quests_${formatYMD(new Date())}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bonusExp, setBonusExp] = useState(() => {
    if (typeof window === "undefined") return 0;
    try {
      return parseInt(localStorage.getItem("monev_bonus_exp") || "0", 10);
    } catch {
      return 0;
    }
  });

  const [isOpeningChest, setIsOpeningChest] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // Fetch logs
      const { data: logs, error: logsError } = await supabase
        .from("daily_logs")
        .select(`
          id, date, attendance, learning,
          activities ( id )
        `)
        .order("date", { ascending: false });
        
      if (logsError) throw logsError;

      // Fetch activities count
      const { count: actCount, error: actError } = await supabase
        .from("activities")
        .select("*", { count: 'exact', head: true });
        
      if (actError) throw actError;

      // Fetch Tasks
      const { data: allTasks, error: tasksError } = await supabase
        .from("notes")
        .select("*")
        .eq("type", "task")
        .order("created_at", { ascending: false });
        
      if (tasksError) throw tasksError;

      const active = (allTasks || []).filter(t => t.status !== "done").slice(0, 4);
      const doneCount = (allTasks || []).filter(t => t.status === "done").length;
      setActiveTasks(active);

      // Hitung stats kehadiran
      const totalLogs = logs ? logs.length : 0;
      const totalActivities = actCount || 0;
      const presentLogs = logs ? logs.filter(l => l.attendance === "Hadir").length : 0;
      const attendanceRate = totalLogs > 0 ? Math.round((presentLogs / totalLogs) * 100) : 100;
      const learningCount = logs ? logs.filter(l => l.learning && l.learning.length > 50).length : 0;

      setStats({ totalLogs, totalActivities, attendanceRate });
      
      if (logs) {
        setRecentLogs(logs.slice(0, 3));
      }

      // Ambil data hari ini untuk kalkulasi quest
      const todayDateStr = formatYMD(new Date());
      const todayLog = (logs || []).find(l => l.date === todayDateStr);
      let todayActsCount = 0;
      if (todayLog) {
        todayActsCount = todayLog.activities ? todayLog.activities.length : 0;
      }

      // Hitung log minggu ini (7 hari terakhir)
      const weekLogsCount = (logs || []).filter(l => {
        const diffDays = (new Date() - new Date(l.date)) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }).length;

      // Hitung Gamifikasi
      let currentBonus = 0;
      let currentClaimed = [];
      try {
        currentBonus = parseInt(localStorage.getItem("monev_bonus_exp") || "0", 10);
        currentClaimed = JSON.parse(localStorage.getItem(`monev_claimed_quests_${todayDateStr}`) || "[]");
      } catch {
        // fallback
      }

      const streak = calculateStreak(logs || []);
      const level = calculateLevelAndExp(totalLogs, totalActivities, learningCount, doneCount, currentBonus);
      const quests = getInteractiveQuests({
        todayLog,
        todayActivitiesCount: todayActsCount,
        doneTasksTodayCount: doneCount,
        weekLogsCount,
        claimedQuestIds: currentClaimed
      });
      const heatmap = generateHeatmap(logs || [], 28);

      setGamification({ streak, level, quests, heatmap });

    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const completeTask = async (taskId) => {
    try {
      setActiveTasks(prev => prev.filter(t => t.id !== taskId));
      const { error } = await supabase.from("notes").update({ status: "done" }).eq("id", taskId);
      if (error) throw error;
      toast.success("Task diselesaikan! (+10 EXP 🎯)");
      // Refresh data gamifikasi
      fetchDashboardData();
    } catch (err) {
      console.error("Error completing task:", err);
      toast.error("Gagal menyelesaikan task");
    }
  };

  const todayStr = formatYMD(new Date());

  // Handler Interaktif: Klaim Misi (Quest Claim)
  const handleClaimQuest = (quest) => {
    if (quest.isClaimed || !quest.isCompleted) return;

    try {
      const newClaimed = [...claimedQuestIds, quest.id];
      setClaimedQuestIds(newClaimed);
      localStorage.setItem(`monev_claimed_quests_${todayStr}`, JSON.stringify(newClaimed));

      const newBonus = bonusExp + quest.rewardExp;
      setBonusExp(newBonus);
      localStorage.setItem("monev_bonus_exp", newBonus.toString());

      toast.success(`Misi "${quest.title}" selesai! Kamu mengklaim +${quest.rewardExp} EXP 🎉`, {
        icon: "✨",
        duration: 4000
      });

      // Update quests state secara instan
      setGamification(prev => ({
        ...prev,
        level: calculateLevelAndExp(stats.totalLogs, stats.totalActivities, 0, 0, newBonus),
        quests: prev.quests.map(q => q.id === quest.id ? { ...q, isClaimed: true } : q)
      }));

      // Refresh data lengkap di background
      fetchDashboardData();
    } catch (e) {
      console.error("Claim error:", e);
      toast.error("Gagal mengklaim misi");
    }
  };

  // Handler Interaktif: Buka Peti Hadiah Harian
  const handleOpenChest = () => {
    if (dailyChest.opened) return;

    const isSunday = new Date().getDay() === 0;
    const hasLoggedToday = gamification.streak.isActiveToday;

    // Jika bukan hari Minggu dan belum mengisi jurnal
    if (!isSunday && !hasLoggedToday) {
      toast.error("Isi jurnal magang hari ini dulu untuk membuka Peti Kejutan!", {
        icon: "🔒"
      });
      return;
    }

    setIsOpeningChest(true);

    setTimeout(() => {
      // Generate bonus EXP acak 25 - 50 EXP
      const randomExp = Math.floor(Math.random() * 26) + 25;
      const quotes = [
        "Konsistensi harianmu hari ini adalah kunci kesuksesan karir masa depanmu!",
        "Langkah kecil setiap hari menghasilkan lompatan karir yang besar!",
        "Kerja cerdas dan kedisiplinan selalu membawa hasil terbaik!",
        "Terus berproses! Setiap catatan magang adalah bukti dedikasimu."
      ];
      const selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];

      const chestData = {
        opened: true,
        exp: randomExp,
        message: selectedQuote,
        isSunday
      };

      setDailyChest(chestData);
      localStorage.setItem(`monev_chest_${todayStr}`, JSON.stringify(chestData));

      const newBonus = bonusExp + randomExp;
      setBonusExp(newBonus);
      localStorage.setItem("monev_bonus_exp", newBonus.toString());

      setIsOpeningChest(false);
      toast.success(`🎉 Peti Hadiah Terbuka! Kamu mendapatkan +${randomExp} EXP Bonus!`, {
        duration: 5000,
        icon: "🎁"
      });

      // Refresh data
      fetchDashboardData();
    }, 700);
  };

  const isSundayToday = gamification.streak.isSunday || new Date().getDay() === 0;
  const isChestReady = dailyChest.opened ? false : (isSundayToday || gamification.streak.isActiveToday);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header Salam */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            Selamat Datang, <br className="md:hidden" /> Peserta Magang
          </h1>
          <p className="text-secondary text-sm md:text-base mt-1">
            Pantau perkembangan magang, jalankan misi harian, dan kumpulkan EXP setiap hari.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-2xl text-xs md:text-sm font-semibold text-secondary shadow-xs">
          <Calendar className="w-4 h-4 text-primary-600" />
          <span>{new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </header>

      {/* GAMIFICATION HERO BANNER: STREAK & LEVEL EXP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Card Level & EXP (2 Kolom di Desktop) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <Trophy className="w-64 h-64 -mr-12 -mt-12 text-white" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                Level {gamification.level.currentLevel} • {gamification.level.title}
              </span>

              <span className="text-sm font-semibold text-indigo-200">
                Total {gamification.level.totalExp} EXP
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-white mb-1">
              Progres Magang Anda
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mb-6">
              Tingkatkan level dengan menyelesaikan jurnal (+50 EXP), aktivitas (+15 EXP), misi interaktif & peti harian.
            </p>

            {/* EXP Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>EXP Menuju Level Berikutnya</span>
                <span>{gamification.level.progressPercent}% ({gamification.level.totalExp} / {gamification.level.maxExp})</span>
              </div>
              <div className="w-full h-3.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${gamification.level.color} transition-all duration-1000 shadow-md shadow-indigo-500/50`}
                  style={{ width: `${gamification.level.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick EXP tags */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2 text-[11px] text-slate-300 relative z-10">
            <span className="bg-white/5 px-2.5 py-1 rounded-lg">Jurnal: +{gamification.level.expBreakdown?.fromLogs || 0} EXP</span>
            <span className="bg-white/5 px-2.5 py-1 rounded-lg">Aktivitas: +{gamification.level.expBreakdown?.fromActs || 0} EXP</span>
            <span className="bg-white/5 px-2.5 py-1 rounded-lg">Refleksi: +{gamification.level.expBreakdown?.fromLearning || 0} EXP</span>
            <span className="bg-white/5 px-2.5 py-1 rounded-lg">Task: +{gamification.level.expBreakdown?.fromTasks || 0} EXP</span>
            {bonusExp > 0 && (
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-lg font-bold">
                Bonus Misi & Peti: +{bonusExp} EXP ✨
              </span>
            )}
          </div>
        </div>

        {/* Card Streak Harian dengan Sunday Shield (1 Kolom) */}
        <div className={`rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden flex flex-col justify-between ${
          isSundayToday 
            ? "bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 shadow-emerald-500/20" 
            : "bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-orange-500/20"
        }`}>
          <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none">
            {isSundayToday ? (
              <ShieldCheck className="w-48 h-48 -mr-10 -mb-10 text-white" />
            ) : (
              <Flame className="w-48 h-48 -mr-10 -mb-10 text-white" />
            )}
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-black/20 backdrop-blur-md">
                {isSundayToday ? "Sunday Shield" : "Daily Streak"}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                isSundayToday 
                  ? "bg-white text-emerald-700 shadow-sm"
                  : gamification.streak.isActiveToday 
                    ? "bg-white text-orange-600 shadow-sm" 
                    : "bg-black/30 text-white"
              }`}>
                {isSundayToday 
                  ? "🏖️ Hari Libur Resmi" 
                  : gamification.streak.isActiveToday 
                    ? "✓ Aktif Hari Ini" 
                    : "Belum Isi"}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl md:text-6xl font-black tracking-tight">
                {gamification.streak.count}
              </span>
              <span className="text-xl font-bold opacity-90">Hari Beruntun</span>
            </div>

            <p className="text-xs md:text-sm text-white/90 leading-relaxed mb-4">
              {gamification.streak.message}
            </p>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/20">
            {isSundayToday ? (
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-2.5 text-center text-xs font-semibold text-white/95">
                Istirahat dulu! Streak Anda aman hingga hari Senin.
              </div>
            ) : (
              <Link 
                href="/daily-log"
                className="inline-flex items-center justify-center gap-1.5 w-full bg-white text-orange-600 hover:bg-orange-50 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-md transition-colors"
              >
                <Flame className="w-4 h-4 fill-orange-600" />
                {gamification.streak.isActiveToday ? "Update Jurnal Hari Ini" : "Isi Jurnal Sekarang"}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Ringkasan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard 
          title="Total Jurnal" 
          value={loading ? "-" : stats.totalLogs} 
          icon={<BookOpen className="w-6 h-6 text-primary-500" />} 
          color="bg-primary-50"
        />
        <StatCard 
          title="Total Aktivitas" 
          value={loading ? "-" : stats.totalActivities} 
          icon={<TrendingUp className="w-6 h-6 text-green-500" />} 
          color="bg-green-50"
        />
        <StatCard 
          title="Tingkat Kehadiran" 
          value={loading ? "-" : `${stats.attendanceRate}%`} 
          icon={<Calendar className="w-6 h-6 text-purple-500" />} 
          color="bg-purple-50"
        />
      </div>

      {/* HEATMAP AKTIVITAS 4 MINGGU (GITHUB-STYLE DENGAN PENANDA MINGGU LIBUR) */}
      <div className="bg-card rounded-3xl border border-border shadow-sm p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Matriks Aktivitas (4 Minggu Terakhir)
            </h2>
            <p className="text-xs text-secondary mt-0.5">Visualisasi konsistensi catatan magang Anda. Hari Minggu ditandai libur resmi.</p>
          </div>
          <div className="flex items-center flex-wrap gap-2 text-xs text-secondary">
            <span className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 rounded-md bg-amber-50 border border-amber-300"></div>
              <span>Minggu (Libur)</span>
            </span>
            <span className="flex items-center gap-1 ml-2">
              <span>Kosong</span>
              <div className="w-3.5 h-3.5 rounded-md bg-gray-100 border border-gray-200"></div>
              <div className="w-3.5 h-3.5 rounded-md bg-green-200"></div>
              <div className="w-3.5 h-3.5 rounded-md bg-green-500"></div>
              <div className="w-3.5 h-3.5 rounded-md bg-green-700"></div>
              <span>Padat</span>
            </span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-2 pt-2">
          {gamification.heatmap.map((item, idx) => {
            let colorClass = "bg-gray-100 border-gray-200 text-gray-400";
            if (item.isSunday && item.count === 0) {
              colorClass = "bg-amber-50/70 border-amber-200 border-dashed text-amber-600";
            } else if (item.count >= 3) {
              colorClass = "bg-green-600 border-green-700 text-white shadow-sm";
            } else if (item.count === 2) {
              colorClass = "bg-green-400 border-green-500 text-white";
            } else if (item.count === 1) {
              colorClass = "bg-green-200 border-green-300 text-green-800";
            }

            return (
              <div 
                key={idx}
                title={`${item.date} (${item.dayName}): ${item.isSunday ? 'Hari Libur Resmi' : `${item.count} aktivitas`}`}
                className={`h-10 rounded-xl border flex flex-col items-center justify-center text-[10px] font-bold transition-transform hover:scale-110 cursor-pointer ${colorClass}`}
              >
                <span>{item.date.split("-")[2]}</span>
                {item.isSunday && item.count === 0 && (
                  <span className="text-[8px] font-medium opacity-70">Libur</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* GAMIFIKASI INTERAKTIF BARU: PETI HADIAH HARIAN & PAPAN MISI AKTIF */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* WIDGET 1: PETI HADIAH HARIAN INTERAKTIF (1 KOLOM) */}
        <div className="bg-gradient-to-b from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between border border-indigo-800/40">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <Gift className="w-44 h-44 -mr-6 -mt-6 text-indigo-300" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5" /> Peti Hadiah Harian
              </span>
              <span className="text-[11px] text-slate-300">
                {isSundayToday ? "Bonus Santai Minggu" : "Reset Tiap 24 Jam"}
              </span>
            </div>

            <div className="text-center py-4">
              {/* Animasi Peti */}
              <div className="relative inline-block mb-3">
                <div className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-5xl transition-all duration-300 shadow-2xl ${
                  dailyChest.opened
                    ? "bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 shadow-emerald-500/30"
                    : isChestReady
                      ? "bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-amber-500/40 animate-bounce cursor-pointer hover:scale-105"
                      : "bg-slate-800/60 border-2 border-slate-700 text-slate-500"
                }`}
                onClick={isChestReady ? handleOpenChest : undefined}
                >
                  {dailyChest.opened ? "🎁" : isChestReady ? "📦" : "🔒"}
                </div>
                {isChestReady && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                  </span>
                )}
              </div>

              <h3 className="text-lg font-extrabold text-white mb-1">
                {dailyChest.opened 
                  ? `Hadiah Terbuka (+${dailyChest.exp} EXP)!`
                  : isChestReady 
                    ? "Peti Kejutan Siap Dibuka!" 
                    : isSundayToday
                      ? "Buka Bonus Hari Minggu"
                      : "Peti Terkunci"}
              </h3>
              
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                {dailyChest.opened 
                  ? `"${dailyChest.message}"`
                  : isChestReady 
                    ? "Klik peti untuk mengklaim bonus EXP dan kutipan karir harian Anda!" 
                    : "Isi dan simpan jurnal harian Anda hari ini untuk membuka peti hadiah."}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            {dailyChest.opened ? (
              <div className="w-full py-2.5 px-4 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" /> Sudah Diklaim Hari Ini (+{dailyChest.exp} EXP)
              </div>
            ) : (
              <button
                onClick={handleOpenChest}
                disabled={!isChestReady || isOpeningChest}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                  isChestReady
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-amber-500/30 font-black cursor-pointer"
                    : "bg-white/10 text-slate-400 cursor-not-allowed border border-white/5"
                }`}
              >
                {isOpeningChest ? (
                  <>Membuka Peti Hadiah...</>
                ) : isChestReady ? (
                  <><Sparkles className="w-4 h-4" /> Buka Peti Sekarang</>
                ) : (
                  <><Lock className="w-4 h-4" /> Tulis Jurnal Untuk Membuka</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* WIDGET 2: PAPAN MISI & TANTANGAN INTERAKTIF (2 KOLOM) */}
        <div className="lg:col-span-2 bg-card rounded-3xl border border-border shadow-sm p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <div>
                <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary-600" /> Papan Misi & Tantangan Interaktif
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  Selesaikan aksi magang hari ini dan klik tombol untuk langsung mengklaim reward EXP!
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
                <PartyPopper className="w-3.5 h-3.5" />
                {gamification.quests.filter(q => q.isClaimed).length} / {gamification.quests.length} Misi Selesai
              </div>
            </div>

            {/* List Misi */}
            <div className="space-y-3">
              {gamification.quests.map((quest) => (
                <div 
                  key={quest.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    quest.isClaimed
                      ? "bg-gray-50/70 border-gray-200/80 opacity-70"
                      : quest.isCompleted
                        ? "bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border-emerald-300 shadow-sm"
                        : "bg-card border-border hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl p-1 bg-white rounded-xl shadow-xs border border-gray-100 flex-shrink-0">
                      {quest.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-xs md:text-sm text-foreground">{quest.title}</h4>
                        <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
                          quest.type === "daily" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                        }`}>
                          {quest.type === "daily" ? "Harian" : "Mingguan"}
                        </span>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.2 rounded-full">
                          +{quest.rewardExp} EXP
                        </span>
                      </div>
                      <p className="text-[11px] text-secondary mt-0.5 leading-snug">{quest.desc}</p>
                      
                      {/* Mini Progress */}
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-secondary">
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              quest.isCompleted ? "bg-emerald-500" : "bg-primary-500"
                            }`}
                            style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                          />
                        </div>
                        <span className="font-semibold">{quest.current} / {quest.target}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Klaim Interaktif */}
                  <div className="sm:self-center flex-shrink-0">
                    {quest.isClaimed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-200/80 px-3 py-1.5 rounded-xl">
                        <Check className="w-3.5 h-3.5" /> Diklaim
                      </span>
                    ) : quest.isCompleted ? (
                      <button
                        onClick={() => handleClaimQuest(quest)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110 px-4 py-1.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all animate-pulse cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Klaim +{quest.rewardExp} EXP
                      </button>
                    ) : (
                      <span className="inline-block text-center w-full sm:w-auto text-[11px] font-medium text-secondary bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
                        Belum Selesai
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Task Widget & Recent Jurnal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Widget */}
        <div className="bg-card rounded-3xl border border-border shadow-sm p-5 md:p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Task Aktif (+10 EXP)
            </h2>
            <Link href="/notes" className="text-xs md:text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Buka Board <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>)}
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="text-center py-8 text-secondary bg-gray-50/70 border border-dashed border-border rounded-2xl text-xs md:text-sm">
              Semua task sudah diselesaikan! 🎉
            </div>
          ) : (
            <div className="space-y-3">
              {activeTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 md:p-4 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors group">
                  <button 
                    onClick={() => completeTask(task.id)}
                    className="mt-0.5 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-gray-300 flex-shrink-0 group-hover:border-green-500 group-hover:bg-green-50 transition-colors flex items-center justify-center"
                    title="Tandai selesai"
                  >
                    <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-transparent group-hover:text-green-500" />
                  </button>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm line-clamp-1">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${task.status === 'in_progress' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                        {task.status === 'in_progress' ? 'In Progress' : 'To Do'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Jurnal Terbaru */}
        <div className="bg-card rounded-3xl border border-border shadow-sm p-5 md:p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" /> Jurnal Terbaru
            </h2>
            <Link href="/report" className="text-xs md:text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Lihat Absensi <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>)}
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="text-center py-8 text-secondary border border-dashed border-border rounded-2xl text-xs md:text-sm">
              Belum ada jurnal yang disimpan. Mulai tulis jurnal hari ini!
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <Link 
                  key={log.id} 
                  href="/report"
                  className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 text-primary-600 font-bold text-xs">
                      {log.attendance === "Hadir" ? "HD" : log.attendance.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground group-hover:text-primary-600 transition-colors">
                        Status: {log.attendance}
                      </p>
                      <p className="text-xs text-secondary">
                        {new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Action Banner */}
      <div>
        <Link 
          href="/report" 
          className="group relative overflow-hidden rounded-3xl bg-card border border-border p-6 md:p-8 text-foreground shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-bold mb-1">Absensi & Riwayat Laporan</h3>
            <p className="text-secondary text-xs md:text-sm">Rekapitulasi kehadiran lengkap & generate narasi laporan magang dengan AI.</p>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-primary-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
            Buka Laporan Magang <ArrowRight className="w-4 h-4" />
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300">
            <FileText className="w-32 h-32 -mr-6 -mb-6" />
          </div>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-card p-5 md:p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow group flex items-center gap-4">
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs md:text-sm font-medium text-secondary mb-0.5">{title}</p>
        <p className="text-2xl md:text-3xl font-extrabold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function ChevronRightIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
  );
}
