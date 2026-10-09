# PRD: Redesain Topbar Standar Glassmorphic & Harmonisasi Glass UI

## 1. Tujuan (Objective)
Menghapus desain navbar berbentuk floating island overlay dan menggantinya dengan **Navbar Standar Penuh (Edge-to-Edge Sticky Topbar)** yang menerapkan efek **Glassmorphism dinamis saat discroll**. Selain itu, memadukan sentuhan glassmorphism ke elemen-elemen UI strategis lainnya (kartu metrik, panel statistik, modal, dan bottom navigation) guna menciptakan tampilan antarmuka yang lebih lapang, premium, dan kohesif.

## 2. Cakupan & Spesifikasi Fitur (Scope)

### A. Redesain Top Navbar (`src/components/Navbar.js`)
- **Format:** Lebar penuh (`w-full sticky top-0 z-40`), bukan pill overlay mengambang di tengah.
- **Perilaku Scroll Dinamis:**
  - **Saat di puncak halaman (`scrollY <= 10`):** Latar belakang bersih/transparan atau semi-transparan minimal tanpa border bawah yang tebal.
  - **Saat halaman digulir (`scrollY > 10`):** Bertransformasi menjadi **Frosted Glass / Glassmorphic Header** (`backdrop-blur-md bg-white/80 border-b border-slate-200/80 shadow-2xs transition-all duration-300`).
- **Tata Letak:**
  - Kiri: Logo InternTrack + Nama Aplikasi.
  - Tengah/Kanan: Menu navigasi (`Beranda`, `Jurnal`, `Absensi`, `Laporan AI`, `Tasks`, `Catatan`) dengan pills/indikator aktif yang halus.
  - Kanan: Indikator status tanggal aktif / quick shortcut.

### B. Penyesuaian Layout Root (`src/app/layout.js`)
- Mengubah padding atas konten utama (`<main>`) agar mengalir alami di bawah sticky navbar tanpa adanya tumpang tindih visual.

### C. Perpaduan Glassmorphism pada Komponen Utama
- **Halaman Presensi & Absensi (`src/app/attendance/page.js`):**
  - Panel statistik bulanan (`grid-cols-5`): Tampilan glass cards halus (`bg-white/75 backdrop-blur-md border border-slate-200/80 shadow-xs`).
  - Bar navigasi bulan & aksi PDF: Aksen glassmorphic button.
- **Mobile Bottom Navigation (`src/components/BottomNav.js`):**
  - Mengoptimalkan efek frosted glass (`bg-white/85 backdrop-blur-xl border border-white/60 shadow-lg`).
- **Dashboard Bento Cards (`src/app/page.js` & elemen metrik):**
  - Sentuhan transparan halus dengan blur untuk meningkatkan kedalaman visual (depth).

## 3. Kriteria Penerimaan (Acceptance Criteria)
1. Navbar berada di posisi atas penuh (`sticky top-0 w-full`), bukan floating island melayang di tengah layar.
2. Ketika halaman di-scroll ke bawah, navbar secara otomatis mengaktifkan efek glassmorphism dengan transisi halus.
3. Konten halaman tidak tertutup canggung oleh navbar dan memiliki jarak scroll yang nyaman.
4. Elemen kartu statistik dan navigasi mobile mengadopsi estetika glassmorphic yang selaras.
5. `npm run lint` dan `npm run build` sukses 100% tanpa error.
