"use client";

import Link from "next/link";
import { formatIndonesianDate, formatYMD } from "@/lib/date";
import { Calendar, ArrowRight, CheckCircle2, Clock3 } from "lucide-react";

export default function BentoGreeting({ telemetry }) {
  const todayStr = formatYMD();
  const formattedToday = formatIndonesianDate(todayStr);
  const isLogged = telemetry?.today?.isLogged;
  const todayStatus = telemetry?.today?.status;
  const todayActsCount = telemetry?.today?.activitiesCount || 0;

  const sarcasticQuotes = [
    "Dunia industri butuh hasil nyata, bukan alasan sinyal ngadat pas daily standup.",
    "Buka IDE, minum air putih. Deadline gak bakal selesai kalau cuma dipelototin.",
    "Status magang boleh junior, tapi kualitas logbook harus sekelas senior engineer.",
    "Jurnal harian rapi, bimbingan lancar, tanda tangan laporan aman terkendali.",
    "Ingat: dokumentasi rapi hari ini menyelamatkanmu dari amukan dosen penguji nanti.",
  ];

  const quoteIndex = new Date().getDate() % sarcasticQuotes.length;
  const quote = sarcasticQuotes[quoteIndex];

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Decorative ambient subtle mesh */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100/50 via-blue-50/20 to-transparent rounded-full pointer-events-none -mr-24 -mt-24 blur-3xl" />

      <div className="relative z-10 max-w-2xl">
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <span className="pixel-badge text-slate-700 bg-white/80 border-slate-300">
            <Calendar className="w-3 h-3 text-slate-500" />
            {formattedToday}
          </span>

          {isLogged ? (
            <span className="pixel-badge text-emerald-800 bg-emerald-50/90 border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              PRESENSI: {todayStatus} ({todayActsCount} ACT)
            </span>
          ) : (
            <span className="pixel-badge text-amber-800 bg-amber-50/90 border-amber-300">
              <Clock3 className="w-3 h-3 text-amber-600" />
              JURNAL: BELUM DIISI
            </span>
          )}
        </div>

        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Pusat Kendali Monitoring & Evaluasi
        </h1>

        <div className="mt-2.5 bg-slate-50/80 border border-slate-200/60 p-3 rounded-2xl max-w-xl">
          <p className="text-xs text-slate-600 leading-relaxed italic">
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      </div>

      <div className="relative z-10 flex-shrink-0">
        <Link
          href="/daily-log"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-semibold text-xs shadow-xs hover:shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
        >
          <span>{isLogged ? "Perbarui Jurnal Hari Ini" : "Isi Jurnal Sekarang"}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
