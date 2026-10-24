"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isLight = document.documentElement.classList.contains("light");
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);

    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      try {
        localStorage.setItem("theme", "light");
      } catch (_) {}
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      try {
        localStorage.setItem("theme", "dark");
      } catch (_) {}
    }
  };

  // Avoid hydration mismatch by rendering placeholder before mount
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10" />
    );
  }

  const isLight = theme === "light";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
      title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
      className={`relative p-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border ${
        isLight
          ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-sm"
          : "bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white"
      }`}
    >
      {isLight ? (
        <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 rotate-0" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0" />
      )}
      <span className="text-xs font-medium hidden sm:inline">
        {isLight ? "Dark" : "Light"}
      </span>
    </button>
  );
}
