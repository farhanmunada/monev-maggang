"use client";

import Link from "next/link";
import { formatIndonesianDate, formatYMD } from "@/lib/date";
import { Calendar, ArrowRight, CheckCircle2, Clock3, Sparkles } from "lucide-react";

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
  ];

  // Deterministic quote based on day
  const quoteIndex = new Date().getDate() % sarcasticQuotes.length;
  const quote = sarcasticQuotes[quoteIndex];

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Decorative subtle backdrop mesh */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-50/70 via-blue-50/30 to-transparent rounded-full pointer-events-none -mr-20 -mt-20 blur-2xl" />

      <div className="relative z-10 max-w-2xl">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100/90 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {formattedToday}
          </span>

          {isLogged ? (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Presensi: {todayStatus} ({todayActsCount} Aktivitas)
            </span>
          ) : (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Clock3 className="w-3.5 h-3.5 text-amber-600" />
              Jurnal Hari Ini Belum Diisi
            </span>
          )}
        </div>

        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Pusat Kendali Monitoring & Evaluasi
        </h1>

        <p className="text-xs md:text-sm text-slate-500 mt-1.5 leading-relaxed font-normal">
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      <div className="relative z-10 flex-shrink-0">
        <Link
          href="/daily-log"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-xs hover:shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
        >
          <span>{isLogged ? "Perbarui Jurnal Hari Ini" : "Isi Jurnal Sekarang"}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
