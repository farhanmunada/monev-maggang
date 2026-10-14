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
    { name: "Laporan", href: "/ai-report", icon: Sparkles },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Catatan", href: "/notes", icon: StickyNote },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-40 w-full bg-[#fffdf8] border-b-[3px] border-black shadow-[0_4px_0px_0px_#000] py-2.5 transition-all">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex-1 flex items-center justify-start">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-black bg-[#8b5cf6] flex items-center justify-center shadow-[2px_2px_0px_0px_#000] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[3px_3px_0px_0px_#000] transition-all">
              <Image
                src="/icon.png"
                alt="InternTrack Logo"
                width={24}
                height={24}
                className="object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-black tracking-tight uppercase">
                InternTrack
              </span>
              <span className="pixel-badge bg-[#a3e635] text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] hidden lg:inline-flex text-[10px]">
                SYS.V2
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links with Neo-Brutalist Block Styling */}
        <div className="hidden md:flex flex-2 justify-center">
          <nav className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#8b5cf6] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] -translate-y-0.5"
                      : "text-slate-800 border-2 border-transparent hover:border-black hover:bg-[#a3e635] hover:text-black hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#000]"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-black"}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Balancer & Live Status */}
        <div className="hidden md:flex flex-1 items-center justify-end">
          <span className="pixel-badge bg-[#a3e635] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 font-black text-[11px]">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            [LIVE.SYS]
          </span>
        </div>
      </div>
    </header>
  );
}
