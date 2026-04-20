import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)]">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl flex-col items-start justify-center gap-6">
        <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">404</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          That page does not exist in this portfolio.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
          The current build is a single-page portfolio with protected admin routes. Use the main entry point to
          continue exploring the work.
        </p>
        <Link
          href="/"
          className="opaque-button inline-flex items-center rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium"
        >
          Return to homepage
        </Link>
      </div>
    </main>
  );
}
