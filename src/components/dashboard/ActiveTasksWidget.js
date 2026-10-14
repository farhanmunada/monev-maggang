import Link from "next/link";
import { CheckSquare, ArrowRight, CheckCircle2, Plus } from "lucide-react";

export default function ActiveTasksWidget({ tasks, loading, onCompleteTask }) {
  return (
    <div className="brutal-card bg-white p-5 md:p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="pixel-badge bg-[#ffe600] text-black">
                TODO.EXEC
              </span>
            </div>
            <h2 className="text-sm font-black uppercase text-black flex items-center gap-2 tracking-tight">
              <CheckSquare className="w-4 h-4 stroke-[2.5]" /> Task Prioritas
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/tasks"
              className="text-xs font-black uppercase tracking-wider text-black hover:bg-[#ffe600] px-2 py-1 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] flex items-center gap-1 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Papan Kanban <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-[#f4f0ea] border-2 border-black rounded-xl animate-pulse shadow-[2px_2px_0px_#000]"></div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border-2 border-dashed border-black rounded-xl text-xs flex flex-col items-center justify-center gap-3 bg-[#fbf8f0]">
            <p className="font-mono font-bold">[SEMUA TASK TUNTAS // KERJA BAGUS]</p>
            <Link
              href="/tasks"
              className="brutal-btn bg-[#ffe600] text-black text-[11px] py-1.5 px-3 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Buat Task Baru
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3.5 rounded-xl border-2 border-black bg-[#fffdfa] shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4.5px_4.5px_0px_0px_#000] transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => onCompleteTask(task.id)}
                    className="w-6 h-6 rounded-md border-2 border-black bg-white hover:bg-[#a3e635] flex items-center justify-center cursor-pointer shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex-shrink-0"
                    title="Tandai Selesai"
                  >
                    <CheckCircle2 className="w-4 h-4 text-transparent hover:text-black transition-colors stroke-[2.5]" />
                  </button>
                  <div className="min-w-0">
                    <p className="font-black text-xs text-black truncate">
                      {task.title}
                    </p>
                    {task.content && (
                      <p className="text-[11px] font-mono text-slate-600 truncate mt-0.5 font-bold">
                        {task.content}
                      </p>
                    )}
                  </div>
                </div>

                <span className="pixel-badge bg-[#ffe600] text-black text-[10px] ml-2 flex-shrink-0">
                  {task.status === "in_progress" ? "WIP" : "TODO"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
