import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
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
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  if (stored === 'light') {
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col relative transition-colors duration-200">

        {/* Header / Navbar */}
        <header className="bg-[#050505] sticky top-0 z-50 h-[80px] flex items-center border-b border-white/5 transition-colors duration-200">
          <div className="w-full mx-auto px-6 lg:px-12 flex items-center justify-between h-full">
            
            {/* Left side: Logo */}
            <div className="flex items-center h-full">
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                <img src="/logo.png" alt="PDFCRAFT Logo" className="h-10 w-auto object-contain transition-all duration-200" />
              </Link>
            </div>

            {/* Right side: Navigation & Theme Toggle */}
            <div className="flex items-center gap-4 sm:gap-6">
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

              {/* Theme Toggle Button */}
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-[#0a0a0a] border-t border-white/5 mt-auto transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 py-8 text-center text-white/40 text-sm">
            <p>&copy; {new Date().getFullYear()} PDF Tools. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
