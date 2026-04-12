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
  title: "Manifesto — Semantic Layer for Deterministic Domain State",
  description: "Define state once. Get governance, lineage, and simulation for free. A deterministic runtime where every state change is traceable, every action is governable, and every outcome is predictable.",
  keywords: ["state management", "deterministic", "governance", "lineage", "simulation", "TypeScript", "MEL", "domain modeling", "reactive", "SDK"],
  authors: [{ name: "Manifesto AI" }],
  metadataBase: new URL("https://manifesto-ai.dev"),
  openGraph: {
    title: "Manifesto — Define state once, govern everything",
    description: "Not just state management. A deterministic semantic runtime with built-in governance, lineage tracking, and simulation.",
    type: "website",
    url: "https://manifesto-ai.dev",
    siteName: "Manifesto",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manifesto — Deterministic Semantic Runtime",
    description: "Define state once. Get governance, lineage, and simulation for free.",
    creator: "@eggplantiny",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-JFV0ZXY9R4" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-JFV0ZXY9R4');`,
          }}
        />
      </head>
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
