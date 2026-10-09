import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Clock } from "lucide-react";

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
  const ATTENDANCE_STATUSES = [
    { id: "Hadir", label: "Hadir", activeClass: "bg-emerald-600 text-white border-emerald-600" },
    { id: "Izin", label: "Izin", activeClass: "bg-blue-600 text-white border-blue-600" },
    { id: "Sakit", label: "Sakit", activeClass: "bg-amber-600 text-white border-amber-600" },
    { id: "Alfa", label: "Alfa", activeClass: "bg-rose-600 text-white border-rose-600" },
  ];

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        {/* Top Badges */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="pixel-badge border-indigo-200 text-indigo-700 bg-indigo-50/80 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-indigo-600 inline" />
            [{isSunday ? "OFF.SUN" : "DAILY.LOG"}]
          </span>

          {hasExistingLog ? (
            <span className="pixel-badge border-emerald-300 text-emerald-700 bg-emerald-50/80 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
              [SYNCED]
            </span>
          ) : (
            <span className="pixel-badge border-amber-300 text-amber-700 bg-amber-50/80 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600 inline" />
              [UNSAVED]
            </span>
          )}
        </div>

        {/* Date Title with Quick Day Stepper */}
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 font-mono">
            {formattedDate}
          </h1>

          <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-lg p-0.5 border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={onPrevDay}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Prev"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {!isToday && (
              <button
                type="button"
                onClick={onToday}
                className="px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
              >
                [TODAY]
              </button>
            )}
            <button
              type="button"
              onClick={onNextDay}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Native Date Picker trigger */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && onDateChange(e.target.value)}
            className="text-xs bg-white/80 border border-slate-200/80 rounded-lg px-2 py-0.5 text-slate-700 font-mono focus:outline-none cursor-pointer"
            title="Pilih tanggal"
          />
        </div>
      </div>

      {/* Attendance Segmented Selector */}
      <div className="w-full md:w-auto">
        <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1 md:text-right">
          [PRESENSI]
        </div>
        <div className="bg-slate-100/80 backdrop-blur-xs p-1 rounded-xl border border-slate-200/80 flex gap-1 w-full md:w-auto">
          {ATTENDANCE_STATUSES.map((status) => {
            const isActive = attendance === status.id;
            return (
              <button
                type="button"
                key={status.id}
                onClick={() => onAttendanceChange(status.id)}
                className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer border ${
                  isActive
                    ? `${status.activeClass} shadow-2xs font-bold`
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                {status.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
