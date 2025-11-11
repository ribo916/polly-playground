import type { ReactNode } from "react";
import "./globals.css";
import ThemeToggle from "../components/ThemeToggle";
import Sidebar from "../components/Sidebar";
import Link from "next/link";

export const metadata = {
  title: "Polly Playground",
  description: "API workflow and UI showcase for Polly",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen transition-colors duration-300 flex flex-col">
        {/* Header */}
        <header
          className="flex items-center justify-between px-6 py-3 border-b"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--background)",
          }}
        >
          <Link
            href="/"
            className="flex items-center space-x-2 no-underline hover:no-underline"
          >
            <h1
              className="text-xl font-medium tracking-wide transition-colors duration-300"
              style={{ color: "var(--title-color)" }}
            >
              Polly Playground
            </h1>
          </Link>
          <ThemeToggle />
        </header>

        {/* Main layout */}
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
