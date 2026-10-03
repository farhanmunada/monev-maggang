# Arsitektur: UI/UX Next-Gen Overhaul & Voice Identity

## 1. Ringkasan Desain Arsitektur
Pembaruan menyeluruh berfokus pada 3 pilar:
1. **Zero-Emoji Pure SVG Iconography:** Seluruh representasi status dan visual menggunakan Lucide React dengan stroke width seragam (1.5px/2px), ukuran terstandarisasi (`w-4 h-4`, `w-5 h-5`), dan wrapper badge ber-radius tinggi (`rounded-xl` / `rounded-full`).
2. **Bento Grid & Glass Surface Design System:** Memanfaatkan Tailwind v4 tokens untuk menciptakan layout modular bento grid, border semi-transparan `border-zinc-200/80` (light) / `border-zinc-800/80` (dark), shadow micro-depth `shadow-xs` / `shadow-sm`, dan background surface bersih.
3. **Microcopy Engine (Sarkas & Menggemaskan):** Standardisasi seluruh string pesan, dialog, toast, dan quotes ke dalam tone of voice yang konsisten.

---

## 2. Pemetaan Komponen & Data

### A. Data Engine (`src/lib/gamification.js`)
- Mengganti kembalian `icon: "📝"` menjadi string identifier standar ikon Lucide (`"FileEdit"`, `"Zap"`, `"Brain"`, `"Target"`, `"Flame"`, `"Coffee"`, `"ShieldCheck"`, `"Gift"`, `"Skull"`).
- Memperbarui kumpulan pesan streak, quote Lord Mager, quote maskot, dan deskripsi Weekly Wrapped dengan gaya sarkas-menggemaskan tanpa satupun karakter emoji.

### B. Theme & Foundation (`src/app/globals.css` & `src/app/layout.js`)
- Deklarasi token visual baru:
  - Surface cards: latar `bg-white/80 backdrop-blur-md`
  - Subtle borders: `border-slate-200/70`
  - Typography: Plus Jakarta Sans / Inter font rendering tajam dengan anti-aliasing
- Perbaikan layout container untuk memastikan konsistensi padding dan respon layar.

### C. Navigasi (`src/components/Sidebar.js`, `src/components/BottomNav.js`)
- Navigasi desktop dan mobile yang seragam, clean, dengan indikator aktif berupa pill halus dan efek transisi halus.
- Brand logo header diperbarui tanpa elemen visual distraksi.

### D. Dashboard Bento Grid (`src/app/page.js`)
- **Header:** Sambutan sarkas berdasarkan streak dan level, EXP bar presisi.
- **Bento Row 1:**
  - Card 1: Boss Battle (Lord Mager HP Bar, animated slash on hit, visual SVG badge, quote sarkas acak).
  - Card 2: Mystery Chest (Peti Harian interaktif dengan animasi icon box/gift, modal reward elegan).
  - Card 3: Quick Stats (Streak counter dengan perisai libur Minggu, total log, task beres).
- **Bento Row 2:**
  - Card 4: Daily Quests (Misi harian interaktif, tombol klaim reward EXP).
  - Card 5: Task Board Ringkas (Daftar to-do aktif dengan aksi cepat).
- **Bento Row 3:**
  - Card 6: Log Aktivitas Terbaru & Heatmap konsistensi.

### E. Halaman Jurnal Harian (`src/app/daily-log/page.js`)
- Form pengisian log beraksen rapi dengan input field responsif, feedback status kehadiran bersih (Hadir/Izin/Sakit/WFA).
- Timeline list aktivitas harian berdesain modern, card expandable, aksi edit/hapus intuitif.
- Generator AI saran kegiatan dengan microcopy cerdas dan toast sarkas.

### F. Halaman Rekap & Catatan (`src/app/report/page.js`, `src/app/notes/page.js`)
- Rekap absensi dengan filter tab modern, status pill tanpa emoji.
- Generator laporan AI dengan layout dual-panel bersih, tombol copy dengan animasi check SVG.
- Board catatan dengan filter kategori badge modern dan modal input efisien.

---

## 3. Rencana Eksekusi Bertahap (Incremental Slices)

```
[Tahap 1: Core Engine & Token]
  - src/lib/gamification.js (Zero emoji, tone data)
  - src/app/globals.css (Tokens & Bento styling)
          │
          ▼
[Tahap 2: Navigasi & Frame]
  - src/components/Sidebar.js
  - src/components/BottomNav.js
  - src/app/layout.js
          │
          ▼
[Tahap 3: Bento Dashboard]
  - src/app/page.js (Bento layout, boss fight, quests, chest modal)
          │
          ▼
[Tahap 4: Daily Log Page]
  - src/app/daily-log/page.js (Form, activities timeline, AI suggestions)
          │
          ▼
[Tahap 5: Report & Notes Pages]
  - src/app/report/page.js
  - src/app/notes/page.js
          │
          ▼
[Tahap 6: Verifikasi & Audit Kualitas]
  - npm run lint
  - npm run build
  - Audit zero-emoji via regex check
```

---

## 4. Mitigasi Risiko
- **Hydration Mismatch:** Hindari perbedaan state render acak antara server dan client pada quote sarkas dengan memanfaatkan `useEffect` untuk state acak.
- **Backward Compatibility Data:** Identifier ikon di `gamification.js` di-render dinamis menggunakan mapper komponen Lucide; tidak memutus fungsi claim quest atau EXP.
