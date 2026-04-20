import type { Session } from "next-auth";
import { AdminSignOutButton } from "./admin-sign-out";
import type { AnalyticsSnapshot } from "../lib/analytics";

type AdminDashboardProps = {
  session: Session;
  analytics: AnalyticsSnapshot;
};

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function AdminDashboard({ session, analytics }: AdminDashboardProps) {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-10 text-white">
      <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">
            Protected workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Admin dashboard</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Signed in as {session.user?.email ?? "admin"}.
          </p>
        </div>

        <AdminSignOutButton />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total views" value={formatCount(analytics.totalEvents)} />
        <StatCard
          label="Unique sessions"
          value={formatCount(analytics.uniqueSessions)}
        />
        <StatCard label="Tracked pages" value={formatCount(analytics.topPages.length)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-lg font-semibold">Top pages</h2>
          <div className="mt-4 space-y-3">
            {analytics.topPages.length > 0 ? (
              analytics.topPages.map((item) => (
                <div
                  key={item.path}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                >
                  <span className="text-sm text-zinc-200">{item.path}</span>
                  <span className="text-sm text-zinc-400">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">No page views recorded yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-lg font-semibold">Recent events</h2>
          <div className="mt-4 space-y-3">
            {analytics.recentEvents.length > 0 ? (
              analytics.recentEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-2xl border border-white/8 bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-white">
                      {event.type}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-300">{event.path}</p>
                </article>
              ))
            ) : (
              <p className="text-sm text-zinc-400">No recent events.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

