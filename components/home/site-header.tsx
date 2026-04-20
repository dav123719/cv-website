"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { ArrowUpRight, Monitor, MoonStar, SunMedium } from "lucide-react";
import { cn } from "@/lib/utils";
import { withViewTransition } from "@/lib/view-transitions";

type ThemeMode = "dark" | "light" | "system";

type SiteHeaderProps = {
  name: string;
  role: string;
  location: string;
  navItems: Array<{
    href: string;
    label: string;
  }>;
  className?: string;
};

function applyTheme(mode: ThemeMode) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const resolved = mode === "system" ? (media.matches ? "dark" : "light") : mode;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeMode = mode;
}

export function SiteHeader({ name, role, location, navItems, className }: SiteHeaderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const stored = localStorage.getItem("theme-mode");
    const initialMode =
      stored === "dark" || stored === "light" || stored === "system" ? stored : "system";
    const nextResolved = initialMode === "system" ? (media.matches ? "dark" : "light") : initialMode;

    setThemeMode(initialMode);
    setResolvedTheme(nextResolved);
    applyTheme(initialMode);

    const onChange = (event: MediaQueryListEvent) => {
      if (document.documentElement.dataset.themeMode !== "system") {
        return;
      }

      const next = event.matches ? "dark" : "light";
      setResolvedTheme(next);
      document.documentElement.dataset.theme = next;
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function cycleTheme() {
    const modes: ThemeMode[] = ["system", "dark", "light"];
    const nextMode = modes[(modes.indexOf(themeMode) + 1) % modes.length];
    const nextResolved = nextMode === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : nextMode;

    setThemeMode(nextMode);
    setResolvedTheme(nextResolved);
    localStorage.setItem("theme-mode", nextMode);

    void withViewTransition(() => {
      document.documentElement.classList.add("theme-changing");
      applyTheme(nextMode);
      window.setTimeout(() => document.documentElement.classList.remove("theme-changing"), 320);
    });
  }

  function handleAnchorNavigation(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#")) return;
    const target = document.querySelector(href);
    if (!(target instanceof HTMLElement)) return;

    event.preventDefault();
    void withViewTransition(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const themeLabel = themeMode === "system" ? "System" : resolvedTheme === "dark" ? "Dark" : "Light";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_88%,transparent)] shadow-[0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-2xl",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <a href="#top" className="block" onClick={(event) => handleAnchorNavigation(event, "#top")}>
            <p className="font-heading text-base font-semibold tracking-tight text-[var(--foreground)] sm:text-xl">
              {name}
            </p>
          </a>
          <p className="mt-1 hidden text-xs uppercase tracking-[0.22em] text-[var(--muted)] lg:block lg:tracking-[0.26em]">
            {role} <span className="mx-2 text-[var(--border)]">/</span> {location}
          </p>
        </div>

        <nav className="hidden items-center gap-7 text-sm text-[var(--muted)] md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(event) => handleAnchorNavigation(event, item.href)}
              className="relative transition duration-200 hover:text-[var(--foreground)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={cycleTheme}
            className="opaque-button inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] sm:px-4"
            aria-label={`Theme mode: ${themeLabel}`}
          >
            {themeMode === "system" ? (
              <Monitor className="h-4 w-4" />
            ) : resolvedTheme === "dark" ? (
              <SunMedium className="h-4 w-4" />
            ) : (
              <MoonStar className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{themeLabel}</span>
          </button>

          <a
            href="#contact"
            onClick={(event) => handleAnchorNavigation(event, "#contact")}
            className="button-primary min-h-11 px-3 py-2 text-sm sm:px-4"
          >
            <span className="hidden sm:inline">Contact</span>
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
