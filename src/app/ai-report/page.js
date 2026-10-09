"use client";

import { useState, useEffect, useMemo } from "react";
import { Sparkles, Bot, Copy, Check, Calendar, ArrowRight, Layers, FileText, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { formatYMD, formatIndonesianDate } from "@/lib/date";

export default function AiReportPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(formatYMD());
  const [rangeMode, setRangeMode] = useState("single"); // "single", "weekly", "period"
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const [aiReport, setAiReport] = useState({
    expandedActivities: "",
    expandedLearning: "",
    expandedObstacle: "",
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*, activities ( * )")
        .order("date", { ascending: false });

      if (error) throw error;
      setLogs(data || []);

      if (data && data.length > 0) {
        setSelectedDate(data[0].date);
      }
    } catch (err) {
      console.error("Error fetching logs for AI report:", err);
      toast.error("Gagal memuat log untuk generator laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Compute targeted logs based on rangeMode
  const { targetLogs, rangeLabel } = useMemo(() => {
    if (!logs.length) return { targetLogs: [], rangeLabel: "" };

    if (rangeMode === "single") {
      const single = logs.filter((l) => l.date === selectedDate);
      return { targetLogs: single, rangeLabel: formatIndonesianDate(selectedDate) };
    }

    if (rangeMode === "weekly") {
      const baseDate = new Date(selectedDate);
      const sevenDaysAgo = new Date(baseDate);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const startStr = formatYMD(sevenDaysAgo);
      const filtered = logs.filter((l) => l.date >= startStr && l.date <= selectedDate);
      return {
        targetLogs: filtered,
        rangeLabel: `Pekan: ${startStr} s/d ${selectedDate} (${filtered.length} hari)`,
      };
    }

    if (rangeMode === "period") {
      const [y, m, d] = selectedDate.split("-").map(Number);
      const targetMonth = d <= 20 ? m : m + 1;
      const targetYear = targetMonth > 12 ? y + 1 : y;
      const normMonth = targetMonth > 12 ? 1 : targetMonth;
      const prevMonth = normMonth === 1 ? 12 : normMonth - 1;
      const prevYear = normMonth === 1 ? targetYear - 1 : targetYear;

      const pad = (n) => String(n).padStart(2, "0");
      const periodStart = `${prevYear}-${pad(prevMonth)}-21`;
      const periodEnd = `${targetYear}-${pad(normMonth)}-20`;

      const filtered = logs.filter((l) => l.date >= periodStart && l.date <= periodEnd);
      return {
        targetLogs: filtered,
        rangeLabel: `Siklus Gajian: 21/${pad(prevMonth)} s/d 20/${pad(normMonth)} (${filtered.length} hari)`,
      };
    }

    return { targetLogs: [], rangeLabel: "" };
  }, [logs, selectedDate, rangeMode]);

  const handleGenerateAI = async () => {
    if (!targetLogs.length) {
      return toast.error("Tidak ada catatan log pada rentang yang dipilih.");
    }

    setIsAiLoading(true);
    try {
      let allActivities = "";
      let allLearning = "";
      let allObstacles = "";

      targetLogs.forEach((l) => {
        if (l.activities && l.activities.length > 0) {
          l.activities.forEach((act) => {
            allActivities += `[${l.date}] ${act.title}: ${act.description || ""}\n`;
          });
        }
        if (l.learning) allLearning += `[${l.date}] ${l.learning}\n`;
        if (l.obstacle) allObstacles += `[${l.date}] ${l.obstacle}\n`;
      });

      const payload = {
        activities: allActivities || "Belum ada kegiatan spesifik tercatat.",
        learning: allLearning || "Belum ada pembelajaran spesifik.",
        obstacle: allObstacles || "Tidak ada kendala fatal.",
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
      toast.success("Narasi laporan formal siap disalin!");
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
      toast.success("Teks tersalin ke clipboard!");
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-400">
        Memuat studio laporan...
      </div>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6 pb-12">
      {/* Glanceable Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pixel-badge text-indigo-700 bg-indigo-50/90 border-indigo-300">
              AI.RECAPPER
            </span>
            <span className="text-[11px] font-mono text-slate-400">Generator Narasi Baku</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            AI Report Studio
          </h1>
        </div>

        {/* Mode Selector Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => { setRangeMode("single"); setIsGenerated(false); }}
            className={`pixel-badge transition-all cursor-pointer ${
              rangeMode === "single"
                ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                : "text-slate-600 bg-white/70 border-slate-300 hover:bg-white"
            }`}
          >
            [1 HARI]
          </button>
          <button
            type="button"
            onClick={() => { setRangeMode("weekly"); setIsGenerated(false); }}
            className={`pixel-badge transition-all cursor-pointer ${
              rangeMode === "weekly"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                : "text-slate-600 bg-white/70 border-slate-300 hover:bg-white"
            }`}
          >
            [PEKAN (7 HARI)]
          </button>
          <button
            type="button"
            onClick={() => { setRangeMode("period"); setIsGenerated(false); }}
            className={`pixel-badge transition-all cursor-pointer ${
              rangeMode === "period"
                ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                : "text-slate-600 bg-white/70 border-slate-300 hover:bg-white"
            }`}
          >
            [PERIODE GAJIAN (TGL 20)]
          </button>
        </div>
      </header>

      {/* Main Studio Glass Panel */}
      <div className="glass-panel rounded-3xl p-5 md:p-7 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">Target Rangkuman:</span>
                <span className="pixel-counter">{rangeLabel}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {targetLogs.length} hari kerja terdeteksi dalam rentang ini
              </p>
            </div>
          </div>

          {/* Date Picker Anchor */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/80 border border-white/90 px-3 py-1.5 rounded-xl text-xs shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setIsGenerated(false);
                }}
                className="bg-transparent font-bold text-slate-800 focus:outline-none text-xs cursor-pointer font-mono"
              >
                {logs.map((log) => (
                  <option key={log.id} value={log.date}>
                    {log.date}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={isAiLoading || targetLogs.length === 0}
              className="bg-slate-900 hover:bg-slate-950 text-white px-4 py-2 rounded-xl shadow-xs transition-all font-bold text-xs disabled:opacity-60 cursor-pointer active:scale-95 flex items-center gap-2 shrink-0"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isAiLoading ? "animate-spin" : ""}`} />
              <span>{isAiLoading ? "Menyusun..." : "Rangkum AI"}</span>
            </button>
          </div>
        </div>

        {/* Output Section */}
        {isGenerated && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Uraian Kegiatan */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="pixel-badge text-indigo-700 bg-indigo-50 border-indigo-200">
                  KEGIATAN.FORMAL
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(aiReport.expandedActivities, "act")}
                  className="pixel-badge text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-300 cursor-pointer"
                >
                  {copiedKey === "act" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "act" ? "TERSALIN" : "SALIN"}</span>
                </button>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                {aiReport.expandedActivities}
              </p>
            </div>

            {/* Pembelajaran */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="pixel-badge text-blue-700 bg-blue-50 border-blue-200">
                  INSIGHT.KOMPETENSI
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(aiReport.expandedLearning, "learn")}
                  className="pixel-badge text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-300 cursor-pointer"
                >
                  {copiedKey === "learn" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "learn" ? "TERSALIN" : "SALIN"}</span>
                </button>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                {aiReport.expandedLearning}
              </p>
            </div>

            {/* Kendala */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="pixel-badge text-amber-700 bg-amber-50 border-amber-200">
                  KENDALA.SOLUSI
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(aiReport.expandedObstacle, "obs")}
                  className="pixel-badge text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-300 cursor-pointer"
                >
                  {copiedKey === "obs" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "obs" ? "TERSALIN" : "SALIN"}</span>
                </button>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                {aiReport.expandedObstacle}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
