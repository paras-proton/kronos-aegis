import { NextResponse } from "next/server";
import { getLedger } from "@/lib/providers";
export const runtime = "nodejs";
export const revalidate = 300;
export const maxDuration = 60;
async function handle(address: string) {
  const data = await getLedger(String(address || ""));
  return NextResponse.json({ address, ...data });
}
export async function GET(req: Request) {
  const a = new URL(req.url).searchParams.get("a") || "";
  return handle(a);
}
export async function POST(req: Request) {
  const { address } = await req.json().catch(() => ({ address: "" }));
  return handle(String(address || ""));
}
