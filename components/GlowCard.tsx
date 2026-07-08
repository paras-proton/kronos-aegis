"use client";
import { ReactNode } from "react";

// Faithful port of motionsites "Glow Features": a blurred gradient glow behind
// the card + a gradient hairline border via the padding-box/border-box clip
// technique. Always-on (not hover-gated), so it reads in a static screenshot.
export default function GlowCard({ gradient, children, className = "" }: { gradient: string; children: ReactNode; className?: string }) {
  return (
    <div className={"glowcard group relative flex h-full w-full flex-col " + className}>
      <div
        className="glowcard-glow pointer-events-none absolute inset-0 rounded-[24px]"
        style={{ background: gradient, filter: "blur(42px)" }}
        aria-hidden
      />
      <div
        className="relative z-10 h-full overflow-hidden rounded-[24px]"
        style={{ border: "1.5px solid transparent", background: `linear-gradient(#14161A, #14161A) padding-box, ${gradient} border-box` }}
      >
        <div className="flex h-full flex-col p-6">{children}</div>
      </div>
    </div>
  );
}
