"use client";

import { motion } from "framer-motion";
import type { FeaturedProject } from "@/data/site-content";
import { cn } from "@/lib/utils";

export interface ProjectCardProps {
  project: FeaturedProject;
  index?: number;
  active?: boolean;
  label?: string;
  onSelect?: () => void;
  className?: string;
}

export function ProjectCard({
  project,
  index = 0,
  active = false,
  label,
  onSelect,
  className,
}: ProjectCardProps) {
  return (
    <motion.button
      layout
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex min-w-0 flex-1 shrink-0 items-center gap-3 rounded-[1.15rem] border px-4 py-3 text-left",
        "isolate transition duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/55",
        active
          ? "border-[var(--accent)]/55 bg-[linear-gradient(135deg,var(--accent-soft),transparent_42%),var(--panel-strong)] shadow-[0_16px_30px_rgba(0,0,0,0.16)]"
          : "border-[var(--border)]/80 bg-[var(--panel)] hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] hover:bg-[var(--control-strong)]",
        className
      )}
      aria-pressed={active}
      aria-label={`${active ? "Selected" : "Select"} project: ${project.name}`}
    >
      {active ? (
        <motion.span
          layoutId="project-selector-active-pill"
          className="absolute inset-0 rounded-[1.15rem] border border-[var(--accent)]/35"
          transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.8 }}
          aria-hidden="true"
        />
      ) : null}

      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[inherit] bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-80"
        aria-hidden="true"
      />

      <span
        className={cn(
          "relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold tracking-[0.22em] transition",
          active
            ? "border-[var(--accent)]/45 bg-[var(--accent)] text-white"
            : "border-[var(--border)] bg-black/20 text-[var(--muted)] group-hover:border-[var(--accent)]/35"
        )}
      >
        {(index + 1).toString().padStart(2, "0")}
      </span>

      <div className="relative min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">{project.category}</p>
        <h3 className="mt-1 truncate text-[0.98rem] font-semibold tracking-tight text-[var(--foreground)]">
          {label ?? project.name}
        </h3>
      </div>

      <span
        className={cn(
          "relative shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition",
          active
            ? "border-[var(--accent)]/35 bg-[var(--accent)]/10 text-[var(--foreground)]"
            : "border-[var(--border)] text-[var(--muted)]"
        )}
      >
        {active ? "Selected" : "Open"}
      </span>
    </motion.button>
  );
}

export default ProjectCard;
