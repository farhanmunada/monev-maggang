import { Bot, Sparkles, Copy, Check } from "lucide-react";

export default function AiReportPanel({
  logs,
  selectedDate,
  onSelectDate,
  onGenerate,
  isAiLoading,
  isGenerated,
  aiReport,
  copiedKey,
  onCopy,
}) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-7 shadow-xs space-y-6">
      <div className="flex flex-col items-center text-center max-w-xl mx-auto">
        <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-3 shadow-xs">
          <Bot className="w-6 h-6" />
        </div>
        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-1">Generator Narasi Laporan</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Ubah catatan harian acak menjadi narasi laporan resmi yang terstruktur, rapi, dan siap dilaporkan ke pembimbing lapangan.
        </p>

        <div className="mt-4 flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
          <span className="text-slate-500 font-medium">Pilih Tanggal:</span>
          <select
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
            className="bg-transparent font-semibold text-slate-900 focus:outline-none text-xs cursor-pointer font-mono"
          >
            {logs.map((log) => (
              <option key={log.id} value={log.date}>
                {log.date} ({log.attendance})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isAiLoading || logs.length === 0}
          className="mt-5 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white w-full md:w-auto px-6 py-2.5 rounded-xl shadow-xs transition-all font-semibold text-xs disabled:opacity-60 cursor-pointer"
        >
          {isAiLoading ? (
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> Menyusun Narasi...
            </span>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Generate Narasi Laporan
            </>
          )}
        </button>
      </div>

      {isGenerated && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Hasil Rangkuman Laporan
            </h3>
            <span className="text-[11px] text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 font-mono font-medium">
              {selectedDate}
            </span>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  Uraian Kegiatan
                </p>
                <button
                  type="button"
                  onClick={() => onCopy(aiReport.expandedActivities, "act")}
                  className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
                >
                  {copiedKey === "act" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === "act" ? "Tersalin" : "Salin"}</span>
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {aiReport.expandedActivities}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  Refleksi Pembelajaran
                </p>
                <button
                  type="button"
                  onClick={() => onCopy(aiReport.expandedLearning, "learn")}
                  className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
                >
                  {copiedKey === "learn" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === "learn" ? "Tersalin" : "Salin"}</span>
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {aiReport.expandedLearning}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  Kendala & Solusi
                </p>
                <button
                  type="button"
                  onClick={() => onCopy(aiReport.expandedObstacle, "obs")}
                  className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
                >
                  {copiedKey === "obs" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === "obs" ? "Tersalin" : "Salin"}</span>
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {aiReport.expandedObstacle}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
