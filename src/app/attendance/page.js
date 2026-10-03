"use client";

import { useState, useEffect } from "react";
import { Search, Filter, CalendarCheck2, Clock, ChevronDown, ChevronRight, BookOpen, AlertCircle, Printer } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { formatIndonesianDate } from "@/lib/date";

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [stats, setStats] = useState({ hadir: 0, izin: 0, sakit: 0, alfa: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*, activities ( * )")
        .order("date", { ascending: false });

      if (error) throw error;

      let hadir = 0, izin = 0, sakit = 0, alfa = 0;
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
      toast.error("Gagal memuat catatan absensi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchStatus = filterStatus === "Semua" || log.attendance === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      log.date.includes(q) ||
      (log.attendance && log.attendance.toLowerCase().includes(q)) ||
      (log.learning && log.learning.toLowerCase().includes(q)) ||
      (log.obstacle && log.obstacle.toLowerCase().includes(q)) ||
      (log.activities &&
        log.activities.some(
          (a) =>
            (a.title && a.title.toLowerCase().includes(q)) ||
            (a.description && a.description.toLowerCase().includes(q))
        ));
    return matchStatus && matchSearch;
  });

  const totalLogs = logs.length;
  const attendanceRate = totalLogs > 0 ? Math.round((stats.hadir / totalLogs) * 100) : 100;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-xs text-slate-400">
        Memuat catatan absensi...
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
              <CalendarCheck2 className="w-3.5 h-3.5" />
              Rekapitulasi Kehadiran
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Absensi & Riwayat Jurnal
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Pantau statistik presensi magang dan arsip rekap log kegiatan harianmu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print flex items-center gap-1.5 bg-white border border-slate-200/90 hover:border-slate-300 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer hover:bg-slate-50"
            title="Cetak atau simpan PDF rekapitulasi kehadiran"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak PDF</span>
          </button>

          <div className="flex items-center gap-2 bg-white border border-slate-200/90 px-3.5 py-2 rounded-xl text-xs shadow-2xs">
            <span className="text-slate-500 font-medium">Tingkat Hadir:</span>
            <span className="font-bold text-emerald-600 font-mono text-sm">{attendanceRate}%</span>
          </div>
        </div>
      </header>

      {/* Ringkasan Statistik 4 Kolom */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-slate-500 mb-1 font-medium">Hadir</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-600 font-mono">
            {stats.hadir} <span className="text-xs font-normal text-slate-400">Hari</span>
          </p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-slate-500 mb-1 font-medium">Izin</p>
          <p className="text-xl md:text-2xl font-bold text-blue-600 font-mono">
            {stats.izin} <span className="text-xs font-normal text-slate-400">Hari</span>
          </p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-slate-500 mb-1 font-medium">Sakit</p>
          <p className="text-xl md:text-2xl font-bold text-amber-600 font-mono">
            {stats.sakit} <span className="text-xs font-normal text-slate-400">Hari</span>
          </p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-slate-500 mb-1 font-medium">Alfa</p>
          <p className="text-xl md:text-2xl font-bold text-rose-600 font-mono">
            {stats.alfa} <span className="text-xs font-normal text-slate-400">Hari</span>
          </p>
        </div>
      </div>

      {/* Pencarian dan Filter Status */}
      <div className="no-print flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari tanggal, kata kunci kegiatan, atau pembelajaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {["Semua", "Hadir", "Izin", "Sakit", "Alfa"].map((st) => (
            <button
              type="button"
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
            Tidak ada data absensi yang cocok dengan filter pencarian.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const actCount = log.activities ? log.activities.length : 0;

            return (
              <div
                key={log.id}
                className={`bg-white border rounded-xl transition-all shadow-2xs ${
                  isExpanded
                    ? "border-slate-300 ring-1 ring-slate-200/80"
                    : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <div
                  onClick={() => setExpandedLogId((prev) => (prev === log.id ? null : log.id))}
                  className="p-4 flex items-center justify-between cursor-pointer gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs font-mono ${
                        log.attendance === "Hadir"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : log.attendance === "Izin"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : log.attendance === "Sakit"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
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
                          ? log.activities.map((a) => a.title).join(", ")
                          : log.learning || "Belum ada rincian kegiatan"}
                      </p>
                    </div>
                  </div>

                  <div className="text-slate-400 p-1 flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-900" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" /> Rincian Kegiatan
                      </h4>
                      {actCount === 0 ? (
                        <p className="text-xs text-slate-400 italic">Belum ada rincian kegiatan tercatat.</p>
                      ) : (
                        <div className="space-y-2">
                          {log.activities.map((act) => (
                            <div
                              key={act.id}
                              className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs"
                            >
                              <div className="flex items-center gap-2 mb-0.5">
                                {act.time_range && (
                                  <span className="font-medium text-slate-600 bg-slate-200/80 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                    {act.time_range}
                                  </span>
                                )}
                                <span className="font-semibold text-slate-900">{act.title}</span>
                              </div>
                              {act.description && (
                                <p className="text-slate-500 text-[11px] leading-relaxed">
                                  {act.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg">
                        <h5 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Pembelajaran
                        </h5>
                        <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                          {log.learning || (
                            <span className="text-slate-400 italic">Tidak ada catatan pembelajaran.</span>
                          )}
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg">
                        <h5 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Kendala
                        </h5>
                        <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                          {log.obstacle || (
                            <span className="text-slate-400 italic">Tidak ada kendala.</span>
                          )}
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
  );
}
