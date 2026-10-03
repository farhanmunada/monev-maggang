# PRD: Next-Gen Bento Architecture & Ambient Experience InternTrack

## 1. Tujuan (Objective)
Merombak total antarmuka InternTrack menjadi pengalaman web modern Next-Gen yang lapang, elegan, dan minim friksi:
- Menghapus sidebar vertikal dan menggantikannya dengan Floating Glass Island (Top Dock).
- Memisahkan rute kerja menjadi independen: `/attendance` (Absensi) terpisah dari `/ai-report` (AI Studio), dan `/tasks` (Kanban) terpisah dari `/notes` (Knowledge Vault).
- Mengeliminasi 100% sistem gamifikasi RPG (Boss HP, Chest, EXP, Level) dan menggantikannya dengan metrik produktivitas nyata.
- Menghadirkan karakter ambient ("Walking Companions") yang berjalan santai di bagian bawah layar secara natural.
- Menghilangkan seluruh dekorasi hitam pekat (`bg-slate-950`/`bg-slate-900`) di seluruh halaman, beralih ke palet *Warm Porcelain & Soft Slate*.

## 2. Struktur Rute Aplikasi
1. `/` — Bento Command Center (Status jurnal hari ini, telemetry kerja, feed aktivitas terbaru, task penting).
2. `/daily-log` — Editor Jurnal Harian (Timeline aktivitas terstruktur per jam & refleksi AI).
3. `/attendance` — Rekapitulasi Absensi (Kalender kehadiran bulanan, filter status, rasio hadir).
4. `/ai-report` — AI Report Studio (Penyusun narasi formal laporan magang dengan export/copy 1-klik).
5. `/tasks` — Task Kanban Board (Papan kerja To Do, In Progress, Done).
6. `/notes` — Knowledge Vault (Arsip materi belajar, catatan meeting, dan keyword).
7. `/report` — Redirect otomatis ke `/attendance`.

## 3. Desain Visual & UI/UX Next-Gen
- **Latar & Surface:** Kanvas terang `#F8FAFC`, card `#FFFFFF` dengan micro-border halus dan soft shadow. Zero black cards.
- **Top Navigation:** Floating Island Bar di tengah atas (`backdrop-blur-xl bg-white/85 border border-slate-200/90 shadow-sm rounded-full`).
- **Walking Companions:** Karakter ambient minimalis di dasar layar (`fixed bottom-0 pointer-events-none z-30`), dengan hitbox interaktif untuk dialog lucu dan toggle on/off.
- **Zero Emoji:** 100% ikon memakai Lucide React SVG.
- **Tone of Voice:** Sarkas cerdas dan menggemaskan ("sarkas dan menggemaskan") tanpa unsur reward game.

## 4. Kriteria Sukses
1. Seluruh 6 rute berfungsi lancar dengan URL tersendiri.
2. Tidak ada kartu/container dekoratif berwarna hitam pekat di seluruh aplikasi.
3. Karakter ambient berjalan natural tanpa mengganggu form input dan tombol.
4. Lulus `npm run lint` dan `npm run build` tanpa error.
