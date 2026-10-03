import { Calendar, ShieldCheck, Flame } from "lucide-react";

export default function LogHeader({
  formattedDate,
  attendance,
  onAttendanceChange,
  streakInfo,
  isSunday,
}) {
  return (
    <div className="bg-white text-slate-900 rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200/90 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            {isSunday ? "Hari Istirahat Mingguan" : "Jurnal Harian"}
          </span>
          {streakInfo.count > 0 && (
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                isSunday
                  ? "bg-teal-50 text-teal-700 border-teal-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {isSunday ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-teal-600" />
                  <span>{streakInfo.count} Hari Streak (Aman)</span>
                </>
              ) : (
                <>
                  <Flame className="w-3 h-3 text-amber-600" />
                  <span>{streakInfo.count} Hari Streak</span>
                </>
              )}
            </span>
          )}
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">{formattedDate}</h1>
        <p className="text-xs text-slate-500 mt-1">
          {isSunday
            ? "Hari Minggu libur resmi. Pengisian catatan bersifat opsional."
            : "Batas input sampai 23:59 WIB. Tuliskan apa yang kamu kerjakan hari ini."}
        </p>
      </div>

      <div className="w-full md:w-auto mt-2 md:mt-0">
        <div className="bg-slate-100/80 p-1 rounded-xl border border-slate-200/90 flex gap-1 w-full md:w-auto">
          {["Hadir", "Izin", "Sakit", "Alfa"].map((status) => {
            const isActive = attendance === status;
            return (
              <button
                type="button"
                key={status}
                onClick={() => onAttendanceChange(status)}
                className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
