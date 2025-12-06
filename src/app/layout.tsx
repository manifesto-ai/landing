import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Manifesto AI - AI-Native Semantic UI State Layer",
  description: "The only UI framework where AI agents can truly understand, reason about, and interact with your interface—not just see pixels.",
  keywords: ["AI", "UI", "Forms", "Schema", "React", "Vue", "TypeScript", "LLM", "Machine Learning"],
  authors: [{ name: "Manifesto AI" }],
  openGraph: {
    title: "Manifesto AI - AI-Native Semantic UI State Layer",
    description: "Turn any form into a machine-readable interface for LLM agents.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manifesto AI",
    description: "AI-Native Semantic UI State Layer",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
