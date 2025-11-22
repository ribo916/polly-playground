"use client";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Calculator, 
  Code, 
  Activity
} from "lucide-react";
import { SidebarLink } from "./SidebarLink";

const sections = [
  {
    title: "Pricing Engine",
    items: [
      { label: "Loan Pipeline", href: "/loan-pipeline", icon: LayoutDashboard },
      { label: "Loan Scenarios", href: "/loan-scenarios", icon: Calculator },
    ],
  },
  {
    title: "Utilities",
    items: [
      { label: "JSON Convert", href: "/utilities/json-convert", icon: Code },
    ],
  },
  {
    title: "Misc",
    items: [
      { label: "API Samples", href: "/misc", icon: FileText },
      { label: "API Logs", href: "/logs", icon: Activity },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 border-r flex flex-col"
      style={{
        backgroundColor: "var(--panel)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title}>
            <p
              className="text-xs font-bold uppercase tracking-wider mb-3 px-2"
              style={{ color: "var(--muted)" }}
            >
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <SidebarLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    active={active}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
