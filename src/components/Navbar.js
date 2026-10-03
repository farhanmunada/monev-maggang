"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck2,
  Sparkles,
  CheckSquare,
  StickyNote,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: "Beranda", href: "/", icon: LayoutDashboard },
    { name: "Jurnal", href: "/daily-log", icon: BookOpen },
    { name: "Absensi", href: "/attendance", icon: CalendarCheck2 },
    { name: "Laporan AI", href: "/ai-report", icon: Sparkles },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Catatan", href: "/notes", icon: StickyNote },
  ];

  return (
    <header className="fixed top-4 left-0 right-0 z-40 hidden md:flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center gap-1 bg-white/85 backdrop-blur-xl border border-slate-200/90 shadow-sm shadow-slate-200/50 rounded-full px-3 py-1.5 transition-all">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 pl-2 pr-3 py-1 mr-1 border-r border-slate-200/80 group"
        >
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200/80 bg-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
            <Image src="/icon.png" alt="InternTrack Logo" width={24} height={24} className="object-cover" />
          </div>
          <span className="font-extrabold text-xs text-slate-900 tracking-tight">
            InternTrack
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
