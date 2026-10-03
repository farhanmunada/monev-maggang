import { X } from "lucide-react";

export default function NoteModal({ isOpen, onClose, formData, onChange, onSubmit, isSubmitting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900">
            {formData.id ? "Edit Catatan" : "Tambah Catatan Baru"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kategori Catatan
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
              {["keyword", "materi", "meeting", "task"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange("type", type)}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status Pengerjaan
              </label>
              <select
                value={formData.status}
                onChange={(e) => onChange("status", e.target.value)}
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
              onChange={(e) => onChange("title", e.target.value)}
              placeholder={
                formData.type === "task"
                  ? "Misal: Perbaiki responsive layout mobile..."
                  : "Misal: Rangkuman arsitektur database..."
              }
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder-slate-400"
            />
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Isi Deskripsi</label>
            <textarea
              value={formData.content}
              onChange={(e) => onChange("content", e.target.value)}
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
  );
}
