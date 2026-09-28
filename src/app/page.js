"use client";

import { useEffect, useState, useTransition } from "react";
import { 
  BookOpen, TrendingUp, Calendar, ArrowRight, FileText, CheckCircle2, 
  Clock, Flame, Zap, Trophy, Star, ShieldCheck, Sparkles, Target,
  Gift, Check, Lock, PartyPopper, RefreshCw, Compass, Skull, Swords, 
  MessageSquare, X, Share2, Volume2, Bot
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { 
  calculateStreak, 
  calculateLevelAndExp, 
  getInteractiveQuests, 
  generateHeatmap,
  formatYMD,
  calculateBossProgress,
  getMascotData,
  generateWeeklyWrapped
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

  const [boss, setBoss] = useState({
    bossName: "Lord Mager",
    subtitle: "Raja Penunda Pekerjaan",
    maxHp: 100,
    currentHp: 100,
    damageDealt: 0,
    isDefeated: false,
    bossQuote: "Yaelah baru kerja 15 menit udah buka Shopee...",
    progressPercent: 0
  });

  const [mascotQuoteIndex, setMascotQuoteIndex] = useState(0);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [weeklyWrapped, setWeeklyWrapped] = useState({
    weekTitle: "Magang Wrapped Minggu Ini",
    personaTitle: "Ahli Pura-Pura Sibuk",
    personaDescription: "Minggu ini lu bertahan hidup di tengah kerasnya dunia kerja nyata.",
    badgeColor: "from-cyan-500 to-blue-600",
    totalLogs: 0,
    totalActivities: 0,
    totalTasksDone: 0,
    funFact: "Tetap santai walau deadline mengejar."
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

  // Audio synthesizer bebas dependensi (Web Audio API)
  const playSoundEffect = (type = "claim") => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "boss") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch {
      // Audio fallback
    }
  };

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

      // Hitung log minggu ini
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
      const bossData = calculateBossProgress({ logs: logs || [], tasks: allTasks || [] });
      const wrappedData = generateWeeklyWrapped({ logs: logs || [], tasks: allTasks || [] });

      setGamification({ streak, level, quests, heatmap });
      setBoss(bossData);
      setWeeklyWrapped(wrappedData);

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
      playSoundEffect("boss");
      toast.success("Task kelar! Serangan -15 HP ke Lord Mager 💥 (+10 EXP)");
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

      playSoundEffect("claim");
      toast.success(`Misi "${quest.title}" selesai! Klaim +${quest.rewardExp} EXP berhasil 🎉`, {
        icon: "✨",
        duration: 4000
      });

      // Update quests state instan
      setGamification(prev => ({
        ...prev,
        level: calculateLevelAndExp(stats.totalLogs, stats.totalActivities, 0, 0, newBonus),
        quests: prev.quests.map(q => q.id === quest.id ? { ...q, isClaimed: true } : q)
      }));

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

    if (!isSunday && !hasLoggedToday) {
      toast.error("Isi jurnal magang hari ini dulu baru petinya mau kebuka, bang!", {
        icon: "🔒"
      });
      return;
    }

    setIsOpeningChest(true);

    setTimeout(() => {
      const randomExp = Math.floor(Math.random() * 26) + 25;
      const quotes = [
        "Kerja keras bagai kuda, padahal gaji cuma ucapan 'makasih banyak ya dek'.",
        "Satu baris kode hari ini, satu langkah lebih dekat menuju tanda tangan pembimbing.",
        "Masa depan cerah menanti mereka yang gak mager buka form daily log.",
        "Rebahan di hari kerja itu godaan, tapi streak putus itu penyesalan abadi."
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
      playSoundEffect("claim");
      toast.success(`🎉 Peti Hadiah Terbuka! +${randomExp} EXP Bonus masuk dompet!`, {
        duration: 5000,
        icon: "🎁"
      });

      fetchDashboardData();
    }, 600);
  };

  const isSundayToday = gamification.streak.isSunday || new Date().getDay() === 0;
  const isChestReady = dailyChest.opened ? false : (isSundayToday || gamification.streak.isActiveToday);

  // Data Maskot Si Maggy
  const mascot = getMascotData({
    isSunday: isSundayToday,
    hasLoggedToday: gamification.streak.isActiveToday,
    streakCount: gamification.streak.count
  });

  const currentMascotQuote = mascot.quotes[mascotQuoteIndex % mascot.quotes.length];

  const handleCycleMascotQuote = () => {
    setMascotQuoteIndex(prev => prev + 1);
    playSoundEffect("claim");
  };

  const copyWrappedToClipboard = () => {
    const text = `🎧 MAGANG WRAPPED MINGGU INI 🎧\n` +
      `Gelar: ${weeklyWrapped.personaTitle}\n` +
      `Catatan Jurnal: ${weeklyWrapped.totalLogs} hari\n` +
      `Aktivitas Terinput: ${weeklyWrapped.totalActivities} kegiatan\n` +
      `Task Selesai: ${weeklyWrapped.totalTasksDone} task\n` +
      `"${weeklyWrapped.personaDescription}"\n\n` +
      `Dipantau lewat InternTrack - Mode Bertahan Hidup Magang 🔥`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success("Rekap Magang Wrapped disalin ke clipboard! Siap pasang di status WA 🚀");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-14">
      
      {/* 1. HEADER SECTION (TONE GEN Z SARKAS & LIVE SPOTLIGHT) */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
              Mode Bertahan Hidup Magang
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Selamat Datang, Calon Pegawai Tetap
          </h1>
          <p className="text-secondary text-xs md:text-sm mt-0.5">
            Mencatat penderitaan harian magang demi secuil tanda tangan laporan akhir.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Tombol Magang Wrapped */}
          <button
            onClick={() => setIsWrappedOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3.5 py-2 rounded-2xl text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Magang Wrapped</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-md font-semibold">Mingguan</span>
          </button>

          {/* Badge Tanggal */}
          <div className="flex items-center gap-2 bg-card border border-border px-3.5 py-2 rounded-2xl text-xs font-medium text-secondary shadow-xs">
            <Calendar className="w-4 h-4 text-primary-600" />
            <span>{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })}</span>
          </div>
        </div>
      </header>

      {/* 2. DUAL HERO ZONE: COMMAND CENTER + MASKOT SI MAGGY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-stretch">
        
        {/* KOLOM KIRI (7/12): COMMAND CENTER (LEVEL, EXP & INTEGRATED STREAK) */}
        <div className="lg:col-span-7 bg-slate-900 text-white rounded-3xl p-6 md:p-7 shadow-xl relative overflow-hidden flex flex-col justify-between border border-slate-800">
          <div className="relative z-10 space-y-5">
            
            {/* Row Level & Streak Indicator */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  Level {gamification.level.currentLevel} • {gamification.level.title}
                </span>
              </div>

              {/* Sunday Shield Pill / Streak Pill */}
              <span className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                isSundayToday 
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                  : gamification.streak.isActiveToday 
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}>
                {isSundayToday ? (
                  <><ShieldCheck className="w-3.5 h-3.5" /> Sunday Shield (Aman)</>
                ) : (
                  <><Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {gamification.streak.count} Hari Streak</>
                )}
              </span>
            </div>

            {/* EXP Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                <span>Progress EXP ({gamification.level.totalExp} Total EXP)</span>
                <span className="font-bold text-white">{gamification.level.progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${gamification.level.color} transition-all duration-1000 shadow-sm`}
                  style={{ width: `${gamification.level.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Pesan Streak / Sunday Shield Realita */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
              {isSundayToday 
                ? "🏖️ Hari Minggu libur resmi! Streak dari Sabtu aman terjaga ke Senin. Rebahanlah wahai anak magang."
                : gamification.streak.message}
            </p>
          </div>

          {/* Satu-Satunya Tombol Utama Aksi Jurnal */}
          <div className="relative z-10 pt-5 mt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {isSundayToday ? "Pengisian hari ini opsional" : "Sesi input log buka sampai 23:59 WIB"}
            </span>
            <Link 
              href="/daily-log"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-primary-600 to-indigo-600 hover:brightness-110 text-white px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-md transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              {gamification.streak.isActiveToday ? "Update Jurnal Hari Ini" : "Isi Jurnal Sekarang"}
            </Link>
          </div>
        </div>

        {/* KOLOM KANAN (5/12): MASKOT INTERAKTIF "SI MAGGY" */}
        <div className="lg:col-span-5 bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <h3 className="font-extrabold text-sm text-foreground">Si Maggy (Career Companion)</h3>
            </div>
            <span className="text-[10px] text-secondary font-semibold bg-gray-100 px-2 py-0.5 rounded-full">
              Sarkas & Relatable
            </span>
          </div>

          {/* Area Interaktif Avatar & Speech Bubble */}
          <div className="my-auto py-3">
            <div className="flex items-start gap-3.5">
              <div 
                onClick={handleCycleMascotQuote}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 flex items-center justify-center text-3xl shadow-sm cursor-pointer hover:scale-110 active:scale-95 transition-transform flex-shrink-0 select-none"
                title="Klik untuk colek Si Maggy!"
              >
                {mascot.avatar}
              </div>

              {/* Speech Bubble */}
              <div className="relative bg-primary-50/70 border border-primary-100 rounded-2xl p-3.5 text-xs text-primary-950 font-medium leading-relaxed shadow-xs flex-1">
                <p>&ldquo;{currentMascotQuote}&rdquo;</p>
                <div className="w-2.5 h-2.5 bg-primary-50 border-l border-b border-primary-100 transform rotate-45 absolute -left-1.5 top-5"></div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-secondary">
            <span>Capek mental? Colek dia:</span>
            <button
              onClick={handleCycleMascotQuote}
              className="font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Ganti Curhatan
            </button>
          </div>
        </div>

      </div>

      {/* 3. ARENA MINGGUAN: MINI BOSS BATTLE ("LORD MAGER") */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 md:p-7 shadow-xl border border-purple-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-2xl shadow-inner">
              {boss.isDefeated ? "💀" : "👾"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.2 rounded-md">
                  Weekly Boss Battle
                </span>
                <span className="text-xs text-purple-300">Reset Tiap Senin</span>
              </div>
              <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2 mt-0.5">
                {boss.bossName} <span className="text-xs text-slate-300 font-normal">({boss.subtitle})</span>
              </h2>
            </div>
          </div>

          {/* Sisa HP */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Boss HP:</span>
            <span className={`text-base font-black px-3 py-1 rounded-xl border ${
              boss.isDefeated 
                ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                : "bg-rose-500/20 border-rose-400 text-rose-300"
            }`}>
              {boss.currentHp} / {boss.maxHp} HP
            </span>
          </div>
        </div>

        {/* Boss HP Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-purple-900/60">
            <div 
              className={`h-full rounded-full transition-all duration-700 shadow-md ${
                boss.isDefeated 
                  ? "bg-emerald-500" 
                  : boss.currentHp < 40 
                    ? "bg-gradient-to-r from-amber-500 to-rose-600" 
                    : "bg-gradient-to-r from-purple-500 to-rose-500"
              }`}
              style={{ width: `${Math.max(4, 100 - boss.progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Quote Boss & Damage Rule */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-purple-900/40 text-xs">
          <div className="md:col-span-2 bg-purple-950/50 p-3 rounded-2xl border border-purple-800/40 text-purple-200 italic">
            &ldquo;{boss.bossQuote}&rdquo;
          </div>
          <div className="flex items-center justify-around bg-slate-800/50 p-2.5 rounded-2xl border border-slate-700/60 text-[11px] text-slate-300">
            <span>Log: <b>-20 HP</b></span>
            <span>•</span>
            <span>Aktivitas: <b>-8 HP</b></span>
            <span>•</span>
            <span>Task: <b>-15 HP</b></span>
          </div>
        </div>
      </div>

      {/* 4. GAMIFIKASI INTERAKTIF: PETI HARIAN & PAPAN MISI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PETI HADIAH HARIAN (1 KOLOM) */}
        <div className="bg-gradient-to-b from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between border border-indigo-800/40">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5" /> Peti Hadiah Harian
              </span>
              <span className="text-[11px] text-slate-300">
                {isSundayToday ? "Bonus Santai Minggu" : "Reset Tiap Hari"}
              </span>
            </div>

            <div className="text-center py-4">
              <div className="relative inline-block mb-3">
                <div 
                  className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-5xl transition-all duration-300 shadow-2xl ${
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
              </div>

              <h3 className="text-base md:text-lg font-extrabold text-white mb-1">
                {dailyChest.opened 
                  ? `Hadiah Terbuka (+${dailyChest.exp} EXP)!`
                  : isChestReady 
                    ? "Peti Siap Dibuka!" 
                    : isSundayToday
                      ? "Buka Bonus Santai Minggu"
                      : "Peti Masih Terkunci"}
              </h3>
              
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                {dailyChest.opened 
                  ? `"${dailyChest.message}"`
                  : isChestReady 
                    ? "Klik peti untuk mengklaim bonus EXP dan kutipan motivasi harian Anda!" 
                    : "Peti otomatis terbuka setelah jurnal hari ini berhasil disimpan."}
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
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:brightness-110 active:scale-95 font-black cursor-pointer shadow-amber-500/30"
                    : "bg-white/10 text-slate-400 cursor-not-allowed border border-white/5"
                }`}
              >
                {isOpeningChest ? (
                  <>Membuka Peti Hadiah...</>
                ) : isChestReady ? (
                  <><Sparkles className="w-4 h-4" /> Buka Peti Sekarang</>
                ) : (
                  <><Lock className="w-4 h-4" /> Peti Masih Terkunci</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* PAPAN MISI & TANTANGAN (2 KOLOM) */}
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

                  {/* Tombol Klaim */}
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

      {/* 5. STATS SUMMARY & HEATMAP 4 MINGGU */}
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

      {/* HEATMAP AKTIVITAS 4 MINGGU */}
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

      {/* 6. TASK WIDGET & RECENT JURNAL */}
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
              Semua task beres! Saatnya rebahan bentar. 🎉
            </div>
          ) : (
            <div className="space-y-3">
              {activeTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 md:p-4 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors group">
                  <button 
                    onClick={() => completeTask(task.id)}
                    className="mt-0.5 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-gray-300 flex-shrink-0 group-hover:border-green-500 group-hover:bg-green-50 transition-colors flex items-center justify-center cursor-pointer"
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
              Belum ada jurnal yang disimpan. Buka kartu streak di atas untuk mulai mencatat!
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
      
      {/* 7. QUICK ACTION BANNER: ABSENSI & RIWAYAT */}
      <div>
        <Link 
          href="/report" 
          className="group relative overflow-hidden rounded-3xl bg-card border border-border p-6 md:p-8 text-foreground shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col md:flex-row md:items-center justify-between gap-4 block"
        >
          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-black mb-1">Absensi & Riwayat Laporan</h3>
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

      {/* 8. MODAL: MAGANG WRAPPED (SPOTIFY-STYLE WEEKLY SPOTLIGHT) */}
      {isWrappedOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 rounded-3xl max-w-md w-full p-6 md:p-8 text-white relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsWrappedOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Wrapped */}
            <div className="text-center mb-6">
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                Weekly Spotlight
              </span>
              <h2 className="text-2xl font-black mt-2 tracking-tight">Magang Wrapped 🎧</h2>
              <p className="text-xs text-slate-400 mt-0.5">Potret realita perjuangan magangmu minggu ini</p>
            </div>

            {/* Persona Badge */}
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${weeklyWrapped.badgeColor} text-slate-950 font-black text-center mb-5 shadow-lg shadow-indigo-500/20`}>
              <span className="text-xs uppercase tracking-wider block opacity-80">Gelar Mingguanmu:</span>
              <span className="text-lg md:text-xl font-extrabold">{weeklyWrapped.personaTitle}</span>
            </div>

            <p className="text-xs text-slate-300 text-center mb-6 leading-relaxed italic">
              &ldquo;{weeklyWrapped.personaDescription}&rdquo;
            </p>

            {/* Stats Breakdown */}
            <div className="grid grid-cols-3 gap-2.5 text-center mb-6">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                <span className="text-xl font-black text-white">{weeklyWrapped.totalLogs}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Hari Log</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                <span className="text-xl font-black text-amber-400">{weeklyWrapped.totalActivities}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Aktivitas</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                <span className="text-xl font-black text-emerald-400">{weeklyWrapped.totalTasksDone}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Task Kelar</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={copyWrappedToClipboard}
                className="w-full py-3 bg-white text-slate-950 hover:bg-slate-100 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Salin Ringkasan untuk Status WA
              </button>
              <button
                onClick={() => setIsWrappedOpen(false)}
                className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Tutup Spotlight
              </button>
            </div>
          </div>
        </div>
      )}

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
