"use client";

import { useState } from "react";
import CreateLoanModal from "./CreateLoanModal";

export default function CreateLoanButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded font-medium transition"
        style={{
          backgroundColor: "var(--accent)",
          color: "var(--button-text)",
        }}
      >
        + Create Loan
      </button>

      {open && (
        <CreateLoanModal
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
