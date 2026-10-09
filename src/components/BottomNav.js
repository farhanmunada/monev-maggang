"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck2,
  Sparkles,
  CheckSquare,
  StickyNote,
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { name: "Beranda", href: "/", icon: LayoutDashboard },
    { name: "Jurnal", href: "/daily-log", icon: BookOpen },
    { name: "Absensi", href: "/attendance", icon: CalendarCheck2 },
    { name: "AI", href: "/ai-report", icon: Sparkles },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Notes", href: "/notes", icon: StickyNote },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200/70 flex justify-around items-center h-16 px-1 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
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
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
              isActive ? "text-slate-900 font-semibold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-all ${
                isActive ? "bg-slate-100 text-slate-900" : "text-slate-500"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={isActive ? 2.2 : 1.8} />
            </div>
            <span className="text-[9px] tracking-tight mt-0.5">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
