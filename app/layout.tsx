import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GTM Agent — Go-to-Market Orchestrator",
  description: "AI-powered workflow orchestrator for market research, lead generation, and strategy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
