"use client";

function getClientSessionId() {
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

export async function trackClientEvent(type: string, path: string, metadata?: Record<string, string>) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        path,
        sessionId: getClientSessionId(),
        metadata,
      }),
    });
  } catch {
    // Best-effort analytics only.
  }
}
