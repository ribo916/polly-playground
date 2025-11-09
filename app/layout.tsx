import type { ReactNode } from "react";
import "./globals.css";
import ThemeToggle from "../components/ThemeToggle";

export const metadata = {
  title: "Polly API Showcase",
  description: "Demo and workflow viewer for the Polly API",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen transition-colors duration-300">
        <header 
          className="p-4 flex items-center justify-between"
          style={{
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h1 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            Polly API Showcase
          </h1>
          <ThemeToggle />
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
