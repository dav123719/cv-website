import { mkdir, readFile, rename, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

export type AnalyticsEvent = {
  id: string;
  type: string;
  path: string;
  referrer: string | null;
  sessionId: string | null;
  userAgent: string | null;
  createdAt: string;
  metadata: Record<string, unknown> | null;
};

export type AnalyticsStore = {
  version: 1;
  updatedAt: string;
  events: AnalyticsEvent[];
};

export type AnalyticsSnapshot = {
  totalEvents: number;
  uniqueSessions: number;
  topPages: Array<{ path: string; count: number }>;
  recentEvents: AnalyticsEvent[];
  dailyViews: Array<{ date: string; count: number }>;
};

const STORE_PATH = path.join(process.cwd(), ".data", "analytics.json");
const MAX_EVENTS = 5000;

let writeQueue: Promise<void> = Promise.resolve();

function normalizePath(input: string | null | undefined) {
  if (!input) {
    return "/";
  }

  const trimmed = input.trim();

  if (!trimmed) {
    return "/";
  }

  try {
    const url = new URL(trimmed, "https://local.invalid");
    return url.pathname + url.search || "/";
  } catch {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }
}

function uniqueId() {
  return randomUUID();
}

async function ensureDirectory() {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
}

async function readStore(): Promise<AnalyticsStore> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<AnalyticsStore>;

    return {
      version: 1,
      updatedAt: parsed.updatedAt ?? new Date(0).toISOString(),
      events: Array.isArray(parsed.events) ? (parsed.events as AnalyticsEvent[]) : [],
    };
  } catch {
    return {
      version: 1,
      updatedAt: new Date(0).toISOString(),
      events: [],
    };
  }
}

async function writeStore(store: AnalyticsStore) {
  await ensureDirectory();

  const tempPath = `${STORE_PATH}.tmp`;
  await writeFile(tempPath, JSON.stringify(store, null, 2), "utf8");
  await rename(tempPath, STORE_PATH);
}

export async function recordAnalyticsEvent(input: {
  type?: string;
  path?: string;
  referrer?: string | null;
  sessionId?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const event: AnalyticsEvent = {
    id: uniqueId(),
    type: input.type?.trim() || "pageview",
    path: normalizePath(input.path),
    referrer: input.referrer ?? null,
    sessionId: input.sessionId ?? null,
    userAgent: input.userAgent ?? null,
    createdAt: new Date().toISOString(),
    metadata: input.metadata ?? null,
  };

  writeQueue = writeQueue.then(async () => {
    const store = await readStore();
    const nextEvents = [...store.events, event].slice(-MAX_EVENTS);

    await writeStore({
      version: 1,
      updatedAt: event.createdAt,
      events: nextEvents,
    });
  });

  await writeQueue;
  return event;
}

export async function getAnalyticsStore() {
  return readStore();
}

export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  const store = await readStore();
  const events = store.events;
  const sessions = new Set(
    events.map((event) => event.sessionId).filter((sessionId): sessionId is string => Boolean(sessionId)),
  );

  const pathCounts = new Map<string, number>();
  const dayCounts = new Map<string, number>();

  for (const event of events) {
    pathCounts.set(event.path, (pathCounts.get(event.path) ?? 0) + 1);
    const day = event.createdAt.slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
  }

  return {
    totalEvents: events.length,
    uniqueSessions: sessions.size,
    topPages: [...pathCounts.entries()]
      .map(([pagePath, count]) => ({ path: pagePath, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    recentEvents: [...events].slice(-10).reverse(),
    dailyViews: [...dayCounts.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}
