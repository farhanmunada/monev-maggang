import Link from "next/link";
import { CheckSquare, ArrowRight, Circle, CheckCircle2 } from "lucide-react";

export default function ActiveTasksWidget({ tasks, loading, onCompleteTask }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" /> Task Prioritas
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pekerjaan yang sedang berjalan atau perlu dieksekusi
            </p>
          </div>
          <Link
            href="/tasks"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Buka Board <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 bg-slate-100/70 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
            Semua task tuntas! Tidak ada tanggungan tugas saat ini.
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => onCompleteTask(task.id)}
                    className="w-5 h-5 rounded-md border border-slate-300 group-hover:border-emerald-500 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
                    title="Tandai Selesai"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-transparent group-hover:text-emerald-500 transition-colors" />
                  </button>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-slate-900 truncate">
                      {task.title}
                    </p>
                    {task.content && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {task.content}
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${
                    task.status === "in_progress"
                      ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                      : "bg-slate-100 text-slate-600 border border-slate-200/60"
                  }`}
                >
                  {task.status === "in_progress" ? "Progress" : "To Do"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
