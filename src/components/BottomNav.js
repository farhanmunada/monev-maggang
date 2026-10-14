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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#fffdf8] border-t-[3px] border-black shadow-[0_-4px_0px_0px_#000] flex justify-around items-center h-16 px-1 z-40">
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
              isActive ? "text-black font-black" : "text-slate-600 hover:text-black"
            }`}
          >
            <div
              className={`p-1 rounded-md transition-all ${
                isActive
                  ? "bg-[#a3e635] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] -translate-y-1"
                  : "text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4 text-black" strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-tight mt-0.5">
              {link.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
