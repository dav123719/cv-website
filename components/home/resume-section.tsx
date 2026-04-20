import type { ReactNode } from "react";
import { GraduationCap, BriefcaseBusiness } from "lucide-react";
import { siteContent, type SiteContent } from "@/data/site-content";

type ResumeSectionProps = {
  content?: Pick<SiteContent, "experience" | "education">;
};

function ResumeEntry({
  title,
  subtitle,
  date,
  summary,
  icon,
}: {
  title: string;
  subtitle: string;
  date: string;
  summary: string;
  icon: ReactNode;
}) {
  return (
    <article className="relative rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-strong)] p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--panel)] text-[var(--accent)]">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]">{title}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
            </div>
            <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
              {date}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{summary}</p>
        </div>
      </div>
    </article>
  );
}

export function ResumeSection({ content = siteContent }: ResumeSectionProps) {
  return (
    <section id="work" className="scroll-mt-28 space-y-5">
      <div className="max-w-3xl">
        <p className="section-eyebrow">Experience</p>
        <h2 className="mt-3 section-title">Work experience and education establish the production context first.</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Professional work sits here as the clearest proof of process before the selected projects continue that same
          logic in more hands-on form.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6">
          <p className="section-eyebrow">Professional Work</p>
          <div className="mt-6 space-y-4">
            {content.experience.map((entry) => (
              <ResumeEntry
                key={entry.title}
                title={entry.title}
                subtitle={entry.subtitle}
                date={entry.date}
                summary={entry.summary}
                icon={<BriefcaseBusiness className="h-4 w-4" />}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6">
          <p className="section-eyebrow">Education</p>
          <div className="mt-6 space-y-4">
            {content.education.map((entry) => (
              <ResumeEntry
                key={entry.title}
                title={entry.title}
                subtitle={entry.subtitle}
                date={entry.date}
                summary={entry.summary}
                icon={<GraduationCap className="h-4 w-4" />}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResumeSection;
