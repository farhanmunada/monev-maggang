"use client";

import { useEffect, useState } from "react";
import { 
  BookOpen, TrendingUp, Calendar, ArrowRight, FileText, CheckCircle2, 
  Clock, Flame, Zap, Trophy, Star, ShieldCheck, Sparkles, Target,
  Gift, Check, Lock, PartyPopper, RefreshCw, Compass, Skull, Swords, 
  MessageSquare, X, Share2, Volume2, Bot, Coffee, Search, Brain, CheckSquare,
  Package, ChevronRight
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

// Dynamic Icon Renderer for Quests & Mascot
function QuestIcon({ name, className = "w-5 h-5 text-slate-700" }) {
  switch (name) {
    case "FileText":
      return <FileText className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "Brain":
      return <Brain className={className} />;
    case "CheckSquare":
      return <CheckSquare className={className} />;
    case "Flame":
      return <Flame className={className} />;
    default:
      return <Target className={className} />;
  }
}

function MascotAvatarIcon({ name, className = "w-8 h-8 text-amber-600" }) {
  switch (name) {
    case "Coffee":
      return <Coffee className={className} />;
    case "Flame":
      return <Flame className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "Search":
      return <Search className={className} />;
    case "Bot":
    default:
      return <Bot className={className} />;
  }
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLogs: 0,
    totalActivities: 0,
    attendanceRate: 100,
  });

  const [gamification, setGamification] = useState({
    streak: { count: 0, isActiveToday: false, isSunday: false, message: "" },
    level: { currentLevel: 1, title: "Trainee Intern", totalExp: 0, minExp: 0, maxExp: 150, progressPercent: 0, color: "from-blue-500 to-indigo-500", badgeColor: "bg-blue-100 text-blue-700" },
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
    bossQuote: "Buka laptop 5 menit, ngelamun 2 jam. Lucu banget kamu.",
    progressPercent: 0
  });

  const [mascotQuoteIndex, setMascotQuoteIndex] = useState(0);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [weeklyWrapped, setWeeklyWrapped] = useState({
    weekTitle: "Magang Wrapped Minggu Ini",
    personaTitle: "Ahli Pura-Pura Sibuk",
    personaDescription: "Minggu ini kamu bertahan hidup di tengah kerasnya dunia kerja nyata.",
    badgeColor: "from-cyan-500 to-blue-600",
    totalLogs: 0,
    totalActivities: 0,
    totalTasksDone: 0,
    funFact: "Tetap santai walau deadline menatap sinis."
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

  // Audio synthesizer Web Audio API
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
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
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
      const { data: logs, error: logsError } = await supabase
        .from("daily_logs")
        .select(`
          id, date, attendance, learning,
          activities ( id )
        `)
        .order("date", { ascending: false });
        
      if (logsError) throw logsError;

      const { count: actCount, error: actError } = await supabase
        .from("activities")
        .select("*", { count: 'exact', head: true });
        
      if (actError) throw actError;

      const { data: allTasks, error: tasksError } = await supabase
        .from("notes")
        .select("*")
        .eq("type", "task")
        .order("created_at", { ascending: false });
        
      if (tasksError) throw tasksError;

      const active = (allTasks || []).filter(t => t.status !== "done").slice(0, 4);
      const doneCount = (allTasks || []).filter(t => t.status === "done").length;
      setActiveTasks(active);

      const totalLogs = logs ? logs.length : 0;
      const totalActivities = actCount || 0;
      const presentLogs = logs ? logs.filter(l => l.attendance === "Hadir").length : 0;
      const attendanceRate = totalLogs > 0 ? Math.round((presentLogs / totalLogs) * 100) : 100;
      const learningCount = logs ? logs.filter(l => l.learning && l.learning.length > 50).length : 0;

      setStats({ totalLogs, totalActivities, attendanceRate });
      
      if (logs) {
        setRecentLogs(logs.slice(0, 3));
      }

      const todayDateStr = formatYMD(new Date());
      const todayLog = (logs || []).find(l => l.date === todayDateStr);
      let todayActsCount = 0;
      if (todayLog) {
        todayActsCount = todayLog.activities ? todayLog.activities.length : 0;
      }

      const weekLogsCount = (logs || []).filter(l => {
        const diffDays = (new Date() - new Date(l.date)) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }).length;

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
      toast.success("Task kelar. Lord Mager kena geprek -15 HP (+10 EXP)");
      fetchDashboardData();
    } catch (err) {
      console.error("Error completing task:", err);
      toast.error("Gagal menyelesaikan task");
    }
  };

  const todayStr = formatYMD(new Date());

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
      toast.success(`Misi "${quest.title}" selesai. Klaim +${quest.rewardExp} EXP sukses.`);

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

  const handleOpenChest = () => {
    if (dailyChest.opened) return;

    const isSunday = new Date().getDay() === 0;
    const hasLoggedToday = gamification.streak.isActiveToday;

    if (!isSunday && !hasLoggedToday) {
      toast.error("Isi jurnal hari ini dulu sebelum minta jatah peti hadiah.");
      return;
    }

    setIsOpeningChest(true);

    setTimeout(() => {
      const randomExp = Math.floor(Math.random() * 26) + 25;
      const quotes = [
        "Kerja keras bagai kuda, dibayar secangkir kopi dan ucapan terima kasih manis.",
        "Satu baris catatan hari ini, satu langkah lebih cepat dari kejaran revisi mentor.",
        "Masa depan cerah menanti mereka yang tidak menunda mengisi form log harian.",
        "Rebahan di jam kerja memang menggoda, tapi streak hangus itu bikin sedih."
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
      toast.success(`Peti hadiah terbuka. +${randomExp} EXP bonus masuk kantong.`);

      fetchDashboardData();
    }, 600);
  };

  const isSundayToday = gamification.streak.isSunday || new Date().getDay() === 0;
  const isChestReady = dailyChest.opened ? false : (isSundayToday || gamification.streak.isActiveToday);

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
    const text = `MAGANG WRAPPED MINGGU INI\n` +
      `Gelar: ${weeklyWrapped.personaTitle}\n` +
      `Catatan Jurnal: ${weeklyWrapped.totalLogs} hari\n` +
      `Aktivitas Terinput: ${weeklyWrapped.totalActivities} kegiatan\n` +
      `Task Selesai: ${weeklyWrapped.totalTasksDone} task\n` +
      `"${weeklyWrapped.personaDescription}"\n\n` +
      `Dipantau lewat InternTrack - Mode Bertahan Hidup Magang`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success("Rekap Magang Wrapped berhasil disalin ke clipboard.");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      
      {/* 1. HEADER SECTION (CLEAN NEXT-GEN & SARCASTIC IDENTITY) */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-slate-900 text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Mode Bertahan Hidup
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Selamat Datang, Calon Pegawai Tetap
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Catat penderitaan dan pencapaian magangmu secara terstruktur dan minim drama.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Tombol Magang Wrapped */}
          <button
            onClick={() => setIsWrappedOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>Magang Wrapped</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">Mingguan</span>
          </button>

          {/* Badge Tanggal */}
          <div className="flex items-center gap-2 bg-white border border-slate-200/90 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })}</span>
          </div>
        </div>
      </header>

      {/* 2. DUAL HERO ZONE: COMMAND CENTER + MASKOT SI MAGGY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-stretch">
        
        {/* KOLOM KIRI (7/12): COMMAND CENTER */}
        <div className="lg:col-span-7 bg-slate-950 text-white rounded-2xl p-6 md:p-7 shadow-sm relative overflow-hidden flex flex-col justify-between border border-slate-800">
          <div className="relative z-10 space-y-5">
            
            {/* Row Level & Streak Indicator */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-tight uppercase bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  Level {gamification.level.currentLevel} • {gamification.level.title}
                </span>
              </div>

              {/* Sunday Shield / Streak Pill */}
              <span className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 ${
                isSundayToday 
                  ? "bg-teal-500/10 text-teal-300 border border-teal-500/30"
                  : gamification.streak.isActiveToday 
                    ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                    : "bg-slate-900 text-slate-400 border border-slate-800"
              }`}>
                {isSundayToday ? (
                  <><ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Sunday Shield (Aman)</>
                ) : (
                  <><Flame className="w-3.5 h-3.5 text-amber-400" /> {gamification.streak.count} Hari Streak</>
                )}
              </span>
            </div>

            {/* EXP Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 font-medium mb-1.5">
                <span>Progress EXP ({gamification.level.totalExp} Total EXP)</span>
                <span className="font-bold text-white font-mono">{gamification.level.progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${gamification.level.color} transition-all duration-700`}
                  style={{ width: `${gamification.level.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Pesan Realita Streak */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              {isSundayToday 
                ? "Hari Minggu libur resmi. Streak dari Sabtu aman terjaga sampai Senin. Nikmati istirahatmu."
                : gamification.streak.message}
            </p>
          </div>

          {/* Action Button Jurnal */}
          <div className="relative z-10 pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {isSundayToday ? "Pengisian hari ini opsional" : "Batas pengisian hari ini pukul 23:59 WIB"}
            </span>
            <Link 
              href="/daily-log"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm shadow-xs transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              {gamification.streak.isActiveToday ? "Perbarui Jurnal Hari Ini" : "Isi Jurnal Sekarang"}
            </Link>
          </div>
        </div>

        {/* KOLOM KANAN (5/12): MASKOT INTERAKTIF "SI MAGGY" */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h3 className="font-bold text-sm text-slate-900">Si Maggy</h3>
              <span className="text-[11px] text-slate-400 font-medium">Teman Curhat</span>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
              Realistis
            </span>
          </div>

          {/* Area Interaktif Avatar & Speech Bubble */}
          <div className="my-auto py-3">
            <div className="flex items-start gap-3.5">
              <div 
                onClick={handleCycleMascotQuote}
                className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-transform flex-shrink-0 select-none"
                title="Klik untuk ganti pesan Si Maggy"
              >
                <MascotAvatarIcon name={mascot.avatar} className="w-7 h-7 text-amber-600" />
              </div>

              {/* Speech Bubble */}
              <div className="relative bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-800 font-medium leading-relaxed shadow-2xs flex-1">
                <p>&ldquo;{currentMascotQuote}&rdquo;</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Butuh perspektif lain?</span>
            <button
              onClick={handleCycleMascotQuote}
              className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Ganti Pesan
            </button>
          </div>
        </div>

      </div>

      {/* 3. ARENA MINGGUAN: MINI BOSS BATTLE ("LORD MAGER") */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-7 shadow-xs border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
              {boss.isDefeated ? (
                <Skull className="w-5 h-5 text-emerald-400" />
              ) : (
                <Swords className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded">
                  Weekly Boss Battle
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Reset Tiap Senin</span>
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                {boss.bossName} <span className="text-xs text-slate-400 font-normal">({boss.subtitle})</span>
              </h2>
            </div>
          </div>

          {/* Sisa HP */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Boss HP:</span>
            <span className={`text-sm font-black px-3 py-1 rounded-lg border font-mono ${
              boss.isDefeated 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}>
              {boss.currentHp} / {boss.maxHp} HP
            </span>
          </div>
        </div>

        {/* Boss HP Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/80">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${
                boss.isDefeated 
                  ? "bg-emerald-500" 
                  : boss.currentHp < 40 
                    ? "bg-amber-500" 
                    : "bg-indigo-500"
              }`}
              style={{ width: `${Math.max(4, 100 - boss.progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Quote Boss & Damage Rule */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="md:col-span-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-slate-300 italic">
            &ldquo;{boss.bossQuote}&rdquo;
          </div>
          <div className="flex items-center justify-around bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            <span>Log: <strong className="text-slate-200 font-mono">-20 HP</strong></span>
            <span>•</span>
            <span>Aktivitas: <strong className="text-slate-200 font-mono">-8 HP</strong></span>
            <span>•</span>
            <span>Task: <strong className="text-slate-200 font-mono">-15 HP</strong></span>
          </div>
        </div>
      </div>

      {/* 4. GAMIFIKASI INTERAKTIF: PETI HARIAN & PAPAN MISI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PETI HADIAH HARIAN (1 KOLOM) */}
        <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between border border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                <Sparkles className="w-3.5 h-3.5" /> Peti Harian
              </span>
              <span className="text-[11px] text-slate-400">
                {isSundayToday ? "Bonus Minggu" : "Reset Tiap Hari"}
              </span>
            </div>

            <div className="text-center py-4">
              <div className="relative inline-block mb-3">
                <div 
                  className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center transition-all duration-200 border ${
                    dailyChest.opened
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : isChestReady
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-400 cursor-pointer hover:scale-105 active:scale-95 shadow-md shadow-amber-500/10"
                        : "bg-slate-900 border-slate-800 text-slate-600"
                  }`}
                  onClick={isChestReady ? handleOpenChest : undefined}
                >
                  {dailyChest.opened ? (
                    <Gift className="w-9 h-9 text-emerald-400" />
                  ) : isChestReady ? (
                    <Package className="w-9 h-9 text-amber-400 animate-pulse" />
                  ) : (
                    <Lock className="w-8 h-8 text-slate-500" />
                  )}
                </div>
              </div>

              <h3 className="text-base font-bold text-white mb-1">
                {dailyChest.opened 
                  ? `Hadiah Terbuka (+${dailyChest.exp} EXP)`
                  : isChestReady 
                    ? "Peti Siap Dibuka" 
                    : isSundayToday
                      ? "Buka Bonus Santai Minggu"
                      : "Peti Terkunci"}
              </h3>
              
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                {dailyChest.opened 
                  ? `"${dailyChest.message}"`
                  : isChestReady 
                    ? "Buka peti untuk mengklaim bonus EXP dan kutipan motivasi harimu." 
                    : "Peti otomatis terbuka setelah jurnal hari ini berhasil disimpan."}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            {dailyChest.opened ? (
              <div className="w-full py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Sudah Diklaim (+{dailyChest.exp} EXP)
              </div>
            ) : (
              <button
                onClick={handleOpenChest}
                disabled={!isChestReady || isOpeningChest}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  isChestReady
                    ? "bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-95 cursor-pointer font-bold shadow-xs"
                    : "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800"
                }`}
              >
                {isOpeningChest ? (
                  <span>Membuka Peti...</span>
                ) : isChestReady ? (
                  <><Sparkles className="w-3.5 h-3.5" /> Buka Peti Sekarang</>
                ) : (
                  <><Lock className="w-3.5 h-3.5" /> Masih Terkunci</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* PAPAN MISI & TANTANGAN (2 KOLOM) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" /> Papan Misi Harian
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selesaikan tugas dan klaim reward EXP langsung ke profilmu.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                <span>{gamification.quests.filter(q => q.isClaimed).length} / {gamification.quests.length} Misi</span>
              </div>
            </div>

            {/* List Misi */}
            <div className="space-y-2.5">
              {gamification.quests.map((quest) => (
                <div 
                  key={quest.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    quest.isClaimed
                      ? "bg-slate-50/70 border-slate-200/60 opacity-60"
                      : quest.isCompleted
                        ? "bg-emerald-50/50 border-emerald-200 shadow-2xs"
                        : "bg-white border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="p-2 bg-slate-100/80 rounded-xl border border-slate-200/60 flex-shrink-0">
                      <QuestIcon name={quest.icon} className="w-4 h-4 text-slate-700" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-xs md:text-sm text-slate-900">{quest.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          quest.type === "daily" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                        }`}>
                          {quest.type === "daily" ? "Harian" : "Mingguan"}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/70 px-1.5 py-0.5 rounded font-mono">
                          +{quest.rewardExp} EXP
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{quest.desc}</p>
                      
                      {/* Mini Progress */}
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              quest.isCompleted ? "bg-emerald-500" : "bg-blue-600"
                            }`}
                            style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-600 font-medium">{quest.current} / {quest.target}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Klaim */}
                  <div className="sm:self-center flex-shrink-0">
                    {quest.isClaimed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                        <Check className="w-3.5 h-3.5" /> Diklaim
                      </span>
                    ) : quest.isCompleted ? (
                      <button
                        onClick={() => handleClaimQuest(quest)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 px-3.5 py-1.5 rounded-lg font-semibold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Klaim +{quest.rewardExp} EXP
                      </button>
                    ) : (
                      <span className="inline-block text-center w-full sm:w-auto text-[11px] font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <StatCard 
          title="Total Jurnal" 
          value={loading ? "-" : stats.totalLogs} 
          icon={<BookOpen className="w-5 h-5 text-blue-600" />} 
          color="bg-blue-50 border border-blue-200/60"
        />
        <StatCard 
          title="Total Aktivitas" 
          value={loading ? "-" : stats.totalActivities} 
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} 
          color="bg-emerald-50 border border-emerald-200/60"
        />
        <StatCard 
          title="Tingkat Kehadiran" 
          value={loading ? "-" : `${stats.attendanceRate}%`} 
          icon={<Calendar className="w-5 h-5 text-purple-600" />} 
          color="bg-purple-50 border border-purple-200/60"
        />
      </div>

      {/* HEATMAP AKTIVITAS 4 MINGGU */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Matriks Aktivitas (4 Minggu)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Konsistensi catatan harian. Hari Minggu dilindungi perisai libur.</p>
          </div>
          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-50 border border-amber-300"></div>
              <span>Minggu (Libur)</span>
            </span>
            <span className="flex items-center gap-1.5 ml-3">
              <span>Kosong</span>
              <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></div>
              <div className="w-3 h-3 rounded bg-emerald-200"></div>
              <div className="w-3 h-3 rounded bg-emerald-500"></div>
              <div className="w-3 h-3 rounded bg-emerald-700"></div>
              <span>Padat</span>
            </span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-1.5 pt-2">
          {gamification.heatmap.map((item, idx) => {
            let colorClass = "bg-slate-50 border-slate-200 text-slate-400";
            if (item.isSunday && item.count === 0) {
              colorClass = "bg-amber-50/70 border-amber-200 text-amber-700";
            } else if (item.count >= 3) {
              colorClass = "bg-emerald-600 border-emerald-700 text-white";
            } else if (item.count === 2) {
              colorClass = "bg-emerald-400 border-emerald-500 text-white";
            } else if (item.count === 1) {
              colorClass = "bg-emerald-100 border-emerald-300 text-emerald-800";
            }

            return (
              <div 
                key={idx}
                title={`${item.date} (${item.dayName}): ${item.isSunday ? 'Hari Libur Resmi' : `${item.count} aktivitas`}`}
                className={`h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] font-mono font-medium transition-transform hover:scale-105 cursor-pointer ${colorClass}`}
              >
                <span>{item.date.split("-")[2]}</span>
                {item.isSunday && item.count === 0 && (
                  <span className="text-[7px] font-sans font-semibold uppercase opacity-80">Libur</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. TASK WIDGET & RECENT JURNAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {/* Task Widget */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Task Aktif (+10 EXP)
            </h2>
            <Link href="/notes" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Buka Board <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-2.5">
              {[1, 2].map((i) => <div key={i} className="h-11 bg-slate-100 rounded-xl animate-pulse"></div>)}
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="text-center py-7 text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs">
              Semua task selesai. Saatnya napas sejenak sebelum ada tugas susulan.
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group">
                  <button 
                    onClick={() => completeTask(task.id)}
                    className="mt-0.5 w-5 h-5 rounded-full border border-slate-300 flex-shrink-0 group-hover:border-emerald-600 group-hover:bg-emerald-50 transition-colors flex items-center justify-center cursor-pointer"
                    title="Tandai selesai"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-transparent group-hover:text-emerald-600" />
                  </button>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-xs md:text-sm line-clamp-1">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${task.status === 'in_progress' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Jurnal Terbaru
            </h2>
            <Link href="/report" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Lihat Rekap <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => <div key={i} className="h-11 bg-slate-100 rounded-xl animate-pulse"></div>)}
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="text-center py-7 text-slate-500 border border-dashed border-slate-200 rounded-xl text-xs">
              Belum ada jurnal yang disimpan. Mulai isi jurnal pertamamu hari ini.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentLogs.map((log) => (
                <Link 
                  key={log.id} 
                  href="/report"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-700 font-bold text-xs font-mono">
                      {log.attendance === "Hadir" ? "HD" : log.attendance.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-xs md:text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                        Status: {log.attendance}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
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
          className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 md:p-6 text-slate-900 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 block"
        >
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-0.5">Rekapitulasi Absensi & Laporan AI</h3>
            <p className="text-slate-500 text-xs md:text-sm">Pantau statistik kehadiran lengkap dan generate narasi laporan magang dengan AI.</p>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-blue-600 font-semibold text-xs md:text-sm group-hover:translate-x-0.5 transition-transform">
            Buka Halaman Rekap <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* 8. MODAL: MAGANG WRAPPED */}
      {isWrappedOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white relative shadow-2xl overflow-hidden">
            <button
              onClick={() => setIsWrappedOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Wrapped */}
            <div className="text-center mb-5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Weekly Spotlight
              </span>
              <h2 className="text-xl font-bold mt-2 tracking-tight flex items-center justify-center gap-2">
                <span>Magang Wrapped</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Potret realita perjuangan magangmu minggu ini</p>
            </div>

            {/* Persona Badge */}
            <div className={`p-4 rounded-xl bg-gradient-to-r ${weeklyWrapped.badgeColor} text-slate-950 font-bold text-center mb-4 shadow-sm`}>
              <span className="text-[10px] uppercase tracking-wider block opacity-80">Gelar Mingguan:</span>
              <span className="text-base md:text-lg font-extrabold">{weeklyWrapped.personaTitle}</span>
            </div>

            <p className="text-xs text-slate-300 text-center mb-5 leading-relaxed italic">
              &ldquo;{weeklyWrapped.personaDescription}&rdquo;
            </p>

            {/* Stats Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center mb-5">
              <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
                <span className="text-lg font-bold text-white font-mono">{weeklyWrapped.totalLogs}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Hari Log</span>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
                <span className="text-lg font-bold text-amber-400 font-mono">{weeklyWrapped.totalActivities}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Aktivitas</span>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
                <span className="text-lg font-bold text-emerald-400 font-mono">{weeklyWrapped.totalTasksDone}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Task Kelar</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={copyWrappedToClipboard}
                className="w-full py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Salin Ringkasan untuk Status WA
              </button>
              <button
                onClick={() => setIsWrappedOpen(false)}
                className="w-full py-2 text-slate-400 hover:text-white text-xs font-medium"
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
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 mb-0.5">{title}</p>
        <p className="text-xl md:text-2xl font-bold text-slate-900 font-mono">{value}</p>
      </div>
    </div>
  );
}
