"use client";

import { useState, useEffect } from "react";
import { Clock, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { formatYMD } from "@/lib/date";

import AttendanceStats from "@/components/report/AttendanceStats";
import LogHistoryList from "@/components/report/LogHistoryList";
import AiReportPanel from "@/components/report/AiReportPanel";

export default function ReportPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("history");
  const [logs, setLogs] = useState([]);
  const [expandedLogId, setExpandedLogId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [stats, setStats] = useState({ hadir: 0, izin: 0, sakit: 0, alfa: 0 });

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const [aiReport, setAiReport] = useState({
    expandedActivities: "",
    expandedLearning: "",
    expandedObstacle: "",
  });

  const [selectedDateForAi, setSelectedDateForAi] = useState(formatYMD());

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*, activities ( * )")
        .order("date", { ascending: false });

      if (error) throw error;

      let hadir = 0,
        izin = 0,
        sakit = 0,
        alfa = 0;
      (data || []).forEach((log) => {
        if (log.attendance === "Hadir") hadir++;
        else if (log.attendance === "Izin") izin++;
        else if (log.attendance === "Sakit") sakit++;
        else if (log.attendance === "Alfa") alfa++;
      });

      setStats({ hadir, izin, sakit, alfa });
      setLogs(data || []);

      if (data && data.length > 0) {
        setExpandedLogId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Gagal memuat data absensi dan riwayat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateAI = async () => {
    setIsAiLoading(true);
    try {
      const targetLog = logs.find((l) => l.date === selectedDateForAi) || logs[0];
      if (!targetLog) {
        throw new Error("Tidak ada catatan log pada tanggal yang dipilih.");
      }

      let allActivities = "";
      if (targetLog.activities && targetLog.activities.length > 0) {
        targetLog.activities.forEach((act) => {
          allActivities += `- ${act.title}: ${act.description || ""}\n`;
        });
      }

      const payload = {
        activities: allActivities || "Belum ada kegiatan tercatat.",
        learning: targetLog.learning || "Belum ada pembelajaran tercatat.",
        obstacle: targetLog.obstacle || "Tidak ada kendala.",
      };

      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal menghubungi layanan AI.");
      }

      setAiReport(data);
      setIsGenerated(true);
      toast.success("Narasi laporan formal berhasil dirangkum.");
    } catch (error) {
      console.error("Error AI generate:", error);
      toast.error(error.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success("Teks berhasil disalin ke clipboard.");
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-400">
        Memuat rekapitulasi...
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-7 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Rekapitulasi & Laporan AI
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Pantau kehadiran, telaah arsip kegiatan, dan ubah catatan harian jadi narasi laporan formal.
          </p>
        </div>
      </header>

      <AttendanceStats stats={stats} />

      <div className="flex border-b border-slate-200/90 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 pb-3 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "history"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Riwayat Jurnal</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
            {logs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 pb-3 text-xs md:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "ai"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Generator Narasi AI</span>
        </button>
      </div>

      {activeTab === "history" && (
        <LogHistoryList
          logs={logs}
          search={search}
          onSearchChange={setSearch}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          expandedLogId={expandedLogId}
          onToggleExpand={(id) => setExpandedLogId((prev) => (prev === id ? null : id))}
        />
      )}

      {activeTab === "ai" && (
        <AiReportPanel
          logs={logs}
          selectedDate={selectedDateForAi}
          onSelectDate={setSelectedDateForAi}
          onGenerate={handleGenerateAI}
          isAiLoading={isAiLoading}
          isGenerated={isGenerated}
          aiReport={aiReport}
          copiedKey={copiedKey}
          onCopy={copyToClipboard}
        />
      )}
    </div>
  );
}
