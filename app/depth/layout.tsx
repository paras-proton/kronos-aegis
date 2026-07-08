import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Collateral & bridge contagion radar for Base assets | KRONOS Aegis",
  description: "Map the recursive collateral / bridge chain behind a Base asset and see its Derivative Tier and single-point bridge risk — the contagion exposure token scanners miss. Read-only, public data.",
  keywords: ["collateral contagion", "bridge risk", "restaking risk", "derivative depth", "Base DeFi risk"],
  alternates: { canonical: "/depth" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
