// Server-only real-data providers with graceful fallback to mock.
// Public data only. No keys are exposed to the client.
import { mockScan, mockContagion, ScanResult } from "@/lib/mock";

const BASE_CHAIN = "8453";
export const isAddr = (a: string) => /^0x[a-fA-F0-9]{40}$/.test(a || "");

async function jget(url: string) {
  const r = await fetch(url, { next: { revalidate: 300 } } as RequestInit);
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

// ---------- SCAN: GoPlus token security (keyless) ----------
// Invalid INPUT must never produce a safety verdict. A genuine upstream FAILURE
// may fall back to clearly-labelled MOCK sample data. These are different things.
const invalidScan = (reason: string): ScanResult & { source: "MOCK"; invalid: true } => ({
  level: "warn",
  liquidityUsd: 0, lpLocked: false, topHoldersPct: 0,
  honeypot: false, sellTaxPct: 0, ownerCanMint: false,
  contractVerified: false, ageDays: 0,
  reasons: [reason],
  source: "MOCK", invalid: true,
});

export async function getScan(address: string): Promise<ScanResult & { source: "LIVE" | "MOCK"; invalid?: boolean }> {
  if (!isAddr(address)) return invalidScan("Enter a valid Base token address (0x followed by 40 hex characters). No safety verdict is shown for invalid input.");
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

// ---------- LEDGER: Blockscout v2 transfers + DefiLlama USD + Frankfurter FX ----------
// HMRC matching order, ported from scripts/uk_tax_ledger.py (SQ-UKTAX):
//   1) same-day, 2) 30-day bed & breakfast (earliest first), 3) Section 104 pool.
// AEA GBP3,000. CGT 18% basic / 24% higher (since 30 Oct 2024, unchanged 2026/27).
const AEA_GBP = 3000;
const CGT_BASIC = 0.18;
const CGT_HIGHER = 0.24;

export type LedgerRow = {
  date: string; asset: string; qty: number;
  proceedsGbp: number; costGbp: number; gainGbp: number;
  selfTransferSuspect?: boolean;
  partialCostBasis?: boolean;
};

const emptyLedger = (note: string) => ({
  rows: [] as LedgerRow[], gain: 0, aea: AEA_GBP, taxable: 0,
  cgtBasic: 0, cgtHigher: 0,
  needsManualValuation: [] as string[],
  partialCostBasis: [] as string[],
  possibleSelfTransfers: [] as string[],
  source: "MOCK" as const, note,
});

export async function getLedger(address: string) {
  // Never invent GBP tax figures for bad input.
  if (!isAddr(address)) return emptyLedger("Enter a valid Base address (0x followed by 40 hex characters). No figures are shown for invalid input.");
  try {
    type BsItem = {
      timestamp: string;
      from?: { hash?: string };
      to?: { hash?: string; is_contract?: boolean };
      token?: { address_hash?: string; address?: string; symbol?: string; decimals?: string };
      total?: { value?: string; decimals?: string };
    };
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
    if (!items.length) return { ...emptyLedger("No ERC-20 transfers found for this wallet on Base."), source: "LIVE" as const };
    const addrL = address.toLowerCase();

    type Ev = { ts: number; date: string; contract: string; symbol: string; qty: number; dir: 1 | -1; toContract: boolean };
    const evs: Ev[] = items.map((it) => {
      const dec = Number(it.total?.decimals ?? it.token?.decimals ?? "18");
      const ts = Math.floor(Date.parse(it.timestamp) / 1000);
      return {
        ts,
        date: new Date(ts * 1000).toISOString().slice(0, 10),
        // Blockscout v2 field is `address_hash`; `address` kept as a defensive fallback.
        contract: (it.token?.address_hash || it.token?.address || "").toLowerCase(),
        symbol: it.token?.symbol || "?",
        qty: Number(it.total?.value || "0") / 10 ** dec,
        dir: ((it.to?.hash || "").toLowerCase() === addrL ? 1 : -1) as 1 | -1,
        toContract: it.to?.is_contract === true,
      };
    }).filter((e) => e.qty > 0 && e.contract && e.ts > 0);

    if (!evs.length) {
      return { ...emptyLedger(`Fetched ${items.length} transfers but could not normalise any of them (unexpected upstream schema). Showing no figures rather than a misleading GBP0.`), source: "LIVE" as const };
    }

    // Rounding to 12:00 UTC puts *today's* transfers in the FUTURE on any run before noon.
    // DefiLlama silently drops the ENTIRE coin for a future timestamp. Clamp to just-before-now.
    const nowSec = Math.floor(Date.now() / 1000);
    const dayTs = (ts: number) => Math.min(Math.floor(ts / 86400) * 86400 + 43200, nowSec - 300);
    const byToken: Record<string, number[]> = {};
    for (const e of evs) (byToken[e.contract] ||= []).push(e.ts);
    const coinsReq: Record<string, number[]> = {};
    for (const c of Object.keys(byToken)) coinsReq[`base:${c}`] = [...new Set(byToken[c].map(dayTs))].slice(0, 60);
    let priceData: Record<string, { prices?: { timestamp: number; price: number }[] }> = {};
    try {
      const pj = await jget(`https://coins.llama.fi/batchHistorical?coins=${encodeURIComponent(JSON.stringify(coinsReq))}&searchWidth=6h`);
      priceData = (pj?.coins || {}) as typeof priceData;
    } catch { /* leave empty -> unpriced */ }

    const fx = await gbpPerUsd();
    const priceGbpAt = (contract: string, ts: number): number | null => {
      const arr = priceData[`base:${contract}`]?.prices;
      if (!arr || !arr.length) return null;
      let best = arr[0], bd = Math.abs(best.timestamp - ts);
      for (const p of arr) { const dd = Math.abs(p.timestamp - ts); if (dd < bd) { bd = dd; best = p; } }
      return best.price * fx;
    };

    const byContract: Record<string, Ev[]> = {};
    for (const e of evs) (byContract[e.contract] ||= []).push(e);

    const rows: LedgerRow[] = [];
    // Two DIFFERENT conditions. Do not merge them again.
    //   needsManualValuation: asset had an unpriced event -> skipped entirely, EXCLUDED from totals.
    //   partialCostBasis:     disposal had residual qty after all three matching rules -> counted,
    //                         but only the matched portion contributed allowable cost.
    const needsManualValuation = new Set<string>();
    const partialCostBasis = new Set<string>();
    const possibleSelfTransfers = new Set<string>();
    let totalGain = 0;

    for (const [contract, list] of Object.entries(byContract)) {
      const priced = list.map((e) => ({ ...e, price: priceGbpAt(contract, e.ts) }));
      // An asset with ANY unpriced event has an unknowable cost basis. Exclude it from the
      // totals entirely. Never book it at cost 0 — that would overstate the gain.
      if (priced.some((e) => e.price == null)) {
        if (priced.some((e) => e.dir === -1)) needsManualValuation.add(list[0].symbol);
        continue;
      }

      type Acq = { date: string; qty: number; remaining: number; cpu: number };
      const acqs: Acq[] = priced.filter((e) => e.dir === 1)
        .map((e) => ({ date: e.date, qty: e.qty, remaining: e.qty, cpu: e.price as number }));
      const sells = priced.filter((e) => e.dir === -1).sort((a, b) => a.ts - b.ts);

      for (const s of sells) {
        let q = s.qty;
        const proceeds = s.qty * (s.price as number);
        let matchedCost = 0;

        const take = (pool: Acq[]) => {
          for (const a of pool) {
            if (q <= 1e-12) break;
            if (a.remaining <= 1e-12) continue;
            const tq = Math.min(a.remaining, q);
            matchedCost += tq * a.cpu;
            a.remaining -= tq; q -= tq;
          }
        };
        const dayMs = (d: string) => Date.parse(d + "T00:00:00Z");
        const sd = dayMs(s.date);

        take(acqs.filter((a) => dayMs(a.date) === sd));                                       // 1 same-day
        take(acqs.filter((a) => dayMs(a.date) > sd && dayMs(a.date) <= sd + 30 * 86400000)    // 2 30-day B&B
                 .sort((a, b) => dayMs(a.date) - dayMs(b.date)));
        const pool = acqs.filter((a) => dayMs(a.date) <= sd && a.remaining > 1e-12);          // 3 Section 104
        const poolQty = pool.reduce((t, a) => t + a.remaining, 0);
        if (q > 1e-12 && poolQty > 1e-12) {
          const avg = pool.reduce((t, a) => t + a.remaining * a.cpu, 0) / poolQty;
          const tq = Math.min(q, poolQty);
          matchedCost += tq * avg;
          for (const a of pool) a.remaining -= tq * (a.remaining / poolQty);
          q -= tq;
        }

        // Residual quantity with no matching acquisition inside the read window.
        // The row is still counted, but its allowable cost is understated.
        const isPartial = q > 1e-12;
        if (isPartial) partialCostBasis.add(s.symbol);

        // A transfer to a non-contract address may be a move between the user's own wallets,
        // which is not a disposal. Flag it; do not silently drop it (gifts ARE disposals).
        const selfTransferSuspect = !s.toContract;
        if (selfTransferSuspect) possibleSelfTransfers.add(s.symbol);

        const gain = proceeds - matchedCost;
        totalGain += gain;
        rows.push({
          date: s.date, asset: s.symbol, qty: Number(s.qty.toFixed(4)),
          proceedsGbp: Math.round(proceeds), costGbp: Math.round(matchedCost), gainGbp: Math.round(gain),
          selfTransferSuspect, partialCostBasis: isPartial,
        });
      }
    }

    rows.sort((a, b) => (a.date < b.date ? 1 : -1));
    const gain = Math.round(totalGain);
    const taxable = Math.max(0, gain - AEA_GBP);
    const cgtBasic = Math.round(taxable * CGT_BASIC);
    const cgtHigher = Math.round(taxable * CGT_HIGHER);

    const note = [
      `Live: Base Blockscout transfers + DefiLlama historical USD prices at GBP FX ${fx.toFixed(3)}. HMRC matching applied in order: same-day, 30-day bed & breakfast, then Section 104 pool.`,
      needsManualValuation.size ? `EXCLUDED from every figure above — no price data, so cost basis is unknowable: ${[...needsManualValuation].slice(0, 6).join(", ")}. These disposals are real; value them manually.` : "",
      partialCostBasis.size ? `COUNTED but with incomplete cost basis: ${[...partialCostBasis].slice(0, 6).join(", ")}. Part of the disposed quantity had no matching acquisition inside the window read, so the allowable cost is understated and the gain overstated.` : "",
      possibleSelfTransfers.size ? `FLAGGED and still counted: ${[...possibleSelfTransfers].slice(0, 6).join(", ")} were sent to non-contract addresses. If those are your own wallets they are NOT disposals — exclude them yourself.` : "",
      `Only the most recent ${items.length} ERC-20 transfers were read; FX is current, not historical. CGT is shown at both bands because it depends on your income. Estimate only — verify before filing.`,
    ].filter(Boolean).join(" ");

    return {
      rows: rows.slice(0, 20), gain, aea: AEA_GBP, taxable, cgtBasic, cgtHigher,
      fxGbpUsd: Number(fx.toFixed(4)),
      needsManualValuation: [...needsManualValuation],
      partialCostBasis: [...partialCostBasis],
      possibleSelfTransfers: [...possibleSelfTransfers],
      source: "LIVE" as const, note,
    };
  } catch {
    return emptyLedger("Live data call failed. No figures are shown rather than misleading ones. Try again shortly.");
  }
}

async function gbpPerUsd(): Promise<number> {
  try {
    const j = await jget("https://api.frankfurter.app/latest?from=USD&to=GBP");
    const g = j?.rates?.GBP;
    return typeof g === "number" && g > 0 ? g : 0.79;
  } catch { return 0.79; }
}
