# Arsitektur: Next-Gen Bento & Ambient Layout

## 1. Desain Struktur File
```
src/
├── app/
│   ├── layout.js                 <-- Root layout: Navbar Floating Island + WalkingCompanions + Container
│   ├── globals.css               <-- Palet Warm Slate & animasi walking companions
│   ├── page.js                   <-- Next-Gen Bento Dashboard (anti-black)
│   ├── daily-log/page.js         <-- Jurnal Harian (Warm Porcelain)
│   ├── attendance/page.js        <-- Dedicated Absensi & Kehadiran
│   ├── ai-report/page.js         <-- Dedicated AI Report Studio
│   ├── tasks/page.js             <-- Dedicated Kanban Board
│   ├── notes/page.js             <-- Dedicated Knowledge Vault
│   └── report/page.js            <-- Redirector ke /attendance
├── components/
│   ├── Navbar.js                 <-- Floating Island Topbar (menggantikan Sidebar)
│   ├── BottomNav.js              <-- Mobile Floating Dock
│   ├── WalkingCompanions.js      <-- Karakter ambient berjalan di dasar layar
│   ├── dashboard/
│   │   ├── BentoGreeting.js      <-- Status hari ini & CTA jurnal
│   │   ├── MetricTiles.js        <-- Metrik kerja (Kehadiran, Aktivitas, Task)
│   │   ├── ActivityFeed.js       <-- Feed aktivitas terkini
│   │   └── PriorityTasks.js      <-- Task prioritas teratas
│   ├── daily-log/
│   │   ├── LogHeader.js
│   │   ├── ActivityList.js
│   │   ├── ActivityForm.js
│   │   └── ReflectionSection.js
│   ├── attendance/
│   │   ├── AttendanceCalendar.js <-- Kalender/matriks kehadiran
│   │   ├── AttendanceStats.js
│   │   └── AttendanceHistory.js
│   ├── ai-report/
│   │   └── ReportStudio.js       <-- Editor & generator narasi formal
│   ├── tasks/
│   │   └── KanbanBoard.js
│   └── notes/
│       ├── NotesGrid.js
│       └── NoteModal.js
└── lib/
    ├── supabase.js
    ├── date.js
    └── telemetry.js              <-- Metrik kerja nyata (tanpa game/HP/EXP)
```

## 2. Tahapan Pengerjaan Bertahap (Execution Slices)

- **Slice 1: Navigation & Layout Overhaul**
  - Buat `src/components/Navbar.js` (Floating Island Topbar).
  - Update `src/components/BottomNav.js` untuk mobile.
  - Hapus referensi `Sidebar.js` di `src/app/layout.js`, ubah padding konten untuk top-floating nav.
  - Tambahkan animasi ambient keyframes di `src/app/globals.css`.

- **Slice 2: Ambient Walking Companions**
  - Buat `src/components/WalkingCompanions.js` (karakter berjalan di footer layar dengan interaksi dialog lucu dan toggle on/off).

- **Slice 3: Pemisahan Rute Absensi & AI Report**
  - Buat `src/app/attendance/page.js`.
  - Buat `src/app/ai-report/page.js`.
  - Pasang redirect di `src/app/report/page.js`.

- **Slice 4: Pemisahan Rute Tasks & Notes**
  - Buat `src/app/tasks/page.js` (Kanban murni).
  - Perbarui `src/app/notes/page.js` (Knowledge vault murni).

- **Slice 5: Pembersihan Gamifikasi & Rombak Bento Dashboard**
  - Buat `src/lib/telemetry.js` menggantikan logika gamifikasi lama.
  - Rombak `src/app/page.js` menjadi Next-Gen Bento Dashboard (100% Warm Porcelain, zero dark cards).
  - Rombak `src/app/daily-log/page.js` agar seragam dengan warna terang/warm.

- **Slice 6: Verifikasi Kualitas & Build**
  - `npm run lint`
  - `npm run build`
  - Commit atomik.
