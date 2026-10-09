# Riset: Konsep Desain "Modern Pixel-Glass" & Overhaul UX Visual

## 1. Validasi Ide Pengguna: Glassmorphism + Pixelate Modern
- **Apakah bagus?** **Sangat bagus dan unik!**
  - Menggabungkan material *frosted glass* (kedalaman, glow aurora, refraksi halus) dengan *elemen pixelate modern* (retro-pixel badges `[TODO]`, `[RUNNING]`, `[DONE]`, pixel indicator dots, font mono bertema retro-tech) menciptakan identitas desain **"Neo-Digital Artisan / Modern Pixel-Glass"**.
  - Sangat kohesif dengan elemen *Walking Companions* yang sudah ada di aplikasi (sprite karakter pixel yang berjalan di layar). Ini membuat seluruh tema terasa satu kesatuan dunia visual yang hidup dan menyenangkan.

## 2. Analisis UX: Menghilangkan Hambatan Membaca & Garis Tebal
1. **Kurangi Beban Teks (Visual-First & Non-Text-Heavy):**
   - Pengguna tidak suka membaca teks panjang. Solusi: Ubah informasi menjadi **visual visual chips, icon cues, progress gauge, dan micro-badges**.
   - Hindari deskripsi berulang di header atau footer. Gunakan counter bergaya digital pixel seperti `[04/12]` dan icon status.
2. **Eliminasi Garis Tebal (Anti-Thick Borders):**
   - Menghapus semua `border-l-4`, `border-2`, dan border pembatas hitam/kaku di seluruh halaman.
   - Menggantinya dengan **hairline glass borders (1px border-white/80 atau border-slate-200/50)** dan specular highlight `inset 0 1px 1px white` untuk ilusi tepi kaca tipis tanpa garis tebal.

## 3. Analisis Masalah Halaman Task (`/tasks`) ("UI Majapahit")
1. **Kondisi Saat Ini:**
   - Masih menggunakan kartu putih solid biasa dengan border samping tebal `border-l-4 border-l-indigo-600` / `border-l-emerald-600`.
   - Kolom kanban terasa kaku dan datar, tidak menyatu dengan background Aurora Mesh.
   - Tombol dan header terasa generik dan kuno.
2. **Solusi Overhaul:**
   - Transformasi kolom menjadi **Glass Columns** (`glass-panel`) semi-transparan.
   - Kartu tugas menjadi **Glassmorphic Task Cards** dengan aksen **Modern Pixel Tags** (`[TODO]`, `[IN_PROG]`, `[DONE]`) dengan micro-border halus (zero thick lines).
   - Indikator aksi geser/pindah cepat yang visual dan instan tanpa perlu membaca panduan panjang.

## 4. Analisis Navbar: Aksesibilitas & Readability Terdepan
- Penyesuaian kontras teks agar tidak tertelan transparansi (`text-slate-800 font-semibold`).
- Indikator aktif kontras tinggi (`bg-slate-900 text-white` dengan specular rim halus).
- Logo dengan sentuhan badge retro-pixel minimalis `[PRO] / [WORKSPACE]`.
