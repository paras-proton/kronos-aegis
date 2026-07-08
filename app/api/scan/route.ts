import { NextResponse } from "next/server";
import { getScan } from "@/lib/providers";
export const runtime = "nodejs";
export const revalidate = 300;
async function handle(address: string) {
  const data = await getScan(String(address || ""));
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
