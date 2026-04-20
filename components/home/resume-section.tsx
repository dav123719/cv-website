import type { ReactNode } from "react";
import { BriefcaseBusiness, GraduationCap } from "lucide-react";
import { siteContent, type ResumeEntry, type ResumeRelatedItem, type SiteContent } from "@/data/site-content";

type ResumeSectionProps = {
  content?: Pick<SiteContent, "experience" | "education" | "independentProjects">;
};

function RelatedItem({ item }: { item: ResumeRelatedItem }) {
  return (
    <div className="rounded-[1.15rem] border border-[var(--border)]/85 bg-[var(--panel)]/70 p-4">
      <h4 className="text-sm font-medium tracking-tight text-[var(--foreground)]">{item.title}</h4>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.summary}</p>
    </div>
  );
}

function ResumeCard({ entry, icon }: { entry: ResumeEntry; icon: ReactNode }) {
  return (
    <article className="group relative overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-strong)] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_32%,var(--border))] hover:shadow-[0_16px_34px_color-mix(in_srgb,var(--foreground)_7%,transparent)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/35 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--panel)] text-[var(--accent)] transition duration-300 group-hover:scale-105 group-hover:border-[color-mix(in_srgb,var(--accent)_42%,var(--border))]">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]">{entry.title}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{entry.subtitle}</p>
            </div>
            <span className="w-fit rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
              {entry.date}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{entry.summary}</p>

          {entry.relatedItems?.length ? (
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
                {entry.relatedLabel ?? "Related items"}
              </p>
              <div className="mt-3 grid gap-3">
                {entry.relatedItems.map((item) => (
                  <RelatedItem key={item.title} item={item} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function CompactResumeCard({ entry, icon }: { entry: ResumeEntry; icon: ReactNode }) {
  return (
    <article className="relative overflow-hidden rounded-[1.35rem] border border-[var(--border)] border-dashed bg-[color-mix(in_srgb,var(--panel-strong)_92%,transparent)] p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--panel)] text-[var(--accent)]">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]">{entry.title}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{entry.subtitle}</p>
            </div>
            <span className="w-fit rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
              {entry.date}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{entry.summary}</p>
          {entry.relatedItems?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {entry.relatedItems.map((item) => (
                <span
                  key={item.title}
                  className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]"
                >
                  {item.title}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ResumeSection({ content = siteContent }: ResumeSectionProps) {
  return (
    <section id="work" className="scroll-mt-28 space-y-6">
      <div className="max-w-3xl">
        <p className="section-eyebrow">Experience</p>
        <h2 className="mt-3 section-title">Work, study, and independent builds stay grouped by context.</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Each card keeps the parent context visible and nests the most relevant projects underneath so the section
          reads cleanly in one pass.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="premium-card rounded-[2rem] p-5 sm:p-6">
          <p className="section-eyebrow">Professional Work</p>
          <div className="mt-6 space-y-4">
            {content.experience.map((entry) => (
              <ResumeCard key={entry.title} entry={entry} icon={<BriefcaseBusiness className="h-4 w-4" />} />
            ))}
          </div>
        </div>

        <div className="premium-card rounded-[2rem] p-5 sm:p-6">
          <p className="section-eyebrow">Education</p>
          <div className="mt-6 space-y-4">
            {content.education.map((entry) => (
              <ResumeCard key={entry.title} entry={entry} icon={<GraduationCap className="h-4 w-4" />} />
            ))}
          </div>
        </div>

        <div className="premium-card rounded-[2rem] p-5 sm:p-6 lg:col-span-2">
          <p className="section-eyebrow">Independent / self-directed</p>
          <div className="mt-6">
            {content.independentProjects.map((entry) => (
              <CompactResumeCard key={entry.title} entry={entry} icon={<BriefcaseBusiness className="h-4 w-4" />} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResumeSection;
