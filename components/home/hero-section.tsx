"use client";

import { useRef, type MouseEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Download, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { withViewTransition } from "@/lib/view-transitions";

type HeroAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
  icon?: "arrow" | "download" | "play";
};

type HeroSectionProps = {
  eyebrow?: string;
  title: string;
  summary: string;
  actions: HeroAction[];
  meta?: readonly string[];
  className?: string;
};

function ActionIcon({ icon }: { icon?: HeroAction["icon"] }) {
  switch (icon) {
    case "download":
      return <Download className="h-4 w-4" />;
    case "play":
      return <PlayCircle className="h-4 w-4" />;
    default:
      return <ArrowUpRight className="h-4 w-4" />;
  }
}

export function HeroSection({
  eyebrow = "Portfolio / CV",
  title,
  summary,
  actions,
  meta = [],
  className,
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 18, mass: 0.4 });
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 18, mass: 0.4 });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -54]);
  const summaryY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -28]);
  const accentY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 64]);
  const glowX = useTransform(smoothX, [-1, 1], reduceMotion ? [0, 0] : [-28, 28]);
  const glowY = useTransform(smoothY, [-1, 1], reduceMotion ? [0, 0] : [-20, 20]);
  const glowTransform = useMotionTemplate`translate3d(${glowX}px, ${glowY}px, 0)`;

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    if (reduceMotion || !sectionRef.current) return;
    const bounds = sectionRef.current.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1);
    pointerY.set(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
  }

  function handleAnchorNavigation(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#")) return;
    const target = document.querySelector(href);
    if (!(target instanceof HTMLElement)) return;

    event.preventDefault();
    void withViewTransition(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const headlineParts = title.split(", ");

  return (
    <section
      id="top"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className={cn("relative mx-auto w-full max-w-7xl px-5 pt-8 sm:px-6 lg:px-8 lg:pt-12", className)}
    >
      <motion.div
        className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-7 shadow-[var(--shadow)] sm:p-10 lg:p-12"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
        <motion.div
          className="absolute -right-8 top-0 h-44 w-44 rounded-full bg-[var(--accent-soft)] blur-3xl"
          style={reduceMotion ? undefined : { y: accentY, transform: glowTransform }}
        />
        <motion.div
          className="absolute left-[8%] top-[14%] h-32 w-32 rounded-full bg-white/6 blur-3xl"
          style={reduceMotion ? undefined : { x: glowX, y: glowY }}
        />

        <motion.p className="section-eyebrow" style={reduceMotion ? undefined : { y: summaryY }}>
          {eyebrow}
        </motion.p>

        <motion.div style={reduceMotion ? undefined : { y: titleY }} className="mt-5 max-w-5xl">
          <h1 className="font-heading text-5xl font-semibold tracking-tight text-[var(--foreground)] sm:text-6xl lg:text-7xl">
            {headlineParts.map((part, index) => (
              <motion.span
                key={part}
                className="block"
                initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.08 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                {part}
                {index < headlineParts.length - 1 ? "," : ""}
              </motion.span>
            ))}
          </h1>
          {!reduceMotion ? (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none mt-4 h-px w-full max-w-3xl bg-gradient-to-r from-[var(--accent)]/60 via-white/18 to-transparent"
              style={{ x: glowX }}
            />
          ) : null}
        </motion.div>

        <motion.p
          className="mt-6 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg"
          style={reduceMotion ? undefined : { y: summaryY }}
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.72, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {summary}
        </motion.p>

        <motion.div
          className="mt-8 flex flex-wrap gap-3"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.72, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          {actions.map((action, index) => (
            <motion.a
              key={`${action.href}-${action.label}`}
              href={action.href}
              onClick={(event) => handleAnchorNavigation(event, action.href)}
              className={cn(action.variant === "primary" ? "button-primary" : "button-secondary")}
              whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }}
              whileTap={reduceMotion ? undefined : { scale: 0.985 }}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.26 + index * 0.06 }}
            >
              {action.label}
              <ActionIcon icon={action.icon} />
            </motion.a>
          ))}
        </motion.div>

        {meta.length > 0 ? (
          <motion.div
            className="mt-10 flex flex-wrap gap-2 text-xs uppercase tracking-[0.22em] text-[var(--muted)]"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {meta.map((item, index) => (
              <motion.span
                key={item}
                className="rounded-full border border-[var(--border)]/70 px-3 py-2"
                whileHover={reduceMotion ? undefined : { y: -2, borderColor: "rgba(229,72,63,0.28)" }}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.46, delay: 0.32 + index * 0.05 }}
              >
                {item}
              </motion.span>
            ))}
          </motion.div>
        ) : null}
      </motion.div>
    </section>
  );
}
