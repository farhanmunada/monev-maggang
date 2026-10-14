"use client";

import Link from "next/link";
import { formatIndonesianDate, formatYMD } from "@/lib/date";
import { Calendar, ArrowRight, CheckCircle2, Clock3, Terminal } from "lucide-react";

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
    <div className="brutal-card bg-white p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Decorative Corner Tag */}
      <div className="absolute -top-3 -right-3 bg-[#ffe600] border-2 border-black px-4 py-1 font-mono font-black text-[10px] uppercase rotate-2 shadow-[2px_2px_0px_0px_#000] hidden sm:block">
        COMMAND.CENTER
      </div>

      <div className="relative z-10 max-w-2xl">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="pixel-badge bg-[#f4f0ea]">
            <Calendar className="w-3.5 h-3.5 text-black" />
            {formattedToday}
          </span>

          {isLogged ? (
            <span className="pixel-badge bg-[#a3e635] text-black">
              <CheckCircle2 className="w-3.5 h-3.5 text-black" />
              PRESENSI: {todayStatus} ({todayActsCount} ACT)
            </span>
          ) : (
            <span className="pixel-badge bg-[#ff6b6b] text-black">
              <Clock3 className="w-3.5 h-3.5 text-black" />
              JURNAL: BELUM DIISI
            </span>
          )}
        </div>

        <h1 className="text-xl md:text-3xl font-black text-black tracking-tight uppercase">
          Pusat Kendali Monitoring & Evaluasi
        </h1>

        <div className="mt-3.5 bg-[#fbf8f0] border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_0px_#000] max-w-xl">
          <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono font-black text-slate-700">
            <Terminal className="w-3 h-3 text-black" /> [NOTE OF THE DAY]
          </div>
          <p className="text-xs font-bold text-black leading-relaxed">
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      </div>

      <div className="relative z-10 flex-shrink-0">
        <Link
          href="/daily-log"
          className="brutal-btn bg-[#ffe600] text-black hover:bg-[#ffd700] text-xs px-6 py-3.5 rounded-xl font-black tracking-wider flex items-center gap-2"
        >
          <span>{isLogged ? "Perbarui Jurnal Hari Ini" : "Isi Jurnal Sekarang"}</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </Link>
      </div>
    </div>
  );
}
