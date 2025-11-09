"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  // On load, use stored preference or default to dark
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    document.documentElement.style.colorScheme = saved;
    setTheme(saved);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("theme", next);
    setTheme(next);
  }

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1 text-sm border rounded transition-colors"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--panel)",
        color: "var(--foreground)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--panel)";
        e.currentTarget.style.opacity = "0.8";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--panel)";
        e.currentTarget.style.opacity = "1";
      }}
    >
      {theme === "dark" ? "🌞" : "🌙"}
    </button>
  );
}
