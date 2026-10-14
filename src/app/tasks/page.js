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
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const COLUMNS = [
  {
    id: "todo",
    title: "To Do",
    tag: "[TODO]",
    tagClass: "bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000]",
    headerBg: "bg-[#f4f0ea]",
    dropHighlight: "border-3 border-dashed border-black bg-slate-200/50",
  },
  {
    id: "in_progress",
    title: "In Progress",
    tag: "[RUN]",
    tagClass: "bg-[#00f0ff] text-black border-2 border-black shadow-[2px_2px_0px_#000]",
    headerBg: "bg-[#00f0ff]/20",
    dropHighlight: "border-3 border-dashed border-black bg-[#00f0ff]/20",
  },
  {
    id: "done",
    title: "Done",
    tag: "[DONE]",
    tagClass: "bg-[#a3e635] text-black border-2 border-black shadow-[2px_2px_0px_#000]",
    headerBg: "bg-[#a3e635]/20",
    dropHighlight: "border-3 border-dashed border-black bg-[#a3e635]/20",
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
        toast.success("Task berhasil diperbarui.");
      } else {
        const { error } = await supabase.from("notes").insert(payload);
        if (error) throw error;
        toast.success("Task baru berhasil ditambahkan.");
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
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    try {
      const { error } = await supabase.from("notes").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      toast.success("Status task dipindahkan.", { id: `move-${id}` });
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Gagal memindahkan task.");
      fetchTasks();
    }
  };

  const deleteTask = (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2.5 font-mono">
          <span className="font-black text-xs text-black">HAPUS TASK INI PERMANEN?</span>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="px-2.5 py-1 bg-white border border-black text-black rounded text-xs font-bold hover:bg-slate-100 cursor-pointer"
            >
              BATAL
            </button>
            <button
              type="button"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const { error } = await supabase.from("notes").delete().eq("id", id);
                  if (error) throw error;
                  setTasks((prev) => prev.filter((item) => item.id !== id));
                  toast.success("Task berhasil dihapus.");
                } catch (err) {
                  console.error("Error deleting task:", err);
                  toast.error("Gagal menghapus task.");
                }
              }}
              className="px-2.5 py-1 bg-[#ff6b6b] text-black border border-black rounded text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              HAPUS
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
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-3 border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pixel-badge bg-[#ffe600] text-black">
              KANBAN.EXEC
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-700">Papan Alur Kerja</span>
          </div>
          <h1 className="text-xl md:text-3xl font-black text-black uppercase tracking-tight">
            Papan Tugas Harian
          </h1>
        </div>

        <button
          type="button"
          onClick={() => openModal()}
          className="brutal-btn bg-[#ffe600] text-black hover:bg-[#ffd700] text-xs px-4 py-2.5 rounded-xl font-black flex items-center gap-2 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tambah Task</span>
        </button>
      </header>

      {/* Visual KPI & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric Progress Visual Card */}
        <div className="brutal-card bg-white p-4 md:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-black flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-black fill-[#ffe600]" /> Progres Eksekusi
            </span>
            <div className="flex items-center gap-2">
              <span className="pixel-counter">
                {doneTasks}/{totalTasks}
              </span>
              <span className="text-xs font-black font-mono bg-[#ffe600] px-2 py-0.5 border border-black shadow-[1.5px_1.5px_0px_#000] rounded">
                {completionRate}%
              </span>
            </div>
          </div>

          <div className="w-full bg-[#f4f0ea] border-2 border-black rounded-lg h-3.5 overflow-hidden p-0.5 shadow-[2px_2px_0px_#000] mb-3">
            <div
              className="bg-[#ffe600] h-full rounded border-r border-black transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          {/* Status Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="pixel-badge bg-white text-black">
              {todoTasks} TODO
            </span>
            <span className="pixel-badge bg-[#00f0ff] text-black">
              {inProgressTasks} WIP
            </span>
            <span className="pixel-badge bg-[#a3e635] text-black">
              {doneTasks} DONE
            </span>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="brutal-card bg-white p-4 md:col-span-2 flex flex-col justify-center">
          <label className="text-[11px] font-black uppercase text-black mb-1.5 flex items-center gap-1.5 font-mono">
            <Search className="w-3.5 h-3.5 stroke-[2.5]" /> Filter Cepat Task
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ketik kata kunci judul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#fbf7ee] transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:bg-black hover:text-white p-1 rounded font-bold"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Neo-Brutalism Kanban Board */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-black stroke-[3]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-4">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            const isTarget = dragOverColId === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`border-[2.5px] border-black rounded-2xl flex flex-col transition-all overflow-hidden bg-white shadow-[4px_4px_0px_0px_#000] ${
                  isTarget ? col.dropHighlight : ""
                }`}
              >
                {/* Column Header */}
                <div className={`p-3.5 border-b-2 border-black flex justify-between items-center ${col.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`pixel-badge ${col.tagClass}`}>
                      {col.tag}
                    </span>
                    <h3 className="font-black text-xs uppercase text-black tracking-tight">
                      {col.title}
                    </h3>
                    <span className="pixel-counter">
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openModal(null, col.id)}
                    className="p-1 rounded-lg border border-black bg-white hover:bg-[#ffe600] text-black transition-colors cursor-pointer shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                    title={`Tambah task langsung di ${col.title}`}
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>

                {/* Drop Container & Tasks List */}
                <div className="p-3.5 flex-1 space-y-3 min-h-[360px] bg-[#fdfbf7]">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-black rounded-xl bg-white">
                      <span className="pixel-badge bg-white text-black border border-black mb-2">
                        KOSONG
                      </span>
                      <p className="text-xs font-mono font-bold text-slate-500">Belum ada task di sini</p>
                      <button
                        type="button"
                        onClick={() => openModal(null, col.id)}
                        className="mt-3 text-[11px] font-black uppercase tracking-wider text-black bg-[#ffe600] px-2.5 py-1 rounded border border-black shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" /> Tambah Task
                      </button>
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="bg-white border-2 border-black rounded-xl p-3.5 shadow-[3px_3px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_#000] transition-all flex flex-col group cursor-grab active:cursor-grabbing"
                      >
                        {/* Top: Checkbox, Title & Actions */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            {/* Toggle Checkbox */}
                            <button
                              type="button"
                              onClick={() => updateStatus(task.id, task.status === "done" ? "todo" : "done")}
                              className="mt-0.5 text-black hover:text-[#a3e635] transition-colors cursor-pointer shrink-0"
                              title={task.status === "done" ? "Kembalikan ke To Do" : "Tandai Selesai"}
                            >
                              {task.status === "done" ? (
                                <CheckCircle2 className="w-4 h-4 text-[#a3e635] fill-black stroke-[2.5]" />
                              ) : (
                                <Circle className="w-4 h-4 stroke-[2.5]" />
                              )}
                            </button>

                            <h4
                              className={`font-black text-xs text-black leading-snug line-clamp-2 ${
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
                              className="p-1 text-black hover:bg-[#ffe600] rounded border border-transparent hover:border-black cursor-pointer"
                              title="Edit task"
                            >
                              <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-black hover:bg-[#ff6b6b] rounded border border-transparent hover:border-black cursor-pointer"
                              title="Hapus task"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>

                        {/* Content preview */}
                        {task.content && (
                          <p className="text-[11px] font-mono text-slate-700 line-clamp-2 mb-2 leading-relaxed pl-6 font-bold">
                            {task.content}
                          </p>
                        )}

                        {/* Bottom: Fast Move Shortcuts */}
                        <div className="flex items-center justify-between pt-2 border-t border-black mt-auto pl-6 text-[10px]">
                          <span className="text-slate-500 font-mono text-[9px] font-bold">
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
                                className="px-1.5 py-0.5 rounded border border-black bg-white hover:bg-slate-100 text-black font-mono text-[9px] font-black shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                                title="Pindah ke To Do"
                              >
                                ← TODO
                              </button>
                            )}
                            {col.id !== "in_progress" && (
                              <button
                                type="button"
                                onClick={() => updateStatus(task.id, "in_progress")}
                                className="px-1.5 py-0.5 rounded border border-black bg-[#00f0ff] hover:bg-cyan-200 text-black font-mono text-[9px] font-black shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                                title="Pindah ke In Progress"
                              >
                                ⚡ WIP
                              </button>
                            )}
                            {col.id !== "done" && (
                              <button
                                type="button"
                                onClick={() => updateStatus(task.id, "done")}
                                className="px-1.5 py-0.5 rounded border border-black bg-[#a3e635] hover:bg-lime-200 text-black font-mono text-[9px] font-black shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
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

      {/* Task Modal (Add / Edit) with Neo-Brutalist Styling */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[#fffdf8] w-full max-w-md rounded-2xl shadow-[8px_8px_0px_0px_#000] flex flex-col overflow-hidden border-[3px] border-black animate-brutal-pop">
            <div className="p-4 border-b-2 border-black flex justify-between items-center bg-[#ffe600]">
              <div className="flex items-center gap-2">
                <span className="pixel-badge bg-black text-[#ffe600] border border-black">
                  {formData.id ? "EDIT" : "NEW"}
                </span>
                <h2 className="text-sm font-black uppercase text-black">
                  {formData.id ? "Edit Task" : "Tambah Task Baru"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-black hover:bg-black hover:text-white p-1 rounded-lg border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5 font-mono">
                  Kolom Status
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {COLUMNS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: col.id })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 border-black ${
                        formData.status === col.id
                          ? "bg-[#ffe600] text-black shadow-[2px_2px_0px_#000] -translate-y-0.5"
                          : "bg-white text-black hover:bg-[#fbf7ee]"
                      }`}
                    >
                      {col.title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5 font-mono">
                  Judul Task
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Misal: Perbaiki responsive layout mobile..."
                  className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#fbf7ee] font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5 font-mono">
                  Deskripsi / Checklist Catatan
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Catatan teknis singkat atau instruksi..."
                  rows={3}
                  className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#fbf7ee] resize-none leading-relaxed font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#a3e635] hover:bg-[#8ee01a] text-black font-black uppercase tracking-wider text-xs border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-60 cursor-pointer"
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
