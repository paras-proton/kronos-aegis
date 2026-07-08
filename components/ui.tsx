import { ReactNode } from "react";

export function Card({ children, className = "", gradient }: { children: ReactNode; className?: string; gradient?: string }) {
  if (gradient) {
    return (
      <div className="glowcard group relative">
        <div className="glowcard-glow pointer-events-none absolute inset-0 rounded-[24px]" style={{ background: gradient, filter: "blur(42px)" }} aria-hidden />
        <div className="relative z-10 overflow-hidden rounded-[24px]" style={{ border: "1.5px solid transparent", background: `linear-gradient(#14161A, #14161A) padding-box, ${gradient} border-box` }}>
          <div className={`p-5 ${className}`}>{children}</div>
        </div>
      </div>
    );
  }
  return <div className={`rounded-2xl border border-edge bg-surface p-5 ${className}`}>{children}</div>;
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="font-mono text-[11px] tracking-[0.3em] text-muted uppercase">{children}</div>;
}
export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-edge bg-surface p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="font-mono text-xl text-ink mt-1">{value}</div>
    </div>
  );
}
export function Light({ level }: { level: "ok" | "warn" | "danger" }) {
  const map = { ok: "bg-ok", warn: "bg-warn", danger: "bg-danger" } as const;
  const txt = { ok: "🟢 Looks clean", warn: "🟡 Caution", danger: "🔴 High risk" } as const;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-edge px-3 py-1 text-sm">
      <span className={`h-2.5 w-2.5 rounded-full ${map[level]}`} /> {txt[level]}
    </span>
  );
}
export function Disclaimer({ text }: { text: string }) {
  return <p className="mt-4 text-xs text-muted border-t border-edge pt-3">{text}</p>;
}

// Shared instrument gradients (match the home-page glow cards)
export const G = {
  amber: "linear-gradient(137deg, #F5A524 0%, #E8B341 45%, #E5484D 100%)",
  cyan: "linear-gradient(137deg, #7DD3FC 0%, #3B9EFF 45%, #7C5CFF 100%)",
  violet: "linear-gradient(137deg, #7C5CFF 0%, #B48CFF 45%, #E8B341 100%)",
};
