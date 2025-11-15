"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    title: "PRICING ENGINE",
    items: [
      { label: "Loan Pipeline", href: "/loan-pipeline" },
      { label: "Loan Scenarios", href: "/loan-scenarios" },
    ],
  },
  {
    title: "UTILITIES",
    items: [
      { label: "JSON Convert", href: "/utilities/json-convert" },
    ],
  },
  {
    title: "MISC",
    items: [
      { label: "API Samples", href: "/misc" },
      { label: "API Logs", href: "/logs" },        
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-56 p-4 border-r transition-colors duration-300"
      style={{
        backgroundColor: "var(--panel)",
        borderColor: "var(--border)",
        color: "var(--foreground)",
      }}
    >
      {sections.map((section) => (
        <div key={section.title} className="mb-6">
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-2"
            style={{ color: "var(--muted)" }}
          >
            {section.title}
          </p>
          <nav className="space-y-1">
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                  style={{
                    backgroundColor: active
                      ? "rgba(1, 255, 241, 0.12)"
                      : "transparent",
                    color: active ? "var(--accent)" : "var(--foreground)",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
}
