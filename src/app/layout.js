import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import WalkingCompanions from "@/components/WalkingCompanions";
import SpeedLogModal from "@/components/SpeedLogModal";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "InternTrack - Asisten Magang Cerdas",
  description: "Aplikasi monitoring dan evaluasi magang dengan gaya Next-Gen",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className="bg-[#eef2f6] text-slate-900 font-sans antialiased pb-24 md:pb-16 selection:bg-indigo-600 selection:text-white min-h-screen relative overflow-x-hidden"
        suppressHydrationWarning
      >
        {/* Multi-layered Ambient Aurora Mesh Background */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
          {/* Top Center: Indigo & Electric Violet Aurora Orb */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[580px] bg-gradient-to-b from-indigo-500/38 via-purple-500/28 to-transparent blur-[100px] rounded-full" />

          {/* Top Left: Deep Cyan & Sky Blue Glow Orb */}
          <div className="absolute -top-24 left-[2%] w-[600px] h-[600px] bg-gradient-to-br from-cyan-400/40 via-sky-500/30 to-transparent blur-[95px] rounded-full" />

          {/* Mid Right: Fuchsia, Rose & Amber Glow Orb */}
          <div className="absolute top-[20%] -right-24 w-[650px] h-[650px] bg-gradient-to-bl from-rose-500/35 via-fuchsia-400/25 to-amber-300/20 blur-[110px] rounded-full" />

          {/* Bottom Left: Vivid Emerald & Teal Accent Orb */}
          <div className="absolute bottom-[8%] -left-28 w-[620px] h-[620px] bg-gradient-to-tr from-emerald-400/35 via-teal-400/25 to-transparent blur-[100px] rounded-full" />

          {/* Center Ambient Floating Glow */}
          <div className="absolute top-[45%] left-[20%] w-[580px] h-[420px] bg-gradient-to-r from-blue-400/25 via-indigo-300/20 to-purple-400/25 blur-[120px] rounded-full" />

          {/* Subtle noise/texture mesh overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
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

        {/* Global Floating Speed Log Modal */}
        <SpeedLogModal />

        {/* Bottom Floating Navigation for Mobile */}
        <BottomNav />
      </body>
    </html>
  );
}
