"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGroup, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Box, Image as ImageIcon, Layers3 } from "lucide-react";
import { ModelViewer } from "@/components/model-viewer";
import { ProjectCard } from "@/components/home/project-card";
import { type FeaturedProject, type ProjectMediaItem, siteContent } from "@/data/site-content";
import type { ModelPreset } from "@/components/model-scenes";
import { cn } from "@/lib/utils";
import { trackClientEvent } from "@/lib/client-analytics";

export interface ProjectsSectionProps {
  className?: string;
  projects?: readonly FeaturedProject[];
}

type ScoreEntry = { slug: string; score: number };

function SectionHeader() {
  return (
    <div className="max-w-3xl">
      <p className="section-eyebrow">Selected work</p>
      <h2 className="section-title">Selected builds with one focused 3D stage.</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
        Choose a project from the fixed segmented selector, then inspect the active CAD model with orbit and exploded
        view controls.
      </p>
    </div>
  );
}

function selectorLabel(project: FeaturedProject) {
  return project.name.replace(/^[A-Z][^a-z]*-inspired\s/i, "").replace(/\bmodel\b/i, "").trim();
}

function readSessionScores() {
  if (typeof window === "undefined") return new Map<string, number>();
  try {
    const raw = window.sessionStorage.getItem("project_personalization_scores");
    if (!raw) return new Map<string, number>();
    return new Map<string, number>(JSON.parse(raw) as Array<[string, number]>);
  } catch {
    return new Map<string, number>();
  }
}

function writeSessionScores(scores: Map<string, number>) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem("project_personalization_scores", JSON.stringify([...scores.entries()]));
}

function ShowcaseSelector({
  projects,
  activeProject,
  recommendedSlug,
  onSelect,
  reduceMotion,
}: {
  projects: readonly FeaturedProject[];
  activeProject: FeaturedProject;
  recommendedSlug?: string | null;
  onSelect: (project: FeaturedProject) => void;
  reduceMotion: boolean;
}) {
  return (
    <div className="rounded-[1.4rem] border border-[var(--border)]/70 bg-[color-mix(in_srgb,var(--panel-strong)_90%,transparent)] p-3 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">Project selector</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Fixed order, clear selected state, and synced with the viewer controls.
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
      </div>

      <LayoutGroup id="project-selector-tabs">
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {projects.map((project, index) => {
            const active = project.slug === activeProject.slug;
            const recommended = project.slug === recommendedSlug && !active;

            return (
              <ProjectCard
                key={project.slug}
                project={project}
                index={index}
                active={active}
                label={selectorLabel(project)}
                onSelect={() => onSelect(project)}
                className={cn(
                  "min-w-[12rem] snap-start",
                  recommended && !active && "shadow-[0_10px_20px_rgba(255,255,255,0.04)]",
                  reduceMotion && "transition-none"
                )}
              />
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}

function ProjectMediaCard({
  item,
  project,
  selected,
  onSelect,
  reduceMotion,
}: {
  item: ProjectMediaItem;
  project: FeaturedProject;
  selected: boolean;
  onSelect: () => void;
  reduceMotion: boolean;
}) {
  const Icon = item.type === "model" ? Box : ImageIcon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "project-media-card group relative flex flex-col overflow-hidden rounded-[1rem] border bg-[var(--panel)] p-3 text-left transition duration-200 hover:border-[color-mix(in_srgb,var(--accent)_32%,var(--border))]",
        !reduceMotion && "hover:-translate-y-0.5",
        selected
          ? "border-[var(--accent)]/55 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_28%,transparent)]"
          : "border-[var(--border)]/70"
      )}
      aria-pressed={selected}
      aria-label={`${selected ? "Selected" : "Select"} media: ${item.label}`}
    >
      {selected ? (
        <motion.span
          layoutId={`project-media-active-${project.slug}`}
          className="pointer-events-none absolute inset-0 rounded-[1rem] border border-[var(--accent)]/45"
          transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.8 }}
          aria-hidden="true"
        />
      ) : null}
      {item.src && item.type === "photo" ? (
        <img
          src={item.src}
          alt={`${project.name}: ${item.label}`}
          className="project-media-card__visual mb-3 w-full rounded-[0.75rem] object-cover"
        />
      ) : (
        <div className="project-media-card__visual mb-3 flex w-full items-center justify-center rounded-[0.75rem] border border-dashed border-[var(--border)]/80 bg-[color-mix(in_srgb,var(--panel-strong)_82%,transparent)]">
          <Icon className="h-5 w-5 text-[var(--muted)] transition group-hover:text-[var(--accent)]" />
        </div>
      )}
      <div className="min-h-[3.1rem]">
        <div className="flex min-h-5 items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
          <span
            className={cn(
              "rounded-full border border-[var(--accent)]/35 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-[var(--muted)] transition-opacity",
              selected ? "opacity-100" : "opacity-0"
            )}
            aria-hidden={!selected}
          >
            Active
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">{item.caption}</p>
      </div>
    </button>
  );
}

