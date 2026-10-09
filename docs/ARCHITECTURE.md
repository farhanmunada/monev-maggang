# Arsitektur: Aurora Mesh Lighting & True Glassmorphism System

## 1. File Terdampak
1. `src/app/globals.css`: Deklarasi utility classes `.glass-panel`, `.glass-nav`, `.glass-subtle` dengan formula saturasi refraktif (`saturate(180%)`), backdrop blur, dan specular rim highlight (`inset 0 1px 1px white`).
2. `src/app/layout.js`: Implementasi sistem pencahayaan multi-layer Aurora Mesh Orbs (Sky Cyan, Indigo Violet, Rose, dan Emerald) di latar kanvas.
3. `src/components/Navbar.js`: Integrasi class `.glass-nav` dinamis saat discroll, menyaring warna dan teks yang melintas di bawahnya.
4. `src/app/attendance/page.js`: Penerapan `.glass-panel` pada Monthly Statistics Cards, Calendar Grid Container, dan Modal Dialog.
5. `src/components/dashboard/BentoGreeting.js` & `BentoTelemetry.js`: Penerapan `.glass-panel` pada Bento Dashboard cards.

## 2. Spesifikasi Teknis Formula Glass

### A. Utilitas CSS `.glass-panel`
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.68);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 4px 20px -2px rgba(15, 23, 42, 0.05),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.95);
}
```

### B. Utilitas CSS `.glass-nav`
```css
.glass-nav {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(190%);
  -webkit-backdrop-filter: blur(20px) saturate(190%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: 
    0 4px 24px 0 rgba(15, 23, 42, 0.05),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.9);
}
```

### C. Aurora Mesh Layer (`src/app/layout.js`)
- Menggunakan 4 orbs gradien warna di layer `fixed inset-0 pointer-events-none -z-10`:
  1. Top-Left: Sky Blue (`#38bdf8`)
  2. Top-Center: Indigo/Violet (`#818cf8`)
  3. Mid-Right: Soft Rose/Peach (`#fb7185`)
  4. Bottom-Left: Soft Emerald (`#34d399`)
- Menjamin refraksi optik di seluruh viewport layar.
