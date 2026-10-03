"use client";

import { useState, useEffect } from "react";
import { 
  Search, Calendar, ChevronDown, ChevronRight, Sparkles, Bot, 
  FileText, CheckCircle2, Clock, Copy, Check, Filter, BookOpen, AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

function formatIndonesianDate(dateString) {
  if (!dateString) return "-";
  const [year, month, day] = dateString.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function getLocalDateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
    expandedObstacle: ""
  });

  const [selectedDateForAi, setSelectedDateForAi] = useState(getLocalDateString());

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_logs")
        .select(`
          *,
          activities ( * )
        `)
        .order("date", { ascending: false });

      if (error) throw error;

      let hadir = 0, izin = 0, sakit = 0, alfa = 0;
      (data || []).forEach(log => {
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
      const targetLog = logs.find(l => l.date === selectedDateForAi) || logs[0];

      if (!targetLog) {
        throw new Error("Tidak ada catatan log pada tanggal yang dipilih.");
      }

      let allActivities = "";
      if (targetLog.activities && targetLog.activities.length > 0) {
        targetLog.activities.forEach(act => {
          allActivities += `- ${act.title}: ${act.description || ""}\n`;
        });
      }

      const payload = {
        activities: allActivities || "Belum ada kegiatan tercatat.",
        learning: targetLog.learning || "Belum ada pembelajaran tercatat.",
        obstacle: targetLog.obstacle || "Tidak ada kendala."
      };

      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Teks berhasil disalin ke clipboard.");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleExpand = (id) => {
    setExpandedLogId(prev => prev === id ? null : id);
  };

  const filteredLogs = logs.filter(log => {
    const matchStatus = filterStatus === "Semua" || log.attendance === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = 
      log.date.includes(q) ||
      (log.attendance && log.attendance.toLowerCase().includes(q)) ||
      (log.learning && log.learning.toLowerCase().includes(q)) ||
      (log.obstacle && log.obstacle.toLowerCase().includes(q)) ||
      (log.activities && log.activities.some(a => 
        (a.title && a.title.toLowerCase().includes(q)) || 
        (a.description && a.description.toLowerCase().includes(q))
      ));
    return matchStatus && matchSearch;
  });

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-400">Memuat rekapitulasi...</div>;
  }

  return (
    <div className="space-y-6 md:space-y-7 pb-12">
      {/* Header */}
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

      {/* Ringkasan Statistik Absensi */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-slate-500 mb-1 font-medium">Hadir</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-600 font-mono">{stats.hadir} <span className="text-xs font-normal text-slate-400">Hari</span></p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-slate-500 mb-1 font-medium">Izin</p>
          <p className="text-xl md:text-2xl font-bold text-blue-600 font-mono">{stats.izin} <span className="text-xs font-normal text-slate-400">Hari</span></p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-slate-500 mb-1 font-medium">Sakit</p>
          <p className="text-xl md:text-2xl font-bold text-amber-600 font-mono">{stats.sakit} <span className="text-xs font-normal text-slate-400">Hari</span></p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-slate-500 mb-1 font-medium">Alfa</p>
          <p className="text-xl md:text-2xl font-bold text-rose-600 font-mono">{stats.alfa} <span className="text-xs font-normal text-slate-400">Hari</span></p>
        </div>
      </div>

      {/* Navigasi Tab */}
      <div className="flex border-b border-slate-200/90 gap-4">
        <button
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

      {/* KONTEN TAB 1: RIWAYAT JURNAL */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {/* Pencarian dan Filter Status */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari tanggal, kata kunci kegiatan, atau pembelajaran..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {["Semua", "Hadir", "Izin", "Sakit", "Alfa"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterStatus === st
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* List Card Riwayat */}
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl text-xs">
                Tidak ada data jurnal yang cocok dengan filter pencarian.
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const actCount = log.activities ? log.activities.length : 0;

                return (
                  <div 
                    key={log.id} 
                    className={`bg-white border rounded-xl transition-all shadow-2xs ${
                      isExpanded ? "border-slate-300 ring-1 ring-slate-200/80" : "border-slate-200/90 hover:border-slate-300"
                    }`}
                  >
                    {/* Header Item Card */}
                    <div 
                      onClick={() => toggleExpand(log.id)}
                      className="p-4 flex items-center justify-between cursor-pointer gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs font-mono ${
                          log.attendance === "Hadir" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          log.attendance === "Izin" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                          log.attendance === "Sakit" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {log.attendance === "Hadir" ? "HD" : log.attendance.slice(0, 2).toUpperCase()}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <h3 className="font-semibold text-slate-900 text-xs md:text-sm">
                              {formatIndonesianDate(log.date)}
                            </h3>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                              {actCount} Kegiatan
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 truncate">
                            {actCount > 0 
                              ? log.activities.map(a => a.title).join(", ") 
                              : (log.learning || "Belum ada rincian kegiatan")}
                          </p>
                        </div>
                      </div>

                      <div className="text-slate-400 p-1 flex-shrink-0">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-900" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Konten Detail Terbuka */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
                        {/* Rincian Kegiatan */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-600" /> Rincian Kegiatan
                          </h4>
                          {actCount === 0 ? (
                            <p className="text-xs text-slate-400 italic">Belum ada rincian kegiatan tercatat.</p>
                          ) : (
                            <div className="space-y-2">
                              {log.activities.map((act) => (
                                <div key={act.id} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    {act.time_range && (
                                      <span className="font-medium text-slate-600 bg-slate-200/80 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                        {act.time_range}
                                      </span>
                                    )}
                                    <span className="font-semibold text-slate-900">{act.title}</span>
                                  </div>
                                  {act.description && (
                                    <p className="text-slate-500 text-[11px] leading-relaxed">{act.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Pembelajaran & Kendala */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg">
                            <h5 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Pembelajaran
                            </h5>
                            <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                              {log.learning || <span className="text-slate-400 italic">Tidak ada catatan pembelajaran.</span>}
                            </p>
                          </div>

                          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg">
                            <h5 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Kendala
                            </h5>
                            <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                              {log.obstacle || <span className="text-slate-400 italic">Tidak ada kendala.</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* KONTEN TAB 2: GENERATOR LAPORAN AI */}
      {activeTab === "ai" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-7 shadow-xs space-y-6">
          <div className="flex flex-col items-center text-center max-w-xl mx-auto">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-3 shadow-xs">
              <Bot className="w-6 h-6" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-1">Generator Narasi Laporan</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ubah catatan harian acak menjadi narasi laporan resmi yang terstruktur, rapi, dan siap dilaporkan ke pembimbing lapangan.
            </p>

            {/* Pemilihan Tanggal */}
            <div className="mt-4 flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-500 font-medium">Pilih Tanggal:</span>
              <select
                value={selectedDateForAi}
                onChange={(e) => setSelectedDateForAi(e.target.value)}
                className="bg-transparent font-semibold text-slate-900 focus:outline-none text-xs cursor-pointer font-mono"
              >
                {logs.map((log) => (
                  <option key={log.id} value={log.date}>
                    {log.date} ({log.attendance})
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleGenerateAI}
              disabled={isAiLoading || logs.length === 0}
              className="mt-5 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white w-full md:w-auto px-6 py-2.5 rounded-xl shadow-xs transition-all font-semibold text-xs disabled:opacity-60 cursor-pointer"
            >
              {isAiLoading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Menyusun Narasi...
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
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Hasil Rangkuman Laporan
                </h3>
                <span className="text-[11px] text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 font-mono font-medium">
                  {selectedDateForAi}
                </span>
              </div>

              <div className="space-y-4">
                {/* Uraian Kegiatan */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Uraian Kegiatan</p>
                    <button
                      onClick={() => copyToClipboard(aiReport.expandedActivities, "act")}
                      className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      {copiedKey === "act" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
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
                    <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Refleksi Pembelajaran</p>
                    <button
                      onClick={() => copyToClipboard(aiReport.expandedLearning, "learn")}
                      className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      {copiedKey === "learn" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
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
                    <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Kendala & Solusi</p>
                    <button
                      onClick={() => copyToClipboard(aiReport.expandedObstacle, "obs")}
                      className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      {copiedKey === "obs" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
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
      )}
    </div>
  );
}
