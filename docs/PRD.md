# PRD: Implementasi Aurora Mesh & Sistem True Glassmorphism

## 1. Masalah & Kebutuhan (Problem Statement)
Efek glassmorphism saat ini tidak terlihat (*"kaga ada glass morph blass"*) karena dua faktor teknis utama:
1. Kanvas dasar berupa warna datar monokromatik (`#F8FAFC`), sehingga blur optik tidak memiliki variasi warna atau elemen kontras di baliknya untuk dibiaskan.
2. Opasitas background elemen terlalu tinggi (0.8 - 0.9) dan tidak memiliki pantulan cahaya tepi (*specular rim highlight* `inset 0 1px 1px white`) serta peningkatan saturasi optik (`saturate(180%)`).

Pengguna menanyakan: *"apakah perlu warna baru untk kombinasi ?"*
Solusinya adalah menghadirkan kombinasi warna latar belakang **Aurora Mesh Gradient** yang dinamis dan berkelas, dipadukan dengan formula **True Glassmorphism Surface**.

## 2. Cakupan Solusi (Scope)

### A. Palet Kombinasi Baru: Aurora Mesh Lighting
Latar belakang kanvas dihiasi oleh orbs pencahayaan ambient yang ditempatkan secara strategis di `src/app/layout.js`:
- **Violet & Indigo Orb (`#6366F1` / `#8B5CF6`):** di area atas tengah, menciptakan bias warna di balik sticky navbar.
- **Sky Blue Orb (`#0EA5E9`):** di area kiri atas, memberi nuansa segar dan profesional.
- **Warm Rose & Amber Orb (`#F59E0B` / `#F43F5E`):** di area kanan tengah, memberi kehangatan visual tanpa menyilaukan.
- Opasitas halus (12-18%) dengan `blur-[110px]` sehingga tetap lembut, tidak mengganggu keterbacaan teks, namun memberi material kaya untuk dibiaskan oleh kaca.

### B. Formula True Glassmorphism (`src/app/globals.css`)
- **Utility `.glass-card` / `.glass-panel`:**
  - `background: rgba(255, 255, 255, 0.65)`
  - `backdrop-filter: blur(16px) saturate(180%)`
  - `-webkit-backdrop-filter: blur(16px) saturate(180%)`
  - `border: 1px solid rgba(255, 255, 255, 0.75)`
  - `box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.9)`
- **Utility `.glass-nav`:**
  - `background: rgba(255, 255, 255, 0.70)` saat di-scroll
  - `backdrop-filter: blur(20px) saturate(190%)`
  - Specular top rim & subtle border

### C. Komponen yang Ditingkatkan
1. `src/app/layout.js`: Inject Aurora Mesh Orbs di kanvas background.
2. `src/components/Navbar.js`: Menggunakan kelas `.glass-nav` dengan opasitas 0.68 - 0.72 saat di-scroll.
3. `src/app/attendance/page.js`: Panel statistik, kontrol kalender, dan sel kalender mengadopsi translusensi kaca nyata.
4. `src/app/page.js` & Bento widgets: Kartu metrik dan greeting card menggunakan styling `.glass-panel`.

## 3. Kriteria Penerimaan (Acceptance Criteria)
1. Efek frosted glass terlihat sangat jelas dan nyata secara visual, baik pada navbar maupun pada kartu metrik.
2. Saat menggulir (scroll) halaman, teks, badge, dan kartu di bawah navbar terlihat membias (blur + saturated) secara dinamis.
3. Kontras teks tetap terjaga 100% dan memenuhi standar aksesibilitas keterbacaan.
4. `npm run lint` dan `npm run build` sukses tanpa error.
