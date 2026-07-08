"use client";

// Port of motionsites "Organic Odyssey" StaggeredFade: fade each character in
// with a per-character delay. Words are wrapped in nowrap spans so a word never
// breaks across lines (fixes "whe/n"); breaks only happen between words.
export default function StaggeredText({ text, className = "", startDelay = 0, step = 0.022 }: { text: string; className?: string; startDelay?: number; step?: number }) {
  const words = text.split(" ");
  let idx = 0;
  return (
    <span className={className} aria-label={text}>
      {words.map((word, wi) => {
        const chars = word.split("").map((ch, ci) => {
          const d = startDelay + idx * step;
          idx += 1;
          return (
            <span key={ci} className="stagger-char" style={{ animationDelay: d + "s" }} aria-hidden>
              {ch}
            </span>
          );
        });
        idx += 1; // account for the inter-word space in the rhythm
        return (
          <span key={wi}>
            <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>{chars}</span>
            {wi < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </span>
  );
}
