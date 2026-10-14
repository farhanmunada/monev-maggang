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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-3 border-black pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pixel-badge bg-[#8b5cf6] text-white">
              <CalendarCheck2 className="w-3.5 h-3.5 stroke-[2.5]" />
              PRESENSI.LOG
            </span>
            <span className="pixel-badge bg-[#a3e635] text-black">
              TOTAL: {monthStats.total} LOG
            </span>
          </div>
          <h1 className="text-xl md:text-3xl font-black uppercase text-black tracking-tight">
            Presensi & Rekap Kehadiran
          </h1>
        </div>

        {/* Action Buttons & Month Navigation with Neo-Brutalist Layout */}
        <div className="no-print flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white hover:bg-[#a3e635] text-black border-2 border-black px-3.5 py-1.5 rounded-xl text-xs font-mono font-black shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            title="Cetak PDF"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>[CETAK.PDF]</span>
          </button>

          <button
            type="button"
            onClick={handleToday}
            className="px-3.5 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white border-2 border-black rounded-xl text-xs font-mono font-black shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            [TODAY]
          </button>

          <div className="flex items-center bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] overflow-hidden">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-[#a3e635] text-black border-r-2 border-black transition-colors cursor-pointer"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
            </button>
            <span className="px-3 py-1 font-black text-xs text-black font-mono uppercase whitespace-nowrap bg-white">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-[#a3e635] text-black border-l-2 border-black transition-colors cursor-pointer"
              title="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </header>

      {/* Monthly Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="border-2 border-black rounded-xl p-3.5 bg-white shadow-[3px_3px_0px_#000]">
          <span className="pixel-badge bg-[#a3e635] text-black">[HADIR %]</span>
          <p className="text-xl md:text-2xl font-black text-black font-mono mt-1">
            {monthStats.rate}%
          </p>
        </div>
        <div className="border-2 border-black rounded-xl p-3.5 bg-white shadow-[3px_3px_0px_#000]">
          <span className="pixel-badge bg-white text-black">[HADIR]</span>
          <p className="text-xl md:text-2xl font-black text-black font-mono mt-1">
            {monthStats.hadir} <span className="text-xs font-bold text-slate-500">HARI</span>
          </p>
        </div>
        <div className="border-2 border-black rounded-xl p-3.5 bg-white shadow-[3px_3px_0px_#000]">
          <span className="pixel-badge bg-[#00f0ff] text-black">[IZIN]</span>
          <p className="text-xl md:text-2xl font-black text-black font-mono mt-1">
            {monthStats.izin} <span className="text-xs font-bold text-slate-500">HARI</span>
          </p>
        </div>
        <div className="border-2 border-black rounded-xl p-3.5 bg-white shadow-[3px_3px_0px_#000]">
          <span className="pixel-badge bg-[#ffe600] text-black">[SAKIT]</span>
          <p className="text-xl md:text-2xl font-black text-black font-mono mt-1">
            {monthStats.sakit} <span className="text-xs font-bold text-slate-500">HARI</span>
          </p>
        </div>
        <div className="border-2 border-black rounded-xl p-3.5 bg-white shadow-[3px_3px_0px_#000] col-span-2 sm:col-span-1">
          <span className="pixel-badge bg-[#ff6b6b] text-black">[ALFA]</span>
          <p className="text-xl md:text-2xl font-black text-black font-mono mt-1">
            {monthStats.alfa} <span className="text-xs font-bold text-slate-500">HARI</span>
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

              let cellStyle = "border-2 border-black bg-white shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000]";
              if (isToday && isPayday) {
                cellStyle = "border-3 border-black bg-[#ffe600] shadow-[3px_3px_0px_#000]";
              } else if (isToday) {
                cellStyle = "border-3 border-black bg-[#fef08a] shadow-[3px_3px_0px_#000]";
              } else if (isPayday) {
                cellStyle = "border-2 border-black bg-[#fef9c3] shadow-[2px_2px_0px_#000]";
              }

              return (
                <div
                  key={cell.key}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[75px] md:min-h-[105px] p-2 md:p-2.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer group select-none relative ${cellStyle}`}
                >
                  {/* Top Bar of Cell: Day Number */}
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs md:text-sm font-black font-mono ${
                        isToday
                          ? "w-6 h-6 rounded-md bg-black text-[#ffe600] flex items-center justify-center -ml-0.5 -mt-0.5 shadow-[1.5px_1.5px_0px_#000]"
                          : cell.isSunday
                          ? "text-rose-600 font-black"
                          : isPayday
                          ? "text-black font-black underline decoration-2"
                          : "text-black font-bold"
                      }`}
                    >
                      {cell.day}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      {isPayday && (
                        <span
                          title="Switch Periode & Hari Gajian"
                          className="pixel-badge bg-[#ffe600] text-black border border-black"
                        >
                          <Coins className="w-2.5 h-2.5 stroke-[2.5]" />
                          <span className="hidden md:inline">GAJI</span>
                        </span>
                      )}

                      {/* Small Activity Dot / Count on Desktop */}
                      {hasLog && actCount > 0 && (
                        <span className="hidden md:inline-flex text-[9px] px-1.5 py-0.5 rounded border border-black bg-white text-black font-mono font-bold shadow-[1px_1px_0px_#000]">
                          {actCount} act
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Attendance Status Indicator */}
                  <div className="mt-1">
                    {hasLog ? (
                      <div
                        className={`px-1.5 py-1 rounded text-[10px] font-black text-center truncate border border-black shadow-[1.5px_1.5px_0px_#000] ${
                          attendance === "Hadir"
                            ? "bg-[#a3e635] text-black"
                            : attendance === "Izin"
                            ? "bg-[#00f0ff] text-black"
                            : attendance === "Sakit"
                            ? "bg-[#ffe600] text-black"
                            : "bg-[#ff6b6b] text-black"
                        }`}
                      >
                        <span className="md:hidden">
                          {attendance === "Hadir" ? "HD" : attendance?.slice(0, 2)}
                        </span>
                        <span className="hidden md:inline uppercase">{attendance}</span>
                      </div>
                    ) : cell.isSunday ? (
                      <div className="text-[9px] md:text-[10px] text-slate-500 text-center py-1 font-mono font-bold">
                        LIBUR
                      </div>
                    ) : (
                      <div className="text-[9px] font-mono font-bold text-slate-400 text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        + CATAT
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Calendar Legend & Info with Neo-Brutalist Badges */}
        <div className="mt-5 pt-4 border-t-2 border-black flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-black uppercase text-black mr-1">Keterangan:</span>
            <span className="pixel-badge bg-[#a3e635] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              HADIR
            </span>
            <span className="pixel-badge bg-[#8b5cf6] text-white border-2 border-black shadow-[2px_2px_0px_#000]">
              IZIN
            </span>
            <span className="pixel-badge bg-[#fef08a] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              SAKIT
            </span>
            <span className="pixel-badge bg-[#ff6b6b] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              ALFA
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-black text-black bg-[#a3e635] border-2 border-black px-3 py-1.5 rounded-xl shadow-[3px_3px_0px_#000]">
            <Coins className="w-4 h-4 stroke-[2.5]" />
            <span><strong>TGL 20:</strong> SWITCH PERIODE & HARI GAJIAN</span>
          </div>
        </div>
      </div>

      {/* Date Detail Inspection Modal with Pop Animation */}
      {selectedDateStr && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[#fffdf8] w-full max-w-lg rounded-2xl shadow-[8px_8px_0px_0px_#000] flex flex-col max-h-[85vh] overflow-hidden border-[3px] border-black animate-brutal-pop">
            {/* Modal Header */}
            <div className="p-4 border-b-2 border-black flex items-center justify-between bg-[#8b5cf6] text-white">
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#a3e635]">
                  [DETAIL JURNAL & PRESENSI]
                </span>
                <h3 className="text-base font-black uppercase tracking-tight text-white mt-0.5">
                  {formatIndonesianDate(selectedDateStr)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDateStr(null)}
                className="text-white hover:bg-black p-1.5 rounded-lg border-2 border-black transition-colors cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Payday & Switch Period Banner */}
              {selectedDateStr?.endsWith("-20") && (
                <div className="bg-[#a3e635] border-2 border-black rounded-xl p-3.5 flex items-start gap-3 shadow-[3px_3px_0px_#000] text-black">
                  <div className="p-2 bg-black text-[#a3e635] rounded-lg shrink-0 mt-0.5 border border-black">
                    <Coins className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black uppercase">Switch Periode & Hari Gajian</span>
                      <span className="pixel-badge bg-black text-[#a3e635] border border-black text-[9px]">
                        CUTOFF.BULANAN
                      </span>
                    </div>
                    <p className="text-[11px] font-bold leading-relaxed">
                      Tanggal 20 menandai penutupan siklus evaluasi bulanan magang dan jadwal pencairan uang saku / honor.
                    </p>
                  </div>
                </div>
              )}

              {selectedLog ? (
                <>
                  {/* Status Presensi */}
                  <div className="flex items-center justify-between bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_#000]">
                    <span className="text-xs font-black uppercase text-black font-mono">Status Kehadiran</span>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] ${
                        selectedLog.attendance === "Hadir"
                          ? "bg-[#a3e635] text-black"
                          : selectedLog.attendance === "Izin"
                          ? "bg-[#8b5cf6] text-white"
                          : selectedLog.attendance === "Sakit"
                          ? "bg-[#fef08a] text-black"
                          : "bg-[#ff6b6b] text-black"
                      }`}
                    >
                      {selectedLog.attendance}
                    </span>
                  </div>

                  {/* Rincian Kegiatan */}
                  <div>
                    <h4 className="text-xs font-black uppercase text-black mb-2 flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                      Rincian Kegiatan ({selectedLog.activities ? selectedLog.activities.length : 0})
                    </h4>
                    {!selectedLog.activities || selectedLog.activities.length === 0 ? (
                      <p className="text-xs text-slate-600 font-mono font-bold bg-[#fbf8f0] p-3 rounded-xl border-2 border-dashed border-black">
                        [TIDAK ADA RINCIAN KEGIATAN SPESIFIK TERCATAT HARI INI]
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedLog.activities.map((act) => (
                          <div
                            key={act.id}
                            className="p-3 bg-white border-2 border-black rounded-xl text-xs space-y-1 shadow-[2px_2px_0px_#000]"
                          >
                            <div className="flex items-center gap-2">
                              {act.time_range && (
                                <span className="font-mono text-[10px] bg-[#8b5cf6] text-white border border-black px-2 py-0.5 rounded font-black">
                                  {act.time_range}
                                </span>
                              )}
                              <span className="font-black text-black">{act.title}</span>
                            </div>
                            {act.description && (
                              <p className="text-[11px] font-mono text-slate-700 leading-relaxed font-bold">
                                {act.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Refleksi Pembelajaran */}
                  <div className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_#000]">
                    <h5 className="text-xs font-black uppercase text-black mb-1.5 flex items-center gap-1.5 font-mono">
                      <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" /> Refleksi Pembelajaran
                    </h5>
                    <p className="text-xs font-mono font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {selectedLog.learning || (
                        <span className="text-slate-500 italic">[BELUM ADA CATATAN PEMBELAJARAN]</span>
                      )}
                    </p>
                  </div>

                  {/* Kendala & Hambatan */}
                  <div className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_#000]">
                    <h5 className="text-xs font-black uppercase text-black mb-1.5 flex items-center gap-1.5 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" /> Kendala / Hambatan
                    </h5>
                    <p className="text-xs font-mono font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {selectedLog.obstacle || (
                        <span className="text-slate-500 italic">[TIDAK ADA KENDALA TERCATAT]</span>
                      )}
                    </p>
                  </div>
                </>
              ) : (
                /* Empty state when no log on selected date */
                <div className="text-center py-10 space-y-3 bg-[#fbf8f0] border-2 border-dashed border-black rounded-xl p-6">
                  <div className="w-12 h-12 bg-white border-2 border-black rounded-xl flex items-center justify-center mx-auto text-black shadow-[2px_2px_0px_#000]">
                    <CalendarIcon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-black text-black text-sm uppercase">Belum Ada Catatan Jurnal</h4>
                    <p className="text-xs font-mono font-bold text-slate-600 mt-1 max-w-xs mx-auto">
                      Tidak ditemukan riwayat log kegiatan atau presensi pada tanggal{" "}
                      <strong>{formatIndonesianDate(selectedDateStr)}</strong>.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/daily-log?date=${selectedDateStr}`}
                      className="brutal-btn bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
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
