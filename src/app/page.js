"use client";

import { useEffect, useState } from "react";
import { BookOpen, TrendingUp, Calendar, ArrowRight, FileText, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLogs: 0,
    totalActivities: 0,
    attendanceRate: 100,
  });
  
  const [recentLogs, setRecentLogs] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch logs
        const { data: logs, error: logsError } = await supabase
          .from("daily_logs")
          .select("id, date, attendance")
          .order("date", { ascending: false });
          
        if (logsError) throw logsError;

        // Fetch activities
        const { count: actCount, error: actError } = await supabase
          .from("activities")
          .select("*", { count: 'exact', head: true });
          
        if (actError) throw actError;

        // Hitung stats
        const totalLogs = logs ? logs.length : 0;
        const totalActivities = actCount || 0;
        const presentLogs = logs ? logs.filter(l => l.attendance === "Hadir").length : 0;
        const attendanceRate = totalLogs > 0 ? Math.round((presentLogs / totalLogs) * 100) : 100;

        setStats({ totalLogs, totalActivities, attendanceRate });
        
        // Ambil 3 terakhir
        if (logs) {
          setRecentLogs(logs.slice(0, 3));
        }

        // Fetch Tasks (To Do / In Progress)
        const { data: tasks, error: tasksError } = await supabase
          .from("notes")
          .select("*")
          .eq("type", "task")
          .neq("status", "done")
          .order("created_at", { ascending: false })
          .limit(4);
          
        if (tasksError) throw tasksError;
        if (tasks) setActiveTasks(tasks);

      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const completeTask = async (taskId) => {
    try {
      // Optimistic update
      setActiveTasks(prev => prev.filter(t => t.id !== taskId));
      const { error } = await supabase.from("notes").update({ status: "done" }).eq("id", taskId);
      if (error) throw error;
      toast.success("Task diselesaikan!");
    } catch (err) {
      console.error("Error completing task:", err);
      toast.error("Gagal menyelesaikan task");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight mb-1 md:mb-2 leading-tight">
            Selamat Datang, <br className="md:hidden" /> Peserta Magang
          </h1>
          <p className="text-secondary text-sm md:text-lg">Berikut ringkasan aktivitas magang Anda.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Task Widget */}
      <div className="mt-8 md:mt-12 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Task Aktif
          </h2>
          <Link href="/notes" className="text-xs md:text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Buka Board <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>)}
          </div>
        ) : activeTasks.length === 0 ? (
          <div className="text-center py-6 text-secondary bg-gray-50 rounded-xl text-sm">
            Semua task sudah diselesaikan! 🎉
          </div>
        ) : (
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 md:p-4 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors group">
                <button 
                  onClick={() => completeTask(task.id)}
                  className="mt-0.5 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-gray-300 flex-shrink-0 group-hover:border-green-500 group-hover:bg-green-50 transition-colors flex items-center justify-center"
                >
                  <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-transparent group-hover:text-green-500" />
                </button>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm md:text-base line-clamp-1">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full font-medium ${task.status === 'in_progress' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                      {task.status === 'in_progress' ? 'In Progress' : 'To Do'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="mt-12 bg-card rounded-2xl border border-border shadow-sm p-6 overflow-hidden relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Jurnal Terbaru</h2>
          <Link href="/history" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : recentLogs.length === 0 ? (
          <div className="text-center py-8 text-secondary border-2 border-dashed border-border rounded-2xl">
            Belum ada jurnal yang disimpan. Mulai tulis jurnal hari ini!
          </div>
        ) : (
          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Status: {log.attendance}</p>
                  <p className="text-sm text-secondary">{new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8">
        <Link href="/daily-log" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 p-6 md:p-8 text-white shadow-lg shadow-primary-500/20 transition-transform hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Tulis Jurnal Hari Ini</h3>
            <p className="text-primary-100 opacity-90 text-sm md:text-base">Catat aktivitas harian di database.</p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 group-hover:scale-110 group-hover:opacity-30 transition-all duration-300">
            <BookOpen className="w-24 h-24 md:w-32 md:h-32 -mr-6 -mb-6 md:-mr-8 md:-mb-8" />
          </div>
        </Link>
        
        <Link href="/report" className="group relative overflow-hidden rounded-2xl bg-white border border-border p-6 md:p-8 text-foreground shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Buat Laporan AI</h3>
            <p className="text-secondary text-sm md:text-base">Generate narasi otomatis dengan Groq.</p>
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
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group flex items-center gap-5">
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs md:text-sm font-medium text-secondary mb-0.5 md:mb-1">{title}</p>
        <p className="text-2xl md:text-3xl font-extrabold text-foreground">{value}</p>
      </div>
    </div>
  );
}
