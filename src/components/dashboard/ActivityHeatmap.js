import { Zap } from "lucide-react";

export default function ActivityHeatmap({ heatmap }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Matriks Aktivitas (4 Minggu)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konsistensi catatan harian. Hari Minggu dilindungi perisai libur.
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-50 border border-amber-300"></div>
            <span>Minggu (Libur)</span>
          </span>
          <span className="flex items-center gap-1.5 ml-3">
            <span>Kosong</span>
            <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></div>
            <div className="w-3 h-3 rounded bg-emerald-200"></div>
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <div className="w-3 h-3 rounded bg-emerald-700"></div>
            <span>Padat</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-1.5 pt-2">
        {heatmap.map((item, idx) => {
          let colorClass = "bg-slate-50 border-slate-200 text-slate-400";
          if (item.isSunday && item.count === 0) {
            colorClass = "bg-amber-50/70 border-amber-200 text-amber-700";
          } else if (item.count >= 3) {
            colorClass = "bg-emerald-600 border-emerald-700 text-white";
          } else if (item.count === 2) {
            colorClass = "bg-emerald-400 border-emerald-500 text-white";
          } else if (item.count === 1) {
            colorClass = "bg-emerald-100 border-emerald-300 text-emerald-800";
          }

          return (
            <div
              key={idx}
              title={`${item.date} (${item.dayName}): ${
                item.isSunday ? "Hari Libur Resmi" : `${item.count} aktivitas`
              }`}
              className={`h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] font-mono font-medium transition-transform hover:scale-105 cursor-pointer ${colorClass}`}
            >
              <span>{item.date.split("-")[2]}</span>
              {item.isSunday && item.count === 0 && (
                <span className="text-[7px] font-sans font-semibold uppercase opacity-80">Libur</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
