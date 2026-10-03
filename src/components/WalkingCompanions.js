"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";

const COMPANIONS = [
  {
    id: "mochi",
    name: "Mochi",
    role: "Kucing Kantor Senior",
    quotes: [
      "Ngetik mulu, jangan lupa elus kepala gua.",
      "Gua tidur 16 jam sehari aja gak dipecat, santai brow.",
      "Bentar, lagi patroli ngecek ada remah roti gak.",
      "Revisi bab 3 kamu lumayan bikin ngantuk ya.",
    ],
    renderIcon: () => (
      <svg viewBox="0 0 32 32" className="w-7 h-7 text-amber-500 fill-current">
        <path d="M6 10L10 6L14 10H18L22 6L26 10V22C26 25 23 27 20 27H12C9 27 6 25 6 22V10Z" />
        <circle cx="11" cy="15" r="1.5" className="fill-slate-900" />
        <circle cx="21" cy="15" r="1.5" className="fill-slate-900" />
        <path d="M14 18L16 20L18 18" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "chip",
    name: "Chip",
    role: "Bot Pengantar Berkas",
    quotes: [
      "Bip bop. Mendeteksi kadar kopi kamu sudah menipis.",
      "Laporan kamu sedang diproses... pura-pura sibuk berhasil.",
      "Jangan tutup tab ini, nanti sistem overthinking.",
      "Status CPU stabil: 90% nunggu jam pulang.",
    ],
    renderIcon: () => (
      <svg viewBox="0 0 32 32" className="w-7 h-7 text-blue-500 fill-current">
        <rect x="8" y="10" width="16" height="14" rx="3" />
        <circle cx="12" cy="16" r="1.5" className="fill-white" />
        <circle cx="20" cy="16" r="1.5" className="fill-white" />
        <rect x="14" y="5" width="4" height="5" rx="1" className="fill-blue-400" />
        <rect x="12" y="20" width="8" height="2" rx="1" className="fill-slate-900" />
      </svg>
    ),
  },
  {
    id: "pip",
    name: "Pip",
    role: "Bebek Quality Assurance",
    quotes: [
      "Kwek! Error di line 42 bukan salah kamu, salah takdir.",
      "Tenang, mentor juga dulu waktu magang sering bingung.",
      "Sudah minum air putih belum? Ginjal kamu butuh asupan.",
      "Lagi nyari bug atau lagi ngelamunin masa depan?",
    ],
    renderIcon: () => (
      <svg viewBox="0 0 32 32" className="w-7 h-7 text-yellow-400 fill-current">
        <circle cx="14" cy="14" r="8" />
        <path d="M18 14L26 16L18 18Z" className="fill-orange-500" />
        <circle cx="12" cy="12" r="1.5" className="fill-slate-900" />
        <path d="M10 20C10 24 16 26 22 24C24 20 22 18 18 18" />
      </svg>
    ),
  },
];

export default function WalkingCompanions() {
  const [isVisible, setIsVisible] = useState(true);
  const clickIndexRef = useRef({ mochi: 0, chip: 0, pip: 0 });
  const stepCountRef = useRef(0);

  const [companionsState, setCompanionsState] = useState([
    { id: "mochi", x: 15, direction: 1, isWalking: true, activeBubble: null },
    { id: "chip", x: 55, direction: -1, isWalking: true, activeBubble: null },
    { id: "pip", x: 80, direction: 1, isWalking: true, activeBubble: null },
  ]);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      stepCountRef.current += 1;
      const step = stepCountRef.current;

      setCompanionsState((prev) =>
        prev.map((c, idx) => {
          // Pause periodically every 30 steps for 6 steps
          const isPaused = (step + idx * 8) % 36 > 30;
          if (isPaused) {
            return { ...c, isWalking: false };
          }

          const speed = 0.35;
          let nextX = c.x + c.direction * speed;
          let nextDir = c.direction;

          if (nextX > 92) {
            nextX = 92;
            nextDir = -1;
          } else if (nextX < 4) {
            nextX = 4;
            nextDir = 1;
          }

          return { ...c, x: nextX, direction: nextDir, isWalking: true };
        })
      );
    }, 200);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleCompanionClick = (id) => {
    const comp = COMPANIONS.find((c) => c.id === id);
    if (!comp) return;

    const currentIndex = clickIndexRef.current[id] || 0;
    const nextQuote = comp.quotes[currentIndex % comp.quotes.length];
    clickIndexRef.current[id] = currentIndex + 1;

    setCompanionsState((prev) =>
      prev.map((c) => (c.id === id ? { ...c, activeBubble: nextQuote } : c))
    );

    setTimeout(() => {
      setCompanionsState((prev) =>
        prev.map((c) => (c.id === id ? { ...c, activeBubble: null } : c))
      );
    }, 4500);
  };

  return (
    <>
      {/* Toggle Button in bottom right corner */}
      <div className="fixed bottom-20 md:bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 text-slate-600 hover:text-slate-900 shadow-xs text-[11px] font-medium transition-all hover:bg-white cursor-pointer select-none"
          title={isVisible ? "Sembunyikan Teman Kantor" : "Tampilkan Teman Kantor"}
        >
          {isVisible ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
          <span className="hidden sm:inline">{isVisible ? "Mode Fokus" : "Teman Kantor"}</span>
        </button>
      </div>

      {/* Walking Area at Bottom Screen */}
      {isVisible && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 h-16 pointer-events-none z-30 overflow-hidden select-none">
          {companionsState.map((c) => {
            const compData = COMPANIONS.find((item) => item.id === c.id);
            if (!compData) return null;

            return (
              <div
                key={c.id}
                style={{
                  left: `${c.x}%`,
                  transition: "left 0.25s linear",
                }}
                className="absolute bottom-1.5 pointer-events-auto flex flex-col items-center cursor-pointer group"
                onClick={() => handleCompanionClick(c.id)}
              >
                {/* Speech Bubble */}
                {c.activeBubble && (
                  <div className="absolute -top-14 max-w-[200px] w-max bg-white/95 backdrop-blur-md border border-slate-200/90 text-slate-800 text-[11px] font-medium p-2.5 rounded-xl shadow-md leading-tight text-center animate-in fade-in zoom-in-90 duration-200 z-50">
                    <p>{c.activeBubble}</p>
                    <div className="w-2 h-2 bg-white border-r border-b border-slate-200 rotate-45 mx-auto -mb-3.5 mt-1" />
                  </div>
                )}

                {/* Character Sprite Container */}
                <div
                  style={{
                    transform: `scaleX(${c.direction === 1 ? 1 : -1})`,
                  }}
                  className={`p-1 rounded-xl bg-white/80 backdrop-blur-xs border border-slate-200/80 shadow-2xs hover:scale-110 active:scale-95 transition-transform ${
                    c.isWalking ? "animate-walk-bob" : ""
                  }`}
                  title={`${compData.name} (${compData.role}) - Klik untuk berinteraksi`}
                >
                  {compData.renderIcon()}
                </div>

                {/* Name Tag on Hover */}
                <span className="text-[9px] font-semibold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-1 rounded shadow-2xs mt-0.5">
                  {compData.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
