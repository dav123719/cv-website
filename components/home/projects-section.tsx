"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Layers3, Sparkles } from "lucide-react";
import { ModelViewer } from "@/components/model-viewer";
import { ProjectCard } from "@/components/home/project-card";
import { type FeaturedProject, siteContent } from "@/data/site-content";
import type { ModelPreset } from "@/components/model-scenes";
import { cn } from "@/lib/utils";
import { trackClientEvent } from "@/lib/client-analytics";
import { withViewTransition } from "@/lib/view-transitions";

export interface ProjectsSectionProps {
  className?: string;
  projects?: readonly FeaturedProject[];
}

type ScoreEntry = { slug: string; score: number };

const ACCENT_STYLES: Record<FeaturedProject["accent"], string> = {
  red: "from-[rgba(229,72,63,0.26)] via-[rgba(255,255,255,0.08)] to-transparent",
  crimson: "from-[rgba(190,24,93,0.24)] via-[rgba(255,255,255,0.08)] to-transparent",
  steel: "from-[rgba(59,130,246,0.2)] via-[rgba(255,255,255,0.08)] to-transparent",
  graphite: "from-[rgba(148,163,184,0.18)] via-[rgba(255,255,255,0.08)] to-transparent",
};

function SectionHeader() {
  return (
    <div className="max-w-3xl">
      <p className="section-eyebrow">Selected work</p>
      <h2 className="section-title">A motion-led project grid built around one interactive 3D stage.</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
        The section stays anchored by a single viewer, while the surrounding cards adapt to what visitors engage with
        most. The result feels more like a product showcase than a conventional portfolio list.
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

function SelectorPreview({ project, active }: { project: FeaturedProject; active?: boolean }) {
  return (
    <div
      className={cn(
        "relative mt-3 overflow-hidden rounded-[1rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] p-3 transition duration-300",
        active ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "group-hover:border-white/12"
      )}
      aria-hidden="true"
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", ACCENT_STYLES[project.accent])} />
      <div className="relative space-y-2.5">
        <div className="flex items-end justify-between gap-3">
          <div className="flex gap-1.5">
            <span className="h-10 w-10 rounded-[0.9rem] border border-white/10 bg-black/20 backdrop-blur-sm" />
            <span className="h-10 w-16 rounded-[0.9rem] border border-white/10 bg-white/10 backdrop-blur-sm" />
          </div>
          <span className="h-7 w-7 rounded-full border border-white/12 bg-white/10" />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <span className="h-1.5 rounded-full bg-white/20" />
          <span className="h-1.5 rounded-full bg-white/10" />
          <span className="h-1.5 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}

function CompactProjectSelector({
  projects,
  activeProject,
  recommendedSlug,
  onSelect,
}: {
  projects: readonly FeaturedProject[];
  activeProject: FeaturedProject;
  recommendedSlug?: string | null;
  onSelect: (project: FeaturedProject) => void;
}) {
  return (
    <div className="rounded-[1.35rem] border border-[var(--border)]/70 bg-[color-mix(in_srgb,var(--panel-strong)_90%,transparent)] p-3 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">Project selector</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Switch the active build without losing context.</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
      </div>

      <LayoutGroup id="compact-project-selector">
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => {
            const active = project.slug === activeProject.slug;
            const recommended = project.slug === recommendedSlug && !active;

            return (
              <motion.button
                key={project.slug}
                layout
                type="button"
                onClick={() => onSelect(project)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.985 }}
                className={cn(
                  "group relative overflow-hidden rounded-[1.25rem] border px-4 py-3 text-left transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out",
                  active
                    ? "border-[var(--accent)]/60 bg-[linear-gradient(135deg,var(--accent-soft),transparent_42%),var(--panel)] shadow-[0_18px_34px_rgba(0,0,0,0.18)]"
                    : "border-[var(--border)]/80 bg-[var(--panel)] hover:border-[var(--accent)]/35 hover:bg-[var(--panel-strong)]",
                  recommended && "border-white/15"
                )}
                aria-pressed={active}
              >
                {active ? (
                  <motion.span
                    layoutId="compact-project-active-frame"
                    className="absolute inset-0 rounded-[1.25rem] border border-[var(--accent)]/40"
                    transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.7 }}
                    aria-hidden="true"
                  />
                ) : null}
                <span
                  className={cn(
                    "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity duration-300",
                    active ? "opacity-80" : "opacity-0 group-hover:opacity-70"
                  )}
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]",
                      active
                        ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--foreground)]"
                        : recommended
                          ? "border-white/12 bg-white/8 text-[var(--foreground)]"
                          : "border-[var(--border)] text-[var(--muted)]"
                    )}
                  >
                    {active ? "Selected" : recommended ? "Recommended" : "Open"}
                  </span>
                </div>
                <SelectorPreview project={project} active={active} />
                <h3 className="mt-3 text-base font-semibold tracking-tight text-[var(--foreground)]">{selectorLabel(project)}</h3>
                <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">{project.category}</p>
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}

