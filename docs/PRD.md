# PRD: UI/UX Next-Gen Overhaul & Voice Identity InternTrack

## 1. Tujuan (Objective)
Mengubah total tampilan antarmuka (UI) InternTrack menjadi antarmuka web modern next-gen berbasis Bento Grid yang bersih, mudah dibaca, dan konsisten. Menghilangkan 100% emoticon/emoji dari seluruh UI dan menggantinya dengan vektor ikon Lucide. Mengubah microcopy dan tone of voice aplikasi menjadi gaya "sarkas tapi menggemaskan" yang mencerminkan perjuangan nyata anak magang.

## 2. Tech Stack & Perintah
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS v4
- **Iconography:** Lucide React (vektor SVG murni)
- **State & Notification:** React State, React Hot Toast
- **Perintah Verifikasi:**
  - Build: `npm run build`
  - Lint: `npm run lint`
  - Dev Server: `npm run dev`

## 3. Lingkup & Kebutuhan Fitur

### 3.1. Zero-Emoticon Policy (Bebas Emoji 100%)
- Hapus semua emoji unicode dari kode frontend dan data gamifikasi (`gamification.js`, `page.js`, `daily-log/page.js`, `report/page.js`, `notes/page.js`).
- Ganti representasi status/ikon dengan Lucide Icon (`Flame`, `Zap`, `Skull`, `ShieldCheck`, `Gift`, `Sparkles`, `Coffee`, `Trophy`, `CheckCircle2`, `Target`, `Clock`, dsb.).
- Ganti avatar emoji maskot/boss dengan SVG vektor stylized avatar atau badge icon.

### 3.2. Nada Suara (Voice & Tone): Sarkas & Menggemaskan
- **Lord Mager & Boss Fight:**
  - Quote: "Buka VS Code cuma buat ditatap, habis itu scroll TikTok. Bangga banget ya?"
  - Quote: "Kerja 10 menit, istirahat 3 jam. Calon CEO masa depan nih."
  - Defeat State: "Lord Mager tumbang! Jangan senang dulu, besok ada Lord Revisi."
- **Streak & Sunday Shield:**
  - Aktif: "Streak aman. Ternyata kamu bisa komitmen juga, kirain cuma wacana."
  - Minggu: "Hari Minggu. Jangan sok produktif buka dokumen, laptopnya tutup sebelum meledak."
  - Putus: "Streak hangus! Selamat, kembali jadi remahan rengginang dari level 0."
- **Daily Quests & Task:**
  - Log Harian: "Isi laporan harian biar mentor percaya kamu gak cuma pura-pura sibuk."
  - Sikat Task: "Kelar satu tugas. Setidaknya ada bukti kamu masuk kantor hari ini."
- **Peti Hadiah (Daily Chest):**
  - "Buka peti dapet bonus EXP. Jangan berharap isinya transferan gaji ya manis."
- **Empty States:**
  - "Belum ada catatan. Otak lagi kosong atau emang mager ngetik?"

### 3.3. Desain Visual Next-Gen & Readability
- **Bento Grid Architecture:** Tampilan modular di Dashboard dengan ritme 4/8dp, rounded-2xl, border subtil `border-zinc-200` (atau dark mode `border-zinc-800`), dan background netral.
- **Glassmorphic Micro-Depth:** Background kartu putih solid/semi-transparan dengan `backdrop-blur-sm`, no tacky drop shadows.
- **Aksesibilitas & Tipografi:**
  - Kontras teks minimal 4.5:1 (WCAG AA).
  - Hirarki font jelas: H1 bold tracking-tight, label uppercase mini ber-tracking wide, body legible.
  - State interaktif: hover halus (150-200ms ease), focus ring keyboard eksplisit.

## 4. Struktur File yang Terdampak
- `src/lib/gamification.js` — Pembersihan data emoji, pengayaan teks sarkas-imut.
- `src/app/globals.css` — Token styling, utilities bento, scrollbar tipis.
- `src/components/Sidebar.js` & `src/components/BottomNav.js` — Navigasi modern next-gen.
- `src/app/page.js` — Redesain dashboard utama (Bento Grid, widget boss, quests, chest modal).
- `src/app/daily-log/page.js` — Redesain daily log & timeline aktivitas, bebas emoji.
- `src/app/report/page.js` — Redesain rekap absensi & generator laporan.
- `src/app/notes/page.js` — Redesain board catatan/kanban.

## 5. Kriteria Sukses
1. Tidak ada satupun emoji unicode di tampilan UI web maupun toast notification.
2. Seluruh teks instruksi, quote, alert, dan empty state memiliki persona sarkas & menggemaskan.
3. Tampilan responsif di layar mobile (375px) hingga desktop (1440px).
4. `npm run build` dan `npm run lint` lulus tanpa error.
