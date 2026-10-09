# Riset: Redesain Navbar Klasik-Glassmorphism & Perpaduan Elemen Glass UI

## 1. Analisis Masalah Navbar Saat Ini
1. **Model Floating Island Overlay:**
   - Navbar saat ini menggunakan pola floating island/pill (`fixed top-4 left-0 right-0 max-w-fit rounded-full`).
   - Masalah: Terasa seperti overlay yang mengambang canggung di atas konten, sering menutupi bagian atas saat scrolling, dan membatasi ruang navigasi horizontal.
2. **Kebutuhan Pengguna:**
   - Mengganti model overlay menjadi **Navbar Standar Penuh (Edge-to-Edge Topbar)**:
     - Menempel di bagian atas layar (`sticky top-0 w-full z-40`).
     - Tampilan bersih saat di posisi paling atas (`scrollY === 0`).
     - Berubah menjadi **Glassmorphic Surface** dinamis saat digulir (`scrollY > 10`): `backdrop-blur-md bg-white/80 border-b border-slate-200/80 shadow-2xs`.
   - Memadukan estetika **Glassmorphism** di elemen-elemen UI utama lainnya agar antarmuka tampak kohesif, premium, dan modern.

## 2. Analisis Penerapan Glassmorphism di Komponen UI
1. **Top Navbar (`src/components/Navbar.js`):**
   - Struktur horizontal standar: Logo + Brand di sisi kiri, menu navigasi dengan indikator aktif di tengah/kanan, dan quick action/status.
   - Deteksi scroll dinamis menggunakan React `useEffect` + event listener `scroll` (passive) untuk transisi halus antar-state (transparan/bersih di top -> glassmorphic dengan blur dan border saat scroll).
2. **Main Layout (`src/app/layout.js`):**
   - Penyesuaian `main` container padding agar pas dengan navbar sticky top-0 standar (`pt-6` bukan padding aneh akibat floating overlay).
3. **Harmonisasi Elemen Glassmorphic Lintas Halaman:**
   - **Kartu Metrik & Quick Stats:** Penerapan `backdrop-blur-md bg-white/75 border border-white/90 shadow-xs` dengan highlight radial halus.
   - **Modal & Filter Bar:** Memberikan depth glassmorphism lembut di header dan wrapper card.
   - **Bottom Navigation Mobile (`src/components/BottomNav.js`):** Peningkatan efek frosted glass agar seragam dengan topbar.