function ProjectMediaStrip({ project, reduceMotion }: { project: FeaturedProject; reduceMotion: boolean }) {
  const gallery = project.gallery ?? [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [windowStart, setWindowStart] = useState(0);
  const maxStart = Math.max(gallery.length - 3, 0);
  const hasOverflow = gallery.length > 3;

  useEffect(() => {
    setSelectedIndex(0);
    setWindowStart(0);
  }, [project.slug]);

  if (!gallery.length) {
    return null;
  }

  const clampWindow = (value: number) => Math.min(Math.max(value, 0), maxStart);
  const keepSelectedVisible = (nextWindowStart: number) => {
    setSelectedIndex((current) => {
      if (current < nextWindowStart) return nextWindowStart;
      if (current > nextWindowStart + 2) return Math.min(nextWindowStart + 2, gallery.length - 1);
      return current;
    });
  };

  const showPrevious = () => {
    const next = clampWindow(windowStart - 1);
    setWindowStart(next);
    keepSelectedVisible(next);
  };

  const showNext = () => {
    const next = clampWindow(windowStart + 1);
    setWindowStart(next);
    keepSelectedVisible(next);
  };

  const selectMedia = (index: number) => {
    setSelectedIndex(index);
    if (index < windowStart) {
      setWindowStart(index);
      return;
    }
    if (index > windowStart + 2) {
      setWindowStart(clampWindow(index - 2));
    }
  };

  return (
    <div className="border-y border-[var(--border)]/70 py-3" aria-label="Project media gallery">
      <div className="mb-3 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">Project evidence</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Photos stay attached to the selected build; the model remains the interactive CAD view.
          </p>
        </div>
        {hasOverflow ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={showPrevious}
              disabled={windowStart === 0}
              className="opaque-button rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium disabled:pointer-events-none disabled:opacity-45"
              aria-label="Show previous project media"
            >
              Prev
            </button>
          <span className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1.5 text-xs text-[var(--muted)]">
              {windowStart + 1}-{Math.min(windowStart + 3, gallery.length)}/{gallery.length}
            </span>
            <button
              type="button"
              onClick={showNext}
              disabled={windowStart >= maxStart}
              className="opaque-button rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium disabled:pointer-events-none disabled:opacity-45"
              aria-label="Show next project media"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      <div className="project-media-viewport" aria-live="polite">
        <motion.div
          className="project-media-track"
          animate={
            reduceMotion
              ? undefined
              : {
                  x: `calc(${windowStart} * (var(--media-card-width) + var(--media-gap)) * -1)`,
                }
          }
          style={
            reduceMotion
              ? {
                  transform: `translateX(calc(${windowStart} * (var(--media-card-width) + var(--media-gap)) * -1))`,
                }
              : undefined
          }
          transition={{ type: "spring", stiffness: 210, damping: 30, mass: 0.78 }}
        >
          {gallery.map((item, index) => (
            <motion.div
              key={`${project.slug}-${item.label}`}
              animate={reduceMotion ? undefined : { opacity: index < windowStart || index > windowStart + 2 ? 0.34 : 1 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProjectMediaCard
                item={item}
                project={project}
                selected={index === selectedIndex}
                onSelect={() => selectMedia(index)}
                reduceMotion={reduceMotion}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export function ProjectsSection({ className, projects = siteContent.featuredProjects }: ProjectsSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const [activeProject, setActiveProject] = useState<FeaturedProject>(projects[0] ?? siteContent.featuredProjects[0]);
  const [recommendedSlug, setRecommendedSlug] = useState<string | null>(null);
  const [hasManualSelection, setHasManualSelection] = useState(false);

  const stableProjects = useMemo(() => [...projects], [projects]);

  const projectsByPreset = useMemo(
    () => new Map(stableProjects.map((project) => [project.preset, project])),
    [stableProjects]
  );

  const viewerPresetOptions = useMemo(
    () =>
      stableProjects.map((project) => ({
        id: project.preset as ModelPreset,
        label: selectorLabel(project),
      })),
    [stableProjects]
  );

  useEffect(() => {
    setActiveProject((current) => {
      const matched = stableProjects.find((project) => project.slug === current.slug);
      return matched ?? stableProjects[0] ?? current;
    });
  }, [stableProjects]);

  useEffect(() => {
    const localScores = readSessionScores();

    void fetch("/api/personalization")
      .then((response) => response.json())
      .then((data: { scores?: ScoreEntry[] }) => {
        const combined = new Map<string, number>(localScores);

        for (const score of data.scores ?? []) {
          combined.set(score.slug, (combined.get(score.slug) ?? 0) + score.score);
        }

        const nextSlug = [...combined.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
        if (!nextSlug) return;

        const nextProject = stableProjects.find((project) => project.slug === nextSlug);
        if (!nextProject) return;

        setRecommendedSlug(nextSlug);
        if (!hasManualSelection) {
          setActiveProject(nextProject);
        }
      })
      .catch(() => undefined);
  }, [stableProjects, hasManualSelection]);

  const topGlowY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [40, -40]);
  const sideGlowY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-24, 36]);
  const stageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -18]);

  function recordProjectSelection(project: FeaturedProject, source: "selector" | "viewer") {
    const scores = readSessionScores();
    scores.set(project.slug, (scores.get(project.slug) ?? 0) + 4);
    writeSessionScores(scores);
    setRecommendedSlug(project.slug);

    void trackClientEvent(source === "viewer" ? "viewer_preset_change" : "project_open", `/projects/${project.slug}`, {
      project: project.slug,
      source,
    });
  }

  function selectProject(project: FeaturedProject, source: "selector" | "viewer" = "selector") {
    if (project.slug === activeProject.slug) return;

    setHasManualSelection(true);
    recordProjectSelection(project, source);

    setActiveProject(project);
  }

  const selectProjectByPreset = (preset: ModelPreset) => {
    const nextProject = projectsByPreset.get(preset);
    if (!nextProject) return;
    selectProject(nextProject, "viewer");
  };

  return (
    <section id="projects" ref={sectionRef} className={cn("relative overflow-visible scroll-mt-28", className)}>
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/35 to-transparent"
        aria-hidden="true"
      />
      <motion.div
        className="pointer-events-none absolute -left-24 top-10 -z-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(220,38,38,0.14),transparent_70%)] blur-3xl"
        style={reduceMotion ? undefined : { y: topGlowY }}
        aria-hidden="true"
      />
      <motion.div
        className="pointer-events-none absolute right-0 top-36 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_70%)] blur-3xl"
        style={reduceMotion ? undefined : { y: sideGlowY }}
        aria-hidden="true"
      />

      <div className="space-y-6">
        <SectionHeader />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          style={reduceMotion ? undefined : { y: stageY }}
          className="premium-card rounded-[2rem] p-4 backdrop-blur-xl sm:p-5"
        >
          <div className="flex items-center justify-between gap-4 px-1">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              <Layers3 className="h-4 w-4 text-[var(--accent)]" />
              <span>Interactive showcase</span>
            </div>
            <span className="rounded-full border border-[var(--border)]/80 bg-[var(--panel-strong)] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
              {activeProject.preset}
            </span>
          </div>

          <div className="mt-4">
            <ShowcaseSelector
              projects={stableProjects}
              activeProject={activeProject}
              recommendedSlug={recommendedSlug}
              onSelect={selectProject}
              reduceMotion={Boolean(reduceMotion)}
            />
          </div>

          <div className="mt-4">
            <ProjectMediaStrip project={activeProject} reduceMotion={Boolean(reduceMotion)} />
          </div>

          <div className="mt-4">
            <ModelViewer
              className="w-full"
              height={700}
              preset={activeProject.preset}
              partDefinitions={activeProject.modelParts}
              presetOptions={viewerPresetOptions}
              onPresetChange={selectProjectByPreset}
              title={activeProject.name}
              subtitle={activeProject.description}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ProjectsSection;
