// MOCK data + deterministic helpers. Swap for public APIs (BaseScan/GoPlus/DefiLlama/FX) behind these interfaces.
export type ScanResult = {
  level: "ok" | "warn" | "danger";
  liquidityUsd: number; lpLocked: boolean; topHoldersPct: number;
  honeypot: boolean; sellTaxPct: number; ownerCanMint: boolean;
  contractVerified: boolean; ageDays: number; reasons: string[];
};
function seed(addr: string) { let s = 0; for (const c of addr) s = (s * 31 + c.charCodeAt(0)) >>> 0; return s; }
export function mockScan(addr: string): ScanResult {
  const s = seed(addr || "0x0"); const r = (n: number) => (s >> n) & 0xff;
  const topHoldersPct = 20 + (r(3) % 70);
  const honeypot = r(1) % 7 === 0;
  const sellTaxPct = r(5) % 16;
  const ownerCanMint = r(7) % 3 === 0;
  const lpLocked = r(2) % 3 !== 0;
  const contractVerified = r(4) % 4 !== 0;
  const liquidityUsd = 2000 + (r(6) % 500) * 900;
  const ageDays = r(0) % 400;
  const reasons: string[] = [];
  if (honeypot) reasons.push("Sell simulation failed — possible honeypot.");
  if (sellTaxPct > 10) reasons.push(`High sell tax (${sellTaxPct}%).`);
  if (topHoldersPct > 60) reasons.push(`Top-10 wallets hold ${topHoldersPct}%.`);
  if (!lpLocked) reasons.push("Liquidity is not locked.");
  if (ownerCanMint) reasons.push("Owner can mint more supply.");
  if (!contractVerified) reasons.push("Contract source not verified.");
  if (reasons.length === 0) reasons.push("No major red flags in public data.");
  const level: ScanResult["level"] = honeypot || topHoldersPct > 70 || !lpLocked ? "danger"
    : sellTaxPct > 10 || ownerCanMint || !contractVerified ? "warn" : "ok";
  return { level, liquidityUsd, lpLocked, topHoldersPct, honeypot, sellTaxPct, ownerCanMint, contractVerified, ageDays, reasons };
}

export type ContagionNode = { label: string; tier: 1 | 2 | 3 | 4; note: string };
export function mockContagion(addr: string): { tier: 1 | 2 | 3 | 4; ratio: string; chain: ContagionNode[]; flags: string[] } {
  const chain: ContagionNode[] = [
    { label: "ETH", tier: 1, note: "Base collateral" },
    { label: "stETH", tier: 2, note: "Liquid staking" },
    { label: "rsETH", tier: 3, note: "Restaked / rehypothecated" },
    { label: "bridged-rsETH (Base)", tier: 4, note: "Cross-chain bridge dependency" },
  ];
  const tier = (2 + (seed(addr) % 3)) as 2 | 3 | 4;
  const flags = tier >= 4 ? ["Depends on a 1-of-1 DVN bridge", "Depth-4 rehypothecation"] : ["Moderate collateral depth"];
  const ratio = tier >= 4 ? "~45:1 contagion (illustrative)" : "~8:1 contagion (illustrative)";
  return { tier, ratio, chain: chain.slice(0, tier), flags };
}

export type Disposal = { date: string; asset: string; proceedsGbp: number; costGbp: number; gainGbp: number };
export function mockLedger(addr: string) {
  const s = seed(addr); const rows: Disposal[] = [];
  const assets = ["ETH", "USDC", "cbBTC", "AERO", "DEGEN"];
  for (let i = 0; i < 6; i++) {
    const proceeds = 200 + ((s >> i) % 40) * 55;
    const cost = 150 + ((s >> (i + 2)) % 40) * 50;
    rows.push({ date: `2026-0${(i % 6) + 1}-1${i}`, asset: assets[i % assets.length], proceedsGbp: proceeds, costGbp: cost, gainGbp: proceeds - cost });
  }
  const gain = rows.reduce((a, r) => a + r.gainGbp, 0);
  const aea = 3000; const taxable = Math.max(0, gain - aea); const cgt = Math.round(taxable * 0.24);
  return { rows, gain, aea, taxable, cgt };
}
