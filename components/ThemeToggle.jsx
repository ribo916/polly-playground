"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

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
      className="relative p-2 rounded-lg transition-all duration-200 hover:scale-105"
      style={{
        backgroundColor: "var(--muted-bg)",
        color: "var(--foreground)",
        border: "1px solid var(--border)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--accent-bg)";
        e.currentTarget.style.borderColor = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--muted-bg)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={18} style={{ color: "var(--accent)" }} />
      ) : (
        <Moon size={18} style={{ color: "var(--accent)" }} />
      )}
    </button>
  );
}
