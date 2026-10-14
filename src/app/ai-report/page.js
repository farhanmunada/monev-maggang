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
    <div className="space-y-5 md:space-y-6 pb-28 md:pb-16">
      {/* Glanceable Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-3 border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pixel-badge bg-[#8b5cf6] text-white">
              AI.RECAPPER
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-700">Generator Narasi Baku</span>
          </div>
          <h1 className="text-xl md:text-3xl font-black text-black uppercase tracking-tight">
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
                ? "bg-[#8b5cf6] text-white border-2 border-black shadow-[2px_2px_0px_#000] -translate-y-0.5"
                : "text-black bg-white border-2 border-black hover:bg-[#a3e635]"
            }`}
          >
            [1 HARI]
          </button>
          <button
            type="button"
            onClick={() => { setRangeMode("weekly"); setIsGenerated(false); }}
            className={`pixel-badge transition-all cursor-pointer ${
              rangeMode === "weekly"
                ? "bg-[#8b5cf6] text-white border-2 border-black shadow-[2px_2px_0px_#000] -translate-y-0.5"
                : "text-black bg-white border-2 border-black hover:bg-[#a3e635]"
            }`}
          >
            [PEKAN (7 HARI)]
          </button>
          <button
            type="button"
            onClick={() => { setRangeMode("period"); setIsGenerated(false); }}
            className={`pixel-badge transition-all cursor-pointer ${
              rangeMode === "period"
                ? "bg-[#a3e635] text-black border-2 border-black shadow-[2px_2px_0px_#000] -translate-y-0.5"
                : "text-black bg-white border-2 border-black hover:bg-[#a3e635]"
            }`}
          >
            [PERIODE GAJIAN (TGL 20)]
          </button>
        </div>
      </header>

      {/* Main Studio Glass Panel */}
      <div className="brutal-card bg-white p-5 md:p-7 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8b5cf6] border-2 border-black text-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
              <Bot className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs uppercase text-black">Target Rangkuman:</span>
                <span className="pixel-counter">{rangeLabel}</span>
              </div>
              <p className="text-[11px] text-slate-700 font-mono font-bold mt-0.5">
                {targetLogs.length} hari kerja terdeteksi dalam rentang ini
              </p>
            </div>
          </div>

          {/* Date Picker Anchor */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border-2 border-black px-3 py-1.5 rounded-lg text-xs shadow-[2px_2px_0px_#000]">
              <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
              <select
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setIsGenerated(false);
                }}
                className="bg-transparent font-black text-black focus:outline-none text-xs cursor-pointer font-mono"
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
              className="brutal-btn bg-[#a3e635] text-black px-5 py-2.5 rounded-xl shadow-[3px_3px_0px_#000] font-black text-xs disabled:opacity-60 cursor-pointer flex items-center gap-2 shrink-0"
            >
              <Sparkles className={`w-3.5 h-3.5 stroke-[2.5] ${isAiLoading ? "animate-spin" : ""}`} />
              <span>{isAiLoading ? "Menyusun..." : "Rangkum AI"}</span>
            </button>
          </div>
        </div>

        {/* Output Section */}
        {isGenerated && (
          <div className="space-y-4 animate-brutal-pop">
            {/* Uraian Kegiatan */}
            <div className="bg-white p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
              <div className="flex items-center justify-between">
                <span className="pixel-badge bg-[#8b5cf6] text-white">
                  KEGIATAN.FORMAL
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(aiReport.expandedActivities, "act")}
                  className="pixel-badge bg-white text-black hover:bg-[#a3e635] cursor-pointer"
                >
                  {copiedKey === "act" ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3 stroke-[2.5]" />}
                  <span>{copiedKey === "act" ? "TERSALIN" : "SALIN"}</span>
                </button>
              </div>
              <p className="text-xs text-black font-bold leading-relaxed whitespace-pre-wrap font-sans">
                {aiReport.expandedActivities}
              </p>
            </div>

            {/* Pembelajaran */}
            <div className="bg-white p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
              <div className="flex items-center justify-between">
                <span className="pixel-badge bg-[#a3e635] text-black">
                  INSIGHT.KOMPETENSI
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(aiReport.expandedLearning, "learn")}
                  className="pixel-badge bg-white text-black hover:bg-[#a3e635] cursor-pointer"
                >
                  {copiedKey === "learn" ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3 stroke-[2.5]" />}
                  <span>{copiedKey === "learn" ? "TERSALIN" : "SALIN"}</span>
                </button>
              </div>
              <p className="text-xs text-black font-bold leading-relaxed whitespace-pre-wrap font-sans">
                {aiReport.expandedLearning}
              </p>
            </div>

            {/* Kendala */}
            <div className="bg-white p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
              <div className="flex items-center justify-between">
                <span className="pixel-badge bg-black text-white">
                  KENDALA.SOLUSI
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(aiReport.expandedObstacle, "obs")}
                  className="pixel-badge bg-white text-black hover:bg-[#a3e635] cursor-pointer"
                >
                  {copiedKey === "obs" ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3 stroke-[2.5]" />}
                  <span>{copiedKey === "obs" ? "TERSALIN" : "SALIN"}</span>
                </button>
              </div>
              <p className="text-xs text-black font-bold leading-relaxed whitespace-pre-wrap font-sans">
                {aiReport.expandedObstacle}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
