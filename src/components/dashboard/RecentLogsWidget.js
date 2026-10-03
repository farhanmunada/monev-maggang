import Link from "next/link";
import { Clock, ArrowRight, ChevronRight, Calendar } from "lucide-react";
import { formatIndonesianDate } from "@/lib/date";

export default function RecentLogsWidget({ logs, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Jurnal & Presensi Terakhir
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan harian yang baru saja kamu simpan
            </p>
          </div>
          <Link
            href="/attendance"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Semua Presensi <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100/70 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
            Belum ada jurnal yang disimpan. Mulai buat jurnal harianmu sekarang.
          </div>
        ) : (
          <div className="space-y-2.5">
            {logs.map((log) => (
              <Link
                key={log.id}
                href="/attendance"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs font-mono ${
                      log.attendance === "Hadir"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : log.attendance === "Izin"
                        ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                        : log.attendance === "Sakit"
                        ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                        : "bg-rose-50 text-rose-700 border border-rose-200/60"
                    }`}
                  >
                    {log.attendance === "Hadir" ? "HD" : log.attendance.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {formatIndonesianDate(log.date)}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {log.activities && log.activities.length > 0
                        ? `${log.activities.length} aktivitas tercatat`
                        : log.learning || "Belum ada rincian kegiatan"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
