"use client";

import { type ComponentType, type SVGProps } from "react";
import { ArrowUpRight, Download, GitBranch, Link, Mail, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/home/section-heading";
import { trackClientEvent } from "@/lib/client-analytics";

type ContactSectionProps = {
  title: string;
  description: string;
  email: string;
  linkedin: string;
  github: string;
  location: string;
  phone: string;
  cvPath: string;
  cvNote: string;
  languages: readonly string[];
  onTrack?: (type: string, path: string, metadata?: Record<string, string>) => void;
  className?: string;
};

type DetailRowProps = {
  href?: string;
  label: string;
  value: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  target?: string;
  rel?: string;
  onClick?: () => void;
  muted?: boolean;
};

function DetailRow({ href, label, value, icon: Icon, target, rel, onClick, muted }: DetailRowProps) {
  const classes = cn(
    "opaque-button group flex min-h-[5.25rem] items-start gap-4 rounded-2xl border border-[var(--border)] px-4 py-4",
    muted && "cursor-default opacity-80"
  );

  const content = (
    <>
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--accent)] transition duration-300 group-hover:scale-105 group-hover:border-[color-mix(in_srgb,var(--accent)_50%,var(--border))]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.68rem] uppercase tracking-[0.24em] text-[var(--muted)]">{label}</span>
        <span className="mt-1 block break-words text-sm font-medium text-[var(--foreground)] sm:truncate">
          {value}
        </span>
      </span>
      {href ? (
        <ArrowUpRight className="ml-auto mt-1 h-4 w-4 text-[var(--muted)] transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--foreground)]" />
      ) : null}
    </>
  );

  if (!href) {
    return <div className={classes}>{content}</div>;
  }

  return (
    <a href={href} target={target} rel={rel} onClick={onClick} className={classes}>
      {content}
    </a>
  );
}

type ProfileTileProps = {
  href?: string;
  label: string;
  value: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
  onClick?: () => void;
  muted?: boolean;
};

function ProfileTile({ href, label, value, icon: Icon, className, onClick, muted }: ProfileTileProps) {
  const classes = cn(
    "opaque-button group flex min-h-[5rem] items-start gap-4 rounded-2xl border border-[var(--border)] px-4 py-4",
    muted && "cursor-default opacity-75",
    className
  );

  const content = (
    <>
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--accent)] transition duration-300 group-hover:scale-105 group-hover:border-[color-mix(in_srgb,var(--accent)_50%,var(--border))]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.68rem] uppercase tracking-[0.24em] text-[var(--muted)]">{label}</span>
        <span className="mt-1 block break-words text-sm font-medium text-[var(--foreground)]">{value}</span>
      </span>
      {href ? (
        <ArrowUpRight className="ml-auto mt-1 h-4 w-4 text-[var(--muted)] transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--foreground)]" />
      ) : (
        <span className="ml-auto mt-1 text-[0.68rem] uppercase tracking-[0.22em] text-[var(--muted)]">Slot</span>
      )}
    </>
  );

  if (!href) {
    return <div className={classes}>{content}</div>;
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={onClick} className={classes}>
      {content}
    </a>
  );
}

export function ContactSection({
  title,
  description,
  email,
  linkedin,
  github,
  location,
  phone,
  cvPath,
  cvNote,
  languages: _languages,
  className
}: ContactSectionProps) {
  return (
    <section id="contact" className={cn("premium-card scroll-mt-28 rounded-[2rem] p-6 sm:p-7", className)}>
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <SectionHeading eyebrow="Contact" title={title} description={description} />

          <div className="premium-card flex-1 rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="section-eyebrow">Direct contact</p>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                  Email, phone, and location are kept together so the contact area reads as one block instead of three
                  separate fragments.
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--panel)] text-[var(--accent)]">
                <Mail className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <DetailRow
                href={`mailto:${email}`}
                label="Email"
                value={email}
                icon={Mail}
                onClick={() => void trackClientEvent("contact_click", "mailto", { target: "email" })}
              />
              <DetailRow
                href={`tel:${phone}`}
                label="Phone"
                value={phone}
                icon={Phone}
                onClick={() => void trackClientEvent("contact_click", "tel", { target: "phone" })}
              />
              <DetailRow href={undefined} label="Location" value={location} icon={MapPin} muted />
            </div>
          </div>

          <div className="premium-card rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="section-eyebrow">CV</p>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">{cvNote}</p>
              </div>
              <a
                href={cvPath}
                className="opaque-button inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
                onClick={() => void trackClientEvent("cv_download", cvPath)}
              >
                <Download className="h-4 w-4" />
                Download CV
              </a>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="premium-card flex-1 rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="section-eyebrow">Profiles</p>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                  Public profiles live here, with one open slot kept aside for a future Facebook or other public profile.
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--panel)] text-[var(--accent)]">
                <Link className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
              <ProfileTile
                href={linkedin}
                label="LinkedIn"
                value="Professional profile"
                icon={Link}
                onClick={() => void trackClientEvent("contact_click", linkedin, { target: "linkedin" })}
              />
              <ProfileTile
                href={github}
                label="GitHub"
                value="Code and experiments"
                icon={GitBranch}
                onClick={() => void trackClientEvent("contact_click", github, { target: "github" })}
              />
              <ProfileTile
                label="Facebook"
                value="Future profile slot"
                icon={Link}
                muted
                className="sm:col-span-2 lg:col-span-1 xl:col-span-1"
              />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel-strong)_94%,transparent)] p-5 transition duration-300 hover:border-[color-mix(in_srgb,var(--accent)_28%,var(--border))]">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Availability</p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Contact details and profile links are grouped here so the section stays compact and the empty form space is
              gone.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
