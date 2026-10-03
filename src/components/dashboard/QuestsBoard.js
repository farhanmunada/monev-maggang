import {
  Compass,
  CheckCircle2,
  Check,
  Sparkles,
  FileText,
  Zap,
  Brain,
  CheckSquare,
  Flame,
  Target,
} from "lucide-react";

function QuestIcon({ name, className = "w-4 h-4 text-slate-700" }) {
  switch (name) {
    case "FileText":
      return <FileText className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "Brain":
      return <Brain className={className} />;
    case "CheckSquare":
      return <CheckSquare className={className} />;
    case "Flame":
      return <Flame className={className} />;
    default:
      return <Target className={className} />;
  }
}

export default function QuestsBoard({ quests, onClaimQuest }) {
  const claimedCount = quests.filter((q) => q.isClaimed).length;

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6 flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" /> Papan Misi Harian
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selesaikan tugas dan klaim reward EXP langsung ke profilmu.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
            <span>
              {claimedCount} / {quests.length} Misi
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                quest.isClaimed
                  ? "bg-slate-50/70 border-slate-200/60 opacity-60"
                  : quest.isCompleted
                  ? "bg-emerald-50/50 border-emerald-200 shadow-2xs"
                  : "bg-white border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="p-2 bg-slate-100/80 rounded-xl border border-slate-200/60 flex-shrink-0">
                  <QuestIcon name={quest.icon} />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-xs md:text-sm text-slate-900">{quest.title}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        quest.type === "daily" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {quest.type === "daily" ? "Harian" : "Mingguan"}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/70 px-1.5 py-0.5 rounded font-mono">
                      +{quest.rewardExp} EXP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{quest.desc}</p>

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                    <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          quest.isCompleted ? "bg-emerald-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-slate-600 font-medium">
                      {quest.current} / {quest.target}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:self-center flex-shrink-0">
                {quest.isClaimed ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                    <Check className="w-3.5 h-3.5" /> Diklaim
                  </span>
                ) : quest.isCompleted ? (
                  <button
                    type="button"
                    onClick={() => onClaimQuest(quest)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 px-3.5 py-1.5 rounded-lg font-semibold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Klaim +{quest.rewardExp} EXP
                  </button>
                ) : (
                  <span className="inline-block text-center w-full sm:w-auto text-[11px] font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
                    Belum Selesai
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
