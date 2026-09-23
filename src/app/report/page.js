"use client";

import { useState, useEffect } from "react";
import { 
  Search, Calendar, ChevronDown, ChevronRight, Sparkles, Bot, 
  FileText, CheckCircle2, Clock, Copy, Check, Filter, BookOpen, AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

// Helper format tanggal lokal
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
  const [activeTab, setActiveTab] = useState("history"); // "history" | "ai"
  const [logs, setLogs] = useState([]);
  const [expandedLogId, setExpandedLogId] = useState(null);
  
  // Search & Filter
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  
  // Stats
  const [stats, setStats] = useState({ hadir: 0, izin: 0, sakit: 0, alfa: 0 });

  // AI Generator States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  
  const [aiReport, setAiReport] = useState({
    expandedActivities: "",
    expandedLearning: "",
    expandedObstacle: ""
  });

  const [selectedDateForAi, setSelectedDateForAi] = useState(getLocalDateString());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
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

      // Auto expand log terbaru jika ada
      if (data && data.length > 0) {
        setExpandedLogId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Gagal memuat data absensi & riwayat");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    setIsAiLoading(true);
    try {
      // Cari data berdasarkan tanggal yang dipilih
      const targetLog = logs.find(l => l.date === selectedDateForAi) || logs[0];

      if (!targetLog) {
        throw new Error("Tidak ada data jurnal untuk tanggal yang dipilih.");
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
        throw new Error(data.error || "Gagal menghubungi AI");
      }

      setAiReport(data);
      setIsGenerated(true);
      toast.success("Narasi laporan absensi berhasil digenerate!");
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
    toast.success("Teks berhasil disalin!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleExpand = (id) => {
    setExpandedLogId(prev => prev === id ? null : id);
  };

  // Filter logs
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
    return <div className="min-h-[50vh] flex items-center justify-center animate-pulse text-secondary">Memuat data absensi & riwayat...</div>;
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-1 md:mb-2">
            Absensi & Riwayat
          </h1>
          <p className="text-sm md:text-base text-secondary">
            Rekapitulasi kehadiran, riwayat aktivitas harian, dan generator narasi laporan magang.
          </p>
        </div>
      </header>

      {/* Ringkasan Statistik Absensi */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm">
          <p className="text-xs md:text-sm text-secondary mb-1">Total Hadir</p>
          <p className="text-2xl md:text-3xl font-extrabold text-green-600">{stats.hadir} <span className="text-sm font-normal text-secondary">Hari</span></p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm">
          <p className="text-xs md:text-sm text-secondary mb-1">Total Izin</p>
          <p className="text-2xl md:text-3xl font-extrabold text-blue-600">{stats.izin} <span className="text-sm font-normal text-secondary">Hari</span></p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm">
          <p className="text-xs md:text-sm text-secondary mb-1">Total Sakit</p>
          <p className="text-2xl md:text-3xl font-extrabold text-amber-600">{stats.sakit} <span className="text-sm font-normal text-secondary">Hari</span></p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-sm">
          <p className="text-xs md:text-sm text-secondary mb-1">Total Alfa</p>
          <p className="text-2xl md:text-3xl font-extrabold text-red-600">{stats.alfa} <span className="text-sm font-normal text-secondary">Hari</span></p>
        </div>
      </div>

      {/* Navigasi Tab */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm md:text-base font-semibold border-b-2 transition-all ${
            activeTab === "history"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-secondary hover:text-foreground"
          }`}
        >
          <Clock className="w-4 h-4 md:w-5 md:h-5" />
          Daftar Riwayat Jurnal
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
            {logs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm md:text-base font-semibold border-b-2 transition-all ${
            activeTab === "ai"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-secondary hover:text-foreground"
          }`}
        >
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />
          Generator Laporan AI
        </button>
      </div>

      {/* KONTEN TAB 1: RIWAYAT JURNAL */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* Pencarian dan Filter Status */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-secondary" />
              <input
                type="text"
                placeholder="Cari berdasarkan tanggal, kegiatan, pembelajaran..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-secondary font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>
              {["Semua", "Hadir", "Izin", "Sakit", "Alfa"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === st
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-card border border-border text-secondary hover:bg-gray-100"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* List Card Riwayat */}
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-secondary bg-card border-2 border-dashed border-border rounded-2xl">
                Tidak ada catatan absensi/riwayat yang sesuai dengan filter.
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const actCount = log.activities ? log.activities.length : 0;

                return (
                  <div 
                    key={log.id} 
                    className={`bg-card border rounded-2xl transition-all shadow-sm ${
                      isExpanded ? "border-primary-300 ring-1 ring-primary-100" : "border-border hover:border-gray-300"
                    }`}
                  >
                    {/* Header Item Card */}
                    <div 
                      onClick={() => toggleExpand(log.id)}
                      className="p-4 md:p-5 flex items-center justify-between cursor-pointer gap-4"
                    >
                      <div className="flex items-center gap-3 md:gap-4 flex-1">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${
                          log.attendance === "Hadir" ? "bg-green-100 text-green-700" :
                          log.attendance === "Izin" ? "bg-blue-100 text-blue-700" :
                          log.attendance === "Sakit" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-foreground text-sm md:text-base">
                              {formatIndonesianDate(log.date)}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              log.attendance === "Hadir" ? "bg-green-50 text-green-700 border border-green-200" :
                              log.attendance === "Izin" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                              log.attendance === "Sakit" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                              "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                              {log.attendance}
                            </span>
                            <span className="text-xs text-secondary bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                              {actCount} Kegiatan
                            </span>
                          </div>

                          <p className="text-xs md:text-sm text-secondary truncate">
                            {actCount > 0 
                              ? log.activities.map(a => a.title).join(", ") 
                              : (log.learning || "Tidak ada rincian kegiatan")}
                          </p>
                        </div>
                      </div>

                      <div className="text-secondary p-1">
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-primary-600" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>

                    {/* Konten Detail Terbuka */}
                    {isExpanded && (
                      <div className="px-4 pb-5 md:px-5 md:pb-6 pt-2 border-t border-border/60 space-y-4 animate-in fade-in duration-300">
                        {/* Rincian Kegiatan */}
                        <div>
                          <h4 className="text-xs md:text-sm font-bold text-foreground mb-2 flex items-center gap-1.5 text-primary-700">
                            <Clock className="w-4 h-4" /> Daftar Kegiatan
                          </h4>
                          {actCount === 0 ? (
                            <p className="text-xs text-secondary italic">Belum ada kegiatan yang dicatat.</p>
                          ) : (
                            <div className="space-y-2">
                              {log.activities.map((act) => (
                                <div key={act.id} className="p-3 bg-gray-50/70 border border-gray-100 rounded-xl text-xs md:text-sm">
                                  <div className="flex items-center gap-2 mb-1">
                                    {act.time_range && (
                                      <span className="font-semibold text-primary-700 bg-primary-100/60 px-2 py-0.5 rounded text-[11px]">
                                        {act.time_range}
                                      </span>
                                    )}
                                    <span className="font-bold text-foreground">{act.title}</span>
                                  </div>
                                  {act.description && (
                                    <p className="text-secondary text-xs">{act.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Pembelajaran & Kendala Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          <div className="bg-indigo-50/40 border border-indigo-100 p-3.5 rounded-xl">
                            <h5 className="text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Pembelajaran
                            </h5>
                            <p className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed">
                              {log.learning || <span className="text-secondary italic">Tidak ada catatan pembelajaran.</span>}
                            </p>
                          </div>

                          <div className="bg-amber-50/40 border border-amber-100 p-3.5 rounded-xl">
                            <h5 className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Kendala
                            </h5>
                            <p className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed">
                              {log.obstacle || <span className="text-secondary italic">Tidak ada kendala.</span>}
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
        <div className="bg-card border border-border rounded-3xl p-5 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-indigo-500/20">
              <Bot className="w-7 h-7" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-foreground">Generator Narasi Laporan Absensi</h2>
            <p className="text-sm text-secondary leading-relaxed">
              AI akan menyusun seluruh uraian kegiatan, pembelajaran, dan kendala menjadi narasi laporan akhir yang profesional, humanis, dan siap dimasukkan ke form absensi/laporan magang.
            </p>

            {/* Pemilihan Tanggal untuk Generate */}
            <div className="mt-5 flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm">
              <span className="text-secondary font-medium text-xs">Pilih Tanggal Log:</span>
              <select
                value={selectedDateForAi}
                onChange={(e) => setSelectedDateForAi(e.target.value)}
                className="bg-transparent font-semibold text-foreground focus:outline-none text-xs md:text-sm cursor-pointer"
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
              className="mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-full md:w-auto px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-purple-700 transition-all font-bold text-sm md:text-base disabled:opacity-60"
            >
              {isAiLoading ? (
                <span className="animate-pulse flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" /> Sedang Menyusun Narasi...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Narasi Laporan
                </>
              )}
            </button>
          </div>

          {/* Hasil Laporan AI */}
          {isGenerated && (
            <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 border border-indigo-200 rounded-3xl p-5 md:p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between border-b border-indigo-200 pb-4">
                <h3 className="text-lg md:text-xl font-bold text-indigo-950 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Hasil Narasi Laporan
                </h3>
                <span className="text-xs text-indigo-700 bg-white px-3 py-1 rounded-full border border-indigo-100 font-medium">
                  {selectedDateForAi}
                </span>
              </div>

              <div className="space-y-5">
                {/* Uraian Kegiatan */}
                <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm relative group">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Uraian Kegiatan</p>
                    <button
                      onClick={() => copyToClipboard(aiReport.expandedActivities, "act")}
                      className="text-xs text-secondary hover:text-primary-600 flex items-center gap-1 font-medium transition-colors"
                    >
                      {copiedKey === "act" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === "act" ? "Tersalin!" : "Salin"}
                    </button>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {aiReport.expandedActivities}
                  </p>
                </div>

                {/* Pembelajaran */}
                <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm relative group">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Pembelajaran</p>
                    <button
                      onClick={() => copyToClipboard(aiReport.expandedLearning, "learn")}
                      className="text-xs text-secondary hover:text-primary-600 flex items-center gap-1 font-medium transition-colors"
                    >
                      {copiedKey === "learn" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === "learn" ? "Tersalin!" : "Salin"}
                    </button>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {aiReport.expandedLearning}
                  </p>
                </div>

                {/* Kendala */}
                <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm relative group">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Kendala</p>
                    <button
                      onClick={() => copyToClipboard(aiReport.expandedObstacle, "obs")}
                      className="text-xs text-secondary hover:text-primary-600 flex items-center gap-1 font-medium transition-colors"
                    >
                      {copiedKey === "obs" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === "obs" ? "Tersalin!" : "Salin"}
                    </button>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
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
