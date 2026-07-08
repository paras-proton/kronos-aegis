import type { Metadata } from "next";
import { Card, Eyebrow, G } from "@/components/ui";
import GlowCard from "@/components/GlowCard";

export const metadata: Metadata = {
  title: "Learn — CARF, UK crypto tax & derivative depth | KRONOS Aegis",
  description: "Plain-English explainers on the OECD CARF crypto reporting framework, how UK Capital Gains Tax on crypto works, spotting real edge vs luck, and what derivative/collateral depth means on Base.",
  keywords: ["CARF crypto", "UK crypto tax", "Capital Gains Tax crypto", "derivative depth", "collateral risk", "onchain safety explainer"],
  alternates: { canonical: "/learn" },
};

export default function Learn() {
  const items: [string, string, string][] = [
    ["What is CARF?", "The OECD Crypto-Asset Reporting Framework requires exchanges/platforms to report user crypto activity to tax authorities. UK users should expect their on-chain activity to be increasingly visible to HMRC.", G.amber],
    ["How UK CGT works", "You may owe Capital Gains Tax on disposals (selling, swapping, spending). There's an annual exempt amount, and rates depend on your income band. Keep records of cost and proceeds in GBP.", G.cyan],
    ["Real edge vs luck", "A backtest that only looks good in one window is usually luck. Honest testing uses out-of-sample walk-forward and corrects for how many ideas were tried (multiple-testing).", G.violet],
    ["Derivative depth", "When a token is backed by another token backed by another (staking → restaking → bridged), a failure deep in the chain can cascade. 'Depth' measures how many layers of risk you're really holding.", G.amber],
  ];
  return (
    <div className="space-y-6">
      <GlowCard gradient={G.amber}>
        <Eyebrow>Learn</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold text-white">Honest, plain-English explainers</h1>
        <p className="mt-2 text-gray-400 max-w-2xl">Short, jargon-free guides to on-chain safety, UK crypto tax and collateral risk on Base.</p>
      </GlowCard>
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map(([t, d, g]) => (
          <Card key={t} gradient={g}>
            <div className="font-medium text-white">{t}</div>
            <p className="text-sm text-gray-400 mt-2">{d}</p>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted">Educational only. Not financial or tax advice.</p>
    </div>
  );
}
