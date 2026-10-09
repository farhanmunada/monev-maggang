import Link from "next/link";
import { CheckSquare, ArrowRight, CheckCircle2, Plus } from "lucide-react";

export default function ActiveTasksWidget({ tasks, loading, onCompleteTask }) {
  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="pixel-badge text-purple-700 bg-purple-50/90 border-purple-300">
                TODO.EXEC
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              <CheckSquare className="w-4 h-4 text-purple-600" /> Task Prioritas
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/tasks"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              Papan Kanban <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-slate-100/70 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-2xl text-xs flex flex-col items-center justify-center gap-2">
            <p>Semua task tuntas! Bebas dari tanggungan tugas saat ini.</p>
            <Link
              href="/tasks"
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" /> Buat Task Baru
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/95 border border-white/80 hover:border-slate-300 bg-white/70 backdrop-blur-xs transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => onCompleteTask(task.id)}
                    className="w-5 h-5 rounded-lg border border-slate-300 group-hover:border-emerald-500 group-hover:bg-emerald-50 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
                    title="Tandai Selesai"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-transparent group-hover:text-emerald-500 transition-colors" />
                  </button>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-slate-900 truncate">
                      {task.title}
                    </p>
                    {task.content && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                        {task.content}
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`pixel-badge shrink-0 ml-2 ${
                    task.status === "in_progress"
                      ? "bg-indigo-50/90 text-indigo-700 border-indigo-300"
                      : "bg-slate-100/90 text-slate-600 border-slate-300"
                  }`}
                >
                  {task.status === "in_progress" ? "[RUN]" : "[TODO]"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
