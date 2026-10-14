import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import WalkingCompanions from "@/components/WalkingCompanions";
import SpeedLogModal from "@/components/SpeedLogModal";
import SarcasticEmergencyAlert from "@/components/SarcasticEmergencyAlert";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "InternTrack - Asisten Magang Cerdas [BRUTAL.EDITION]",
  description: "Aplikasi monitoring dan evaluasi magang dengan gaya Neo-Brutalist",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className="bg-[#faf9f6] text-black font-sans antialiased pb-24 md:pb-16 selection:bg-[#a3e635] selection:text-black min-h-screen relative overflow-x-hidden"
        suppressHydrationWarning
      >
        {/* Retro-Engineering Technical Dot-Grid Background */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] [background-size:22px_22px] opacity-10" />
        </div>

        {/* Neo-Brutalist Ticker Banner in Lime on Black */}
        <div className="marquee-banner bg-black text-[#a3e635] border-b-[2.5px] border-black overflow-hidden py-1.5 select-none font-mono text-[11px] font-black tracking-wider uppercase flex items-center">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
            <span className="text-white">INTERNTRACK SYS.V2</span>
            <span className="text-[#8b5cf6]">{"//"}</span>
            <span>HARDWARE MAINTENANCE & SOFTWARE DEV LOGS</span>
            <span className="text-[#8b5cf6]">{"//"}</span>
            <span className="text-white">ZERO DOWNTIME — TRACK EVERY GRIND</span>
            <span className="text-[#8b5cf6]">{"//"}</span>
            <span>VIOLET-LIME BRUTALIST PROTOCOL</span>
            <span className="text-[#8b5cf6]">{"//"}</span>
            <span className="text-white">INTERNTRACK SYS.V2</span>
            <span className="text-[#8b5cf6]">{"//"}</span>
            <span>HARDWARE MAINTENANCE & SOFTWARE DEV LOGS</span>
            <span className="text-[#8b5cf6]">{"//"}</span>
            <span className="text-white">ZERO DOWNTIME — TRACK EVERY GRIND</span>
            <span className="text-[#8b5cf6]">{"//"}</span>
            <span>VIOLET-LIME BRUTALIST PROTOCOL</span>
          </div>
        </div>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: "10px",
              background: "#ffffff",
              color: "#000000",
              fontSize: "12px",
              fontWeight: 800,
              fontFamily: "var(--font-mono)",
              padding: "10px 18px",
              boxShadow: "4px 4px 0px 0px #000000",
              border: "2.5px solid #000000",
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

        {/* Global Sarcastic Emergency Alert System */}
        <SarcasticEmergencyAlert />

        {/* Bottom Floating Navigation for Mobile */}
        <BottomNav />
      </body>
    </html>
  );
}
