import { redirect } from "next/navigation";
import { auth, googleAuthEnabled } from "../../auth";
import { SignInForm } from "../../components/sign-in-form";

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();

  if (session?.user?.role === "admin") {
    redirect("/admin");
  }

  const resolvedSearchParams = await searchParams;
  const callbackUrl =
    typeof resolvedSearchParams?.callbackUrl === "string" &&
      resolvedSearchParams.callbackUrl
      ? resolvedSearchParams.callbackUrl
      : "/admin";

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
            Admin access
          </p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-tight sm:text-6xl">
            Protected access for analytics and content administration.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-400">
            Sign in with a Google account or admin credentials to manage local
            analytics and protected dashboard tools.
          </p>
          <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
            <InfoCard title="Role gated" text="Only approved admin emails can enter." />
            <InfoCard title="Fast login" text="Google and credentials both supported." />
            <InfoCard title="Local analytics" text="File-backed stats with no vendor lock-in." />
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Secure sign-in
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Continue to admin</h2>
          </div>

          <SignInForm callbackUrl={callbackUrl} googleEnabled={googleAuthEnabled} />

          <p className="mt-6 text-xs leading-6 text-zinc-500">
            {googleAuthEnabled
              ? "Google login is enabled in the current environment."
              : "Google login will appear once the Google OAuth environment variables are configured."}
          </p>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{text}</p>
    </div>
  );
}
