import { cn } from "@/lib/utils";
import { siteContent, type SiteContent, type ToolEntry } from "@/data/site-content";

type ToolsSectionProps = {
  content?: Pick<SiteContent, "toolGroups">;
  className?: string;
};

function ToolLogo({ logo, name }: Pick<ToolEntry, "logo" | "name">) {
  const logoSrc: Record<ToolEntry["logo"], string> = {
    fusion360: "/brand/autodesk.svg",
    kicad: "/brand/kicad.svg",
    creality: "/brand/creality.svg",
    prusaslicer: "/brand/prusa-slicer.png",
    arduino: "/brand/arduino.svg",
    github: "/brand/github.svg"
  };

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--panel-strong)_88%,transparent),color-mix(in_srgb,var(--panel)_96%,transparent))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 group-hover:scale-105 group-hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))]"
      aria-hidden="true"
    >
      <img
        src={logoSrc[logo]}
        alt=""
        className={cn(
          "h-full w-full object-contain",
          logo === "github" && "invert-0 dark:invert"
        )}
        loading="lazy"
      />
    </div>
  );
}

function ToolCard({ item }: { item: ToolEntry }) {
  return (
    <article className="group rounded-[1.4rem] border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel-strong)_94%,transparent)] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] hover:shadow-[0_14px_30px_color-mix(in_srgb,var(--foreground)_6%,transparent)]">
      <div className="flex items-start gap-4">
        <ToolLogo logo={item.logo} name={item.name} />
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)] transition duration-300 group-hover:text-[color-mix(in_srgb,var(--accent)_68%,var(--foreground))]">{item.name}</h3>
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
        <h2 className="mt-3 section-title">The software stack is shown as one working set, not a scattered skills list.</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Everything is presented inside a single element, with the workflow still readable inside it. The focus stays
          on the tools that actually shape the work.
        </p>
      </div>

      <article className="premium-card rounded-[2rem] p-6 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="section-eyebrow">Tools</p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Model creation, board design, fabrication, and delivery stay together in one container so the section
              reads like a working stack instead of separate shelves.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {content.toolGroups.map((group) => (
              <span key={group.title} className="chip text-[0.78rem]">
                {group.title}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-7">
          {content.toolGroups.map((group) => (
            <section key={group.title} className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--foreground)]">
                    {group.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">{group.note}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((item) => (
                  <ToolCard key={item.name} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </section>
  );
}

export default ToolsSection;
