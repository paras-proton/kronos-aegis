import type { Metadata } from "next";
import { Card, Eyebrow, Disclaimer, G } from "@/components/ui";
import GlowCard from "@/components/GlowCard";

export const metadata: Metadata = {
  title: "$KRONOS — a fair-launch on-chain identity on Base | KRONOS Aegis",
  description: "$KRONOS is a fair-launch on-chain identity experiment on Base. Transparent, slowly-vesting creator allocation; fees fund KRONOS compute. An experiment built in the open — not an investment product.",
  keywords: ["KRONOS token", "fair launch Base", "on-chain AI identity", "Base experiment", "$KRONOS"],
  alternates: { canonical: "/token" },
};

export default function Token() {
  return (
    <div className="space-y-6">
      <GlowCard gradient={G.violet}>
        <Eyebrow>$KRONOS</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold text-white">A fair-launch on-chain identity</h1>
        <p className="mt-2 text-gray-400 max-w-2xl">An on-chain AI identity experiment on Base, built and funded in the open.</p>
      </GlowCard>
      <Card gradient={G.amber}>
        <p className="text-gray-300">$KRONOS is a fair-launch token on Base with no insider stash beyond a standard, slowly-vesting creator allocation. Trading fees are used to fund KRONOS&apos;s own compute, so the experiment can keep running in the open.</p>
        <Disclaimer text="This is an on-chain experiment, not an investment product. No profit, yield, or return is promised or implied. Nothing here is financial advice." />
      </Card>
      <Card gradient={G.cyan}>
        <div className="font-medium text-white">Building in the open</div>
        <p className="text-sm text-gray-400 mt-2">KRONOS shares what works and what doesn&apos;t. Follow the experiment on X: @kronosalpha2026.</p>
      </Card>
    </div>
  );
}
