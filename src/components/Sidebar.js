"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Clock, FileText, StickyNote } from "lucide-react";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Jurnal Harian", href: "/daily-log", icon: BookOpen },
    { name: "Riwayat", href: "/history", icon: Clock },
    { name: "Absensi", href: "/report", icon: FileText },
    { name: "Catatan", href: "/notes", icon: StickyNote },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 bg-card border-r border-border h-screen fixed shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 bg-white">
          <Image src="/icon.png" alt="InternTrack Logo" width={40} height={40} className="object-cover" />
        </div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-foreground to-secondary tracking-tight">
          InternTrack
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-primary-50 text-primary-600 font-semibold"
                  : "text-secondary font-medium hover:text-primary-600 hover:bg-primary-50"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
