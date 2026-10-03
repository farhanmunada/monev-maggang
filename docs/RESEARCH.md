# Riset: Transformasi Layout Next-Gen & UI/UX InternTrack

## 1. Analisis Masalah UI/UX Saat Ini
1. **Sidebar Konvensional Membatasi Kanvas:**
   - Sidebar statis 72px/288px di sisi kiri memotong ruang horizontal layar desktop.
   - Mengurangi fleksibilitas layout Bento Grid yang membutuhkan ruang lebar bebas hambatan.
2. **Kontras Ekstrem Gelap (Dark Cards Fatigue):**
   - Elemen `bg-slate-950` dan `bg-slate-900` pada hero dashboard, boss card, dan modal terasa terlalu berat dan kontras negatif terhadap latar terang.
   - User menginginkan tampilan bersih tanpa dekorasi hitam pekat (*anti-black decorative*).
3. **Penyatuan Fitur yang Tidak Kohesif (Coupled Routes):**
   - Absensi dan Generator AI disatukan di `/report` sehingga alur kerja membingungkan.
   - Task Kanban dan Catatan disatukan di `/notes`, padahal memiliki mental model berbeda (eksekusi vs dokumentasi).
4. **Gamifikasi Berlebihan (Clutter):**
   - Lord Mager, chest reward, level, dan exp quest mendistraksi dari produktivitas kerja nyata.
5. **Kebutuhan Delight Menggemaskan:**
   - User menyukai elemen karakter ambient yang hidup dan berjalan-jalan secara alami di layar tanpa sistem poin/EXP.

## 2. Benchmark Desain & Referensi Skill `ui-ux-pro-max`
- **Gaya Visual:** *Soft UI Evolution + Bento Box Grid* (`styles.csv: bento-box-grid`).
- **Palet Warna:** *Warm Porcelain & Soft Slate*.
  - Background: `#F8FAFC` dengan aksen mesh gradien lembut (indigo/teal 5% opacity).
  - Cards: Putih bersih (`#FFFFFF`) dengan border `rgba(226, 232, 240, 0.9)` dan soft multi-layer shadow.
  - Aksen Brand: Indigo Modern (`#4F46E5`), Emerald Status (`#10B981`), Amber Warning (`#F59E0B`).
- **Navigasi:** *Floating Glass Island (Top Dock)* melayang di tengah atas dengan backdrop blur 16px.
- **Micro-Interaction Ambient:** *Walking Companions* di batas bawah layar (CSS keyframe / ticker sprite yang ringan dan non-intrusif).
