import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { formatIndonesianDate } from "@/lib/date";

export default function RecentLogsWidget({ logs, loading }) {
  return (
    <div className="brutal-card bg-white p-5 md:p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="pixel-badge bg-[#00f0ff] text-black">
                LOG.FEED
              </span>
            </div>
            <h2 className="text-sm font-black uppercase text-black flex items-center gap-2 tracking-tight">
              <Clock className="w-4 h-4 stroke-[2.5]" /> Jurnal & Presensi Terkini
            </h2>
          </div>
          <Link
            href="/attendance"
            className="text-xs font-black uppercase tracking-wider text-black hover:bg-[#ffe600] px-2 py-1 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] flex items-center gap-1 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            Semua Log <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#f4f0ea] border-2 border-black rounded-xl animate-pulse shadow-[2px_2px_0px_#000]"></div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border-2 border-dashed border-black rounded-xl text-xs font-mono font-bold bg-[#fbf8f0]">
            [BELUM ADA JURNAL YANG DISIMPAN]
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <Link
                key={log.id}
                href="/attendance"
                className="flex items-center justify-between p-3.5 rounded-xl border-2 border-black bg-[#fffdfa] shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4.5px_4.5px_0px_0px_#000] transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-xs font-mono border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                      log.attendance === "Hadir"
                        ? "bg-[#a3e635] text-black"
                        : log.attendance === "Izin"
                        ? "bg-[#00f0ff] text-black"
                        : log.attendance === "Sakit"
                        ? "bg-[#ffe600] text-black"
                        : "bg-[#ff6b6b] text-black"
                    }`}
                  >
                    {log.attendance === "Hadir" ? "HD" : log.attendance.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-xs text-black group-hover:text-indigo-900 transition-colors">
                      {formatIndonesianDate(log.date)}
                    </p>
                    <p className="text-[11px] font-mono text-slate-700 truncate mt-0.5 font-bold">
                      {log.activities && log.activities.length > 0
                        ? `${log.activities.length} aktivitas tercatat`
                        : log.learning || "Belum ada rincian kegiatan"}
                    </p>
                  </div>
                </div>

                <span className="pixel-badge bg-white text-black text-[10px] hidden sm:inline-flex group-hover:bg-[#ffe600] transition-colors">
                  DETAIL
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
