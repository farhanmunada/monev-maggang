import Link from "next/link";
import { BookOpen, CalendarCheck2, Sparkles, CheckSquare, StickyNote, ArrowUpRight } from "lucide-react";

export default function QuickShortcuts() {
  const tools = [
    {
      title: "Jurnal Harian",
      desc: "Log aktivitas per jam & refleksi AI",
      href: "/daily-log",
      icon: BookOpen,
      bg: "bg-[#8b5cf6]",
      iconColor: "text-white",
    },
    {
      title: "Rekap Absensi",
      desc: "Statistik kehadiran & cetak laporan",
      href: "/attendance",
      icon: CalendarCheck2,
      bg: "bg-[#a3e635]",
      iconColor: "text-black",
    },
    {
      title: "AI Report Studio",
      desc: "Formulasi uraian formal instan",
      href: "/ai-report",
      icon: Sparkles,
      bg: "bg-[#8b5cf6]",
      iconColor: "text-white",
    },
    {
      title: "Task Kanban",
      desc: "Kelola status eksekusi tugas harian",
      href: "/tasks",
      icon: CheckSquare,
      bg: "bg-[#a3e635]",
      iconColor: "text-black",
    },
    {
      title: "Knowledge Vault",
      desc: "Arsip materi, meeting, & snippet",
      href: "/notes",
      icon: StickyNote,
      bg: "bg-white",
      iconColor: "text-black",
    },
  ];

  return (
    <div className="brutal-card bg-white p-5 md:p-6">
      <div className="mb-4">
        <h2 className="text-sm font-black uppercase text-black tracking-tight">Navigasi Modul Kerja</h2>
        <p className="text-xs font-mono font-bold text-slate-600 mt-0.5">Akses langsung ke seluruh workspace aplikasi</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.title}
              href={tool.href}
              className="p-4 rounded-xl border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000] flex flex-col justify-between group hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_#000] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border-2 border-black ${tool.bg} shadow-[2px_2px_0px_0px_#000] group-hover:-rotate-3 transition-transform`}>
                  <Icon className={`w-4 h-4 ${tool.iconColor || "text-black"} stroke-[2.5]`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-black stroke-[3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase text-black tracking-tight group-hover:text-[#7c3aed] transition-colors">
                  {tool.title}
                </h3>
                <p className="text-[11px] font-mono font-bold text-slate-600 mt-1 leading-snug line-clamp-2">
                  {tool.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
