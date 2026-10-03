import Link from "next/link";
import { Clock, ArrowRight, ChevronRight } from "lucide-react";
import { formatIndonesianDate } from "@/lib/date";

export default function RecentLogsWidget({ logs, loading }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 md:p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              <Clock className="w-4 h-4 text-indigo-600" /> Jurnal & Presensi Terkini
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Riwayat log harian terbaru yang tersimpan
            </p>
          </div>
          <Link
            href="/attendance"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Semua Log <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-100/70 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-2xl text-xs">
            Belum ada jurnal yang disimpan. Mulai buat jurnal harianmu sekarang.
          </div>
        ) : (
          <div className="space-y-2.5">
            {logs.map((log) => (
              <Link
                key={log.id}
                href="/attendance"
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-all border border-slate-100 hover:border-slate-200 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs font-mono shadow-2xs ${
                      log.attendance === "Hadir"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                        : log.attendance === "Izin"
                        ? "bg-blue-50 text-blue-700 border border-blue-200/70"
                        : log.attendance === "Sakit"
                        ? "bg-amber-50 text-amber-700 border border-amber-200/70"
                        : "bg-rose-50 text-rose-700 border border-rose-200/70"
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
                        ? `${log.activities.length} aktivitas dicatat`
                        : log.learning || "Belum ada rincian kegiatan"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
