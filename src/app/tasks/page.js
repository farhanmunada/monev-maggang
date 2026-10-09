"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  CheckSquare,
  Edit2,
  Trash2,
  Loader2,
  X,
  Search,
  CheckCircle2,
  Circle,
  ArrowRight,
  GripVertical,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const COLUMNS = [
  {
    id: "todo",
    title: "To Do",
    tag: "[TODO]",
    tagClass: "text-slate-600 bg-slate-100/90 border-slate-300",
    dropHighlight: "ring-1 ring-slate-400 bg-slate-100/40",
  },
  {
    id: "in_progress",
    title: "In Progress",
    tag: "[RUN]",
    tagClass: "text-indigo-700 bg-indigo-50/90 border-indigo-300",
    dropHighlight: "ring-1 ring-indigo-400 bg-indigo-50/40",
  },
  {
    id: "done",
    title: "Done",
    tag: "[DONE]",
    tagClass: "text-emerald-700 bg-emerald-50/90 border-emerald-300",
    dropHighlight: "ring-1 ring-emerald-400 bg-emerald-50/40",
  },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColId, setDragOverColId] = useState(null);

  // Modal State
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
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: "task",
        status: formData.status,
      };

      if (formData.id) {
        const { error } = await supabase.from("notes").update(payload).eq("id", formData.id);
        if (error) throw error;
        toast.success("Task diperbarui.");
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
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Gagal memindahkan task.");
      fetchTasks();
    }
  };

  const deleteTask = (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2.5">
          <span className="font-semibold text-xs text-slate-900">Hapus task ini dari papan?</span>
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
              className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs hover:bg-rose-700 cursor-pointer"
            >
              Hapus
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };

  const openModal = (task = null, defaultCol = "todo") => {
    if (task) {
      setFormData({
        id: task.id,
        title: task.title,
        content: task.content || "",
        status: task.status || "todo",
      });
    } else {
      setFormData({
        id: null,
        title: "",
        content: "",
        status: defaultCol,
      });
    }
    setIsModalOpen(true);
  };

  // Drag and Drop handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    setDragOverColId(null);
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (taskId) {
      updateStatus(taskId, targetColId);
    }
    setDraggedTaskId(null);
  };

  // Metrics calculation
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  const todoTasks = tasks.filter((t) => t.status === "todo").length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Filtered tasks by search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.content && t.content.toLowerCase().includes(q))
    );
  }, [tasks, searchQuery]);

  return (
    <div className="space-y-5 md:space-y-6 pb-12">
      {/* Visual Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pixel-badge text-indigo-700 bg-indigo-50/90 border-indigo-300">
              KANBAN.EXEC
            </span>
            <span className="text-[11px] font-mono text-slate-400">Papan Alur Kerja</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Papan Tugas Harian
          </h1>
        </div>

        <button
          type="button"
          onClick={() => openModal()}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 font-semibold text-xs cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Task</span>
        </button>
      </header>

      {/* Visual KPI & Search (Non-Text-Heavy) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Metric Progress Visual Card */}
        <div className="glass-panel rounded-2xl p-4 md:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Progres Eksekusi
            </span>
            <div className="flex items-center gap-1.5">
              <span className="pixel-counter">
                {doneTasks}/{totalTasks}
              </span>
              <span className="text-xs font-bold font-mono text-indigo-700">
                {completionRate}%
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden mb-3">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          {/* Scannable Status Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="pixel-badge text-slate-700 bg-slate-100/90 border-slate-300">
              {todoTasks} TODO
            </span>
            <span className="pixel-badge text-indigo-700 bg-indigo-50/90 border-indigo-300">
              {inProgressTasks} WIP
            </span>
            <span className="pixel-badge text-emerald-700 bg-emerald-50/90 border-emerald-300">
              {doneTasks} DONE
            </span>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="glass-panel rounded-2xl p-4 md:col-span-2 flex flex-col justify-center">
          <label className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-slate-500" /> Filter Cepat Task
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ketik kata kunci judul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-white/70 border border-white/80 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modern Pixel-Glass Kanban Board */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            const isTarget = dragOverColId === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`glass-panel rounded-3xl flex flex-col transition-all overflow-hidden ${
                  isTarget ? col.dropHighlight : ""
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-white/70 flex justify-between items-center bg-white/40">
                  <div className="flex items-center gap-2">
                    <span className={`pixel-badge ${col.tagClass}`}>
                      {col.tag}
                    </span>
                    <h3 className="font-bold text-xs text-slate-900 tracking-tight">
                      {col.title}
                    </h3>
                    <span className="pixel-counter">
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openModal(null, col.id)}
                    className="p-1.5 rounded-lg hover:bg-white/80 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                    title={`Tambah task langsung di ${col.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Drop Container & Tasks List */}
                <div className="p-3 flex-1 space-y-2.5 min-h-[340px]">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/80 rounded-2xl bg-white/30 backdrop-blur-xs">
                      <span className="pixel-badge text-slate-400 bg-white/50 border-slate-200 mb-2">
                        KOSONG
                      </span>
                      <p className="text-xs text-slate-400">Belum ada task di sini</p>
                      <button
                        type="button"
                        onClick={() => openModal(null, col.id)}
                        className="mt-2 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Tambah Task
                      </button>
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="bg-white/75 backdrop-blur-md border border-white/90 rounded-2xl p-3.5 shadow-2xs hover:border-slate-300 hover:bg-white/90 hover:shadow-xs transition-all flex flex-col group cursor-grab active:cursor-grabbing"
                      >
                        {/* Top: Checkbox, Title & Actions */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            {/* Toggle Checkbox */}
                            <button
                              type="button"
                              onClick={() => updateStatus(task.id, task.status === "done" ? "todo" : "done")}
                              className="mt-0.5 text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                              title={task.status === "done" ? "Kembalikan ke To Do" : "Tandai Selesai"}
                            >
                              {task.status === "done" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>

                            <h4
                              className={`font-bold text-xs text-slate-900 leading-snug line-clamp-2 ${
                                task.status === "done" ? "line-through text-slate-400 font-normal" : ""
                              }`}
                            >
                              {task.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              type="button"
                              onClick={() => openModal(task)}
                              className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                              title="Edit task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                              title="Hapus task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Content preview */}
                        {task.content && (
                          <p className="text-[11px] text-slate-600 line-clamp-2 mb-2 leading-relaxed pl-6 font-sans">
                            {task.content}
                          </p>
                        )}

                        {/* Bottom: Fast Move Shortcuts (No Reading Burden) */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 mt-auto pl-6 text-[10px]">
                          <span className="text-slate-400 font-mono text-[9px]">
                            {new Date(task.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>

                          <div className="flex gap-1">
                            {col.id !== "todo" && (
                              <button
                                type="button"
                                onClick={() => updateStatus(task.id, "todo")}
                                className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 font-mono text-[9px] font-semibold transition-colors cursor-pointer"
                                title="Pindah ke To Do"
                              >
                                ← TODO
                              </button>
                            )}
                            {col.id !== "in_progress" && (
                              <button
                                type="button"
                                onClick={() => updateStatus(task.id, "in_progress")}
                                className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-mono text-[9px] font-semibold transition-colors cursor-pointer"
                                title="Pindah ke In Progress"
                              >
                                ⚡ WIP
                              </button>
                            )}
                            {col.id !== "done" && (
                              <button
                                type="button"
                                onClick={() => updateStatus(task.id, "done")}
                                className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-mono text-[9px] font-semibold transition-colors cursor-pointer"
                                title="Pindah ke Done"
                              >
                                ✓ DONE
                              </button>
                            )}
                          </div>
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

      {/* Task Modal (Add / Edit) with Glass Styling */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/80">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/50">
              <div className="flex items-center gap-2">
                <span className="pixel-badge text-indigo-700 bg-indigo-50 border-indigo-300">
                  {formData.id ? "EDIT" : "NEW"}
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  {formData.id ? "Edit Task" : "Tambah Task Baru"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kolom Status
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {COLUMNS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: col.id })}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        formData.status === col.id
                          ? "bg-slate-900 border-slate-900 text-white shadow-2xs"
                          : "bg-white/80 border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {col.title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Judul Task
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Misal: Perbaiki responsive layout mobile..."
                  className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 placeholder-slate-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Deskripsi / Checklist Catatan
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Catatan teknis singkat atau instruksi..."
                  rows={3}
                  className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none placeholder-slate-400 leading-relaxed font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-70 mt-1 cursor-pointer"
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
