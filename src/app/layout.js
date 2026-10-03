import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "InternTrack - Asisten Magang Cerdas",
  description: "Aplikasi monitoring dan evaluasi magang dengan gaya Next-Gen",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className="bg-slate-50 text-slate-900 font-sans antialiased pb-20 md:pb-0 md:flex selection:bg-slate-900 selection:text-white"
        suppressHydrationWarning
      >
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: "12px",
              background: "#0f172a",
              color: "#f8fafc",
              fontSize: "13px",
              fontWeight: 500,
              padding: "10px 16px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            },
          }}
        />

        {/* Navigation Components */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 md:ml-72 min-h-screen relative overflow-x-hidden">
          <div className="relative z-10 p-4 md:p-8 max-w-6xl mx-auto">
            {children}
          </div>
        </main>

        <BottomNav />
      </body>
    </html>
  );
}
