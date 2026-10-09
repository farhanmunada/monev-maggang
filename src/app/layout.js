import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import WalkingCompanions from "@/components/WalkingCompanions";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "InternTrack - Asisten Magang Cerdas",
  description: "Aplikasi monitoring dan evaluasi magang dengan gaya Next-Gen",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className="bg-slate-50 text-slate-900 font-sans antialiased pb-24 md:pb-16 selection:bg-indigo-600 selection:text-white min-h-screen relative overflow-x-hidden"
        suppressHydrationWarning
      >
        {/* Multi-layered Ambient Aurora Mesh Background */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
          {/* Top Center: Indigo & Violet Aurora Orb */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[680px] h-[420px] bg-gradient-to-b from-indigo-300/35 via-purple-200/25 to-transparent blur-[90px] rounded-full" />

          {/* Top Left: Sky Blue & Cyan Glow Orb */}
          <div className="absolute -top-16 left-[5%] w-[480px] h-[480px] bg-gradient-to-br from-sky-300/30 via-cyan-200/20 to-transparent blur-[85px] rounded-full" />

          {/* Mid Right: Warm Rose & Peach Glow Orb */}
          <div className="absolute top-[28%] -right-20 w-[520px] h-[520px] bg-gradient-to-bl from-rose-300/25 via-amber-200/20 to-transparent blur-[95px] rounded-full" />

          {/* Bottom Left: Soft Emerald & Teal Accent Orb */}
          <div className="absolute bottom-[10%] -left-24 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-300/20 via-teal-200/15 to-transparent blur-[90px] rounded-full" />

          {/* Subtle noise/texture mesh overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
        </div>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: "14px",
              background: "#ffffff",
              color: "#0f172a",
              fontSize: "13px",
              fontWeight: 500,
              padding: "10px 18px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(226, 232, 240, 0.9)",
            },
          }}
        />

        {/* Standard Sticky Topbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="relative z-10 pt-4 md:pt-6 px-4 md:px-8 max-w-6xl mx-auto">
          {children}
        </main>

        {/* Ambient Walking Companions at bottom */}
        <WalkingCompanions />

        {/* Bottom Floating Navigation for Mobile */}
        <BottomNav />
      </body>
    </html>
  );
}
