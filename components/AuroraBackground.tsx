// CSS-only animated aurora: three large drifting colour glows on the dark bg.
// Replaces the earlier canvas version (which rendered too faint). Guaranteed to
// paint — no canvas/rAF timing. Reduced-motion aware via globals.css.
export default function AuroraBackground({ className = "" }: { className?: string }) {
  return (
    <div className={"aurora-css " + className} aria-hidden>
      <i className="b1" />
      <i className="b2" />
      <i className="b3" />
    </div>
  );
}
