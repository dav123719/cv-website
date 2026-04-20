import { getAnalyticsStore } from "./analytics";

export type ProjectPersonalizationScore = {
  slug: string;
  score: number;
};

const DEFAULT_WEIGHTS: Record<string, number> = {
  project_open: 6,
  viewer_preset_change: 3,
  viewer_reset: 1,
  viewer_wireframe: 1,
};

export async function getProjectPersonalizationScores(): Promise<ProjectPersonalizationScore[]> {
  const store = await getAnalyticsStore();
  const scores = new Map<string, number>();

  for (const event of store.events) {
    const metadataProject =
      typeof event.metadata?.project === "string" ? event.metadata.project : null;
    const pathProject = event.path.startsWith("/projects/")
      ? event.path.slice("/projects/".length)
      : null;
    const slug = metadataProject ?? pathProject;

    if (!slug) continue;

    const weight = DEFAULT_WEIGHTS[event.type] ?? 1;
    scores.set(slug, (scores.get(slug) ?? 0) + weight);
  }

  return [...scores.entries()]
    .map(([slug, score]) => ({ slug, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}
