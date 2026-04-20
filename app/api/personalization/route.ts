import { NextResponse } from "next/server";
import { getProjectPersonalizationScores } from "@/lib/personalization";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const scores = await getProjectPersonalizationScores();
  return NextResponse.json({ scores });
}
