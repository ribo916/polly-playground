"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  // When the page loads, read the saved theme (if any)
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const initial = saved || "dark";
    document.documentElement.style.colorScheme = initial;
    setDark(initial === "dark");
  }, []);

  function toggleTheme() {
    const next = dark ? "light" : "dark";
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("theme", next);
    setDark(!dark);
  }

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1 text-sm border rounded border-gray-600 hover:bg-gray-700 transition"
    >
      {dark ? "🌞 Light" : "🌙 Dark"}
    </button>
  );
}
