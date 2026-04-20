"use client";

import { type FormEvent, type InputHTMLAttributes, type TextareaHTMLAttributes, useState } from "react";
import { ArrowUpRight, Download, GitBranch, Link, Mail, MapPin, Phone, Send } from "lucide-react";
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

type DraftState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function ContactLink({
  href,
  label,
  value,
  icon: Icon,
  target,
  rel,
  onClick
}: {
  href: string;
  label: string;
  value: string;
  icon: typeof Mail;
  target?: string;
  rel?: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={cn(
        "group relative flex min-h-[5.25rem] items-start gap-4 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-4 transition duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--panel-strong)]"
      )}
    >
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--accent)_75%,transparent)] to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--accent)] transition duration-300 group-hover:scale-105 group-hover:border-[color-mix(in_srgb,var(--accent)_50%,var(--border))]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.68rem] uppercase tracking-[0.24em] text-[var(--muted)]">{label}</span>
        <span className="mt-1 block truncate text-sm font-medium text-[var(--foreground)]">{value}</span>
      </span>
      <ArrowUpRight className="ml-auto mt-1 h-4 w-4 text-[var(--muted)] transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--foreground)]" />
    </a>
  );
}

function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.22em] text-[var(--muted)]">{label}</span>
      <input
        {...props}
        className={cn(
          "w-full rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition duration-200 placeholder:text-[var(--muted)]",
          "focus:border-[var(--accent)] focus:bg-[var(--panel-strong)]"
        )}
      />
    </label>
  );
}

function TextArea({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.22em] text-[var(--muted)]">{label}</span>
      <textarea
        {...props}
        className={cn(
          "min-h-36 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition duration-200 placeholder:text-[var(--muted)]",
          "focus:border-[var(--accent)] focus:bg-[var(--panel-strong)]"
        )}
      />
    </label>
  );
}

function buildMailto(email: string, state: DraftState) {
  const subject = state.subject.trim() || "Portfolio enquiry";
  const body = [
    `Name: ${state.name.trim() || "Not provided"}`,
    `Email: ${state.email.trim() || "Not provided"}`,
    "",
    state.message.trim() || "Hello,",
    "",
    "Best regards,"
  ].join("\n");

  const params = new URLSearchParams({
    subject,
    body
  });

  return `mailto:${email}?${params.toString()}`;
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
  className
}: ContactSectionProps) {
  const [draft, setDraft] = useState<DraftState>({
    name: "",
    email: "",
    subject: "Portfolio enquiry",
    message: ""
  });

  const mailto = buildMailto(email, draft);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void trackClientEvent("contact_submit", "mailto_form", {
      target: "email",
      subject: draft.subject.trim() || "Portfolio enquiry"
    });

    window.location.href = mailto;
  }

  return (
    <section
      id="contact"
      className={cn(
        "scroll-mt-28 rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow)]",
        className
      )}
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <SectionHeading eyebrow="Contact" title={title} description={description} />

          <div className="grid gap-3 sm:grid-cols-2">
            <ContactLink
              href={`mailto:${email}`}
              label="Email"
              value={email}
              icon={Mail}
              onClick={() => void trackClientEvent("contact_click", "mailto", { target: "email" })}
            />
            <ContactLink
              href={`tel:${phone}`}
              label="Phone"
              value={phone}
              icon={Phone}
              onClick={() => void trackClientEvent("contact_click", "tel", { target: "phone" })}
            />
            <ContactLink
              href={linkedin}
              label="LinkedIn"
              value="Profile"
              icon={Link}
              target="_blank"
              rel="noreferrer"
              onClick={() => void trackClientEvent("contact_click", linkedin, { target: "linkedin" })}
            />
            <ContactLink
              href={github}
              label="GitHub"
              value="Source and experiments"
              icon={GitBranch}
              target="_blank"
              rel="noreferrer"
              onClick={() => void trackClientEvent("contact_click", github, { target: "github" })}
            />
            <div className="sm:col-span-2 flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-4 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--panel-strong)]">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--accent)] transition duration-300">
                <MapPin className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.68rem] uppercase tracking-[0.24em] text-[var(--muted)]">Location</span>
                <span className="mt-1 block text-sm font-medium text-[var(--foreground)]">{location}</span>
              </span>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel-strong)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">CV</p>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--foreground)]">{cvNote}</p>
              </div>
              <a
                href={cvPath}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition duration-200 hover:border-[var(--accent)] hover:bg-[var(--panel)]"
                onClick={() => void trackClientEvent("cv_download", cvPath)}
              >
                <Download className="h-4 w-4" />
                Download CV
              </a>
            </div>
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel-strong)] p-5 sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(220,38,38,0.12),transparent_34%)]" />
          <div className="pointer-events-none absolute -right-10 top-4 h-32 w-32 rounded-full bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] blur-3xl" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">Send a message</p>
                <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">Opens your email app with a ready draft.</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
                  This keeps the section fast, simple, and usable today without needing a backend mail service.
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--panel)] text-[var(--accent)]">
                <Send className="h-4 w-4" />
              </div>
            </div>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Your name"
                  type="text"
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Name"
                  autoComplete="name"
                  required
                />
                <Field
                  label="Your email"
                  type="email"
                  value={draft.email}
                  onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              <Field
                label="Subject"
                type="text"
                value={draft.subject}
                onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))}
                placeholder="Project inquiry, role, or collaboration"
                autoComplete="off"
                required
              />

              <TextArea
                label="Message"
                value={draft.message}
                onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))}
                placeholder="Tell me what you are hiring for, what you need help with, and the timeline."
                rows={6}
                required
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white transition duration-200 hover:opacity-90"
                >
                  Open email client
                  <Mail className="h-4 w-4" />
                </button>
                <a
                  href={mailto}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-5 py-3 text-sm font-medium text-[var(--foreground)] transition duration-200 hover:border-[var(--accent)] hover:bg-[var(--panel)]"
                  onClick={() => void trackClientEvent("contact_click", "mailto_draft", { target: "email_form" })}
                >
                  Prefill draft
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>

              <p className="text-xs leading-6 text-[var(--muted)]">
                The form does not send mail itself. It composes a message locally and opens your default email app, which works without backend configuration.
              </p>
            </form>
          </div>
        </aside>
      </div>
    </section>
  );
}