function InsightTile({ project, recommended }: { project: FeaturedProject; recommended: boolean }) {
  return (
    <div className="rounded-[1.35rem] border border-[var(--border)]/70 bg-[color-mix(in_srgb,var(--panel-strong)_86%,transparent)] p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
        <Sparkles className="h-4 w-4 text-[var(--accent)]" />
        <span>{recommended ? "Suggested focus" : "Project read"}</span>
      </div>
      <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
        {recommended
          ? `${selectorLabel(project)} is currently highlighted because visitors tend to spend more time opening similar work and interacting with this type of build.`
          : project.description}
      </p>
    </div>
  );
}

function ProjectMeta({ project, recommended }: { project: FeaturedProject; recommended: boolean }) {
  return (
    <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">
          {project.category}
        </span>
        <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">
          {project.preset}
        </span>
        {project.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[var(--border)]/80 bg-[var(--panel-strong)] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <InsightTile project={project} recommended={recommended} />

        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">Project highlights</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {project.highlights.slice(0, 3).map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 + index * 0.06 }}
                className="rounded-[1.15rem] border border-[var(--border)]/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] px-3.5 py-3 text-sm leading-6 text-[var(--foreground)]"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveProjectHeader({
  project,
  projects,
  recommendedSlug,
  onSelect,
}: {
  project: FeaturedProject;
  projects: readonly FeaturedProject[];
  recommendedSlug?: string | null;
  onSelect: (project: FeaturedProject) => void;
}) {
  return (
    <div className="space-y-5 px-5 pt-5 sm:px-6 sm:pt-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] lg:items-stretch">
        <div className="relative overflow-hidden rounded-[1.6rem] border border-[var(--border)]/70 bg-[color-mix(in_srgb,var(--panel-strong)_82%,transparent)] p-5">
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", ACCENT_STYLES[project.accent])} />
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="relative flex h-full flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">Active project</p>
                <span className="rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/8 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[var(--foreground)]">
                  {project.slug === recommendedSlug ? "Personalized lead" : "Synced with viewer"}
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
                  {project.name}
                </h3>
                <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">{project.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--foreground)] backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:hidden">
          <CompactProjectSelector
            projects={projects}
            activeProject={project}
            recommendedSlug={recommendedSlug}
            onSelect={onSelect}
          />
        </div>
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
  const [contentKey, setContentKey] = useState(0);
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
    setContentKey((value) => value + 1);

    void withViewTransition(() => {
      setActiveProject(project);
    });
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

        <div className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr] xl:items-start">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -18 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="hidden rounded-[2rem] border border-[var(--border)]/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_96%,transparent),color-mix(in_srgb,var(--panel-strong)_90%,transparent))] p-4 shadow-[var(--shadow)] backdrop-blur-xl xl:sticky xl:top-24 xl:block"
          >
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="section-eyebrow">Project selector</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Hover for previews, click for a synchronized stage transition.
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
            </div>
            <LayoutGroup id="desktop-project-selector">
              <div className="grid gap-3">
                {stableProjects.map((project, index) => (
                  <div key={project.slug} className="relative">
                    {activeProject.slug === project.slug ? (
                      <motion.span
                        layoutId="desktop-project-active-frame"
                        className="pointer-events-none absolute inset-0 rounded-[1.5rem] border border-[var(--accent)]/40"
                        transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.7 }}
                        aria-hidden="true"
                      />
                    ) : null}
                    <ProjectCard
                      project={project}
                      index={index}
                      active={activeProject.slug === project.slug}
                      onSelect={() => selectProject(project)}
                      className={cn(
                        project.slug === recommendedSlug &&
                          activeProject.slug !== project.slug &&
                          "shadow-[0_10px_25px_rgba(255,255,255,0.05)]"
                      )}
                    />
                  </div>
                ))}
              </div>
            </LayoutGroup>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            <motion.div
              className="rounded-[2rem] border border-[var(--border)]/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel)_94%,transparent),color-mix(in_srgb,var(--panel-strong)_88%,transparent))] shadow-[var(--shadow)] backdrop-blur-xl"
              style={reduceMotion ? undefined : { y: stageY }}
            >
              <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                  <Layers3 className="h-4 w-4 text-[var(--accent)]" />
                  <span>Interactive showcase</span>
                </div>
                <span className="rounded-full border border-[var(--border)]/80 bg-[var(--panel-strong)] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
                  {activeProject.preset}
                </span>
              </div>

              <motion.div
                key={`header-${contentKey}-${activeProject.slug}`}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                <ActiveProjectHeader
                  project={activeProject}
                  projects={stableProjects}
                  recommendedSlug={recommendedSlug}
                  onSelect={selectProject}
                />
              </motion.div>

              <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
                <ModelViewer
                  className="w-full"
                  height={700}
                  initialPreset={activeProject.preset}
                  preset={activeProject.preset}
                  presetOptions={viewerPresetOptions}
                  onPresetChange={selectProjectByPreset}
                  title={activeProject.name}
                  subtitle="Drag to inspect the active project, or switch builds from the viewer controls without losing the surrounding context."
                />
              </div>

              <motion.div
                key={`meta-${contentKey}-${activeProject.slug}`}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProjectMeta project={activeProject} recommended={activeProject.slug === recommendedSlug} />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ProjectsSection;
