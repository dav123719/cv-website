import { NextRequest, NextResponse } from "next/server";
import { auth, isAdminSessionEmail } from "../../../auth";
import {
  getAnalyticsSnapshot,
  recordAnalyticsEvent,
} from "../../../lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.role && !isAdminSessionEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getAnalyticsSnapshot();

  return NextResponse.json({ snapshot });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const pathname =
    typeof body.path === "string" ? body.path : request.nextUrl.pathname;

  const event = await recordAnalyticsEvent({
    type: typeof body.type === "string" ? body.type : "pageview",
    path: pathname,
    referrer:
      typeof body.referrer === "string"
        ? body.referrer
        : request.headers.get("referer"),
    sessionId: typeof body.sessionId === "string" ? body.sessionId : null,
    userAgent: request.headers.get("user-agent"),
    metadata:
      body.metadata && typeof body.metadata === "object"
        ? (body.metadata as Record<string, unknown>)
        : null,
  });

  return NextResponse.json({ ok: true, event }, { status: 201 });
}
