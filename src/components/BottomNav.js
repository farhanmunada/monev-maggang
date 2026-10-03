"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, FileText, StickyNote } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { name: "Beranda", href: "/", icon: LayoutDashboard },
    { name: "Jurnal", href: "/daily-log", icon: BookOpen },
    { name: "Rekap", href: "/report", icon: FileText },
    { name: "Catatan", href: "/notes", icon: StickyNote },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 flex justify-around items-center h-16 px-2 z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 ${
              isActive ? "text-slate-900 font-semibold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                isActive ? "bg-slate-100 text-slate-900" : "text-slate-500"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
