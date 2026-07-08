"use client";
import { useState } from "react";
import { Card, Eyebrow, Disclaimer, Stat, G } from "@/components/ui";
import GlowCard from "@/components/GlowCard";

type Row = { date: string; asset: string; proceedsGbp: number; costGbp: number; gainGbp: number; qty?: number; selfTransferSuspect?: boolean };
type Res = { rows: Row[]; gain: number; aea: number; taxable: number; cgtBasic: number; cgtHigher: number; fxGbpUsd?: number; source: "LIVE" | "MOCK"; note?: string; needsManualValuation?: string[]; possibleSelfTransfers?: string[] };
const gbp = (n: number) => `£${(n ?? 0).toLocaleString()}`;
function Badge({ source }: { source: "LIVE" | "MOCK" }) {
  return <span className={`font-mono text-[11px] px-2 py-0.5 rounded-full border ${source === "LIVE" ? "border-ok text-ok" : "border-warn text-warn"}`}>{source}</span>;
}

export default function Ledger() {
  const [addr, setAddr] = useState("");
  const [l, setL] = useState<Res | null>(null);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    try { const r = await fetch("/api/ledger", { method: "POST", body: JSON.stringify({ address: addr }) }); setL(await r.json()); }
    catch { setL(null); } finally { setLoading(false); }
  };
  return (
    <div className="space-y-6">
      <GlowCard gradient={G.violet}>
        <Eyebrow>Ledger · post-sell (UK CARF)</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold text-white">UK CGT reconstruction</h1>
        <p className="mt-2 text-gray-400 max-w-2xl">Reconstructs disposals from public transaction history and values them in GBP by block timestamp, so you can prepare CARF/Self-Assessment figures. This is data reconstruction, not tax advice.</p>
      </GlowCard>
      <Card gradient={G.violet}>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Wallet address — 0x…"
            className="flex-1 rounded-xl bg-elevated border border-edge px-4 py-3 font-mono text-sm outline-none focus:border-accent" />
          <button onClick={run} disabled={loading} className="rounded-xl bg-accent text-bg font-medium px-5 py-3 hover:brightness-110 disabled:opacity-60">{loading ? "Reading…" : "Reconstruct wallet"}</button>
        </div>
        <p className="mt-2 text-xs text-gray-400">Live disposals via Base Blockscout + DefiLlama USD prices + Frankfurter GBP FX — no API key needed.</p>
      </Card>
      {l && (
        <Card gradient={G.violet}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">{l.fxGbpUsd ? `FX: 1 USD = £${l.fxGbpUsd}` : "Result"}</span>
            <Badge source={l.source} />
          </div>
          <div className="grid sm:grid-cols-4 gap-3">
            <Stat label="Total gain" value={gbp(l.gain)} />
            <Stat label="Annual exempt amt" value={gbp(l.aea)} />
            <Stat label="Taxable gain" value={gbp(l.taxable)} />
            <Stat label="Est. CGT — 18% basic / 24% higher" value={`${gbp(l.cgtBasic)} / ${gbp(l.cgtHigher)}`} />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead className="text-muted text-left"><tr><th className="py-2">Date</th><th>Asset</th><th className="text-right">Qty</th><th className="text-right">Proceeds £</th><th className="text-right">Gain £</th></tr></thead>
              <tbody>{l.rows.map((r, i) => (
                <tr key={i} className="border-t border-edge"><td className="py-2">{r.date}</td><td>{r.asset}{r.selfTransferSuspect && <span title="Sent to a non-contract address — may be your own wallet, which is not a disposal" className="ml-2 text-[10px] px-1.5 py-0.5 rounded border border-warn text-warn">self?</span>}</td><td className="text-right">{r.qty ?? "—"}</td><td className="text-right">{gbp(r.proceedsGbp)}</td><td className={`text-right ${r.gainGbp >= 0 ? "text-ok" : "text-danger"}`}>{gbp(r.gainGbp)}</td></tr>
              ))}</tbody>
            </table>
          </div>
          {l.rows.length === 0 && <p className="mt-3 text-sm text-warn">No priced disposals to report for this wallet in the window read.</p>}
          {l.note && <p className="mt-3 text-xs text-muted">{l.note}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="https://www.gov.uk/log-in-register-hmrc-online-services" target="_blank" rel="noreferrer" className="rounded-xl border border-edge px-4 py-2 text-sm hover:bg-elevated">Open HMRC Gateway ↗</a>
          </div>
          <Disclaimer text="Data reconstruction from public sources — NOT tax advice. Figures are estimates; verify with a qualified adviser before filing. KRONOS Aegis never files anything for you." />
        </Card>
      )}
    </div>
  );
}
