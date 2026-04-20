import { cn } from "@/lib/utils";
import { siteContent, type SiteContent, type ToolEntry } from "@/data/site-content";

type ToolsSectionProps = {
  content?: Pick<SiteContent, "toolGroups" | "formats">;
  className?: string;
};

function ToolLogo({ logo, name }: Pick<ToolEntry, "logo" | "name">) {
  const base = "h-12 w-12 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-2.5 text-[var(--foreground)]";

  switch (logo) {
    case "fusion360":
      return (
        <div className={cn(base, "text-[#ff6a2b]")} aria-hidden="true">
          <svg viewBox="0 0 48 48" className="h-full w-full fill-none stroke-current stroke-[2.8]">
            <path d="M9 11.5 21.5 6l17 7.5-8 4-9-4-7.5 3.6V31L9 28.4Z" />
            <path d="m21.5 13.5 9 4v10l-9 4-7.5-3.5V17.1Z" />
            <path d="m30.5 17.5 8-4V28l-8 3.5Z" />
          </svg>
        </div>
      );
    case "kicad":
      return (
        <div className={cn(base, "text-[#2f80ed]")} aria-hidden="true">
          <svg viewBox="0 0 48 48" className="h-full w-full fill-none stroke-current stroke-[2.6]">
            <circle cx="13" cy="13" r="3.5" />
            <circle cx="35" cy="13" r="3.5" />
            <circle cx="13" cy="35" r="3.5" />
            <circle cx="35" cy="35" r="3.5" />
            <path d="M16.5 13H22m4 0h5.5M13 16.5V22m0 4v5.5M35 16.5V22m0 4v5.5M16.5 35H22m4 0h5.5" />
            <path d="M24 16v16m-5-8h10" />
          </svg>
        </div>
      );
    case "creality":
      return (
        <div className={cn(base, "text-[#17b1ff]")} aria-hidden="true">
          <svg viewBox="0 0 48 48" className="h-full w-full fill-none stroke-current stroke-[2.6]">
            <path d="M24 8c8.5 0 15 6.4 15 15S32.5 38 24 38 9 31.6 9 23 15.5 8 24 8Z" />
            <path d="M24 15c4.8 0 8 3.1 8 8s-3.2 8-8 8c-4.7 0-8-3.1-8-8" />
          </svg>
        </div>
      );
    case "prusaslicer":
      return (
        <div className={cn(base, "text-[#ff6d1f]")} aria-hidden="true">
          <svg viewBox="0 0 48 48" className="h-full w-full fill-none stroke-current stroke-[2.8]">
            <path d="M14 15h12a7 7 0 1 1 0 14H14Z" />
            <path d="M14 15v18" />
            <path d="M26 22h8" />
          </svg>
        </div>
      );
    case "arduino":
      return (
        <div className={cn(base, "text-[#00b9b0]")} aria-hidden="true">
          <svg viewBox="0 0 48 48" className="h-full w-full fill-none stroke-current stroke-[2.5]">
            <path d="M16 24c0-4.8 3.3-8 8-8s8 3.2 8 8-3.3 8-8 8-8-3.2-8-8Z" />
            <path d="M9 24h10m10 0h10M24 19v10m-8-5h4m12 0h-4" />
          </svg>
        </div>
      );
    case "github":
      return (
        <div className={cn(base, "text-[var(--foreground)]")} aria-hidden="true">
          <svg viewBox="0 0 48 48" className="h-full w-full fill-none stroke-current stroke-[2.4]">
            <path d="M24 10c-7.8 0-14 6.2-14 14 0 6.2 4 11.5 9.6 13.3.7.1 1-.3 1-.7v-2.7c-3.9.9-4.8-1.7-4.8-1.7-.7-1.7-1.6-2.1-1.6-2.1-1.3-.9.1-.9.1-.9 1.4.1 2.2 1.5 2.2 1.5 1.3 2.1 3.3 1.5 4.1 1.2.1-.9.5-1.5.9-1.9-3.1-.3-6.4-1.6-6.4-7 0-1.6.6-2.9 1.5-4-.1-.4-.7-1.9.1-4 0 0 1.2-.4 4.1 1.5 1.2-.3 2.5-.5 3.8-.5s2.6.2 3.8.5c2.9-1.9 4.1-1.5 4.1-1.5.8 2.1.2 3.6.1 4 1 .9 1.5 2.4 1.5 4 0 5.4-3.3 6.7-6.4 7 .5.4 1 1.3 1 2.6v3.8c0 .4.3.8 1 .7A14 14 0 0 0 38 24c0-7.8-6.2-14-14-14Z" />
          </svg>
        </div>
      );
  }
}

function ToolCard({ item }: { item: ToolEntry }) {
  return (
    <article className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--panel-strong)] p-4">
      <div className="flex items-start gap-4">
        <ToolLogo logo={item.logo} name={item.name} />
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]">{item.name}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
        </div>
      </div>
    </article>
  );
}

export function ToolsSection({ content = siteContent, className }: ToolsSectionProps) {
  return (
    <section id="tools" className={cn("scroll-mt-28 space-y-6", className)}>
      <div className="max-w-3xl">
        <p className="section-eyebrow">Tools</p>
        <h2 className="mt-3 section-title">The software stack is shown by workflow, not as a random skills dump.</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
          The tools are grouped by how the work actually happens: model and electronics first, fabrication and delivery
          after that. Output formats stay secondary because they matter less than the process behind them.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {content.toolGroups.map((group) => (
          <div key={group.title} className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6">
            <p className="section-eyebrow">{group.title}</p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">{group.note}</p>
            <div className="mt-6 grid gap-4">
              {group.items.map((item) => (
                <ToolCard key={item.name} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Preferred output</p>
          {content.formats.map((format) => (
            <span key={format} className="chip">
              {format}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ToolsSection;
