"use client";
import { useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Typewriter from "@/components/Typewriter";
import ShinyText from "@/components/ShinyText";
import AuroraBackground from "@/components/AuroraBackground";
import GlowCard from "@/components/GlowCard";

const PILLS = [
  ["Scan a token", "/scan"],
  ["Map contagion", "/depth"],
  ["Reconstruct tax", "/ledger"],
  ["Agent API", "/agents"],
];

const INSTRUMENTS = [
  { t: "Scan", d: "Paste any Base token and get an honest read: liquidity and LP-lock, holder concentration, honeypot / sell-tax simulation, owner privileges, verification.", href: "/scan", tag: "Before you commit", g: "linear-gradient(137deg, #F5A524 0%, #E8B341 45%, #E5484D 100%)" },
  { t: "Depth", d: "Trace the recursive collateral chain behind an asset (staking, restaking, bridge) and see the Derivative Tier and single-point bridge risk that token scanners miss.", href: "/depth", tag: "While you hold", g: "linear-gradient(137deg, #7DD3FC 0%, #3B9EFF 45%, #7C5CFF 100%)" },
  { t: "Ledger", d: "Reconstruct disposals from public history, value them in GBP by block timestamp, and get CARF / Self-Assessment figures. Data reconstruction, not tax advice.", href: "/ledger", tag: "When you file", g: "linear-gradient(137deg, #7C5CFF 0%, #B48CFF 45%, #E8B341 100%)" },
];

const PROBLEMS = [
  { h: "Wallets get drained", p: "Honeypots, hidden sell-taxes and mint backdoors quietly cost retail users real money. Most people cannot read a contract to spot them." },
  { h: "Contagion hides in depth", p: "A token backed by a token backed by a bridge can cascade. A deep failure wipes value even when the surface looks fine. Nobody maps this for Base." },
  { h: "UK tax is now unavoidable", p: "Under CARF, your on-chain activity becomes visible to HMRC. Reconstructing GBP disposals by hand across DeFi is effectively impossible." },
];

const STEPS = [
  ["01", "Paste an address", "A Base token or wallet. Read-only: no wallet connect, no signatures, ever."],
  ["02", "We read public data", "BaseScan, DEX liquidity, safety APIs, TVL/bridge data and GBP FX. Nothing private."],
  ["03", "You get a clear read", "An honest, plain-English readout you can act on. Information, never advice."],
];

const GRADS = [
  "linear-gradient(137deg, #F5A524 0%, #E8B341 45%, #E5484D 100%)",
  "linear-gradient(137deg, #7DD3FC 0%, #3B9EFF 45%, #7C5CFF 100%)",
  "linear-gradient(137deg, #7C5CFF 0%, #B48CFF 45%, #E8B341 100%)",
];

const FAQS: [string, string][] = [
  ["What is KRONOS Aegis?", "KRONOS Aegis is read-only, public on-chain intelligence for the Base network. It checks a token's safety before you commit, maps collateral and bridge contagion while you hold, and reconstructs your UK crypto tax (CARF/CGT) when you file - all from public data, with no wallet connection and no advice."],
  ["Does KRONOS Aegis connect to my wallet?", "No. It is read-only. You paste a public Base address; KRONOS Aegis never asks you to connect a wallet, sign a transaction, or approve anything."],
  ["Is KRONOS Aegis financial or tax advice?", "No. It provides risk information and data reconstruction from public sources only. It is not financial or tax advice, and no profit, yield, or return is promised."],
  ["What data does KRONOS Aegis use?", "Only public data: BaseScan, DEX liquidity, public token-safety APIs, TVL and bridge data, and GBP FX rates. Nothing private and no wallet access."],
  ["What is CARF?", "CARF is the OECD Crypto-Asset Reporting Framework - a global standard requiring platforms to report crypto activity to tax authorities, which makes UK on-chain activity increasingly visible to HMRC."],
];
const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

export default function Home() {
  const [addr, setAddr] = useState("");
  return (
    <div className="space-y-24">
      <section className="relative">
        <div className="pointer-events-none absolute inset-x-0 -top-40 h-[640px] aurora-wrap">
          <AuroraBackground />
        </div>
        <div className="pointer-events-none absolute inset-0 grid-tex opacity-40" />
        <div className="relative pt-6">
          <div className="font-mono text-[11px] tracking-[0.35em] text-muted uppercase">KRONOS &middot; Aegis</div>
          <p className="intro-blur mt-5 text-base text-muted select-none">An on-chain AI identity, building in the open.</p>
          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Know what&apos;s really on chain &mdash;<br className="hidden sm:block" />
            <ShinyText text="before you commit, while you hold, when you file." />
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/80 min-h-[56px]">
            <Typewriter text="Scan a token. Trace its collateral risk. Reconstruct your UK tax. All from public data, no wallet, no advice." />
          </p>

          <GlowCard gradient={GRADS[0]} className="mt-8 max-w-2xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Paste a Base address - 0x..."
                className="flex-1 rounded-xl bg-elevated border border-edge px-4 py-3 font-mono text-sm outline-none focus:border-accent" />
              <Link href={"/scan?a=" + encodeURIComponent(addr)} className="liquid-glass rounded-xl bg-accent text-bg font-medium px-6 py-3 text-center hover:brightness-110 transition">Snapshot &rarr;</Link>
              <button onClick={() => setAddr("0x4200000000000000000000000000000000000006")} className="rounded-xl border border-edge px-4 py-3 text-sm hover:bg-elevated transition">Use example</button>
            </div>
            <p className="mt-3 text-xs text-gray-400">Read-only. KRONOS Aegis never asks you to connect a wallet, sign, or approve anything.</p>
          </GlowCard>

          <div className="mt-6 flex flex-wrap gap-2">
            {PILLS.map(([label, href], i) => (
              <Link key={href} href={href}
                className="fadeup inline-flex items-center rounded-full border border-edge bg-surface px-4 py-1.5 text-sm text-ink/90 hover:bg-accent hover:text-bg hover:border-accent transition-colors"
                style={{ animationDelay: (400 + i * 90) + "ms" }}>
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2 font-mono text-[11px] tracking-widest text-muted uppercase">
            <span className="rounded-full border border-edge px-3 py-1">Public data only</span>
            <span className="rounded-full border border-edge px-3 py-1">Read-only</span>
            <span className="rounded-full border border-edge px-3 py-1">No advice</span>
            <span className="rounded-full border border-edge px-3 py-1">Base-native</span>
          </div>
        </div>
      </section>

      <section>
        <Reveal><div className="font-mono text-[11px] tracking-[0.3em] text-muted uppercase">The problem</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">On-chain is opaque at exactly the wrong moments</h2></Reveal>
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.h} delay={i * 80}>
              <GlowCard gradient={GRADS[i % GRADS.length]}>
                <div className="text-danger text-sm font-mono">risk</div>
                <div className="mt-2 text-lg font-medium text-white">{p.h}</div>
                <p className="mt-2 text-sm text-gray-400">{p.p}</p>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section>
        <Reveal><div className="font-mono text-[11px] tracking-[0.3em] text-muted uppercase">Three instruments, one panel</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">The full lifecycle, not one slice</h2></Reveal>
        <div className="mt-10 grid md:grid-cols-3 gap-8 md:gap-6">
          {INSTRUMENTS.map((m, i) => (
            <Reveal key={m.t} delay={i * 90}>
              <Link href={m.href} className="block h-full">
                <GlowCard gradient={m.g}>
                  <div className="font-mono text-[11px] tracking-widest text-white/70 uppercase">{m.tag}</div>
                  <div className="mt-3 text-2xl font-semibold text-white">{m.t}</div>
                  <p className="mt-3 text-sm text-gray-400 leading-[1.6]">{m.d}</p>
                  <div className="mt-5 text-sm text-white/80">Open {m.t} &rarr;</div>
                </GlowCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section>
        <Reveal><div className="font-mono text-[11px] tracking-[0.3em] text-muted uppercase">How it works</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Paste. Read. Understand.</h2></Reveal>
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {STEPS.map(([n, h, p], i) => (
            <Reveal key={n} delay={i * 80}>
              <GlowCard gradient={GRADS[i % GRADS.length]}>
                <div className="font-mono text-3xl text-accent/80">{n}</div>
                <div className="mt-3 text-lg font-medium text-white">{h}</div>
                <p className="mt-2 text-sm text-gray-400">{p}</p>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section>
        <Reveal><div className="font-mono text-[11px] tracking-[0.3em] text-muted uppercase">Why it is different</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Others cover one moment. Aegis covers all three.</h2></Reveal>
        <Reveal>
          <div className="glowcard group relative mt-8">
            <div className="glowcard-glow pointer-events-none absolute inset-0 rounded-[24px]" style={{ background: GRADS[0], filter: "blur(42px)" }} aria-hidden />
            <div className="relative z-10 overflow-x-auto rounded-[24px]" style={{ border: "1.5px solid transparent", background: `linear-gradient(#14161A, #14161A) padding-box, ${GRADS[0]} border-box` }}>
            <table className="w-full text-sm">
              <thead className="bg-elevated text-muted font-mono text-[11px] uppercase tracking-widest">
                <tr><th className="text-left p-4">Need</th><th className="p-4">Token scanners</th><th className="p-4">Tax tools</th><th className="p-4 text-accent">KRONOS Aegis</th></tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {[["Pre-buy safety", "yes", "-", "yes"], ["Collateral / bridge contagion", "-", "-", "yes"], ["UK CARF tax reconstruction", "-", "yes", "yes"], ["Base-native + agent (MCP)", "partial", "-", "yes"]].map((r) => (
                  <tr key={r[0]}><td className="p-4">{r[0]}</td><td className="p-4 text-center text-muted">{r[1]}</td><td className="p-4 text-center text-muted">{r[2]}</td><td className="p-4 text-center text-accent">{r[3]}</td></tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </Reveal>
      </section>

      <section>
        <Reveal><div className="font-mono text-[11px] tracking-[0.3em] text-muted uppercase">FAQ</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Questions people ask before they trust a tool</h2></Reveal>
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {FAQS.map(([q, a], i) => (
            <Reveal key={q} delay={i * 70}>
              <GlowCard gradient={GRADS[i % GRADS.length]}>
                <h3 className="text-lg font-medium text-white">{q}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-[1.6]">{a}</p>
              </GlowCard>
            </Reveal>
          ))}
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }} />
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <Reveal>
          <GlowCard gradient={GRADS[1]}>
            <div className="font-mono text-[11px] tracking-widest text-white/70 uppercase">For builders and agents</div>
            <div className="mt-3 text-xl font-medium text-white">Let your agent ask KRONOS</div>
            <p className="mt-2 text-sm text-gray-400">Every instrument is an MCP tool + JSON endpoint. Read-only, rate-limited, public data.</p>
            <Link href="/agents" className="mt-4 inline-block text-sm text-accent hover:underline">See the agent API &rarr;</Link>
          </GlowCard>
        </Reveal>
        <Reveal delay={80}>
          <GlowCard gradient={GRADS[0]}>
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="text-xl font-medium text-white">Start with an address</div>
                <p className="mt-2 text-sm text-gray-400">No sign-up. No wallet. Just a clear view of what is verifiably on chain.</p>
              </div>
              <div className="mt-5 flex gap-2">
                <Link href="/scan" className="liquid-glass rounded-xl bg-accent text-bg font-medium px-5 py-2.5 hover:brightness-110 transition">Scan a token</Link>
                <Link href="/learn" className="rounded-xl border border-edge px-5 py-2.5 hover:bg-elevated transition">Learn how it works</Link>
              </div>
            </div>
          </GlowCard>
        </Reveal>
      </section>
    </div>
  );
}
