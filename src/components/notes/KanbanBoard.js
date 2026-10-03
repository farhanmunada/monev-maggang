import { Edit2, Trash2 } from "lucide-react";

export default function KanbanBoard({ notes, onOpenModal, onDelete, onUpdateStatus }) {
  const tasks = notes.filter((n) => n.type === "task");
  const columns = [
    { id: "todo", title: "To Do", bg: "bg-slate-100 text-slate-700", border: "border-slate-200" },
    { id: "in_progress", title: "In Progress", bg: "bg-blue-50 text-blue-700", border: "border-blue-200" },
    { id: "done", title: "Done", bg: "bg-emerald-50 text-emerald-700", border: "border-emerald-200" },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div
            key={col.id}
            className="flex-1 min-w-[280px] bg-white border border-slate-200/90 rounded-2xl flex flex-col shadow-2xs"
          >
            <div className="p-3.5 border-b border-slate-100 font-bold text-xs flex justify-between items-center text-slate-900">
              <span>{col.title}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${col.bg}`}>
                {colTasks.length}
              </span>
            </div>
            <div className="p-3 flex-1 space-y-2.5 bg-slate-50/40 min-h-[200px]">
              {colTasks.length === 0 ? (
                <p className="text-xs text-center text-slate-400 py-8">Kolom kosong</p>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white border border-slate-200/90 p-3.5 rounded-xl shadow-2xs hover:border-slate-300 transition-all flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="font-semibold text-xs text-slate-900 line-clamp-2 pr-2">
                        {task.title}
                      </h4>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => onOpenModal(task)}
                          className="text-slate-400 hover:text-slate-900 p-0.5 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(task.id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {task.content && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                        {task.content}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-slate-100">
                      {col.id !== "todo" && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(task.id, "todo")}
                          className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          To Do
                        </button>
                      )}
                      {col.id !== "in_progress" && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(task.id, "in_progress")}
                          className="text-[10px] font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          Progress
                        </button>
                      )}
                      {col.id !== "done" && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(task.id, "done")}
                          className="text-[10px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          Selesai
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
