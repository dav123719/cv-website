"use client";

import { ArrowUpRight } from "lucide-react";
import type { FeaturedProject } from "@/data/site-content";
import { cn } from "@/lib/utils";

export interface ProjectCardProps {
  project: FeaturedProject;
  index?: number;
  active?: boolean;
  onSelect?: () => void;
  className?: string;
}

function AccentDot({ active }: { active?: boolean }) {
  return (
    <span
      className={cn(
        "mt-1.5 h-2 w-2 shrink-0 rounded-full transition",
        active ? "bg-[var(--accent)] shadow-[0_0_0_4px_rgba(220,38,38,0.12)]" : "bg-[var(--muted)]/50"
      )}
      aria-hidden="true"
    />
  );
}

export function ProjectCard({ project, index = 0, active = false, onSelect, className }: ProjectCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative w-full overflow-hidden rounded-[1.5rem] border text-left transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out",
        "bg-[color-mix(in_srgb,var(--panel)_92%,transparent)] px-4 py-4",
        "ring-1 ring-inset ring-white/5 hover:-translate-y-0.5 hover:bg-[var(--panel-strong)] hover:ring-[var(--accent)]/10",
        active
          ? "border-[var(--accent)]/60 bg-[linear-gradient(135deg,var(--accent-soft),transparent_42%),var(--panel-strong)] shadow-[0_18px_38px_rgba(0,0,0,0.22)] ring-[var(--accent)]/15"
          : "border-[var(--border)]/90",
        className
      )}
      aria-pressed={active}
    >
      <span
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity duration-300",
          active ? "opacity-80" : "opacity-0 group-hover:opacity-70"
        )}
        aria-hidden="true"
      />

      <span
        className={cn(
          "absolute inset-y-4 left-0 w-[3px] rounded-full transition-[opacity,transform,background-color] duration-300",
          active ? "bg-[var(--accent)]" : "bg-transparent group-hover:bg-[var(--accent)]/40"
        )}
        aria-hidden="true"
      />

      <div className="flex items-start gap-3.5">
        <div className="flex flex-col items-center gap-2 pt-0.5">
          <span
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold tracking-[0.18em] transition",
              active
                ? "border-[var(--accent)]/50 bg-[var(--accent)] text-white"
                : "border-[var(--border)] bg-[var(--panel)] text-[var(--muted)] group-hover:border-[var(--accent)]/35"
            )}
          >
            {(index + 1).toString().padStart(2, "0")}
          </span>
          <AccentDot active={active} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">{project.category}</p>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.22em]",
                active
                  ? "border-[var(--accent)]/35 bg-[var(--accent)]/10 text-[var(--foreground)]"
                  : "border-[var(--border)] text-[var(--muted)]"
              )}
            >
              {active ? "Active" : "Select"}
            </span>
          </div>
          <h3 className="mt-2 text-[1.02rem] font-semibold tracking-tight text-[var(--foreground)]">{project.name}</h3>
          <p className="mt-1.5 max-w-xl overflow-hidden text-sm leading-6 text-[var(--muted)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {project.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {project.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[10px] leading-none tracking-[0.08em]",
                  active
                    ? "border-[var(--accent)]/35 bg-[var(--accent)]/10 text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--panel)] text-[var(--muted)]"
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <span
          className={cn(
            "mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] transition",
            active
              ? "border-[var(--accent)]/45 bg-[var(--accent)]/12 text-[var(--foreground)]"
              : "border-[var(--border)] text-[var(--muted)] group-hover:border-[var(--accent)]/35 group-hover:text-[var(--foreground)]"
          )}
        >
          {active ? "Live" : "Open"}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

export default ProjectCard;
