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
    { id: "Hadir", label: "Hadir", activeClass: "bg-[#a3e635] text-black border-2 border-black shadow-[2px_2px_0px_#000]" },
    { id: "Izin", label: "Izin", activeClass: "bg-[#00f0ff] text-black border-2 border-black shadow-[2px_2px_0px_#000]" },
    { id: "Sakit", label: "Sakit", activeClass: "bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000]" },
    { id: "Alfa", label: "Alfa", activeClass: "bg-[#ff6b6b] text-black border-2 border-black shadow-[2px_2px_0px_#000]" },
  ];

  return (
    <div className="brutal-card bg-white p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        {/* Top Badges */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="pixel-badge bg-[#ffe600] text-black flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
            [{isSunday ? "OFF.SUN" : "DAILY.LOG"}]
          </span>

          {hasExistingLog ? (
            <span className="pixel-badge bg-[#a3e635] text-black flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              [SYNCED]
            </span>
          ) : (
            <span className="pixel-badge bg-[#ffe600] text-black flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
              [UNSAVED]
            </span>
          )}
        </div>

        {/* Date Title with Quick Day Stepper */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-lg md:text-2xl font-black uppercase tracking-tight text-black font-mono">
            {formattedDate}
          </h1>

          <div className="flex items-center bg-white rounded-lg p-0.5 border-2 border-black shadow-[2px_2px_0px_#000]">
            <button
              type="button"
              onClick={onPrevDay}
              className="p-1 hover:bg-[#ffe600] rounded text-black transition-colors cursor-pointer"
              title="Prev"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
            </button>
            {!isToday && (
              <button
                type="button"
                onClick={onToday}
                className="px-2 py-0.5 font-mono text-[10px] font-black text-black bg-[#ffe600] hover:bg-[#ffd700] rounded transition-colors cursor-pointer"
              >
                [TODAY]
              </button>
            )}
            <button
              type="button"
              onClick={onNextDay}
              className="p-1 hover:bg-[#ffe600] rounded text-black transition-colors cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Native Date Picker trigger */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && onDateChange(e.target.value)}
            className="text-xs bg-white border-2 border-black rounded-lg px-2.5 py-1 text-black font-mono font-bold shadow-[2px_2px_0px_#000] focus:outline-none cursor-pointer"
            title="Pilih tanggal"
          />
        </div>
      </div>

      {/* Attendance Segmented Selector */}
      <div className="w-full md:w-auto">
        <div className="text-[10px] font-mono font-black text-black uppercase tracking-wider mb-1.5 md:text-right">
          [STATUS PRESENSI]
        </div>
        <div className="bg-[#fbf8f0] p-1.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] flex gap-1.5 w-full md:w-auto">
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
  );
}
