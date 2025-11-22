"use client";

import { ArrowRight, Zap, Shield, Code, Activity } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const features = [
    {
      icon: Zap,
      title: "Fast API Testing",
      description: "Test Polly APIs with instant feedback and real-time logging",
      href: "/loan-pipeline",
    },
    {
      icon: Shield,
      title: "Secure Overrides",
      description: "Safely override environment variables per session with encrypted storage",
      href: "/",
    },
    {
      icon: Code,
      title: "JSON Converter",
      description: "Convert between different JSON formats and validate schemas",
      href: "/utilities/json-convert",
    },
    {
      icon: Activity,
      title: "API Logs",
      description: "Monitor all API calls with detailed request/response logging",
      href: "/logs",
    },
  ];

  return (
    <div className="min-h-full flex flex-col">
      {/* Hero Section */}
      <div 
        className="flex-1 flex items-center justify-center px-6 py-16"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 
              className="text-5xl md:text-6xl font-bold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              Welcome to{" "}
              <span style={{ color: "var(--accent)" }}>
                Polly Playground
              </span>
            </h1>
            <p 
              className="text-xl md:text-2xl max-w-2xl mx-auto"
              style={{ color: "var(--foreground-secondary)" }}
            >
              Your comprehensive workspace for testing, exploring, and developing with Polly APIs
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/loan-pipeline"
              className="group px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-lg inline-flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
                color: "var(--button-text)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              Get Started
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/logs"
              className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 border-2 hover:bg-[var(--accent-bg)]"
              style={{
                borderColor: "var(--accent)",
                color: "var(--accent)",
                backgroundColor: "transparent",
              }}
            >
              View Logs
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div 
        className="px-6 py-16 border-t"
        style={{ 
          backgroundColor: "var(--background-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 
            className="text-3xl font-bold text-center mb-12"
            style={{ color: "var(--foreground)" }}
          >
            Explore Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group p-6 rounded-xl border transition-all hover:scale-105 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
                  style={{
                    backgroundColor: "var(--panel)",
                    borderColor: "var(--border)",
                    boxShadow: "var(--shadow)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      backgroundColor: "var(--accent-bg)",
                      color: "var(--accent)",
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 
                    className="text-lg font-semibold mb-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: "var(--foreground-secondary)" }}
                  >
                    {feature.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
