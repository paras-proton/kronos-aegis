// Port of motionsites "DesignPro" ShinyText: a gradient shimmer that sweeps
// continuously across the text. Text stays readable (amber base, white sweep).
export default function ShinyText({ text, className = "" }: { text: string; className?: string }) {
  return <span className={"shiny " + className}>{text}</span>;
}
