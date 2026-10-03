import { Calendar, ShieldCheck, Flame } from "lucide-react";

export default function LogHeader({
  formattedDate,
  attendance,
  onAttendanceChange,
  streakInfo,
  isSunday,
}) {
  return (
    <div className="bg-slate-950 text-white rounded-2xl p-5 md:p-7 shadow-xs border border-slate-800 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            {isSunday ? "Hari Istirahat Mingguan" : "Jurnal Harian"}
          </span>
          {streakInfo.count > 0 && (
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                isSunday
                  ? "bg-teal-500/10 text-teal-300 border-teal-500/20"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/20"
              }`}
            >
              {isSunday ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-teal-400" />
                  <span>{streakInfo.count} Hari Streak (Aman)</span>
                </>
              ) : (
                <>
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>{streakInfo.count} Hari Streak</span>
                </>
              )}
            </span>
          )}
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">{formattedDate}</h1>
        <p className="text-xs text-slate-400 mt-1">
          {isSunday
            ? "Hari Minggu libur resmi. Pengisian catatan bersifat opsional."
            : "Batas input sampai 23:59 WIB. Tuliskan apa yang kamu kerjakan hari ini."}
        </p>
      </div>

      <div className="w-full md:w-auto mt-2 md:mt-0">
        <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1 w-full md:w-auto">
          {["Hadir", "Izin", "Sakit", "Alfa"].map((status) => {
            const isActive = attendance === status;
            return (
              <button
                type="button"
                key={status}
                onClick={() => onAttendanceChange(status)}
                className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive ? "bg-white text-slate-950 shadow-xs" : "text-slate-400 hover:text-white"
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
