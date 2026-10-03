import Link from "next/link";
import { Clock, ArrowRight, ChevronRight } from "lucide-react";

export default function RecentLogsWidget({ logs, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" /> Jurnal Terbaru
        </h2>
        <Link
          href="/report"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Lihat Rekap <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-11 bg-slate-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-7 text-slate-500 border border-dashed border-slate-200 rounded-xl text-xs">
          Belum ada jurnal yang disimpan. Mulai isi jurnal pertamamu hari ini.
        </div>
      ) : (
        <div className="space-y-2.5">
          {logs.map((log) => (
            <Link
              key={log.id}
              href="/report"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-700 font-bold text-xs font-mono">
                  {log.attendance === "Hadir" ? "HD" : log.attendance.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-xs md:text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    Status: {log.attendance}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(log.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
