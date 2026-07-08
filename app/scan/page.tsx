"use client";
import { useState } from "react";
import { Card, Eyebrow, Light, Disclaimer, Stat, G } from "@/components/ui";
import { ScanResult } from "@/lib/mock";
import GlowCard from "@/components/GlowCard";

type Res = ScanResult & { source: "LIVE" | "MOCK" };
const isAddr = (a: string) => /^0x[a-fA-F0-9]{40}$/.test(a || "");
function Badge({ source }: { source: "LIVE" | "MOCK" }) {
  return <span className={`font-mono text-[11px] px-2 py-0.5 rounded-full border ${source === "LIVE" ? "border-ok text-ok" : "border-warn text-warn"}`}>{source}</span>;
}

export default function Scan() {
  const [addr, setAddr] = useState("");
  const [res, setRes] = useState<Res | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setRes(null); setErr(null);
    if (!isAddr(addr.trim())) { setErr("Enter a valid Base token address — 0x followed by 40 hex characters."); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/scan", { method: "POST", body: JSON.stringify({ address: addr.trim() }) });
      setRes(await r.json());
    } catch { setErr("Live scan failed. Please try again shortly."); } finally { setLoading(false); }
  };
  return (
    <div className="space-y-6">
      <GlowCard gradient={G.amber}>
        <Eyebrow>Scan · pre-commit safety</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold text-white">Check a token before you commit</h1>
      </GlowCard>
      <Card gradient={G.amber}>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Base token address — 0x…"
            className="flex-1 rounded-xl bg-elevated border border-edge px-4 py-3 font-mono text-sm outline-none focus:border-accent" />
          <button onClick={run} disabled={loading} className="rounded-xl bg-accent text-bg font-medium px-5 py-3 hover:brightness-110 disabled:opacity-60">{loading ? "Scanning…" : "Scan token"}</button>
        </div>
        <p className="mt-2 text-xs text-gray-400">Live via GoPlus token-security (public). Falls back to sample data if unavailable.</p>
        {err && <p className="mt-2 text-sm text-warn">{err}</p>}
      </Card>
      {res && (
        <Card gradient={G.amber}>
          <div className="flex items-center justify-between"><Light level={res.level} /><Badge source={res.source} /></div>
          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <Stat label="Liquidity (USD)" value={`$${(res.liquidityUsd || 0).toLocaleString()}`} />
            <Stat label="Top-10 holders" value={`${res.topHoldersPct}%`} />
            <Stat label="Sell tax" value={`${res.sellTaxPct}%`} />
            <Stat label="LP locked" value={res.lpLocked ? "Yes" : "No"} />
            <Stat label="Owner can mint" value={res.ownerCanMint ? "Yes" : "No"} />
            <Stat label="Verified" value={res.contractVerified ? "Yes" : "No"} />
          </div>
          <ul className="mt-4 space-y-1 text-sm">{res.reasons.map((r, i) => <li key={i} className="text-gray-400">• {r}</li>)}</ul>
          <Disclaimer text="Risk information from public data — not financial advice and not a recommendation to buy or sell." />
        </Card>
      )}
    </div>
  );
}
