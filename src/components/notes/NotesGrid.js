import { Edit2, Trash2 } from "lucide-react";

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

export default function NotesGrid({ notes, onOpenModal, onDelete }) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-14 text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl">
        <p className="text-xs">
          Belum ada catatan materi atau referensi. Catat ide atau instruksi penting di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col group"
        >
          <div className="flex justify-between items-start mb-2.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getTypeBadgeClass(
                note.type
              )}`}
            >
              {note.type}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onOpenModal(note)}
                className="text-slate-400 hover:text-slate-900 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                title="Edit catatan"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(note.id)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                title="Hapus catatan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <h3 className="font-semibold text-sm text-slate-900 mb-1.5 line-clamp-2">{note.title}</h3>
          <p className="text-xs text-slate-500 whitespace-pre-wrap flex-1 line-clamp-4 leading-relaxed font-sans">
            {note.content}
          </p>
          <p className="text-[10px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100 font-mono">
            {new Date(note.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      ))}
    </div>
  );
}
