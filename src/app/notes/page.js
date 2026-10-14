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
        <div className="flex flex-col gap-2.5 font-mono">
          <span className="font-black text-xs text-black">HAPUS CATATAN INI PERMANEN?</span>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-white border border-black text-black rounded text-xs font-bold hover:bg-slate-100 cursor-pointer"
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
                  setNotes((prev) => prev.filter((n) => n.id !== id));
                  toast.success("Catatan dihapus.");
                } catch (error) {
                  console.error("Error deleting note:", error);
                  toast.error("Gagal menghapus catatan.");
                }
              }}
              className="px-3 py-1 bg-[#ff6b6b] text-black border border-black rounded text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              HAPUS
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
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-3 border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pixel-badge bg-[#8b5cf6] text-white">
              KNOWLEDGE.VAULT
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-700">Arsip Snippet & Catatan</span>
          </div>
          <h1 className="text-xl md:text-3xl font-black text-black uppercase tracking-tight">
            Knowledge Vault
          </h1>
        </div>

        <button
          type="button"
          onClick={() => openModal()}
          className="brutal-btn bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs px-5 py-2.5 rounded-xl font-black flex items-center gap-2 cursor-pointer shadow-[3.5px_3.5px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Buat Catatan</span>
        </button>
      </header>

      {/* Filter and Search Bar with Neo-Brutalist Layout */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-black stroke-[2.5]" />
          <input
            type="text"
            placeholder="Cari materi atau keyword catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-white border-2 border-black rounded-xl text-xs font-mono font-bold text-black shadow-[3px_3px_0px_#000] focus:bg-[#faf5ff] focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
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
              className={`pixel-badge transition-all cursor-pointer font-bold border-2 border-black shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                categoryFilter === cat.id
                  ? "bg-[#8b5cf6] text-white -translate-y-0.5 shadow-[3px_3px_0px_#000]"
                  : "text-black bg-white hover:bg-[#a3e635]"
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
