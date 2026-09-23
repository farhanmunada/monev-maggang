"use client";

import { useEffect, useState } from "react";
import { 
  BookOpen, TrendingUp, Calendar, ArrowRight, FileText, CheckCircle2, 
  Clock, Flame, Zap, Award, Trophy, Star, ShieldCheck, Sparkles, Target
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { calculateStreak, calculateLevelAndExp, calculateBadges, generateHeatmap } from "@/lib/gamification";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLogs: 0,
    totalActivities: 0,
    attendanceRate: 100,
  });

  const [gamification, setGamification] = useState({
    streak: { count: 0, isActiveToday: false, message: "" },
    level: { currentLevel: 1, title: "Trainee Intern", totalExp: 0, minExp: 0, maxExp: 150, progressPercent: 0, color: "from-blue-500 to-cyan-500", badgeColor: "bg-blue-100 text-blue-700" },
    badges: [],
    heatmap: []
  });
  
  const [recentLogs, setRecentLogs] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
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

      // Hitung Gamifikasi
      const streak = calculateStreak(logs || []);
      const level = calculateLevelAndExp(totalLogs, totalActivities, learningCount, doneCount);
      const badges = calculateBadges({
        streakCount: streak.count,
        logsCount: totalLogs,
        activitiesCount: totalActivities,
        learningCount,
        doneTasksCount: doneCount,
        attendanceRate,
        currentLevel: level.currentLevel
      });
      const heatmap = generateHeatmap(logs || [], 28);

      setGamification({ streak, level, badges, heatmap });

    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const unlockedBadgesCount = gamification.badges.filter(b => b.unlocked).length;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header Salam */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            Selamat Datang, <br className="md:hidden" /> Peserta Magang
          </h1>
          <p className="text-secondary text-sm md:text-base mt-1">
            Pantau konsistensi, kumpulkan EXP, dan raih lencana prestasi magang Anda.
          </p>
        </div>

        <Link
          href="/daily-log"
          className="w-fit flex items-center gap-2 bg-primary-600 text-white hover:bg-primary-700 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-primary-500/20 transition-all hover:-translate-y-0.5"
        >
          <BookOpen className="w-4 h-4" /> Tulis Jurnal Hari Ini
        </Link>
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
              Kumpulkan EXP dengan rajin mengisi jurnal (+50), mencatat aktivitas (+15), dan refleksi (+20).
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
          </div>
        </div>

        {/* Card Streak Harian (1 Kolom) */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white rounded-3xl p-6 md:p-8 shadow-xl shadow-orange-500/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none">
            <Flame className="w-48 h-48 -mr-10 -mb-10 text-white" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-black/20 backdrop-blur-md">
                Daily Streak
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                gamification.streak.isActiveToday ? "bg-white text-orange-600" : "bg-black/30 text-white"
              }`}>
                {gamification.streak.isActiveToday ? "✓ Aktif Hari Ini" : "Belum Isi"}
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
            <Link 
              href="/daily-log"
              className="inline-flex items-center justify-center gap-1.5 w-full bg-white text-orange-600 hover:bg-orange-50 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-md transition-colors"
            >
              <Flame className="w-4 h-4 fill-orange-600" />
              {gamification.streak.isActiveToday ? "Update Jurnal Hari Ini" : "Isi Jurnal Sekarang"}
            </Link>
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

      {/* HEATMAP AKTIVITAS 4 MINGGU (GITHUB-STYLE) */}
      <div className="bg-card rounded-3xl border border-border shadow-sm p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Matriks Aktivitas (4 Minggu Terakhir)
            </h2>
            <p className="text-xs text-secondary mt-0.5">Visualisasi konsistensi catatan magang Anda setiap hari.</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-secondary">
            <span>Kosong</span>
            <div className="w-3.5 h-3.5 rounded-md bg-gray-100 border border-gray-200"></div>
            <div className="w-3.5 h-3.5 rounded-md bg-green-200"></div>
            <div className="w-3.5 h-3.5 rounded-md bg-green-500"></div>
            <div className="w-3.5 h-3.5 rounded-md bg-green-700"></div>
            <span>Padat</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-2 pt-2">
          {gamification.heatmap.map((item, idx) => {
            let colorClass = "bg-gray-100 border-gray-200 text-gray-400";
            if (item.count >= 3) colorClass = "bg-green-600 border-green-700 text-white shadow-sm";
            else if (item.count === 2) colorClass = "bg-green-400 border-green-500 text-white";
            else if (item.count === 1) colorClass = "bg-green-200 border-green-300 text-green-800";

            return (
              <div 
                key={idx}
                title={`${item.date}: ${item.count} aktivitas`}
                className={`h-10 rounded-xl border flex flex-col items-center justify-center text-[10px] font-bold transition-transform hover:scale-110 cursor-pointer ${colorClass}`}
              >
                <span>{item.date.split("-")[2]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* LENCANA PRESTASI (ACHIEVEMENTS / BADGES) */}
      <div className="bg-card rounded-3xl border border-border shadow-sm p-5 md:p-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Lencana Prestasi Magang
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Terbuka {unlockedBadgesCount} dari {gamification.badges.length} lencana prestasi.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
            {unlockedBadgesCount} / {gamification.badges.length} Terbuka
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {gamification.badges.map((badge) => (
            <div 
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all ${
                badge.unlocked
                  ? "bg-gradient-to-br from-amber-50/60 to-orange-50/40 border-amber-200 shadow-sm"
                  : "bg-gray-50/50 border-gray-200/80 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{badge.title.split(" ")[0]}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  badge.unlocked 
                    ? "bg-amber-100 text-amber-800 border border-amber-300" 
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {badge.unlocked ? "Terbuka" : `${badge.progress}/${badge.target}`}
                </span>
              </div>

              <h4 className="font-bold text-xs md:text-sm text-foreground">{badge.title.split(" ").slice(1).join(" ")}</h4>
              <p className="text-[11px] text-secondary mt-0.5 mb-2.5 leading-snug">{badge.desc}</p>

              {/* Progress mini bar */}
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${badge.unlocked ? "bg-amber-500" : "bg-gray-400"}`}
                  style={{ width: `${(badge.progress / badge.target) * 100}%` }}
                />
              </div>
            </div>
          ))}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Link href="/daily-log" className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-indigo-700 p-6 md:p-8 text-white shadow-lg shadow-primary-500/20 transition-transform hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Tulis Jurnal Hari Ini</h3>
            <p className="text-primary-100 opacity-90 text-xs md:text-sm">Tambah kegiatan (+15 EXP) & simpan kehadiran (+50 EXP).</p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 group-hover:scale-110 group-hover:opacity-30 transition-all duration-300">
            <BookOpen className="w-24 h-24 md:w-32 md:h-32 -mr-6 -mb-6 md:-mr-8 md:-mb-8" />
          </div>
        </Link>
        
        <Link href="/report" className="group relative overflow-hidden rounded-3xl bg-card border border-border p-6 md:p-8 text-foreground shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Absensi & Riwayat</h3>
            <p className="text-secondary text-xs md:text-sm">Rekapitulasi kehadiran & generate narasi laporan magang dengan AI.</p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300">
            <FileText className="w-24 h-24 md:w-32 md:h-32 -mr-6 -mb-6 md:-mr-8 md:-mb-8" />
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
