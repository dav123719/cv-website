"use client";

import { type CSSProperties, type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, Box, Image as ImageIcon, Layers3 } from "lucide-react";
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
  const activeProjectRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    activeProjectRef.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "auto",
    });
  }, [activeProject.slug]);

  return (
    <div className="rounded-[1.4rem] border border-[var(--border)]/70 bg-[color-mix(in_srgb,var(--panel-strong)_90%,transparent)] p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">Project selector</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Choose the build shown in evidence and the CAD viewer.
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-[var(--muted)]" />
      </div>

      <LayoutGroup id="project-selector-tabs">
        <div className="selector-scroll-fade relative -mx-2 mt-3 overflow-hidden">
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {projects.map((project, index) => {
            const active = project.slug === activeProject.slug;
            const recommended = project.slug === recommendedSlug && !active;

            return (
              <div key={project.slug} ref={active ? activeProjectRef : undefined} className="min-w-[13.5rem] snap-start sm:min-w-[15rem] lg:min-w-0 lg:flex-1">
                <ProjectCard
                  project={project}
                  index={index}
                  active={active}
                  label={selectorLabel(project)}
                  onSelect={() => onSelect(project)}
                  className={cn(
                    "h-full w-full",
                    recommended && !active && "shadow-[0_10px_20px_rgba(255,255,255,0.04)]",
                    reduceMotion && "transition-none"
                  )}
                />
              </div>
            );
          })}
          </div>
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
        "project-media-card group relative flex w-full flex-col rounded-[1rem] border bg-[var(--panel)] p-2.5 text-left transition duration-200 hover:border-[color-mix(in_srgb,var(--accent)_32%,var(--border))]",
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
        <span className="project-media-card__visual mb-3 block w-full overflow-hidden rounded-[0.75rem] border border-[var(--border)]/60 bg-black/20">
          <img
            src={item.src}
            alt={`${project.name}: ${item.label}`}
            className="h-full w-full object-cover"
          />
        </span>
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

function ProjectEvidencePreview({
  item,
  project,
  count,
  index,
  hasMultiple,
  onPrevious,
  onNext,
  reduceMotion,
}: {
  item: ProjectMediaItem;
  project: FeaturedProject;
  count: number;
  index: number;
  hasMultiple: boolean;
  onPrevious: () => void;
  onNext: () => void;
  reduceMotion: boolean;
}) {
  const Icon = item.type === "model" ? Box : ImageIcon;

  return (
    <div className="project-evidence-preview">
      <div className="project-evidence-preview__media">
        {item.src && item.type === "photo" ? (
          <img src={item.src} alt={`${project.name}: ${item.label}`} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_20%,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_44%),color-mix(in_srgb,var(--panel-strong)_88%,black)]">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-black/20">
                <Icon className="h-6 w-6 text-[var(--muted)]" />
              </span>
              <span className="max-w-[18rem] text-sm leading-6 text-[var(--muted)]">
                {item.type === "model" ? "CAD reference available in the viewer below." : "Build photo pending upload."}
              </span>
            </div>
          </div>
        )}
        {hasMultiple ? (
          <div className="project-evidence-preview__controls" aria-label="Large photo navigation">
            <button
              type="button"
              onClick={onPrevious}
              disabled={index === 0}
              className={cn("project-evidence-preview__arrow", !reduceMotion && "hover:-translate-x-0.5")}
              aria-label="Show previous project media"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="project-evidence-preview__counter">
              {index + 1}/{count}
            </span>
            <button
              type="button"
              onClick={onNext}
              disabled={index === count - 1}
              className={cn("project-evidence-preview__arrow", !reduceMotion && "hover:translate-x-0.5")}
              aria-label="Show next project media"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
      <div className="project-evidence-preview__caption">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">{item.type}</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-[var(--foreground)]">{item.label}</h3>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">{item.caption}</p>
      </div>
    </div>
  );
}

function ProjectMediaStrip({ project, reduceMotion }: { project: FeaturedProject; reduceMotion: boolean }) {
  const gallery = project.gallery ?? [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const hasMultiple = gallery.length > 1;
  const mediaRailRef = useRef<HTMLDivElement | null>(null);
  const mediaItemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const safeSelectedIndex = gallery.length ? Math.min(selectedIndex, gallery.length - 1) : 0;

  useEffect(() => {
    setSelectedIndex(0);
  }, [project.slug]);

  useEffect(() => {
    const rail = mediaRailRef.current;
    const item = mediaItemRefs.current[safeSelectedIndex];
    if (!rail || !item) return;

    const railRect = rail.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const targetLeft = rail.scrollLeft + itemRect.left - railRect.left - (rail.clientWidth - itemRect.width) / 2;

    rail.scrollTo({
      left: Math.max(targetLeft, 0),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [safeSelectedIndex, project.slug, reduceMotion]);

  if (!gallery.length) {
    return null;
  }

  const selectMedia = (index: number) => {
    setDirection(index >= safeSelectedIndex ? 1 : -1);
    setSelectedIndex(index);
  };

  const selectedItem = gallery[safeSelectedIndex] ?? gallery[0];
  const previousMedia = () => {
    setDirection(-1);
    setSelectedIndex((current) => Math.max(current - 1, 0));
  };
  const nextMedia = () => {
    setDirection(1);
    setSelectedIndex((current) => Math.min(current + 1, gallery.length - 1));
  };
  const handleGalleryKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previousMedia();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextMedia();
    }
  };

  return (
    <div className="project-evidence-shell" aria-label="Project media gallery" onKeyDown={handleGalleryKeyDown}>
      <div className="mb-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">Project evidence</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Build images and CAD references stay attached to the selected project.
          </p>
        </div>
        {hasMultiple ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={previousMedia}
              disabled={safeSelectedIndex === 0}
              className="opaque-button inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] text-xs font-medium disabled:pointer-events-none disabled:opacity-45"
              aria-label="Show previous project thumbnail"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1.5 text-xs text-[var(--muted)]">
              {safeSelectedIndex + 1}/{gallery.length}
            </span>
            <button
              type="button"
              onClick={nextMedia}
              disabled={safeSelectedIndex === gallery.length - 1}
              className="opaque-button inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] text-xs font-medium disabled:pointer-events-none disabled:opacity-45"
              aria-label="Show next project thumbnail"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={`${project.slug}-${selectedItem.label}`}
          custom={direction}
          initial={reduceMotion ? false : { opacity: 0, x: direction * 18, scale: 1.01 }}
          animate={reduceMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: direction * -18, scale: 0.995 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          aria-live="polite"
        >
          <ProjectEvidencePreview
            item={selectedItem}
            project={project}
            count={gallery.length}
            index={safeSelectedIndex}
            hasMultiple={hasMultiple}
            onPrevious={previousMedia}
            onNext={nextMedia}
            reduceMotion={reduceMotion}
          />
        </motion.div>
      </AnimatePresence>

      <div ref={mediaRailRef} className="project-media-viewport mt-4" aria-label="Project thumbnail navigation">
        <div className="project-media-track" style={{ "--media-count": gallery.length } as CSSProperties}>
          {gallery.map((item, index) => (
            <motion.div
              key={`${project.slug}-${item.label}`}
              ref={(node) => {
                mediaItemRefs.current[index] = node;
              }}
              className="snap-center"
              animate={reduceMotion ? undefined : { opacity: index === safeSelectedIndex ? 1 : 0.72 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProjectMediaCard
                item={item}
                project={project}
                selected={index === safeSelectedIndex}
                onSelect={() => selectMedia(index)}
                reduceMotion={reduceMotion}
              />
            </motion.div>
          ))}
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
          className="premium-card project-showcase-card rounded-[2rem] p-4 backdrop-blur-xl sm:p-5"
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
