import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "UK crypto tax (CARF / CGT) reconstruction for Base wallets | KRONOS Aegis",
  description: "Reconstruct disposals from public Base history and value them in GBP by block timestamp to prepare UK CARF / Self-Assessment CGT figures. Data reconstruction from public sources — not tax advice.",
  keywords: ["UK crypto tax", "CARF", "Capital Gains Tax crypto", "SA108", "crypto tax reconstruction", "Base wallet tax"],
  alternates: { canonical: "/ledger" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
