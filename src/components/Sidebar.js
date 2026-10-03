"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, FileText, StickyNote, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Jurnal Harian", href: "/daily-log", icon: BookOpen },
    { name: "Rekap & Absensi", href: "/report", icon: FileText },
    { name: "Catatan & Task", href: "/notes", icon: StickyNote },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 bg-white/90 backdrop-blur-xl border-r border-slate-200/80 h-screen fixed z-20 shadow-[1px_0_12px_rgba(0,0,0,0.02)]">
      <div className="p-6 pb-4 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-blue-500/10 border border-slate-200 bg-white flex items-center justify-center">
          <Image src="/icon.png" alt="InternTrack Logo" width={36} height={36} className="object-cover" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
            InternTrack
          </h1>
          <p className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Mode Bertahan Hidup
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama
        </div>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                isActive
                  ? "bg-slate-900 text-white font-medium shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-normal"
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900 group-hover:scale-105"}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sarcastic Badge at Footer */}
      <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Status Pekerja Tangguh</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Tetap santun di depan mentor, tetap rajin isi log harian.
        </p>
      </div>
    </aside>
  );
}
