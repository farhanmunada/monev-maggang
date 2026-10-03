"use client";

import { useState, useEffect } from "react";
import { Sparkles, Bot, Copy, Check, Calendar, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { formatYMD, formatIndonesianDate } from "@/lib/date";

export default function AiReportPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(formatYMD());
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

  const handleGenerateAI = async () => {
    setIsAiLoading(true);
    try {
      const targetLog = logs.find((l) => l.date === selectedDate);
      if (!targetLog) {
        throw new Error("Tidak ada catatan jurnal pada tanggal yang dipilih.");
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

  const currentLog = logs.find((l) => l.date === selectedDate);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-400">
        Memuat studio laporan...
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-7 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI Report Studio
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Generator Narasi Laporan Formal
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Ubah catatan harian acak menjadi uraian laporan resmi standar korporat siap serah ke mentor.
          </p>
        </div>
      </header>

      {/* Main Studio Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col items-center text-center max-w-xl mx-auto">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-200/70 text-indigo-600 rounded-2xl flex items-center justify-center mb-3 shadow-2xs">
            <Bot className="w-6 h-6" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-1">
            Penyusun Narasi Laporan
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pilih tanggal logbook yang ingin dirangkum. AI akan memformulasikan kegiatan teknis, refleksi kompetensi, dan analisis kendala dalam format formal.
          </p>

          {/* Date Picker Selector */}
          <div className="mt-5 flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500 font-medium">Pilih Tanggal:</span>
            <select
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setIsGenerated(false);
              }}
              className="bg-transparent font-semibold text-slate-900 focus:outline-none text-xs cursor-pointer font-mono"
            >
              {logs.map((log) => (
                <option key={log.id} value={log.date}>
                  {log.date} — {log.attendance} ({log.activities ? log.activities.length : 0} aktivitas)
                </option>
              ))}
            </select>
          </div>

          {currentLog && (
            <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-2">
              <span>Status: <strong className="text-slate-700">{currentLog.attendance}</strong></span>
              <span>•</span>
              <span>{formatIndonesianDate(currentLog.date)}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={isAiLoading || logs.length === 0}
            className="mt-5 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto px-6 py-2.5 rounded-xl shadow-xs transition-all font-semibold text-xs disabled:opacity-60 cursor-pointer active:scale-95"
          >
            {isAiLoading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Menyusun Narasi Baku...
              </span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate Narasi Laporan
              </>
            )}
          </button>
        </div>

        {/* Hasil Laporan AI */}
        {isGenerated && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 pt-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Hasil Rangkuman Laporan</h3>
              </div>
              <span className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full font-mono font-medium">
                {selectedDate}
              </span>
            </div>

            <div className="space-y-4">
              {/* Uraian Kegiatan */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Uraian Kegiatan
                  </p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(aiReport.expandedActivities, "act")}
                    className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    {copiedKey === "act" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === "act" ? "Tersalin" : "Salin"}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {aiReport.expandedActivities}
                </p>
              </div>

              {/* Pembelajaran */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Refleksi Pembelajaran & Insight
                  </p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(aiReport.expandedLearning, "learn")}
                    className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    {copiedKey === "learn" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === "learn" ? "Tersalin" : "Salin"}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {aiReport.expandedLearning}
                </p>
              </div>

              {/* Kendala */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Kendala & Solusi Teknis
                  </p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(aiReport.expandedObstacle, "obs")}
                    className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    {copiedKey === "obs" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === "obs" ? "Tersalin" : "Salin"}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {aiReport.expandedObstacle}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
