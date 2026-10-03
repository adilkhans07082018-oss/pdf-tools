import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDF Tools - Free Online PDF Editor",
  description: "Merge, split, compress, and convert PDFs for free.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col relative">

        {/* Header / Navbar */}
        <header className="bg-[#050505] sticky top-0 z-50 h-[80px] flex items-center border-b border-white/5">
          <div className="w-full mx-auto px-6 lg:px-12 flex items-center justify-between h-full">
            
            {/* Left side: Logo */}
            <div className="flex items-center h-full">
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                <img src="/logo.png" alt="PDFCRAFT Logo" className="h-10 w-auto object-contain" />
              </Link>
            </div>

            {/* Right side: Navigation */}
            <nav className="hidden lg:flex items-center h-full gap-8">
              <Link href="/" className="text-[13px] font-medium text-white hover:text-gray-300 transition-colors">
                All
              </Link>
              <Link href="#" className="text-[13px] font-medium text-white/60 hover:text-white transition-colors">
                Organize
              </Link>
              <Link href="#" className="text-[13px] font-medium text-white/60 hover:text-white transition-colors">
                Convert
              </Link>
              <Link href="#" className="text-[13px] font-medium text-white/60 hover:text-white transition-colors">
                Security
              </Link>
              <Link href="#" className="text-[13px] font-medium text-white/60 hover:text-white transition-colors">
                Identify
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} PDF Tools. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
