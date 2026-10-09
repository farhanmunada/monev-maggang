"use client";

import { Edit2, Trash2, FileText, Code2, Users2, BookOpen } from "lucide-react";

function getTypeInfo(type) {
  switch (type) {
    case "materi":
      return {
        badgeClass: "text-teal-700 bg-teal-50/90 border-teal-300",
        label: "MATERI",
        icon: BookOpen,
      };
    case "meeting":
      return {
        badgeClass: "text-amber-700 bg-amber-50/90 border-amber-300",
        label: "MEETING",
        icon: Users2,
      };
    case "snippet":
      return {
        badgeClass: "text-blue-700 bg-blue-50/90 border-blue-300",
        label: "SNIPPET",
        icon: Code2,
      };
    case "keyword":
    default:
      return {
        badgeClass: "text-purple-700 bg-purple-50/90 border-purple-300",
        label: "KEYWORD",
        icon: FileText,
      };
  }
}

export default function NotesGrid({ notes, onOpenModal, onDelete, onViewNote }) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 glass-panel rounded-3xl border border-dashed border-white/80">
        <span className="pixel-badge text-slate-400 bg-white/50 border-slate-200 mb-2">
          KOSONG
        </span>
        <p className="text-xs">Belum ada arsip catatan atau snippet materi.</p>
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
            className="glass-panel rounded-2xl p-4 hover:shadow-xs transition-all flex flex-col group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2.5">
              <span className={`pixel-badge ${info.badgeClass}`}>
                <Icon className="w-2.5 h-2.5" />
                {info.label}
              </span>

              <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onOpenModal(note)}
                  className="text-slate-400 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Edit catatan"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(note.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Hapus catatan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-xs text-slate-900 mb-1.5 line-clamp-2">
              {note.title}
            </h3>

            <p className="text-xs text-slate-600 whitespace-pre-wrap flex-1 line-clamp-3 leading-relaxed font-sans">
              {note.content}
            </p>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/80 font-mono text-[9px] text-slate-400">
              <span>
                {new Date(note.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span className="text-slate-300">#vault</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
