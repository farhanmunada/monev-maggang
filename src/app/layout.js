import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { CalendarDays, LayoutDashboard, History, FileText, ClipboardList, Menu, X, StickyNote } from "lucide-react";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "InternTrack - Asisten Magang Cerdas",
  description: "Aplikasi monitoring dan evaluasi magang dengan AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground font-sans antialiased pb-20 md:pb-0 md:flex selection:bg-primary-100 selection:text-primary-700 transition-colors duration-300" suppressHydrationWarning>
        <Toaster position="top-center" toastOptions={{ duration: 4000, style: { borderRadius: '12px', background: '#333', color: '#fff' } }} />
        
        {/* Navigation Components */}
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 md:ml-72 min-h-screen relative overflow-x-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>
          <div className="relative z-0 p-4 md:p-10 max-w-5xl mx-auto">
            {children}
          </div>
        </main>

        <BottomNav />
      </body>
    </html>
  );
}
