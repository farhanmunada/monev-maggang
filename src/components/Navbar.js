"use client";

import { useState, useEffect } from "react";
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Beranda", href: "/", icon: LayoutDashboard },
    { name: "Jurnal", href: "/daily-log", icon: BookOpen },
    { name: "Absensi", href: "/attendance", icon: CalendarCheck2 },
    { name: "Laporan AI", href: "/ai-report", icon: Sparkles },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Catatan", href: "/notes", icon: StickyNote },
  ];

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "glass-nav py-2.5"
          : "bg-white/20 backdrop-blur-xs border-b border-white/40 py-3.5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex-1 flex items-center justify-start">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/80 bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Image
                src="/icon.png"
                alt="InternTrack Logo"
                width={26}
                height={26}
                className="object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                InternTrack
              </span>
              <span className="pixel-badge text-indigo-700 bg-indigo-50/90 border-indigo-300 hidden lg:inline-flex">
                SYS.V2
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links with Whitespace & Breathing Room */}
        <div className="hidden md:flex flex-2 justify-center">
          <nav className="flex items-center gap-1.5 bg-white/75 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-white/80 shadow-xs">
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
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? "bg-slate-900 text-white font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-950 font-semibold hover:bg-slate-100/80"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-white" : "text-slate-500"
                    }`}
                    strokeWidth={isActive ? 2.2 : 2}
                  />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Balancer & Live Status */}
        <div className="hidden md:flex flex-1 items-center justify-end">
          <span className="pixel-badge text-emerald-700 bg-emerald-50/80 border-emerald-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            [LIVE.SYS]
          </span>
        </div>
      </div>
    </header>
  );
}
