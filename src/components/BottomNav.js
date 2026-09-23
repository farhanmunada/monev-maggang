"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Clock, FileText, StickyNote } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/", icon: LayoutDashboard },
    { name: "Jurnal", href: "/daily-log", icon: BookOpen },
    { name: "Absensi", href: "/report", icon: FileText },
    { name: "Notes", href: "/notes", icon: StickyNote },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-card/90 backdrop-blur-md border-t border-border flex justify-around items-center h-20 px-4 pb-2 z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors group ${
              isActive ? "text-primary-600" : "text-secondary hover:text-primary-600"
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${isActive ? "bg-primary-50" : "group-hover:bg-primary-50"}`}>
              <Icon className={`w-6 h-6 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
            </div>
            <span className="text-[10px] font-medium mt-1">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
