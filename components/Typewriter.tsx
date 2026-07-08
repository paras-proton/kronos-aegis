"use client";
import { useEffect, useState } from "react";

export default function Typewriter({ text, speed = 30, startDelay = 500 }: { text: string; speed?: number; startDelay?: number }) {
  const [n, setN] = useState(0);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGo(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);
  useEffect(() => {
    if (!go || n >= text.length) return;
    const t = setTimeout(() => setN((v) => v + 1), speed);
    return () => clearTimeout(t);
  }, [go, n, text, speed]);
  const done = n >= text.length;
  return (<span>{text.slice(0, n)}{!done ? <span className="cursor" /> : null}</span>);
}
