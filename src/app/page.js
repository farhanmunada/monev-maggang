"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { calculateTelemetry } from "@/lib/telemetry";

import BentoGreeting from "@/components/dashboard/BentoGreeting";
import BentoTelemetry from "@/components/dashboard/BentoTelemetry";
import RecentLogsWidget from "@/components/dashboard/RecentLogsWidget";
import ActiveTasksWidget from "@/components/dashboard/ActiveTasksWidget";
import QuickShortcuts from "@/components/dashboard/QuickShortcuts";

export default function Dashboard() {
  const [telemetry, setTelemetry] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [logsRes, tasksRes] = await Promise.all([
        supabase
          .from("daily_logs")
          .select("id, date, attendance, learning, obstacle, activities ( * )")
          .order("date", { ascending: false }),
        supabase
          .from("notes")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (logsRes.error) throw logsRes.error;
      if (tasksRes.error) throw tasksRes.error;

      const logs = logsRes.data || [];
      const notes = tasksRes.data || [];

      // Calculate telemetry
      const tel = calculateTelemetry(logs, notes);
      setTelemetry(tel);

      // Slice recent logs and active tasks
      setRecentLogs(logs.slice(0, 3));
      const tasks = notes.filter((n) => n.type === "task" && n.status !== "done").slice(0, 3);
      setActiveTasks(tasks);
    } catch (error) {
      console.error("Error fetching dashboard telemetry:", error);
      toast.error("Gagal memuat data metrik dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCompleteTask = async (id) => {
    try {
      setActiveTasks((prev) => prev.filter((t) => t.id !== id));
      const { error } = await supabase
        .from("notes")
        .update({ status: "done" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Task ditandai selesai.");
      fetchDashboardData();
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Gagal memperbarui status task.");
      fetchDashboardData();
    }
  };

  return (
    <div className="space-y-5 md:space-y-6 pb-12">
      {/* 1. Hero Greeting Banner (Bento full width) */}
      <BentoGreeting telemetry={telemetry} />

      {/* 2. Key Telemetry Metrics (4 Columns) */}
      <BentoTelemetry telemetry={telemetry} />

      {/* 3. Operational Grid: Jurnal Terkini & Task Prioritas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <RecentLogsWidget logs={recentLogs} loading={loading} />
        <ActiveTasksWidget
          tasks={activeTasks}
          loading={loading}
          onCompleteTask={handleCompleteTask}
        />
      </div>

      {/* 4. Quick Workflow Shortcuts */}
      <QuickShortcuts />
    </div>
  );
}
