"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  X,
  CalendarDays,
} from "lucide-react";
import { formatYMD } from "@/lib/date";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function LogHeader({
  selectedDate,
  formattedDate,
  attendance,
  onAttendanceChange,
  isSunday,
  isToday,
  hasExistingLog,
  onPrevDay,
  onNextDay,
  onToday,
  onDateChange,
}) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Month and Year state for the custom brutal picker
  const [pickerDate, setPickerDate] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });

  const pickerYear = pickerDate.getFullYear();
  const pickerMonth = pickerDate.getMonth();

  const handlePrevPickerMonth = () => {
    setPickerDate(new Date(pickerYear, pickerMonth - 1, 1));
  };

  const handleNextPickerMonth = () => {
    setPickerDate(new Date(pickerYear, pickerMonth + 1, 1));
  };

  // Calendar cells for picker
  const pickerCells = useMemo(() => {
    const firstDay = new Date(pickerYear, pickerMonth, 1);
    const totalDays = new Date(pickerYear, pickerMonth + 1, 0).getDate();
    // Monday-based (0 = Mon, 6 = Sun)
    const startOffset = (firstDay.getDay() + 6) % 7;

    const cells = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push({ isBlank: true, key: `empty-${i}` });
    }
    for (let d = 1; d <= totalDays; d++) {
      const pad = (n) => String(n).padStart(2, "0");
      const dateStr = `${pickerYear}-${pad(pickerMonth + 1)}-${pad(d)}`;
      cells.push({
        isBlank: false,
        key: dateStr,
        day: d,
        dateStr,
      });
    }
    return cells;
  }, [pickerYear, pickerMonth]);

  const ATTENDANCE_STATUSES = [
    {
      id: "Hadir",
      label: "Hadir",
      activeClass: "bg-[#a3e635] text-black border-2 border-black shadow-[2px_2px_0px_#000]",
    },
    {
      id: "Izin",
      label: "Izin",
      activeClass: "bg-[#8b5cf6] text-white border-2 border-black shadow-[2px_2px_0px_#000]",
    },
    {
      id: "Sakit",
      label: "Sakit",
      activeClass: "bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000]",
    },
    {
      id: "Alfa",
      label: "Alfa",
      activeClass: "bg-black text-white border-2 border-black shadow-[2px_2px_0px_#000]",
    },
  ];

  const todayStr = formatYMD();

  return (
    <>
      <div className="brutal-card bg-white p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* Top Badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="pixel-badge bg-[#8b5cf6] text-white flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
              [{isSunday ? "OFF.SUN" : "DAILY.LOG"}]
            </span>

            {hasExistingLog ? (
              <span className="pixel-badge bg-[#a3e635] text-black flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                [SYNCED]
              </span>
            ) : (
              <span className="pixel-badge bg-black text-white flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                [UNSAVED]
              </span>
            )}
          </div>

          {/* Date Title with Quick Day Stepper & Custom Picker Trigger */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg md:text-2xl font-black uppercase tracking-tight text-black font-mono">
              {formattedDate}
            </h1>

            <div className="flex items-center bg-white rounded-lg p-0.5 border-2 border-black shadow-[2px_2px_0px_#000]">
              <button
                type="button"
                onClick={onPrevDay}
                className="p-1 hover:bg-[#a3e635] rounded text-black transition-colors cursor-pointer"
                title="Hari sebelumnya"
              >
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
              </button>
              {!isToday && (
                <button
                  type="button"
                  onClick={onToday}
                  className="px-2 py-0.5 font-mono text-[10px] font-black text-black bg-[#a3e635] hover:bg-[#84cc16] rounded transition-colors cursor-pointer"
                >
                  [TODAY]
                </button>
              )}
              <button
                type="button"
                onClick={onNextDay}
                className="p-1 hover:bg-[#a3e635] rounded text-black transition-colors cursor-pointer"
                title="Hari berikutnya"
              >
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Custom Brutal Date Picker Popover Button */}
            <button
              type="button"
              onClick={() => {
                setPickerDate(new Date(selectedDate));
                setIsDatePickerOpen(true);
              }}
              className="pixel-badge bg-white hover:bg-[#8b5cf6] hover:text-white text-black border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-mono font-black"
              title="Pilih tanggal dari kalender"
            >
              <CalendarDays className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>[PILIH TGL]</span>
            </button>
          </div>
        </div>

        {/* Attendance Segmented Selector */}
        <div className="w-full md:w-auto">
          <div className="text-[10px] font-mono font-black text-black uppercase tracking-wider mb-1.5 md:text-right">
            [STATUS PRESENSI]
          </div>
          <div className="bg-white p-1.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] flex gap-1.5 w-full md:w-auto">
            {ATTENDANCE_STATUSES.map((status) => {
              const isActive = attendance === status.id;
              return (
                <button
                  type="button"
                  key={status.id}
                  onClick={() => onAttendanceChange(status.id)}
                  className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-mono font-black uppercase transition-all cursor-pointer ${
                    isActive
                      ? `${status.activeClass} -translate-y-0.5`
                      : "border-2 border-transparent text-slate-700 hover:text-black hover:bg-white"
                  }`}
                >
                  {status.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom Neo-Brutalist Date Picker Modal (No ugly browser picker) */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-[8px_8px_0px_0px_#000] border-[3px] border-black animate-brutal-pop overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b-2 border-black bg-[#8b5cf6] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 stroke-[3] text-[#a3e635]" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  Pilih Tanggal Jurnal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(false)}
                className="text-white hover:bg-black p-1 rounded-lg border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Month & Year Navigation */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3 bg-white border-2 border-black rounded-xl p-1.5 shadow-[2px_2px_0px_#000]">
                <button
                  type="button"
                  onClick={handlePrevPickerMonth}
                  className="p-1 rounded hover:bg-[#a3e635] text-black cursor-pointer border border-transparent hover:border-black"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3]" />
                </button>
                <span className="font-mono font-black text-xs uppercase text-black">
                  {MONTH_NAMES[pickerMonth]} {pickerYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextPickerMonth}
                  className="p-1 rounded hover:bg-[#a3e635] text-black cursor-pointer border border-transparent hover:border-black"
                >
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Day Name Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono font-black text-[10px] text-black uppercase mb-1">
                <span>Sen</span>
                <span>Sel</span>
                <span>Rab</span>
                <span>Kam</span>
                <span>Jum</span>
                <span>Sab</span>
                <span className="text-[#8b5cf6]">Min</span>
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {pickerCells.map((cell) => {
                  if (cell.isBlank) {
                    return <div key={cell.key} className="h-8" />;
                  }

                  const isSelected = cell.dateStr === selectedDate;
                  const isCurrentDay = cell.dateStr === todayStr;

                  return (
                    <button
                      key={cell.key}
                      type="button"
                      onClick={() => {
                        onDateChange(cell.dateStr);
                        setIsDatePickerOpen(false);
                      }}
                      className={`h-8 rounded-lg font-mono font-black text-xs flex items-center justify-center border-2 border-black transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#a3e635] text-black shadow-[2px_2px_0px_#000] -translate-y-0.5"
                          : isCurrentDay
                          ? "bg-[#8b5cf6] text-white shadow-[1.5px_1.5px_0px_#000]"
                          : "bg-white text-black hover:bg-[#f5f3ff] shadow-[1.5px_1.5px_0px_#000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                      }`}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions Footer */}
              <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    onDateChange(todayStr);
                    setIsDatePickerOpen(false);
                  }}
                  className="pixel-badge bg-[#a3e635] text-black border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  HARI INI ({todayStr})
                </button>

                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="px-3 py-1 bg-white border-2 border-black rounded-lg text-xs font-black uppercase text-black hover:bg-slate-100 cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
