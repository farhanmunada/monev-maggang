"use client";

import { useState, useEffect } from "react";
import { Plus, StickyNote, Search, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

import NotesGrid from "@/components/notes/NotesGrid";
import NoteModal from "@/components/notes/NoteModal";
import NoteDetailModal from "@/components/notes/NoteDetailModal";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    content: "",
    type: "keyword",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .neq("type", "task")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Gagal memuat arsip catatan.");
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
          <span className="font-semibold text-xs text-slate-900">Hapus catatan ini secara permanen?</span>
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
      setFormData({ id: null, title: "", content: "", type: "keyword" });
    }
    setIsModalOpen(true);
  };

  const filteredNotes = notes.filter((n) => {
    const matchCat = categoryFilter === "all" || n.type === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 md:space-y-7 pb-12">
      {/* Glanceable Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pixel-badge text-indigo-700 bg-indigo-50/90 border-indigo-300">
              KNOWLEDGE.VAULT
            </span>
            <span className="text-[11px] font-mono text-slate-400">Arsip Snippet & Catatan</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Knowledge Vault
          </h1>
        </div>

        <button
          type="button"
          onClick={() => openModal()}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-950 text-white px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 font-bold text-xs cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Catatan</span>
        </button>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari materi atau keyword catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white/70 backdrop-blur-md border border-white/80 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xs font-sans"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          {[
            { id: "all", label: "[SEMUA]" },
            { id: "materi", label: "[MATERI]" },
            { id: "meeting", label: "[MEETING]" },
            { id: "keyword", label: "[KEYWORD]" },
            { id: "snippet", label: "[SNIPPET]" },
          ].map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`pixel-badge transition-all cursor-pointer ${
                categoryFilter === cat.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                  : "text-slate-600 bg-white/70 border-slate-300 hover:bg-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <NotesGrid
          notes={filteredNotes}
          onOpenModal={openModal}
          onDelete={handleDelete}
          onViewNote={setViewingNote}
        />
      )}

      <NoteDetailModal
        note={viewingNote}
        onClose={() => setViewingNote(null)}
        onEdit={(note) => {
          setViewingNote(null);
          openModal(note);
        }}
      />

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
