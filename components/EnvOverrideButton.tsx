"use client";

import { useState } from "react";
import { Database } from "lucide-react";
import { EnvOverrideModal } from "@/components/EnvOverrideModal";

export default function EnvOverrideButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-lg transition-all duration-200 hover:scale-105 group"
        style={{
          backgroundColor: "var(--muted-bg)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--accent-bg)";
          e.currentTarget.style.borderColor = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--muted-bg)";
          e.currentTarget.style.borderColor = "var(--border)";
        }}
        aria-label="Environment overrides"
      >
        <Database 
          size={18} 
          style={{ color: "var(--accent)" }}
          className="transition-transform group-hover:rotate-12"
        />
      </button>

      {open && <EnvOverrideModal onClose={() => setOpen(false)} />}
    </>
  );
}
