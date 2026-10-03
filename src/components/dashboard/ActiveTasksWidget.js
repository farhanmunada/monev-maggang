import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function ActiveTasksWidget({ tasks, loading, onCompleteTask }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Task Aktif (+10 EXP)
        </h2>
        <Link
          href="/notes"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Buka Board <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div key={i} className="h-11 bg-slate-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-7 text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs">
          Semua task selesai. Saatnya napas sejenak sebelum ada tugas susulan.
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group"
            >
              <button
                type="button"
                onClick={() => onCompleteTask(task.id)}
                className="mt-0.5 w-5 h-5 rounded-full border border-slate-300 flex-shrink-0 group-hover:border-emerald-600 group-hover:bg-emerald-50 transition-colors flex items-center justify-center cursor-pointer"
                title="Tandai selesai"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-transparent group-hover:text-emerald-600" />
              </button>
              <div className="flex-1">
                <p className="font-medium text-slate-900 text-xs md:text-sm line-clamp-1">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      task.status === "in_progress"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {task.status === "in_progress" ? "In Progress" : "To Do"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
