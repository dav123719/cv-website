import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const DEFAULT_ADMIN_EMAILS = ["ddabbis@gmail.com"];

function allowedEmails() {
  const source =
    process.env.ADMIN_EMAILS?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    DEFAULT_ADMIN_EMAILS.join(",");

  return new Set(
    source
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function isAdminToken(token: Awaited<ReturnType<typeof getToken>> | null) {
  if (!token || typeof token === "string") {
    return false;
  }

  if (token.role === "admin") {
    return true;
  }

  const email = typeof token.email === "string" ? token.email.toLowerCase() : "";
  return allowedEmails().has(email);
}

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin") && !isAdminToken(token)) {
    const url = new URL("/sign-in", request.url);
    const callbackUrl = `${pathname}${search}`;

    if (callbackUrl) {
      url.searchParams.set("callbackUrl", callbackUrl);
    }

    return NextResponse.redirect(url);
  }

  if (pathname === "/sign-in" && isAdminToken(token)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/sign-in"],
};
