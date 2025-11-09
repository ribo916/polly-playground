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
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
        <header className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Polly API Showcase</h1>
          <ThemeToggle />
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
