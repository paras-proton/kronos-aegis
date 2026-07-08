"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  ["/", "HOME"], ["/scan", "SCAN"], ["/depth", "DEPTH"], ["/ledger", "LEDGER"],
  ["/agents", "AGENTS"], ["/learn", "LEARN"], ["/token", "TOKEN"],
];

export default function Nav() {
  const p = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-edge bg-bg/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-mono tracking-widest text-sm">
          <img src="/kronos-mark.ico" alt="KRONOS Aegis logo" width={22} height={22} className="rounded-sm" /> KRONOS AEGIS
        </Link>
        <nav className="flex flex-wrap gap-1 font-mono text-[11px] tracking-widest">
          {TABS.map(([href, label]) => {
            const active = p === href;
            return (
              <Link key={href} href={href}
                className={`px-3 py-1.5 rounded-lg ${active ? "bg-elevated text-ink" : "text-muted hover:text-ink hover:bg-surface"}`}>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
