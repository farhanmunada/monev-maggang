"use client";

import { Edit2, Trash2, FileText, Code2, Users2, BookOpen } from "lucide-react";

function getTypeInfo(type) {
  switch (type) {
    case "materi":
      return {
        badgeClass: "bg-[#00f0ff] text-black",
        label: "MATERI",
        icon: BookOpen,
      };
    case "meeting":
      return {
        badgeClass: "bg-[#ffe600] text-black",
        label: "MEETING",
        icon: Users2,
      };
    case "snippet":
      return {
        badgeClass: "bg-[#a3e635] text-black",
        label: "SNIPPET",
        icon: Code2,
      };
    case "keyword":
    default:
      return {
        badgeClass: "bg-[#c084fc] text-black",
        label: "KEYWORD",
        icon: FileText,
      };
  }
}

export default function NotesGrid({ notes, onOpenModal, onDelete, onViewNote }) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 border-2 border-dashed border-black rounded-2xl bg-white shadow-[3px_3px_0px_#000]">
        <span className="pixel-badge bg-white text-black border border-black mb-2">
          KOSONG
        </span>
        <p className="text-xs font-mono font-bold">Belum ada arsip catatan atau snippet materi.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => {
        const info = getTypeInfo(note.type);
        const Icon = info.icon;

        return (
          <div
            key={note.id}
            onClick={() => onViewNote && onViewNote(note)}
            className="border-2 border-black rounded-xl p-4 bg-white shadow-[3px_3px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_#000] transition-all flex flex-col group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2.5">
              <span className={`pixel-badge ${info.badgeClass}`}>
                <Icon className="w-3 h-3 stroke-[2.5]" />
                {info.label}
              </span>

              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onOpenModal(note)}
                  className="p-1 text-black hover:bg-[#ffe600] rounded border border-transparent hover:border-black cursor-pointer transition-colors"
                  title="Edit catatan"
                >
                  <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(note.id)}
                  className="p-1 text-black hover:bg-[#ff6b6b] rounded border border-transparent hover:border-black cursor-pointer transition-colors"
                  title="Hapus catatan"
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            <h3 className="font-black text-xs uppercase text-black mb-1.5 line-clamp-2">
              {note.title}
            </h3>

            <p className="text-xs font-mono font-bold text-slate-700 whitespace-pre-wrap flex-1 line-clamp-3 leading-relaxed">
              {note.content}
            </p>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-black font-mono text-[10px] text-black font-bold">
              <span>
                {new Date(note.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span className="bg-[#f4f0ea] px-1.5 py-0.5 border border-black rounded text-[9px]">#VAULT</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
