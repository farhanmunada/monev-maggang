import { X } from "lucide-react";

export default function NoteModal({ isOpen, onClose, formData, onChange, onSubmit, isSubmitting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[#fffdf8] w-full max-w-lg rounded-2xl shadow-[8px_8px_0px_0px_#000] flex flex-col max-h-[90vh] border-[3px] border-black animate-brutal-pop overflow-hidden">
        <div className="p-4 border-b-2 border-black flex justify-between items-center bg-[#ffe600]">
          <h2 className="text-sm font-black uppercase text-black">
            {formData.id ? "Edit Catatan" : "Tambah Catatan Baru"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-black hover:bg-black hover:text-white p-1 rounded-lg border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1.5 font-mono">
              Kategori Catatan
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {["keyword", "materi", "meeting", "snippet"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange("type", type)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer ${
                    formData.type === type
                      ? "bg-[#ffe600] text-black shadow-[2px_2px_0px_#000] -translate-y-0.5"
                      : "bg-white text-black hover:bg-slate-100"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-black mb-1.5 font-mono">Judul Catatan</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => onChange("title", e.target.value)}
              placeholder="Misal: Rangkuman arsitektur database, snippet fungsi auth..."
              className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#fbf7ee]"
            />
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-black uppercase text-black mb-1.5 font-mono">Isi Catatan</label>
            <textarea
              value={formData.content}
              onChange={(e) => onChange("content", e.target.value)}
              placeholder="Tuliskan rincian, instruksi, rumus, atau link referensi di sini..."
              rows={6}
              className="w-full flex-1 bg-white border-2 border-black rounded-lg px-3 py-2 text-xs font-mono font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#fbf7ee] resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-[#a3e635] text-black font-black uppercase tracking-wider text-xs border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-70 mt-1 cursor-pointer"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Catatan"}
          </button>
        </form>
      </div>
    </div>
  );
}
