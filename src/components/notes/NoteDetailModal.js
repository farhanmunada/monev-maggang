"use client";

import { useState } from "react";
import { X, Copy, Check, Edit2, Calendar } from "lucide-react";

function getTypeBadgeClass(type) {
  switch (type) {
    case "materi":
      return "bg-[#00f0ff] text-black";
    case "meeting":
      return "bg-[#ffe600] text-black";
    case "snippet":
      return "bg-[#a3e635] text-black";
    case "keyword":
    default:
      return "bg-[#c084fc] text-black";
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
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#fffdf8] w-full max-w-xl rounded-2xl shadow-[8px_8px_0px_0px_#000] flex flex-col max-h-[85vh] border-[3px] border-black animate-brutal-pop overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b-2 border-black flex items-center justify-between gap-3 bg-[#ffe600]">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`pixel-badge ${getTypeBadgeClass(
                note.type
              )}`}
            >
              {note.type}
            </span>
            <span className="text-[11px] text-black font-black flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopy}
              className="bg-white hover:bg-slate-100 text-black border-2 border-black px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              title="Salin isi catatan"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Salin</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onEdit(note)}
              className="bg-white hover:bg-slate-100 text-black border-2 border-black px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              title="Edit catatan"
            >
              <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-black hover:bg-black hover:text-white p-1 rounded-lg border-2 border-black cursor-pointer shadow-[1.5px_1.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ml-1"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <h2 className="text-base md:text-lg font-black uppercase text-black leading-snug">{note.title}</h2>

          <div
            className={`text-xs text-black font-bold whitespace-pre-wrap leading-relaxed p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#000] rounded-xl ${
              note.type === "snippet" ? "font-mono bg-[#fdfbf7]" : "font-sans"
            }`}
          >
            {note.content || <span className="text-slate-400 italic">Tidak ada isi catatan.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
