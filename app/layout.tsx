import type { ReactNode } from "react";
import { LogProvider } from "./context/LogContext";
import "./globals.css";
import ThemeToggle from "../components/ThemeToggle";
import Sidebar from "../components/Sidebar";
import Link from "next/link";
import EnvOverrideButton from "../components/EnvOverrideButton";

export const metadata = {
  title: "Polly Playground",
  description: "API demos and workflow testing",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)" }}>
        <LogProvider>
          {/* Modern Header */}
          <header
            className="sticky top-0 z-50 border-b backdrop-blur-sm"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--panel)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="flex items-center justify-between px-6 py-4">
              <Link
                href="/"
                className="flex items-center space-x-3 no-underline hover:no-underline group"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
                    color: "var(--button-text)",
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  P
                </div>
                <div>
                  <h1
                    className="text-xl font-bold tracking-tight transition-colors duration-300"
                    style={{ color: "var(--title-color)" }}
                  >
                    Polly Playground
                  </h1>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    API Testing & Development
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-3">
                <EnvOverrideButton />
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Main layout */}
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main 
              className="flex-1 overflow-y-auto"
              style={{ backgroundColor: "var(--background)" }}
            >
              {children}
            </main>
          </div>
        </LogProvider>
      </body>
    </html>
  );
}
