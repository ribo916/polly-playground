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
        className="p-2 rounded border text-sm flex items-center justify-center transition"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--panel)",
          color: "var(--foreground)",
        }}
      >
        <Database size={16} />
      </button>

      {open && <EnvOverrideModal onClose={() => setOpen(false)} />}
    </>
  );
}
