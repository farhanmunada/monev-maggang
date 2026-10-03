import Link from "next/link";
import { Star, ShieldCheck, Flame, BookOpen } from "lucide-react";

export default function HeroCommand({ level, streak, isSundayToday }) {
  return (
    <div className="lg:col-span-7 bg-slate-950 text-white rounded-2xl p-6 md:p-7 shadow-xs relative overflow-hidden flex flex-col justify-between border border-slate-800">
      <div className="relative z-10 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-tight uppercase bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              Level {level.currentLevel} • {level.title}
            </span>
          </div>

          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 ${
              isSundayToday
                ? "bg-teal-500/10 text-teal-300 border border-teal-500/30"
                : streak.isActiveToday
                ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            {isSundayToday ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Sunday Shield (Aman)
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5 text-amber-400" /> {streak.count} Hari Streak
              </>
            )}
          </span>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-400 font-medium mb-1.5">
            <span>Progress EXP ({level.totalExp} Total EXP)</span>
            <span className="font-bold text-white font-mono">{level.progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${level.color} transition-all duration-700`}
              style={{ width: `${level.progressPercent}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          {isSundayToday
            ? "Hari Minggu libur resmi. Streak dari Sabtu aman terjaga sampai Senin. Nikmati istirahatmu."
            : streak.message}
        </p>
      </div>

      <div className="relative z-10 pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          {isSundayToday ? "Pengisian hari ini opsional" : "Batas pengisian hari ini pukul 23:59 WIB"}
        </span>
        <Link
          href="/daily-log"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm shadow-xs transition-all active:scale-95"
        >
          <BookOpen className="w-4 h-4" />
          {streak.isActiveToday ? "Perbarui Jurnal Hari Ini" : "Isi Jurnal Sekarang"}
        </Link>
      </div>
    </div>
  );
}
