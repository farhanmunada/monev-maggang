"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Sparkles, X, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatYMD } from "@/lib/date";

const SAVAGE_ROASTS = [
  "Buka tab banyak, pura-pura ngetik terminal, tapi logbook masih 0? Mau nilai magang E?",
  "Jam kerja mau kelar, lu mau langsung checkout? Logbook masih sekosong masa depan kalau gak diisi!",
  "Minta uang saku lancar, nulis 3 baris logbook kayak disuruh gali sumur. Isi buruan sebelum mentor murka!",
  "Dosen pembimbing udah siapin spidol merah. Mau bikin alasan 'laptop kebakar' lagi pas sidang magang?",
  "Status: Pura-pura sibuk 100%, Hasil dokumentasi 0%. Jangan bikin malu kampus, isi jurnal sekarang!",
  "Server aja lu rawat tiap hari, masa logbook sendiri lu telantarin sampe mau pulang? Cepet isi!",
  "Karier senior idaman, disiplin nulis logbook kayak bocah. Tinggal klik 'Pabrik AI' apa susahnya, Bos?!",
];

function playSirenAudio() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.15);
    osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
}

export default function SarcasticEmergencyAlert() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [roastMessage, setRoastMessage] = useState("");
  const [hasNotifPermission, setHasNotifPermission] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setHasNotifPermission(Notification.permission === "granted");
    }
  }, []);

  const triggerAlert = useCallback(() => {
    const randomRoast = SAVAGE_ROASTS[Math.floor(Math.random() * SAVAGE_ROASTS.length)];
    setRoastMessage(randomRoast);
    setIsOpen(true);
    playSirenAudio();

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("🚨 LOGBOOK KOSONG WOI! [ROASTING PROTOCOL]", {
          body: randomRoast,
          icon: "/icon.png",
          tag: "monev-daily-roast",
        });
      } catch {}
    }
  }, []);

  const checkAlarmCondition = useCallback(async () => {
    const now = new Date();
    const day = now.getDay();
    if (day === 0) return; // Minggu libur

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTotalMin = hours * 60 + minutes;

    // Shift check:
    // Sabtu: 07:00 - 12:00. Peringatan mulai 11:00 (660 min) s/d 14:00 (840 min)
    // Senin-Jum: 07:00 - 14:00. Peringatan mulai 12:30 (750 min) s/d 16:00 (960 min)
    const isSaturday = day === 6;
    const startAlarmMin = isSaturday ? 11 * 60 : 12 * 60 + 30;
    const endAlarmMin = isSaturday ? 14 * 60 : 16 * 60;

    const isAlarmTime = currentTotalMin >= startAlarmMin && currentTotalMin <= endAlarmMin;
    if (!isAlarmTime) return;

    // Cek apakah baru saja di-snooze
    const snoozeUntil = sessionStorage.getItem("monev_roast_snooze_until");
    if (snoozeUntil && Date.now() < Number(snoozeUntil)) {
      return;
    }

    try {
      const todayStr = formatYMD();
      const { data: log } = await supabase
        .from("daily_logs")
        .select("id, attendance, activities(id)")
        .eq("date", todayStr)
        .maybeSingle();

      const actsCount = log?.activities?.length || 0;
      const isAttended = log?.attendance === "Hadir" ? actsCount > 0 : Boolean(log?.attendance);

      if (!isAttended) {
        triggerAlert();
      }
    } catch (err) {
      console.error("Gagal memeriksa alarm darurat:", err);
    }
  }, [triggerAlert]);

  useEffect(() => {
    const handleManual = () => triggerAlert();
    window.addEventListener("trigger-sarcastic-roast", handleManual);
    return () => window.removeEventListener("trigger-sarcastic-roast", handleManual);
  }, [triggerAlert]);

  useEffect(() => {
    if (pathname === "/daily-log") {
      setIsOpen(false);
      return;
    }

    checkAlarmCondition();
    const interval = setInterval(checkAlarmCondition, 60000);
    return () => clearInterval(interval);
  }, [pathname, checkAlarmCondition]);

  const handleSnooze = () => {
    const snoozeTime = Date.now() + 20 * 60 * 1000;
    sessionStorage.setItem("monev_roast_snooze_until", String(snoozeTime));
    setIsOpen(false);
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const res = await Notification.requestPermission();
    if (res === "granted") {
      setHasNotifPermission(true);
      new Notification("Sistem Notifikasi Desktop Aktif!", {
        body: "Kamu akan mendapatkan roasting pedas di Windows jika jam pulang tiba tapi logbook kosong.",
        icon: "/icon.png",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border-[3.5px] border-black rounded-2xl shadow-[10px_10px_0px_0px_#000] overflow-hidden animate-brutal-pop">
        {/* Hazard Warning Bar */}
        <div className="bg-[#ef4444] text-white px-4 py-2 border-b-[3px] border-black flex items-center justify-between font-mono font-black text-xs uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>CRITICAL ALERT: EMERGENCY ROASTING</span>
          </div>
          <button
            onClick={handleSnooze}
            className="hover:bg-black p-1 rounded border border-white text-white transition-colors cursor-pointer"
            title="Tutup (Snooze 20 Menit)"
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 md:p-6 space-y-4 bg-[#fff1f2]">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#ef4444] text-white border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_#000] shrink-0">
              <AlertTriangle className="w-8 h-8 stroke-[2.5] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="pixel-badge bg-black text-[#facc15] font-black text-[10px]">
                  DEADLINE MENDEKATI
                </span>
                <span className="pixel-badge bg-white text-black font-black text-[10px]">
                  LOGBOOK: 0 AKTIVITAS
                </span>
              </div>
              <h3 className="text-base md:text-lg font-black uppercase text-black leading-tight">
                Jam Pulang Mau Tiba, Tapi Logbook Lu Masih Melompong!
              </h3>
            </div>
          </div>

          {/* Sarcastic Message Box */}
          <div className="bg-white border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_#000] relative">
            <div className="text-[10px] font-mono font-black text-[#ef4444] uppercase mb-1 flex items-center gap-1.5">
              <span>[PESAN SARKAS DARI SISTEM]</span>
            </div>
            <p className="text-sm font-black text-black leading-relaxed italic">
              &ldquo;{roastMessage}&rdquo;
            </p>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <Link
              href="/daily-log"
              onClick={() => setIsOpen(false)}
              className="brutal-btn bg-[#a3e635] hover:bg-[#8ee01a] text-black text-xs py-3 px-4 rounded-xl font-black flex items-center justify-center gap-2 border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>ISI SEKARANG DI PABRIK AI</span>
            </Link>

            <button
              type="button"
              onClick={handleSnooze}
              className="brutal-btn bg-white hover:bg-slate-100 text-black text-xs py-3 px-4 rounded-xl font-black flex items-center justify-center gap-2 border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer"
            >
              <span>NANTI DULU, SNOOZE 20 MENIT</span>
            </button>
          </div>

          {/* Notification Permission Toggle */}
          <div className="border-t-2 border-black/20 pt-3 flex items-center justify-between text-[11px] font-mono text-slate-700">
            <span>Notifikasi Desktop (Windows Toast):</span>
            {hasNotifPermission ? (
              <span className="pixel-badge bg-[#a3e635] text-black font-black">AKTIF (WINDOWS)</span>
            ) : (
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="pixel-badge bg-black text-white hover:bg-[#8b5cf6] cursor-pointer"
              >
                Aktifkan Alarm Windows
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
