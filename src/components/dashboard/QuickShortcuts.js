import Link from "next/link";
import { BookOpen, CalendarCheck2, Sparkles, CheckSquare, StickyNote, ArrowUpRight } from "lucide-react";

export default function QuickShortcuts() {
  const tools = [
    {
      title: "Jurnal Harian",
      desc: "Log aktivitas per jam & refleksi AI",
      href: "/daily-log",
      icon: BookOpen,
      color: "text-blue-600 bg-blue-50/80 border-blue-200/70",
    },
    {
      title: "Rekap Absensi",
      desc: "Statistik kehadiran & cetak laporan",
      href: "/attendance",
      icon: CalendarCheck2,
      color: "text-emerald-600 bg-emerald-50/80 border-emerald-200/70",
    },
    {
      title: "AI Report Studio",
      desc: "Formulasi uraian formal instan",
      href: "/ai-report",
      icon: Sparkles,
      color: "text-indigo-600 bg-indigo-50/80 border-indigo-200/70",
    },
    {
      title: "Task Kanban",
      desc: "Kelola status eksekusi tugas harian",
      href: "/tasks",
      icon: CheckSquare,
      color: "text-purple-600 bg-purple-50/80 border-purple-200/70",
    },
    {
      title: "Knowledge Vault",
      desc: "Arsip materi, meeting, & snippet",
      href: "/notes",
      icon: StickyNote,
      color: "text-amber-600 bg-amber-50/80 border-amber-200/70",
    },
  ];

  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Navigasi Modul Kerja</h2>
        <p className="text-xs text-slate-500 mt-0.5">Akses langsung ke seluruh workspace aplikasi</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.title}
              href={tool.href}
              className="p-3.5 rounded-2xl border border-white/80 hover:border-slate-300 bg-white/70 hover:bg-white/95 backdrop-blur-xs transition-all flex flex-col justify-between group shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${tool.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2 font-normal font-sans">
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
