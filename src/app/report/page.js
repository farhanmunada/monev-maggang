"use client";

import { useState, useEffect } from "react";
import { Download, Sparkles, FileText, Bot, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ReportPage() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState({ hadir: 0, izin: 0, sakit: 0, alfa: 0 });
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  
  // Data mentah gabungan untuk digenerate oleh AI
  const [rawData, setRawData] = useState({
    activities: "",
    learning: "",
    obstacle: ""
  });

  const [aiReport, setAiReport] = useState({
    expandedActivities: "",
    expandedLearning: "",
    expandedObstacle: ""
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        // Ambil semua data absensi
        const { data, error } = await supabase
          .from("daily_logs")
          .select(`
            *,
            activities ( title, description )
          `)
          .order("date", { ascending: false });

        if (error) throw error;
        
        let hadir = 0, izin = 0, sakit = 0, alfa = 0;
        let allActivities = "";
        let allLearning = "";
        let allObstacle = "";

        const formatted = data.map(log => {
          // Hitung statistik
          if (log.attendance === "Hadir") hadir++;
          else if (log.attendance === "Izin") izin++;
          else if (log.attendance === "Sakit") sakit++;
          else if (log.attendance === "Alfa") alfa++;

          return {
            date: log.date,
            attendance: log.attendance,
            activitiesCount: log.activities ? log.activities.length : 0
          };
        });

        // Ambil HANYA data hari ini untuk digenerate oleh AI
        const todayStr = new Date().toISOString().split("T")[0];
        const todayLog = data.find(l => l.date === todayStr);

        if (todayLog) {
          if (todayLog.activities) {
            todayLog.activities.forEach(act => {
              allActivities += `- ${act.title}: ${act.description || ""}\n`;
            });
          }
          if (todayLog.learning) allLearning = todayLog.learning;
          if (todayLog.obstacle) allObstacle = todayLog.obstacle;
        }

        setStats({ hadir, izin, sakit, alfa });
        setReportData(formatted);
        
        // Simpan raw data (hanya hari ini) untuk dikirim ke API AI
        setRawData({
          activities: allActivities || "Belum ada kegiatan tercatat hari ini.",
          learning: allLearning || "Belum ada pembelajaran tercatat hari ini.",
          obstacle: allObstacle || "Tidak ada kendala."
        });

      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const handleGenerateAI = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rawData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Gagal menghubungi AI");
      }

      setAiReport(data);
      setIsGenerated(true);
    } catch (error) {
      console.error(error);
      alert("Error dari AI: " + error.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExport = () => {
    alert("Fitur Ekspor PDF/Excel akan segera diimplementasikan!");
  };

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center animate-pulse">Menghitung rekapitulasi laporan...</div>;
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-1 md:mb-2">
            Laporan Absensi & Kegiatan
          </h1>
          <p className="text-sm md:text-base text-secondary">Rekapitulasi kehadiran dan penyempurnaan laporan dengan AI (Groq).</p>
        </div>
      </header>

      {/* Ringkasan Statistik Absensi */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-secondary mb-1">Total Hadir</p>
          <p className="text-2xl font-bold text-green-600">{stats.hadir} Hari</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-secondary mb-1">Total Izin</p>
          <p className="text-2xl font-bold text-blue-600">{stats.izin} Hari</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-secondary mb-1">Total Sakit</p>
          <p className="text-2xl font-bold text-amber-600">{stats.sakit} Hari</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-secondary mb-1">Total Alfa</p>
          <p className="text-2xl font-bold text-red-600">{stats.alfa} Hari</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-5 md:p-8 shadow-sm">
        <div className="mb-6 md:mb-8 flex flex-col items-center text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3 md:mb-4">
            <Bot className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">Generator Laporan Cerdas</h2>
          <p className="text-sm md:text-base text-secondary max-w-2xl mx-auto">
            AI akan membaca seluruh ringkasan jurnal, aktivitas, pembelajaran, dan kendala Anda dari database, lalu menyusunnya menjadi satu narasi laporan akhir yang profesional dan humanis.
          </p>
          
          <button 
            onClick={handleGenerateAI}
            disabled={isAiLoading || reportData.length === 0}
            className="mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white w-full md:w-auto px-6 md:px-8 py-3.5 md:py-4 rounded-xl shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 transition-transform font-bold text-base md:text-lg disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isAiLoading ? (
              <span className="animate-pulse flex items-center gap-2 text-sm md:text-base">Sedang Merangkum...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                Generate Narasi Laporan
              </>
            )}
          </button>
        </div>


        {/* Hasil AI */}
        {isGenerated && (
          <div className="bg-gradient-to-br from-indigo-50 to-primary-50 border border-primary-100 rounded-3xl p-5 md:p-8 shadow-inner relative overflow-hidden mt-6 md:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg md:text-2xl font-bold flex items-center gap-2 mb-4 md:mb-6 text-indigo-950 border-b border-indigo-200 pb-3 md:pb-4">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" />
              Narasi Laporan
            </h2>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-indigo-900 mb-2 uppercase tracking-wide">Uraian Kegiatan</p>
                <div className="bg-white p-5 rounded-xl border border-white text-foreground text-sm shadow-sm leading-relaxed whitespace-pre-wrap">
                  {aiReport.expandedActivities}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-indigo-900 mb-2 uppercase tracking-wide">Pembelajaran</p>
                <div className="bg-white p-5 rounded-xl border border-white text-foreground text-sm shadow-sm leading-relaxed whitespace-pre-wrap">
                  {aiReport.expandedLearning}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-indigo-900 mb-2 uppercase tracking-wide">Kendala</p>
                <div className="bg-white p-5 rounded-xl border border-white text-foreground text-sm shadow-sm leading-relaxed whitespace-pre-wrap">
                  {aiReport.expandedObstacle}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
