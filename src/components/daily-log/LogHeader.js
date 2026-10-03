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
    <div className="bg-white rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/90 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
      <div>
        {/* Top Badges */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            {isSunday ? "Hari Libur Mingguan" : "Jurnal Harian"}
          </span>

          {hasExistingLog ? (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Tersimpan di Database
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              Belum Ada Catatan
            </span>
          )}
        </div>

        {/* Date Title with Quick Day Stepper */}
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
            {formattedDate}
          </h1>

          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={onPrevDay}
              className="p-1 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {!isToday && (
              <button
                type="button"
                onClick={onToday}
                className="px-2 py-0.5 text-[10px] font-bold text-indigo-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                Hari Ini
              </button>
            )}
            <button
              type="button"
              onClick={onNextDay}
              className="p-1 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Native Date Picker trigger */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && onDateChange(e.target.value)}
            className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 font-mono focus:outline-none cursor-pointer"
            title="Pilih tanggal spesifik"
          />
        </div>

        <p className="text-xs text-slate-500 mt-1">
          {isSunday
            ? "Hari Minggu libur resmi. Pengisian jurnal bersifat opsional."
            : "Catat kehadiran dan aktivitas magang harian sebelum batas 23:59 WIB."}
        </p>
      </div>

      {/* Attendance Segmented Selector */}
      <div className="w-full md:w-auto">
        <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 md:text-right">
          Status Presensi Harian
        </label>
        <div className="bg-slate-100/90 p-1 rounded-2xl border border-slate-200/90 flex gap-1 w-full md:w-auto">
          {ATTENDANCE_STATUSES.map((status) => {
            const isActive = attendance === status.id;
            return (
              <button
                type="button"
                key={status.id}
                onClick={() => onAttendanceChange(status.id)}
                className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
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
