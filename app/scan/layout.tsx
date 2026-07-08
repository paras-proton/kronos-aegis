import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Scan a Base token for safety (honeypot, LP-lock, sell-tax) | KRONOS Aegis",
  description: "Paste any Base token address for a read-only safety read: liquidity & LP-lock, holder concentration, honeypot / sell-tax simulation, owner privileges and contract verification. Public data, not advice.",
  keywords: ["Base token scanner", "honeypot checker", "sell tax", "LP lock", "rug check", "token safety Base"],
  alternates: { canonical: "/scan" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
