import type { Metadata } from "next";
import { Card, Eyebrow, Disclaimer, G } from "@/components/ui";
import GlowCard from "@/components/GlowCard";

export const metadata: Metadata = {
  title: "Agents & MCP API — KRONOS Aegis",
  description: "Call KRONOS Aegis from your AI agent: scan_token, map_contagion and reconstruct_tax as read-only MCP tools and JSON endpoints on Base. Public data, rate-limited, no advice.",
  keywords: ["MCP server", "AI agent crypto tools", "Base token API", "onchain MCP", "scan token API", "KRONOS Aegis agents"],
  alternates: { canonical: "/agents" },
};

export default function Agents() {
  const tools: [string, string, string, string][] = [
    ["scan_token", '{ "address": "0x…" }', "Public safety red-flags for a Base token.", G.amber],
    ["map_contagion", '{ "address": "0x…" }', "Collateral/bridge contagion tier for an asset.", G.cyan],
    ["reconstruct_tax", '{ "wallet": "0x…", "year": "2025-26" }', "GBP disposal reconstruction (data, not advice).", G.violet],
  ];
  return (
    <div className="space-y-6">
      <GlowCard gradient={G.amber}>
        <Eyebrow>Agents · MCP interface</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold text-white">Let your agent ask KRONOS</h1>
        <p className="mt-2 text-gray-400 max-w-2xl">Every Aegis instrument is exposed as an MCP tool + JSON endpoint so other AI agents can call it. Read-only, rate-limited, public data.</p>
      </GlowCard>
      {tools.map(([name, args, desc, g]) => (
        <Card key={name} gradient={g}>
          <div className="font-mono text-accent">{name}</div>
          <div className="text-sm text-gray-400 mt-1">{desc}</div>
          <pre className="mt-3 rounded-xl bg-elevated border border-edge p-3 text-xs font-mono overflow-x-auto">POST /api/{name.split("_")[0]}  {args}</pre>
        </Card>
      ))}
      <Card gradient={G.violet}>
        <div className="text-sm text-white">MCP config (illustrative):</div>
        <pre className="mt-2 rounded-xl bg-elevated border border-edge p-3 text-xs font-mono overflow-x-auto">{`{
  "mcpServers": {
    "kronos-aegis": { "url": "https://www.kronosaegis.com/api/mcp" }
  }
}`}</pre>
      </Card>
      <Disclaimer text="Public data only. No advice. Rate-limited." />
    </div>
  );
}
