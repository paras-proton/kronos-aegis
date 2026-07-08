"use client";
import { useState } from "react";
import { Card, Eyebrow, Disclaimer, Stat, G } from "@/components/ui";
import GlowCard from "@/components/GlowCard";

type Node = { label: string; tier: number; note: string };
type Res = { tier: number; ratio: string; chain: Node[]; flags: string[]; baseTvlUsd?: number; source: "LIVE" | "MOCK" };
function Badge({ source }: { source: "LIVE" | "MOCK" }) {
  return <span className={`font-mono text-[11px] px-2 py-0.5 rounded-full border ${source === "LIVE" ? "border-ok text-ok" : "border-warn text-warn"}`}>{source}</span>;
}

export default function Depth() {
  const [addr, setAddr] = useState("");
  const [d, setD] = useState<Res | null>(null);
  const [loading, setLoading] = useState(false);
  const tierColor = (t: number) => t >= 4 ? "border-danger text-danger" : t === 3 ? "border-warn text-warn" : "border-ok text-ok";
  const run = async () => {
    setLoading(true);
    try { const r = await fetch("/api/depth", { method: "POST", body: JSON.stringify({ address: addr }) }); setD(await r.json()); }
    catch { setD(null); } finally { setLoading(false); }
  };
  return (
    <div className="space-y-6">
      <GlowCard gradient={G.cyan}>
        <Eyebrow>Depth · hold-time risk</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold text-white">Collateral contagion radar</h1>
        <p className="mt-2 text-gray-400 max-w-2xl">Maps the recursive collateral / bridge chain behind a Base asset. Deep rehypothecation and single-point bridges raise contagion risk — the thing token scanners miss.</p>
      </GlowCard>
      <Card gradient={G.cyan}>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Token address — 0x…"
            className="flex-1 rounded-xl bg-elevated border border-edge px-4 py-3 font-mono text-sm outline-none focus:border-accent" />
          <button onClick={run} disabled={loading} className="rounded-xl bg-accent text-bg font-medium px-5 py-3 hover:brightness-110 disabled:opacity-60">{loading ? "Mapping…" : "Map collateral chain"}</button>
        </div>
        <p className="mt-2 text-xs text-gray-400">Live Base TVL context via DefiLlama (public). Tier model is an illustrative heuristic.</p>
      </Card>
      {d && (
        <Card gradient={G.cyan}>
          <div className="flex items-center justify-between mb-3"><span className="text-sm text-gray-400">Result</span><Badge source={d.source} /></div>
          <div className="grid sm:grid-cols-2 gap-3"><Stat label="Derivative tier (1–4)" value={`Tier ${d.tier}`} /><Stat label="Contagion (illustrative)" value={d.ratio} /></div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {d.chain.map((n, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`rounded-xl border ${tierColor(n.tier)} bg-elevated px-3 py-2`}>
                  <div className="font-mono text-sm">{n.label}</div><div className="text-[11px] text-muted">{n.note}</div>
                </div>
                {i < d.chain.length - 1 && <span className="text-muted">→</span>}
              </div>
            ))}
          </div>
          <ul className="mt-4 space-y-1 text-sm">{d.flags.map((f, i) => <li key={i} className="text-gray-400">• {f}</li>)}</ul>
          <Disclaimer text="Illustrative risk information from public data. Not financial advice." />
        </Card>
      )}
    </div>
  );
}
