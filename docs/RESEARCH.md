# Riset: Solusi Autentik Glassmorphism (Aurora Mesh & Saturate Blur)

## 1. Mengapa Efek Glassmorphism Sebelumnya Tidak Terlihat?
1. **Latar Belakang Monokromatik Datar:**
   - Background aplikasi sebelumnya adalah warna solid datar `#F8FAFC` tanpa elemen warna atau gradien kontras di bawahnya.
   - Karakteristik optik `backdrop-filter: blur(...)`: Efek blur pada permukaan solid yang rata akan menghasilkan warna yang sama persis dengan latar belakangnya. Tidak ada objek atau warna yang bisa dibiaskan sehingga kartu terlihat seperti warna putih solid biasa.
2. **Opasitas Terlalu Pekat:**
   - Nilai opasitas `bg-white/80` hingga `bg-white/90` terlalu pekat, memblokir transparansi dan mematikan efek kedalaman (depth).
3. **Absennya Pantulan Refraksi (Specular Rim Light):**
   - Efek kaca nyata (seperti macOS Liquid Glass atau Windows Fluent Acrylic) membutuhkan rim highlight:
     - `box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)` (cahaya pantulan di tepi atas).
     - `backdrop-filter: blur(16px) saturate(180%)` (saturasi optik yang meningkatkan kecerahan warna di balik kaca).
     - Border semi-transparan `border-white/70` yang menyerupai tepi kaca bening.

## 2. Solusi & Rekomendasi Palet Kombinasi Baru (Aurora Glassmorphism)
1. **Ambient Aurora Mesh di Latar Belakang (`src/app/layout.js`):**
   - Menambahkan orbs gradien lembut dengan warna harmonis:
     - *Sky / Cyan Glow:* `#0ea5e9` (opacity 15-20%) di sudut kiri atas.
     - *Indigo / Violet Aura:* `#6366f1` / `#a855f7` (opacity 15-20%) di tengah atas.
     - *Warm Peach / Amber Tint:* `#f59e0b` / `#fb7185` (opacity 10-15%) di sudut kanan tengah.
   - Posisi `fixed inset-0 pointer-events-none blur-3xl -z-10` sehingga menyatu lembut di bawah semua halaman.
2. **Token CSS Glassmorphism Standar (`src/app/globals.css`):**
   - Utility `.glass-panel`:
     ```css
     background: rgba(255, 255, 255, 0.68);
     backdrop-filter: blur(16px) saturate(180%);
     -webkit-backdrop-filter: blur(16px) saturate(180%);
     border: 1px solid rgba(255, 255, 255, 0.75);
     box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9);
     ```
   - Utility `.glass-nav`:
     ```css
     background: rgba(255, 255, 255, 0.72);
     backdrop-filter: blur(20px) saturate(190%);
     -webkit-backdrop-filter: blur(20px) saturate(190%);
     border-bottom: 1px solid rgba(226, 232, 240, 0.6);
     box-shadow: 0 4px 24px 0 rgba(15, 23, 42, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.85);
     ```
3. **Pengaruh pada Navbar & Komponen:**
   - Saat navbar melayang di atas konten saat di-scroll, teks, kartu warna, dan orbs aurora di bawahnya akan terbiaskan secara instan dan sangat jelas terlihat efek kacanya.
