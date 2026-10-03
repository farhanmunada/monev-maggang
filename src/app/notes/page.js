"use client";

import { useState, useEffect } from "react";
import { Plus, LayoutGrid, Kanban, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

import NotesGrid from "@/components/notes/NotesGrid";
import KanbanBoard from "@/components/notes/KanbanBoard";
import NoteModal from "@/components/notes/NoteModal";

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
    status: "todo",
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
        status: formData.type === "task" ? formData.status : "todo",
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
    toast(
      (t) => (
        <div className="flex flex-col gap-2.5">
          <span className="font-semibold text-xs text-white">Hapus catatan ini secara permanen?</span>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700 cursor-pointer"
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
                  setNotes((prev) => prev.filter((n) => n.id !== id));
                  toast.success("Catatan dihapus.");
                } catch (error) {
                  console.error("Error deleting note:", error);
                  toast.error("Gagal menghapus catatan.");
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
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, status: newStatus } : n)));
      const { error } = await supabase.from("notes").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
    } catch (error) {
      console.error("Error updating status:", error);
      fetchNotes();
    }
  };

  return (
    <div className="pb-12 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Catatan & Task Board
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Arsip materi belajar, catatan meeting, dan papan kanban tugas harian.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 font-semibold text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Catatan</span>
        </button>
      </header>

      <div className="flex p-1 bg-slate-100 rounded-xl w-full md:max-w-xs">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Semua Catatan</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("task")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "task" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Kanban className="w-3.5 h-3.5" />
          <span>Task Board</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : activeTab === "all" ? (
        <NotesGrid notes={notes} onOpenModal={openModal} onDelete={handleDelete} />
      ) : (
        <KanbanBoard
          notes={notes}
          onOpenModal={openModal}
          onDelete={handleDelete}
          onUpdateStatus={updateTaskStatus}
        />
      )}

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        onChange={(field, val) => setFormData((prev) => ({ ...prev, [field]: val }))}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
