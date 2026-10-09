# Arsitektur: Standar Top Navbar Glassmorphic & Ekosistem Glass UI

## 1. Rencana Pemecahan File (File Impact Breakdown)
Perubahan ini melibatkan pembaruan terkoordinasi pada file-file berikut:
1. `src/components/Navbar.js`: Mengubah layout dari floating pill overlay menjadi standard edge-to-edge sticky topbar dengan scroll listener dinamis (`scrolled` state).
2. `src/app/layout.js`: Mengatur ulang padding `<main>` agar mengalir rapi di bawah sticky navbar (`pt-5 pb-20`).
3. `src/components/BottomNav.js`: Meningkatkan efek glassmorphism mobile dock (`backdrop-blur-xl bg-white/80 border border-slate-200/70 shadow-lg`).
4. `src/app/attendance/page.js`: Menerapkan glassmorphism pada panel statistik bulanan (`bg-white/75 backdrop-blur-md border border-slate-200/80 shadow-xs`) dan kontrol kalender.
5. `src/app/page.js`: Memberikan sentuhan glassmorphic pada kartu Bento Greeting & Metric Summary.

## 2. Rincian Desain Arsitektur Per Komponen

### A. `src/components/Navbar.js`
- **Container:**
  ```jsx
  <header className={`sticky top-0 left-0 right-0 z-40 w-full transition-all duration-300 ${
    isScrolled
      ? "bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-2xs py-2.5"
      : "bg-transparent border-b border-transparent py-4"
  }`}>
  ```
- **Inner Layout:**
  - Container pembatas: `max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between`
  - Sisi Kiri: Logo InternTrack + Brand Label + Badge Status Hari Ini
  - Sisi Kanan: Menu link navigasi dengan pills aktif (`bg-slate-900 text-white` jika aktif, `text-slate-600 hover:text-slate-900 hover:bg-slate-100/70` jika inaktif).
- **Logika Scroll:**
  - React hook `useEffect` dengan event listener `window.addEventListener("scroll", handler, { passive: true })`.
  - Ambang batas scroll: `window.scrollY > 15`.

### B. `src/app/layout.js`
- Hapus class fixed pembatas navbar jika ada.
- Sesuaikan container `<main>`:
  `<main className="relative z-10 pt-4 md:pt-6 px-4 md:px-8 max-w-6xl mx-auto">`

### C. `src/components/BottomNav.js` (Mobile)
- Format: `fixed bottom-3 left-4 right-4 z-40 md:hidden`
- Styling: `backdrop-blur-xl bg-white/85 border border-slate-200/80 shadow-lg shadow-slate-300/30 rounded-2xl`

### D. `src/app/attendance/page.js` & `src/app/page.js`
- Update kartu-kartu statistik utama agar menggunakan perpaduan glassmorphism lembut:
  - `bg-white/75 backdrop-blur-md border border-slate-200/80 shadow-xs hover:bg-white/90 transition-all`
- Menjaga kontras teks dan keterbacaan agar tetap prima tanpa kehilangan estetika *Warm Porcelain*.

## 3. Rencana Verifikasi
1. Verifikasi scroll di desktop:
   - Posisi paling atas: navbar menyatu alami dengan kanvas tanpa border kasar atau background kaku.
   - Saat digulir: navbar bertransformasi halus menjadi frosted glass (`backdrop-blur-md bg-white/80 border-b border-slate-200/80`).
2. Verifikasi responsivitas mobile & bottom dock.
3. Verifikasi integrasi visual pada halaman `/attendance` dan dashboard.
4. Linting & Build check (`npm run lint`, `npm run build`).
