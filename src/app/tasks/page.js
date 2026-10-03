"use client";

import { useState, useEffect } from "react";
import { Plus, CheckSquare, Edit2, Trash2, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, title: "", content: "", status: "todo" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("type", "task")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Gagal memuat task board.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Judul task tidak boleh kosong.");

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        type: "task",
        status: formData.status,
      };

      if (formData.id) {
        const { error } = await supabase.from("notes").update(payload).eq("id", formData.id);
        if (error) throw error;
        toast.success("Task berhasil diperbarui.");
      } else {
        const { error } = await supabase.from("notes").insert(payload);
        if (error) throw error;
        toast.success("Task baru ditambahkan.");
      }

      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error("Error saving task:", err);
      toast.error("Gagal menyimpan task: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
      const { error } = await supabase.from("notes").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      toast.success("Status task diperbarui.");
    } catch (err) {
      console.error("Error updating status:", err);
      fetchTasks();
    }
  };

  const deleteTask = (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2.5">
          <span className="font-semibold text-xs text-slate-900">Hapus task ini?</span>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs hover:bg-slate-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const { error } = await supabase.from("notes").delete().eq("id", id);
                  if (error) throw error;
                  setTasks((prev) => prev.filter((t) => t.id !== id));
                  toast.success("Task dihapus.");
                } catch (err) {
                  console.error("Error deleting task:", err);
                  toast.error("Gagal menghapus task.");
                }
              }}
              className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 cursor-pointer"
            >
              Hapus
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const openModal = (task = null) => {
    if (task) {
      setFormData({ id: task.id, title: task.title, content: task.content || "", status: task.status || "todo" });
    } else {
      setFormData({ id: null, title: "", content: "", status: "todo" });
    }
    setIsModalOpen(true);
  };

  const COLUMNS = [
    { id: "todo", title: "To Do", bg: "bg-slate-100 text-slate-700", border: "border-slate-200" },
    { id: "in_progress", title: "In Progress", bg: "bg-blue-50 text-blue-700", border: "border-blue-200" },
    { id: "done", title: "Done", bg: "bg-emerald-50 text-emerald-700", border: "border-emerald-200" },
  ];

  return (
    <div className="space-y-6 md:space-y-7 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" />
              Workflow Execution
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Task Kanban Board
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Papan pengerjaan tugas harian magang. Kelola progres tugas dari rencana hingga tuntas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 font-semibold text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Task</span>
        </button>
      </header>

      {/* Kanban Board Container */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
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
                <div className="p-3 flex-1 space-y-2.5 bg-slate-50/40 min-h-[260px]">
                  {colTasks.length === 0 ? (
                    <div className="text-xs text-center text-slate-400 py-12 italic">
                      Tidak ada task
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white border border-slate-200/90 p-3.5 rounded-xl shadow-2xs hover:border-slate-300 transition-all flex flex-col group"
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <h4 className="font-semibold text-xs text-slate-900 line-clamp-2 pr-2">
                            {task.title}
                          </h4>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => openModal(task)}
                              className="text-slate-400 hover:text-slate-900 p-0.5 cursor-pointer"
                              title="Edit task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                              title="Hapus task"
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
                              onClick={() => updateStatus(task.id, "todo")}
                              className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                              To Do
                            </button>
                          )}
                          {col.id !== "in_progress" && (
                            <button
                              type="button"
                              onClick={() => updateStatus(task.id, "in_progress")}
                              className="text-[10px] font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                              Progress
                            </button>
                          )}
                          {col.id !== "done" && (
                            <button
                              type="button"
                              onClick={() => updateStatus(task.id, "done")}
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
      )}

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900">
                {formData.id ? "Edit Task" : "Tambah Task Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status Pengerjaan</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="todo">To Do (Akan Dikerjakan)</option>
                  <option value="in_progress">In Progress (Sedang Dikerjakan)</option>
                  <option value="done">Done (Selesai)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Judul Task</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Misal: Selesaikan revisi modul autentikasi..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Deskripsi / Detail</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Instruksi tambahan, checklist, atau catatan penting..."
                  rows={4}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none placeholder-slate-400 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-xs transition-colors disabled:opacity-70 mt-1 cursor-pointer"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Task"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
