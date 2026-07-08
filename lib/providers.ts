// Server-only real-data providers with graceful fallback to mock.
// Public data only. No keys are exposed to the client.
import { mockScan, mockContagion, mockLedger, ScanResult } from "@/lib/mock";

const BASE_CHAIN = "8453";
export const isAddr = (a: string) => /^0x[a-fA-F0-9]{40}$/.test(a || "");

async function jget(url: string) {
  const r = await fetch(url, { next: { revalidate: 300 } } as RequestInit);
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

// ---------- SCAN: GoPlus token security (keyless) ----------
export async function getScan(address: string): Promise<ScanResult & { source: "LIVE" | "MOCK" }> {
  if (!isAddr(address)) return { ...mockScan(address), source: "MOCK" };
  try {
    const j = await jget(`https://api.gopluslabs.io/api/v1/token_security/${BASE_CHAIN}?contract_addresses=${address}`);
    const d = j?.result?.[address.toLowerCase()];
    if (!d) return { ...mockScan(address), source: "MOCK" };
    const honeypot = d.is_honeypot === "1";
    const sellTaxPct = Math.round(parseFloat(d.sell_tax || "0") * 100);
    const ownerCanMint = d.is_mintable === "1";
    const contractVerified = d.is_open_source === "1";
    const holders = Array.isArray(d.holders) ? d.holders : [];
    const topHoldersPct = Math.round(holders.slice(0, 10).reduce((a: number, h: { percent?: string }) => a + parseFloat(h.percent || "0") * 100, 0));
    const lpHolders = Array.isArray(d.lp_holders) ? d.lp_holders : [];
    const lpLocked = lpHolders.some((h: { is_locked?: number }) => h.is_locked === 1);
    const dex = Array.isArray(d.dex) ? d.dex : [];
    const liquidityUsd = Math.round(dex.reduce((a: number, x: { liquidity?: string }) => a + parseFloat(x.liquidity || "0"), 0));
    // Trusted-token signal: a verified, non-honeypot, zero-tax, non-mintable token
    // with real holders is treated as blue-chip — missing LP-lock data is not penalised.
    const hasLpData = lpHolders.length > 0 || liquidityUsd > 0;
    const blueChip = contractVerified && !honeypot && sellTaxPct === 0 && !ownerCanMint && topHoldersPct <= 60;

    const reasons: string[] = [];
    if (honeypot) reasons.push("Sell simulation failed — possible honeypot.");
    if (sellTaxPct > 10) reasons.push(`High sell tax (${sellTaxPct}%).`);
    if (topHoldersPct > 60) reasons.push(`Top-10 wallets hold ${topHoldersPct}%.`);
    if (hasLpData && !lpLocked) reasons.push("Liquidity does not appear locked.");
    if (ownerCanMint) reasons.push("Owner can mint more supply.");
    if (!contractVerified) reasons.push("Contract source not verified.");
    if (d.is_proxy === "1") reasons.push(blueChip ? "Upgradeable proxy (expected for many blue-chip tokens)." : "Upgradeable proxy contract.");
    if (reasons.length === 0) reasons.push("No major red flags in public data.");

    const level: ScanResult["level"] =
      honeypot || topHoldersPct > 80 || (hasLpData && !lpLocked && !blueChip) ? "danger"
      : blueChip ? "ok"
      : sellTaxPct > 10 || ownerCanMint || !contractVerified || topHoldersPct > 60 ? "warn"
      : "ok";
    return { level, liquidityUsd, lpLocked, topHoldersPct, honeypot, sellTaxPct, ownerCanMint, contractVerified, ageDays: 0, reasons, source: "LIVE" };
  } catch {
    return { ...mockScan(address), source: "MOCK" };
  }
}

// ---------- DEPTH: DefiLlama real Base TVL context + heuristic tier ----------
export async function getContagion(address: string) {
  const base = mockContagion(address);
  try {
    const chains = await jget("https://api.llama.fi/v2/chains");
    const baseTvl = Array.isArray(chains) ? chains.find((c: { name?: string }) => c.name === "Base")?.tvl : undefined;
    if (typeof baseTvl === "number") {
      return { ...base, baseTvlUsd: Math.round(baseTvl),
        flags: [...base.flags, `Base chain TVL context: $${Math.round(baseTvl).toLocaleString()} (DefiLlama, live).`],
        source: "LIVE" as const };
    }
  } catch { /* fall through */ }
  return { ...base, baseTvlUsd: 0, source: "MOCK" as const };
}

// ---------- LEDGER: Blockscout v2 transfers + DefiLlama USD + Frankfurter FX (S104) ----------
type PriceSeries = [number, number][];

export async function getLedger(address: string) {
  if (!isAddr(address)) return { ...mockLedger(address), source: "MOCK" as const, note: "Invalid address — showing sample." };
  try {
    // Base Blockscout v2 REST — bounded pages (fast, keyless). Avoids pulling full history.
    type BsItem = { timestamp: string; from?: { hash?: string }; to?: { hash?: string }; token?: { address_hash?: string; address?: string; symbol?: string; decimals?: string }; total?: { value?: string; decimals?: string } };
    let items: BsItem[] = [];
    let next = `https://base.blockscout.com/api/v2/addresses/${address}/token-transfers?type=ERC-20`;
    for (let page = 0; page < 3 && next; page++) {
      const pj = await jget(next);
      const its = (Array.isArray(pj?.items) ? pj.items : []) as BsItem[];
      items = items.concat(its);
      const np = pj?.next_page_params as Record<string, string> | null | undefined;
      next = np ? `https://base.blockscout.com/api/v2/addresses/${address}/token-transfers?type=ERC-20&${new URLSearchParams(np).toString()}` : "";
      if (items.length >= 150) break;
    }
    if (!items.length) return { rows: [], gain: 0, aea: 3000, taxable: 0, cgt: 0, source: "LIVE" as const, note: "No ERC-20 transfers found for this wallet on Base." };
    const addrL = address.toLowerCase();

    type Ev = { ts: number; contract: string; symbol: string; qty: number; dir: 1 | -1 };
    const evs: Ev[] = items.map((it) => {
      const dec = Number(it.total?.decimals ?? it.token?.decimals ?? "18");
      return {
        ts: Math.floor(Date.parse(it.timestamp) / 1000),
        contract: (it.token?.address_hash || it.token?.address || "").toLowerCase(),
        symbol: it.token?.symbol || "?",
        qty: Number(it.total?.value || "0") / 10 ** dec,
        dir: ((it.to?.hash || "").toLowerCase() === addrL ? 1 : -1) as 1 | -1,
      };
    }).filter((e) => e.qty > 0 && e.contract && e.ts > 0);

    // FIX-3: transfers existed but none normalised — surface it, never a silent £0.
    if (!evs.length) {
      return { rows: [], gain: 0, aea: 3000, taxable: 0, cgt: 0, source: "LIVE" as const,
        note: `Fetched ${items.length} transfers but could not normalise any of them (unexpected upstream schema). Showing no figures rather than a misleading £0.` };
    }

    // DefiLlama batch historical USD prices (keyless): one call for all tokens+timestamps.
    const byToken: Record<string, number[]> = {};
    for (const e of evs) (byToken[e.contract] ||= []).push(e.ts);
    // FIX-4 (critical): rounding to 12:00 UTC puts *today's* transfers in the FUTURE
    // (any run before noon). DefiLlama silently drops the ENTIRE coin for a future
    // timestamp, so every token came back unpriced. Clamp to just-before-now.
    const nowSec = Math.floor(Date.now() / 1000);
    const dayTs = (ts: number) => Math.min(Math.floor(ts / 86400) * 86400 + 43200, nowSec - 300);
    const coinsReq: Record<string, number[]> = {};
    for (const c of Object.keys(byToken)) coinsReq[`base:${c}`] = [...new Set(byToken[c].map(dayTs))].slice(0, 60);
    let priceData: Record<string, { prices?: { timestamp: number; price: number }[] }> = {};
    try {
      const pj = await jget(`https://coins.llama.fi/batchHistorical?coins=${encodeURIComponent(JSON.stringify(coinsReq))}&searchWidth=6h`);
      priceData = (pj?.coins || {}) as typeof priceData;
    } catch { /* leave empty -> unpriced */ }

    const fx = await gbpPerUsd(); // GBP per USD
    const priceGbpAt = (contract: string, ts: number): number | null => {
      const d = priceData[`base:${contract}`];
      const arr = d?.prices;
      if (!arr || !arr.length) return null;
      let best = arr[0], bd = Math.abs(best.timestamp - ts);
      for (const p of arr) { const dd = Math.abs(p.timestamp - ts); if (dd < bd) { bd = dd; best = p; } }
      return best.price * fx;
    };

    // FIX-2: a pool whose acquisitions could not all be priced has an UNKNOWN cost basis.
    // Booking its disposals would set cost=0 and OVERSTATE the gain. Quarantine instead.
    const pools: Record<string, { qty: number; cost: number; tainted: boolean }> = {};
    const rows: { date: string; asset: string; qty: number; proceedsGbp: number; costGbp: number; gainGbp: number }[] = [];
    let totalGain = 0;
    const unpriced = new Set<string>();
    const needsReview = new Set<string>();
    for (const e of evs.sort((a, b) => a.ts - b.ts)) {
      const price = priceGbpAt(e.contract, e.ts);
      const p = (pools[e.contract] ||= { qty: 0, cost: 0, tainted: false });

      if (e.dir === 1) {
        if (price == null) { unpriced.add(e.symbol); p.qty += e.qty; p.tainted = true; }
        else { p.qty += e.qty; p.cost += e.qty * price; }
        continue;
      }

      if (price == null) { unpriced.add(e.symbol); needsReview.add(e.symbol); continue; }
      if (p.tainted) { needsReview.add(e.symbol); p.qty = Math.max(0, p.qty - e.qty); continue; }
      if (p.qty <= 0) needsReview.add(e.symbol);

      const proceeds = e.qty * price;
      const costPortion = p.qty > 0 ? p.cost * (Math.min(e.qty, p.qty) / p.qty) : 0;
      const gain = proceeds - costPortion;
      p.qty = Math.max(0, p.qty - e.qty); p.cost = Math.max(0, p.cost - costPortion);
      totalGain += gain;
      rows.push({ date: new Date(e.ts * 1000).toISOString().slice(0, 10), asset: e.symbol, qty: Number(e.qty.toFixed(4)), proceedsGbp: Math.round(proceeds), costGbp: Math.round(costPortion), gainGbp: Math.round(gain) });
    }
    const gain = Math.round(totalGain), aea = 3000, taxable = Math.max(0, gain - aea), cgt = Math.round(taxable * 0.24);
    const note = [
      `Live: Base Blockscout transfers + DefiLlama historical USD prices at GBP FX ${fx.toFixed(3)}, S104 pooled.`,
      unpriced.size ? `Unpriced (no DefiLlama price): ${[...unpriced].slice(0, 6).join(", ")}.` : "",
      needsReview.size ? `EXCLUDED from the CGT total — cost basis could not be established: ${[...needsReview].slice(0, 6).join(", ")}. These disposals are real; value them manually.` : "",
      `Only the most recent ${items.length} ERC-20 transfers were read, FX is current (not historical), and pre-window holdings may understate cost basis. Estimate only — verify before filing.`,
    ].filter(Boolean).join(" ");
    return { rows: rows.slice(-20).reverse(), gain, aea, taxable, cgt, fxGbpUsd: Number(fx.toFixed(4)), needsReview: [...needsReview], source: "LIVE" as const, note };
  } catch {
    return { ...mockLedger(address), source: "MOCK" as const, note: "Live call failed — showing sample." };
  }
}

async function gbpPerUsd(): Promise<number> {
  try {
    const j = await jget("https://api.frankfurter.app/latest?from=USD&to=GBP");
    const g = j?.rates?.GBP;
    return typeof g === "number" && g > 0 ? g : 0.79;
  } catch { return 0.79; }
}
