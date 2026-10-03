"use client";

import { useEffect, useState } from "react";
import { Sparkles, Calendar, BookOpen, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { formatYMD } from "@/lib/date";
import { playSoundEffect } from "@/lib/audio";
import {
  getDailyChest,
  saveDailyChest,
  getClaimedQuests,
  saveClaimedQuests,
  getBonusExp,
  saveBonusExp,
} from "@/lib/storage";
import {
  calculateStreak,
  calculateLevelAndExp,
  getInteractiveQuests,
  generateHeatmap,
  calculateBossProgress,
  getMascotData,
  generateWeeklyWrapped,
} from "@/lib/gamification";

import HeroCommand from "@/components/dashboard/HeroCommand";
import MascotCard from "@/components/dashboard/MascotCard";
import BossBattleCard from "@/components/dashboard/BossBattleCard";
import DailyChestCard from "@/components/dashboard/DailyChestCard";
import QuestsBoard from "@/components/dashboard/QuestsBoard";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import ActiveTasksWidget from "@/components/dashboard/ActiveTasksWidget";
import RecentLogsWidget from "@/components/dashboard/RecentLogsWidget";
import WrappedModal from "@/components/dashboard/WrappedModal";
import StatCard from "@/components/dashboard/StatCard";

export default function Dashboard() {
  const [stats, setStats] = useState({ totalLogs: 0, totalActivities: 0, attendanceRate: 100 });
  const [gamification, setGamification] = useState({
    streak: { count: 0, isActiveToday: false, isSunday: false, message: "" },
    level: { currentLevel: 1, title: "Trainee Intern", totalExp: 0, minExp: 0, maxExp: 150, progressPercent: 0, color: "from-blue-500 to-indigo-500", badgeColor: "bg-blue-100 text-blue-700" },
    quests: [],
    heatmap: [],
  });
  const [boss, setBoss] = useState({
    bossName: "Lord Mager",
    subtitle: "Raja Penunda Pekerjaan",
    maxHp: 100,
    currentHp: 100,
    damageDealt: 0,
    isDefeated: false,
    bossQuote: "Buka laptop 5 menit, ngelamun 2 jam. Lucu banget kamu.",
    progressPercent: 0,
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
    funFact: "Tetap santai walau deadline menatap sinis.",
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyChest, setDailyChest] = useState(() => getDailyChest());
  const [claimedQuestIds, setClaimedQuestIds] = useState(() => getClaimedQuests());
  const [bonusExp, setBonusExp] = useState(() => getBonusExp());
  const [isOpeningChest, setIsOpeningChest] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const { data: logs, error: logsError } = await supabase
        .from("daily_logs")
        .select("id, date, attendance, learning, activities ( id )")
        .order("date", { ascending: false });
      if (logsError) throw logsError;

      const { count: actCount, error: actError } = await supabase
        .from("activities")
        .select("*", { count: "exact", head: true });
      if (actError) throw actError;

      const { data: allTasks, error: tasksError } = await supabase
        .from("notes")
        .select("*")
        .eq("type", "task")
        .order("created_at", { ascending: false });
      if (tasksError) throw tasksError;

      const active = (allTasks || []).filter((t) => t.status !== "done").slice(0, 4);
      const doneCount = (allTasks || []).filter((t) => t.status === "done").length;
      setActiveTasks(active);

      const totalLogs = logs ? logs.length : 0;
      const totalActivities = actCount || 0;
      const presentLogs = logs ? logs.filter((l) => l.attendance === "Hadir").length : 0;
      const attendanceRate = totalLogs > 0 ? Math.round((presentLogs / totalLogs) * 100) : 100;
      const learningCount = logs ? logs.filter((l) => l.learning && l.learning.length > 50).length : 0;

      setStats({ totalLogs, totalActivities, attendanceRate });
      if (logs) setRecentLogs(logs.slice(0, 3));

      const todayDateStr = formatYMD();
      const todayLog = (logs || []).find((l) => l.date === todayDateStr);
      const todayActsCount = todayLog?.activities?.length || 0;

      const weekLogsCount = (logs || []).filter((l) => {
        const diffDays = (new Date() - new Date(l.date)) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }).length;

      const currentBonus = getBonusExp();
      const currentClaimed = getClaimedQuests(todayDateStr);

      const streak = calculateStreak(logs || []);
      const level = calculateLevelAndExp(totalLogs, totalActivities, learningCount, doneCount, currentBonus);
      const quests = getInteractiveQuests({
        todayLog,
        todayActivitiesCount: todayActsCount,
        doneTasksTodayCount: doneCount,
        weekLogsCount,
        claimedQuestIds: currentClaimed,
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
      setActiveTasks((prev) => prev.filter((t) => t.id !== taskId));
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

  const todayStr = formatYMD();

  const handleClaimQuest = (quest) => {
    if (quest.isClaimed || !quest.isCompleted) return;
    try {
      const newClaimed = [...claimedQuestIds, quest.id];
      setClaimedQuestIds(newClaimed);
      saveClaimedQuests(newClaimed, todayStr);

      const newBonus = bonusExp + quest.rewardExp;
      setBonusExp(newBonus);
      saveBonusExp(newBonus);

      playSoundEffect("claim");
      toast.success(`Misi \"${quest.title}\" selesai. Klaim +${quest.rewardExp} EXP sukses.`);

      setGamification((prev) => ({
        ...prev,
        level: calculateLevelAndExp(stats.totalLogs, stats.totalActivities, 0, 0, newBonus),
        quests: prev.quests.map((q) => (q.id === quest.id ? { ...q, isClaimed: true } : q)),
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
        "Rebahan di jam kerja memang menggoda, tapi streak hangus itu bikin sedih.",
      ];
      const selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];
      const chestData = { opened: true, exp: randomExp, message: selectedQuote, isSunday };

      setDailyChest(chestData);
      saveDailyChest(chestData, todayStr);

      const newBonus = bonusExp + randomExp;
      setBonusExp(newBonus);
      saveBonusExp(newBonus);

      setIsOpeningChest(false);
      playSoundEffect("claim");
      toast.success(`Peti hadiah terbuka. +${randomExp} EXP bonus masuk kantong.`);
      fetchDashboardData();
    }, 600);
  };

  const isSundayToday = gamification.streak.isSunday || new Date().getDay() === 0;
  const isChestReady = dailyChest.opened ? false : isSundayToday || gamification.streak.isActiveToday;

  const mascot = getMascotData({
    isSunday: isSundayToday,
    hasLoggedToday: gamification.streak.isActiveToday,
    streakCount: gamification.streak.count,
  });
  const currentMascotQuote = mascot.quotes[mascotQuoteIndex % mascot.quotes.length];

  const handleCycleMascotQuote = () => {
    setMascotQuoteIndex((prev) => prev + 1);
    playSoundEffect("claim");
  };

  const copyWrappedToClipboard = () => {
    const text =
      `MAGANG WRAPPED MINGGU INI\n` +
      `Gelar: ${weeklyWrapped.personaTitle}\n` +
      `Catatan Jurnal: ${weeklyWrapped.totalLogs} hari\n` +
      `Aktivitas Terinput: ${weeklyWrapped.totalActivities} kegiatan\n` +
      `Task Selesai: ${weeklyWrapped.totalTasksDone} task\n` +
      `\"${weeklyWrapped.personaDescription}\"\n\n` +
      `Dipantau lewat InternTrack - Mode Bertahan Hidup Magang`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success("Rekap Magang Wrapped berhasil disalin ke clipboard.");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
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
          <button
            type="button"
            onClick={() => setIsWrappedOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>Magang Wrapped</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">Mingguan</span>
          </button>

          <div className="flex items-center gap-2 bg-white border border-slate-200/90 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-stretch">
        <HeroCommand level={gamification.level} streak={gamification.streak} isSundayToday={isSundayToday} />
        <MascotCard
          mascot={mascot}
          currentMascotQuote={currentMascotQuote}
          onCycleQuote={handleCycleMascotQuote}
        />
      </div>

      <BossBattleCard boss={boss} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DailyChestCard
          dailyChest={dailyChest}
          isChestReady={isChestReady}
          isOpeningChest={isOpeningChest}
          isSundayToday={isSundayToday}
          onOpenChest={handleOpenChest}
        />
        <QuestsBoard quests={gamification.quests} onClaimQuest={handleClaimQuest} />
      </div>

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
          icon={<CalendarIcon className="w-5 h-5 text-purple-600" />}
          color="bg-purple-50 border border-purple-200/60"
        />
      </div>

      <ActivityHeatmap heatmap={gamification.heatmap} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <ActiveTasksWidget tasks={activeTasks} loading={loading} onCompleteTask={completeTask} />
        <RecentLogsWidget logs={recentLogs} loading={loading} />
      </div>

      <div>
        <Link
          href="/report"
          className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 md:p-6 text-slate-900 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 block"
        >
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-0.5">Rekapitulasi Absensi & Laporan AI</h3>
            <p className="text-slate-500 text-xs md:text-sm">
              Pantau statistik kehadiran lengkap dan generate narasi laporan magang dengan AI.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-blue-600 font-semibold text-xs md:text-sm group-hover:translate-x-0.5 transition-transform">
            Buka Halaman Rekap <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      <WrappedModal
        isOpen={isWrappedOpen}
        onClose={() => setIsWrappedOpen(false)}
        weeklyWrapped={weeklyWrapped}
        onCopyWrapped={copyWrappedToClipboard}
      />
    </div>
  );
}
