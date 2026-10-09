"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Printer,
  CalendarCheck2,
  Clock,
  BookOpen,
  AlertCircle,
  X,
  ExternalLink,
  Plus,
  Coins,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { formatIndonesianDate, formatYMD } from "@/lib/date";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [activeDate, setActiveDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*, activities ( * )")
        .order("date", { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
      toast.error("Gagal memuat catatan absensi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Map logs by YYYY-MM-DD for O(1) lookup
  const logsByDate = useMemo(() => {
    const map = {};
    logs.forEach((log) => {
      map[log.date] = log;
    });
    return map;
  }, [logs]);

  // Current year and month viewed
  const currentYear = activeDate.getFullYear();
  const currentMonth = activeDate.getMonth(); // 0 - 11

  // Navigation handlers
  const handlePrevMonth = () => {
    setActiveDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setActiveDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setActiveDate(new Date());
  };

  // Month days calculation
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Monday-based index: 0 = Mon, ..., 6 = Sun
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

    const cells = [];

    // Leading empty cells
    for (let i = 0; i < startDayIndex; i++) {
      cells.push({ isBlank: true, key: `blank-${i}` });
    }

    // Days in month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const pad = (n) => String(n).padStart(2, "0");
      const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}`;
      const dateObj = new Date(currentYear, currentMonth, day);
      const isSunday = dateObj.getDay() === 0;
      const isPayday = day === 20;

      const log = logsByDate[dateStr] || null;

      cells.push({
        isBlank: false,
        key: dateStr,
        day,
        dateStr,
        isSunday,
        isPayday,
        log,
      });
    }

    return cells;
  }, [currentYear, currentMonth, logsByDate]);

  // Active Month Statistics
  const monthStats = useMemo(() => {
    const pad = (n) => String(n).padStart(2, "0");
    const prefix = `${currentYear}-${pad(currentMonth + 1)}`;
    const monthLogs = logs.filter((l) => l.date.startsWith(prefix));

    let hadir = 0, izin = 0, sakit = 0, alfa = 0;
    monthLogs.forEach((l) => {
      if (l.attendance === "Hadir") hadir++;
      else if (l.attendance === "Izin") izin++;
      else if (l.attendance === "Sakit") sakit++;
      else if (l.attendance === "Alfa") alfa++;
    });

    const total = monthLogs.length;
    const rate = total > 0 ? Math.round((hadir / total) * 100) : 100;

    return { hadir, izin, sakit, alfa, total, rate };
  }, [currentYear, currentMonth, logs]);

  const todayStr = formatYMD();
  const selectedLog = selectedDateStr ? logsByDate[selectedDateStr] : null;

  return (
    <div className="space-y-6 md:space-y-7 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pixel-badge text-indigo-700 bg-indigo-50/90 border-indigo-300">
              <CalendarCheck2 className="w-3 h-3" />
              PRESENSI.LOG
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Kalender Kehadiran & Riwayat Jurnal
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Klik tanggal pada kalender untuk membuka rincian kegiatan dan pembelajaran harian.
          </p>
        </div>

        {/* Action Buttons & Month Navigation */}
        <div className="no-print flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white border border-slate-200/90 hover:border-slate-300 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer hover:bg-slate-50"
            title="Cetak atau simpan PDF kalender kehadiran"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak PDF</span>
          </button>

          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Hari Ini
          </button>

          <div className="flex items-center bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-r border-slate-200/90 transition-colors cursor-pointer"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3.5 py-1.5 font-bold text-xs text-slate-800 font-mono whitespace-nowrap">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-l border-slate-200/90 transition-colors cursor-pointer"
              title="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Monthly Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-[11px] text-slate-500 font-medium">Tingkat Hadir</p>
          <p className="text-xl md:text-2xl font-extrabold text-emerald-600 font-mono mt-0.5">
            {monthStats.rate}%
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-[11px] text-slate-500 font-medium">Hadir Bulan Ini</p>
          <p className="text-xl md:text-2xl font-bold text-slate-900 font-mono mt-0.5">
            {monthStats.hadir} <span className="text-xs font-normal text-slate-400">Hari</span>
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-[11px] text-slate-500 font-medium">Izin</p>
          <p className="text-xl md:text-2xl font-bold text-blue-600 font-mono mt-0.5">
            {monthStats.izin} <span className="text-xs font-normal text-slate-400">Hari</span>
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-[11px] text-slate-500 font-medium">Sakit</p>
          <p className="text-xl md:text-2xl font-bold text-amber-600 font-mono mt-0.5">
            {monthStats.sakit} <span className="text-xs font-normal text-slate-400">Hari</span>
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-4 col-span-2 sm:col-span-1">
          <p className="text-[11px] text-slate-500 font-medium">Alfa</p>
          <p className="text-xl md:text-2xl font-bold text-rose-600 font-mono mt-0.5">
            {monthStats.alfa} <span className="text-xs font-normal text-slate-400">Hari</span>
          </p>
        </div>
      </div>

      {/* Main Interactive Calendar Grid */}
      <div className="glass-panel rounded-3xl p-4 md:p-6 shadow-sm">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center">
          {DAY_NAMES.map((dayName, idx) => (
            <div
              key={dayName}
              className={`py-2 text-[11px] font-bold uppercase tracking-wider ${
                idx === 6 ? "text-rose-500" : "text-slate-500"
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Date Cells Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Memuat kalender presensi...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5 md:gap-2.5">
            {calendarCells.map((cell) => {
              if (cell.isBlank) {
                return (
                  <div
                    key={cell.key}
                    className="min-h-[75px] md:min-h-[105px] rounded-2xl bg-white/20 border border-white/40 opacity-30 pointer-events-none"
                  />
                );
              }

              const isToday = cell.dateStr === todayStr;
              const isPayday = cell.isPayday;
              const hasLog = !!cell.log;
              const attendance = cell.log?.attendance;
              const actCount = cell.log?.activities?.length || 0;

              let cellStyle = "border-white/80 bg-white/60 backdrop-blur-xs hover:border-slate-300 hover:bg-white/85 hover:shadow-2xs";
              if (isToday && isPayday) {
                cellStyle = "ring-2 ring-indigo-500 border-amber-400 bg-amber-50/60 backdrop-blur-xs shadow-xs";
              } else if (isToday) {
                cellStyle = "ring-2 ring-indigo-500 border-indigo-300 bg-indigo-50/50 backdrop-blur-xs shadow-xs";
              } else if (isPayday) {
                cellStyle = "border-amber-300/90 bg-amber-50/50 backdrop-blur-xs hover:border-amber-400 hover:bg-amber-50/70 hover:shadow-2xs";
              }

              return (
                <div
                  key={cell.key}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[75px] md:min-h-[105px] p-2 md:p-2.5 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group select-none relative ${cellStyle}`}
                >
                  {/* Top Bar of Cell: Day Number */}
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs md:text-sm font-bold font-mono ${
                        isToday
                          ? "w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center -ml-0.5 -mt-0.5 shadow-2xs"
                          : cell.isSunday
                          ? "text-rose-500"
                          : isPayday
                          ? "text-amber-900 font-extrabold"
                          : "text-slate-800"
                      }`}
                    >
                      {cell.day}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      {isPayday && (
                        <span
                          title="Switch Periode & Hari Gajian"
                          className="pixel-badge text-amber-800 bg-amber-100/90 border-amber-400"
                        >
                          <Coins className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                          <span className="hidden md:inline">GAJI</span>
                        </span>
                      )}

                      {/* Small Activity Dot / Count on Desktop */}
                      {hasLog && actCount > 0 && (
                        <span className="hidden md:inline-flex text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-medium">
                          {actCount} act
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Attendance Status Indicator */}
                  <div className="mt-1">
                    {hasLog ? (
                      <div
                        className={`px-1.5 py-1 rounded-xl text-[10px] font-semibold text-center truncate ${
                          attendance === "Hadir"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                            : attendance === "Izin"
                            ? "bg-blue-50 text-blue-700 border border-blue-200/80"
                            : attendance === "Sakit"
                            ? "bg-amber-50 text-amber-700 border border-amber-200/80"
                            : "bg-rose-50 text-rose-700 border border-rose-200/80"
                        }`}
                      >
                        <span className="md:hidden">
                          {attendance === "Hadir" ? "HD" : attendance?.slice(0, 2)}
                        </span>
                        <span className="hidden md:inline">{attendance}</span>
                      </div>
                    ) : cell.isSunday ? (
                      <div className="text-[9px] md:text-[10px] text-slate-400 text-center py-1 font-medium italic">
                        Libur
                      </div>
                    ) : (
                      <div className="text-[9px] text-slate-300 text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        + Catat
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Calendar Legend & Info */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Keterangan:</span>
            <span className="inline-flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Hadir
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Izin
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Sakit
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Alfa
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50/90 border border-amber-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span><strong>Tgl 20:</strong> Switch Periode & Hari Gajian</span>
          </div>
        </div>
      </div>

      {/* Date Detail Inspection Modal */}
      {selectedDateStr && (
        <div className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-white/80">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Detail Jurnal & Presensi
                </span>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {formatIndonesianDate(selectedDateStr)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDateStr(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Payday & Switch Period Banner */}
              {selectedDateStr?.endsWith("-20") && (
                <div className="bg-gradient-to-r from-amber-50 via-amber-50/70 to-orange-50/40 border border-amber-200/90 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-amber-900">Switch Periode & Hari Gajian</span>
                      <span className="pixel-badge text-amber-900 bg-amber-200/90 border-amber-400">
                        CUTOFF.BULANAN
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800/90 leading-relaxed">
                      Tanggal 20 menandai penutupan siklus evaluasi bulanan magang dan jadwal pencairan uang saku / honor.
                    </p>
                  </div>
                </div>
              )}

              {selectedLog ? (
                <>
                  {/* Status Presensi */}
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                    <span className="text-xs font-semibold text-slate-600">Status Kehadiran</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedLog.attendance === "Hadir"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : selectedLog.attendance === "Izin"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : selectedLog.attendance === "Sakit"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {selectedLog.attendance}
                    </span>
                  </div>

                  {/* Rincian Kegiatan */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      Rincian Kegiatan ({selectedLog.activities ? selectedLog.activities.length : 0})
                    </h4>
                    {!selectedLog.activities || selectedLog.activities.length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                        Tidak ada rincian kegiatan spesifik yang dicatat pada hari ini.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedLog.activities.map((act) => (
                          <div
                            key={act.id}
                            className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1"
                          >
                            <div className="flex items-center gap-2">
                              {act.time_range && (
                                <span className="font-mono text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded font-semibold">
                                  {act.time_range}
                                </span>
                              )}
                              <span className="font-bold text-slate-900">{act.title}</span>
                            </div>
                            {act.description && (
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                {act.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Refleksi Pembelajaran */}
                  <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                    <h5 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Refleksi Pembelajaran
                    </h5>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {selectedLog.learning || (
                        <span className="text-slate-400 italic">Belum ada catatan pembelajaran.</span>
                      )}
                    </p>
                  </div>

                  {/* Kendala & Hambatan */}
                  <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                    <h5 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Kendala / Hambatan
                    </h5>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {selectedLog.obstacle || (
                        <span className="text-slate-400 italic">Tidak ada kendala tercatat.</span>
                      )}
                    </p>
                  </div>
                </>
              ) : (
                /* Empty state when no log on selected date */
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Belum Ada Catatan Jurnal</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Tidak ditemukan riwayat log kegiatan atau presensi pada tanggal{" "}
                      <strong>{formatIndonesianDate(selectedDateStr)}</strong>.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/daily-log?date=${selectedDateStr}`}
                      className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buka Editor Jurnal</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer CTA */}
            {selectedLog && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-2">
                <Link
                  href={`/daily-log?date=${selectedDateStr}`}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Jurnal Harian</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
