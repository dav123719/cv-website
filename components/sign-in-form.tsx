"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

type SignInFormProps = {
  callbackUrl: string;
  googleEnabled: boolean;
};

export function SignInForm({ callbackUrl, googleEnabled }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submitCredentials = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(() => {
      void (async () => {
        const result = await signIn("credentials", {
          email,
          password,
          callbackUrl,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid credentials or unauthorized account.");
          return;
        }

        window.location.assign(result?.url ?? callbackUrl);
      })();
    });
  };

  const submitGoogle = () => {
    setError(null);
    void signIn("google", { callbackUrl });
  };

  return (
    <form onSubmit={submitCredentials} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-300">Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-white/25"
          placeholder="ddabbis@gmail.com"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-300">Password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-white/25"
          placeholder="Enter admin password"
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:bg-zinc-100 active:translate-y-0 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>

        {googleEnabled ? (
          <button
            type="button"
            onClick={submitGoogle}
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:bg-zinc-100 active:translate-y-0 active:scale-[0.985]"
          >
            Continue with Google
          </button>
        ) : null}
      </div>
    </form>
  );
}
