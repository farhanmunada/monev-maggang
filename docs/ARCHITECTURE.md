# Arsitektur: Modern Pixel-Glass Design & Kanban Overhaul

## 1. File Terdampak
1. `src/app/globals.css`: Utilitas `.pixel-badge`, `.pixel-chip`, hairline glass borders, dan animasi micro-glow.
2. `src/app/tasks/page.js`: Rombak total dari UI lama ke Modern Pixel-Glass Kanban Board (visual-first, zero thick borders, visual progress gauge, drag and drop glass tiles).
3. `src/components/Navbar.js`: Penguatan aksesibilitas (kontras tinggi, font weight, pixel tag `[WORKSPACE]`, label tegap).
4. `src/app/attendance/page.js`: Pembersihan border atau styling tebal agar selaras dengan filosofi hairline glass & pixel badge tanggal gajian.

## 2. Rincian Teknis Implementasi

### A. Utilitas CSS (`src/app/globals.css`)
```css
/* Modern Pixel-Glass Utility Classes */
.pixel-badge {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 2px 7px;
  border-radius: 6px;
  border: 1px solid currentColor;
  box-shadow: 1px 1px 0px 0px currentColor;
}
```

### B. Overhaul Kanban Board (`src/app/tasks/page.js`)
- **Header:** Ringkas, icon-focused, tanpa paragraf panjang. Tombol Tambah Task dengan styling glass button + micro-glow.
- **Visual KPI:** Progress bar visual dengan pixel counter `[DONE 05/10]` dan dot indicators.
- **Kolom Kanban:** Menggunakan `glass-panel` yang semi-transparan dengan border hairline `border-white/80`.
- **Kartu Tugas (Task Cards):**
  - **HAPUS TOTAL `border-l-4`**.
  - Background kaca: `bg-white/70 backdrop-blur-md border border-white/90 shadow-2xs hover:shadow-xs`.
  - Tag status pixel:
    - To Do: `<span className="pixel-badge text-slate-600 bg-slate-100/80">[TODO]</span>`
    - In Progress: `<span className="pixel-badge text-indigo-700 bg-indigo-50/90 border-indigo-300">[RUN]</span>`
    - Done: `<span className="pixel-badge text-emerald-700 bg-emerald-50/90 border-emerald-300">[DONE]</span>`
  - Aksi 1-klik untuk toggle status dan modal edit yang intuitif.

### C. Navbar (`src/components/Navbar.js`)
- Penajaman kontras: Teks tautan menu menggunakan warna yang solid dan jelas terbaca (`text-slate-700 font-semibold hover:text-slate-900`).
- Menu aktif menggunakan `bg-slate-900 text-white font-bold shadow-xs`.
- Brand logo dilengkapi micro-badge pixel modern `[V2.0]`.
