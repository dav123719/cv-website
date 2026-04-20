"use client";

import { signOut } from "next-auth/react";

export function AdminSignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
      className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white px-4 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:bg-zinc-100 active:translate-y-0 active:scale-[0.985]"
    >
      Sign out
    </button>
  );
}
