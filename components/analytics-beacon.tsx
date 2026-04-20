"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function getSessionId() {
  const key = "cv_site_session_id";
  const existing = window.sessionStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const created =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.sessionStorage.setItem(key, created);
  return created;
}

export function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    const sessionId = getSessionId();

    void fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "page_view",
        path: pathname,
        sessionId
      })
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
