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
        {/* Soft Ambient Radial Background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-100/40 via-blue-50/20 to-transparent blur-3xl rounded-full" />
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
