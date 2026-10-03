# Dokumen Riset: UI/UX Next-Gen Overhaul & Voice Overhaul InternTrack

## 1. Analisis Codebase Eksisting
- **Framework & Core Stack:**
  - Next.js 16.3.5 (App Router, Turbopack support)
  - React 19.2.8 & React DOM 19.2.8
  - Tailwind CSS v4 (`@tailwindcss/postcss: ^4`, `@theme inline` di `src/app/globals.css`)
  - Ikon: `lucide-react` (1.47.0)
  - Notifikasi: `react-hot-toast` (2.6.1)
  - Backend/DB: `@supabase/supabase-js` (2.116.0)

- **Masalah Utama UI/UX Saat Ini:**
  1. **Polusi Emoticon/Emoji Mentah:**
     - Ditemukan lebih dari 40 kemunculan karakter emoji unicode (`🏖️`, `📝`, `⚡`, `🧠`, `🎯`, `🔥`, `💀`, `👾`, `📦`, `🎁`, `🔒`, `🎉`) yang di-hardcode ke string database, toast notifikasi, teks antarmuka, dan badge status.
     - Emoji menyebabkan tampilan tidak konsisten antar OS (Windows vs macOS vs Android/iOS) dan melanggar prinsip desain sistem modern.
  2. **Microcopy / UX Writing Generic & Kaku:**
     - Copywriting bawaan masih bernuansa standar tutorial/template ("Tingkatkan streak!", "Task selesai!").
     - Belum menerapkan karakter suara produk: sarkas tapi menggemaskan (witty, cute, deadpan humor khas kehidupan magang).
  3. **Visual Hierarchy & Densitas:**
     - Kartu dashboard belum mengadopsi struktur Bento Grid yang seimbang.
     - Kontras border dan efek visual terlalu datar, aksen tombol belum memiliki transisi mikro yang presisi (150-200ms).

## 2. Riset Desain Sistem & Rekomendasi `ui-ux-pro-max`
- **Aesthetic:** Modern Tech Bento Grid (Clean Flat Surface + Micro-Depth).
- **Aturan Bebas Emoji:**
  - Standar `ui-ux-pro-max`: "No Emoji as Structural Icons. Use vector-based icons (Lucide / SVG)."
  - Seluruh indikator visual diubah ke komponen Lucide React dengan stroke width konsisten (1.5px atau 2px).
- **Palet Warna Semantic (Dark/Light Neutral with Teal/Cyan High-Tech Accent):**
  - Background: Neutral zinc-50 / zinc-900 surface
  - Card & Surfaces: White / zinc-900 border zinc-200 / zinc-800
  - Primary / Action: Indigo-600 / Teal-600
  - Micro-accents: Rose (Lord Mager), Amber (Streak/XP), Emerald (Selesai/Hadir)
- **Voice & Tone:**
  - Sarkas: Menyinggung kebiasaan prokrastinasi, realita magang, revisi tiada henti, dan overthinking tugas.
  - Menggemaskan: Menggunakan panggilan akrab, istilah jenaka yang playful, tidak merendahkan secara kasar namun menggelitik.

## 3. Kompatibilitas Kode
- Tailwind v4 kompatibel penuh dengan kelas utilitas inline tanpa perlu file `tailwind.config.js` usang.
- Menggunakan ikon SVG bawaan `lucide-react` yang sudah terpasang. Tidak memerlukan penambahan dependensi baru.
