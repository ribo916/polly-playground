"use client";

import Link from "next/link";
import { LucideIcon, ChevronRight } from "lucide-react";

type SidebarLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
};

export function SidebarLink({ href, label, icon: Icon, active }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative"
      style={{
        backgroundColor: active ? "var(--accent-bg)" : "transparent",
        color: active ? "var(--accent)" : "var(--foreground-secondary)",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "var(--muted-bg)";
          e.currentTarget.style.color = "var(--foreground)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "var(--foreground-secondary)";
        }
      }}
    >
      <Icon 
        size={18} 
        style={{ 
          color: active ? "var(--accent)" : "var(--muted)",
          transition: "all 0.2s ease"
        }} 
      />
      <span className="flex-1">{label}</span>
      {active && (
        <ChevronRight 
          size={16} 
          style={{ color: "var(--accent)" }}
          className="animate-in slide-in-from-right-2"
        />
      )}
    </Link>
  );
}

