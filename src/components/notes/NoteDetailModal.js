"use client";

import { useState } from "react";
import { X, Copy, Check, Edit2, Calendar } from "lucide-react";

function getTypeBadgeClass(type) {
  switch (type) {
    case "materi":
      return "bg-teal-50 text-teal-700 border-teal-200";
    case "meeting":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "snippet":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "keyword":
    default:
      return "bg-purple-50 text-purple-700 border-purple-200";
  }
}

export default function NoteDetailModal({ note, onClose, onEdit }) {
  const [copied, setCopied] = useState(false);

  if (!note) return null;

  const handleCopy = async () => {
    if (!note.content) return;
    try {
      await navigator.clipboard.writeText(note.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin:", err);
    }
  };

  const formattedDate = note.created_at
    ? new Date(note.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-2xl shadow-xl flex flex-col max-h-[85vh] border border-slate-200/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getTypeBadgeClass(
                note.type
              )}`}
            >
              {note.type}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="Salin isi catatan"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] text-emerald-600 font-medium">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Salin</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onEdit(note)}
              className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="Edit catatan"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="text-[11px]">Edit</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          <h2 className="text-base font-bold text-slate-900 leading-snug">{note.title}</h2>

          <div
            className={`text-xs text-slate-700 whitespace-pre-wrap leading-relaxed p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl ${
              note.type === "snippet" ? "font-mono" : "font-sans"
            }`}
          >
            {note.content || <span className="text-slate-400 italic">Tidak ada isi catatan.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
