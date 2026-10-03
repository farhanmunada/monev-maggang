"use client";

import { useState, useEffect } from "react";
import { Plus, LayoutGrid, Kanban, X, Trash2, Edit2, Loader2, CheckSquare, StickyNote, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    content: "",
    type: "keyword",
    status: "todo"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Judul tidak boleh kosong.");
    
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        status: formData.type === "task" ? formData.status : "todo"
      };

      if (formData.id) {
        const { error } = await supabase.from("notes").update(payload).eq("id", formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("notes").insert(payload);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchNotes();
      toast.success(formData.id ? "Catatan berhasil diperbarui." : "Catatan baru tersimpan.");
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Gagal menyimpan catatan: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-2.5">
        <span className="font-semibold text-xs text-white">Hapus catatan ini secara permanen?</span>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700"
          >
            Batal
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const { error } = await supabase.from("notes").delete().eq("id", id);
                if (error) throw error;
                setNotes(notes.filter(n => n.id !== id));
                toast.success("Catatan dihapus.");
              } catch (error) {
                console.error("Error deleting note:", error);
                toast.error("Gagal menghapus catatan.");
              }
            }} 
            className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
          >
            Hapus
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const openModal = (note = null) => {
    if (note) {
      setFormData(note);
    } else {
      setFormData({ id: null, title: "", content: "", type: "keyword", status: "todo" });
    }
    setIsModalOpen(true);
  };

  const updateTaskStatus = async (id, newStatus) => {
    try {
      setNotes(notes.map(n => n.id === id ? { ...n, status: newStatus } : n));
      const { error } = await supabase.from("notes").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
    } catch (error) {
      console.error("Error updating status:", error);
      fetchNotes();
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "task":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "materi":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "meeting":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "keyword":
      default:
        return "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  const renderGrid = () => {
    const nonTaskNotes = notes.filter(n => n.type !== "task");
    
    if (nonTaskNotes.length === 0) {
      return (
        <div className="text-center py-14 text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl">
          <p className="text-xs">Belum ada catatan materi atau keyword. Otak lagi rileks tanpa beban tugas?</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nonTaskNotes.map((note) => (
          <div key={note.id} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col group">
            <div className="flex justify-between items-start mb-2.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getTypeBadgeClass(note.type)}`}>
                {note.type}
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => openModal(note)} 
                  className="text-slate-400 hover:text-slate-900 p-1 rounded hover:bg-slate-100 transition-colors"
                  title="Edit catatan"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleDelete(note.id)} 
                  className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                  title="Hapus catatan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-sm text-slate-900 mb-1.5 line-clamp-2">{note.title}</h3>
            <p className="text-xs text-slate-500 whitespace-pre-wrap flex-1 line-clamp-4 leading-relaxed">{note.content}</p>
            <p className="text-[10px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100 font-mono">
              {new Date(note.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderKanban = () => {
    const tasks = notes.filter(n => n.type === "task");
    const columns = [
      { id: "todo", title: "To Do", bg: "bg-slate-100 text-slate-700", border: "border-slate-200" },
      { id: "in_progress", title: "In Progress", bg: "bg-blue-50 text-blue-700", border: "border-blue-200" },
      { id: "done", title: "Done", bg: "bg-emerald-50 text-emerald-700", border: "border-emerald-200" }
    ];

    return (
      <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex-1 min-w-[280px] bg-white border border-slate-200/90 rounded-2xl flex flex-col shadow-2xs">
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
                  colTasks.map(task => (
                    <div key={task.id} className="bg-white border border-slate-200/90 p-3.5 rounded-xl shadow-2xs hover:border-slate-300 transition-all flex flex-col">
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="font-semibold text-xs text-slate-900 line-clamp-2 pr-2">{task.title}</h4>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openModal(task)} className="text-slate-400 hover:text-slate-900 p-0.5"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(task.id)} className="text-slate-400 hover:text-rose-600 p-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      {task.content && <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">{task.content}</p>}
                      
                      <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-slate-100">
                        {col.id !== "todo" && (
                          <button onClick={() => updateTaskStatus(task.id, "todo")} className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors">To Do</button>
                        )}
                        {col.id !== "in_progress" && (
                          <button onClick={() => updateTaskStatus(task.id, "in_progress")} className="text-[10px] font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors">Progress</button>
                        )}
                        {col.id !== "done" && (
                          <button onClick={() => updateTaskStatus(task.id, "done")} className="text-[10px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-colors">Selesai</button>
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
  };

  return (
    <div className="pb-12 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Catatan & Task Board</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">Arsip materi belajar, catatan meeting, dan papan kanban tugas harian.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 font-semibold text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Catatan</span>
        </button>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl w-full md:max-w-xs">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Semua Catatan</span>
        </button>
        <button
          onClick={() => setActiveTab("task")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "task" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Kanban className="w-3.5 h-3.5" />
          <span>Task Board</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : (
        activeTab === "all" ? renderGrid() : renderKanban()
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900">{formData.id ? "Edit Catatan" : "Tambah Catatan Baru"}</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kategori Catatan</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                  {["keyword", "materi", "meeting", "task"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                        formData.type === type
                          ? "bg-slate-900 border-slate-900 text-white shadow-2xs"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {formData.type === "task" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status Pengerjaan</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="todo">To Do (Akan Dikerjakan)</option>
                    <option value="in_progress">In Progress (Sedang Dikerjakan)</option>
                    <option value="done">Done (Selesai)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Judul Catatan</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={formData.type === "task" ? "Misal: Perbaiki responsive layout mobile..." : "Misal: Rangkuman arsitektur database..."}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder-slate-400"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Isi Deskripsi</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tuliskan rincian, instruksi, atau link referensi di sini..."
                  rows={5}
                  className="w-full flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none font-mono placeholder-slate-400 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 shadow-xs transition-colors disabled:opacity-70 mt-1 cursor-pointer"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Catatan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
