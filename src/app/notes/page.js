"use client";

import { useState, useEffect } from "react";
import { Plus, LayoutGrid, Kanban, X, Trash2, Edit2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all' (Grid), 'task' (Kanban)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    content: "",
    type: "keyword", // 'task', 'materi', 'keyword', 'meeting'
    status: "todo"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Judul tidak boleh kosong!");
    
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        status: formData.type === "task" ? formData.status : "todo"
      };

      if (formData.id) {
        // Update
        const { error } = await supabase.from("notes").update(payload).eq("id", formData.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from("notes").insert(payload);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchNotes();
      toast.success(formData.id ? "Catatan diperbarui!" : "Catatan berhasil disimpan!");
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Gagal menyimpan catatan: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-semibold text-sm">Yakin ingin menghapus catatan ini?</span>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-lg text-xs font-medium hover:bg-gray-300"
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
                toast.success("Catatan dihapus");
              } catch (error) {
                console.error("Error deleting note:", error);
                toast.error("Gagal menghapus catatan");
              }
            }} 
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600"
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
      // Optimistic update UI
      setNotes(notes.map(n => n.id === id ? { ...n, status: newStatus } : n));
      const { error } = await supabase.from("notes").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
    } catch (error) {
      console.error("Error updating status:", error);
      fetchNotes(); // Revert on failure
    }
  };

  const renderGrid = () => {
    const nonTaskNotes = notes.filter(n => n.type !== "task");
    
    if (nonTaskNotes.length === 0) {
      return (
        <div className="text-center py-20 text-secondary bg-card border border-border border-dashed rounded-3xl mx-4 md:mx-0">
          <p>Belum ada catatan.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in fade-in duration-500 mx-4 md:mx-0">
        {nonTaskNotes.map((note) => (
          <div key={note.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col group">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {note.type}
              </span>
              <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(note)} className="text-gray-400 hover:text-blue-500">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(note.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2 text-foreground line-clamp-2">{note.title}</h3>
            <p className="text-sm text-secondary whitespace-pre-wrap flex-1 line-clamp-5">{note.content}</p>
            <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-border">
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
      { id: "todo", title: "To Do", bg: "bg-gray-50", text: "text-gray-600" },
      { id: "in_progress", title: "In Progress", bg: "bg-blue-50", text: "text-blue-600" },
      { id: "done", title: "Done", bg: "bg-green-50", text: "text-green-600" }
    ];

    return (
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 overflow-x-auto pb-4 animate-in fade-in duration-500 snap-x mx-4 md:mx-0">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex-1 min-w-[280px] bg-card border border-border rounded-2xl flex flex-col snap-center">
              <div className={`p-4 border-b border-border font-bold ${col.text} flex justify-between items-center`}>
                <span>{col.title}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${col.bg}`}>{colTasks.length}</span>
              </div>
              <div className="p-4 flex-1 space-y-4 bg-gray-50/30">
                {colTasks.length === 0 ? (
                  <p className="text-xs text-center text-gray-400 py-6">Kosong</p>
                ) : (
                  colTasks.map(task => (
                    <div key={task.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm line-clamp-2 pr-2">{task.title}</h4>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openModal(task)} className="text-gray-400 hover:text-blue-500 p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(task.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      {task.content && <p className="text-xs text-gray-500 line-clamp-3 mb-4">{task.content}</p>}
                      
                      {/* Mobile & Desktop Action Buttons for Status */}
                      <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-gray-100">
                        {col.id !== "todo" && (
                          <button onClick={() => updateTaskStatus(task.id, "todo")} className="text-[10px] font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">To Do</button>
                        )}
                        {col.id !== "in_progress" && (
                          <button onClick={() => updateTaskStatus(task.id, "in_progress")} className="text-[10px] font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">Progress</button>
                        )}
                        {col.id !== "done" && (
                          <button onClick={() => updateTaskStatus(task.id, "done")} className="text-[10px] font-medium px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors">Selesai</button>
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
    <div className="pb-28 md:pb-10 min-h-screen space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mx-4 md:mx-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1 md:mb-2">Catatan & Task</h1>
          <p className="text-sm md:text-base text-secondary">Simpan materi, ide, dan pantau progress tugas Anda.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-foreground text-background hover:bg-gray-800 px-6 py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5 md:hover:scale-105 font-bold w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Buat Baru</span>
        </button>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl w-full md:max-w-sm mx-4 md:mx-0 max-w-[calc(100%-2rem)]">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
            activeTab === "all" ? "bg-white text-foreground shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Semua Catatan
        </button>
        <button
          onClick={() => setActiveTab("task")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
            activeTab === "task" ? "bg-white text-foreground shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Kanban className="w-4 h-4" />
          Task Board
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : (
        activeTab === "all" ? renderGrid() : renderKanban()
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold">{formData.id ? "Edit Catatan" : "Catatan Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipe Catatan</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["keyword", "materi", "meeting", "task"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all ${
                        formData.type === type
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500/20"
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {formData.type === "task" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Status Tugas</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all cursor-pointer"
                  >
                    <option value="todo">To Do (Akan Dikerjakan)</option>
                    <option value="in_progress">In Progress (Sedang Dikerjakan)</option>
                    <option value="done">Done (Selesai)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Judul</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={formData.type === "task" ? "Contoh: Perbaiki error halaman Login..." : "Contoh: Referensi React Hooks..."}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium placeholder-gray-400"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-bold text-gray-700 mb-2">Isi Catatan</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tulis detail catatan, link, atau deskripsi di sini..."
                  className="w-full flex-1 min-h-[150px] bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 shadow-md transition-colors disabled:opacity-70 mt-2"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
