import Link from "next/link";
import { BookOpen, CalendarCheck2, Sparkles, CheckSquare, StickyNote, ArrowUpRight } from "lucide-react";

export default function QuickShortcuts() {
  const tools = [
    {
      title: "Jurnal Harian",
      desc: "Log aktivitas per jam & refleksi AI",
      href: "/daily-log",
      icon: BookOpen,
      color: "text-blue-600 bg-blue-50 border-blue-200/60",
    },
    {
      title: "Rekap Absensi",
      desc: "Statistik kehadiran bulanan",
      href: "/attendance",
      icon: CalendarCheck2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200/60",
    },
    {
      title: "AI Report Studio",
      desc: "Format narasi baku siap serah",
      href: "/ai-report",
      icon: Sparkles,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200/60",
    },
    {
      title: "Task Kanban",
      desc: "Kelola status eksekusi tugas",
      href: "/tasks",
      icon: CheckSquare,
      color: "text-purple-600 bg-purple-50 border-purple-200/60",
    },
    {
      title: "Knowledge Vault",
      desc: "Arsip materi & referensi meeting",
      href: "/notes",
      icon: StickyNote,
      color: "text-amber-600 bg-amber-50 border-amber-200/60",
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-900">Alat Kerja Cepat</h2>
        <p className="text-xs text-slate-500 mt-0.5">Navigasi langsung ke modul pengerjaan</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.title}
              href={tool.href}
              className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${tool.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
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
