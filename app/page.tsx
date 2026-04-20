import { SiteHeader } from "@/components/home/site-header";
import { HeroSection } from "@/components/home/hero-section";
import { ProjectsSection } from "@/components/home/projects-section";
import { ResumeSection } from "@/components/home/resume-section";
import { ContactSection } from "@/components/home/contact-section";
import { ToolsSection } from "@/components/home/tools-section";
import { SectionReveal } from "@/components/motion/section-reveal";
import { siteContent } from "@/data/site-content";

export default function Home() {
  return (
    <main className="relative overflow-hidden pb-20">
      <SiteHeader
        name={siteContent.name}
        role={siteContent.role}
        location={siteContent.location}
        navItems={[
          { href: "#work", label: "Work" },
          { href: "#projects", label: "Projects" },
          { href: "#tools", label: "Tools" },
          { href: "#contact", label: "Contact" },
        ]}
      />

      <HeroSection
        title="Engineering-focused prototypes, PCB work, and 3D design that are built to be used."
        summary={siteContent.summary}
        actions={[
          { href: "#work", label: "View background", variant: "primary", icon: "arrow" },
          { href: "#contact", label: "CV + contact", variant: "secondary", icon: "download" },
        ]}
      />

      <div className="mx-auto mt-5 flex w-full max-w-7xl flex-col gap-10 px-5 sm:mt-6 sm:gap-12 sm:px-6 lg:px-8">
        <SectionReveal delay={0.05}>
          <ResumeSection content={siteContent} />
        </SectionReveal>

        <div aria-hidden="true" className="px-1 sm:px-0">
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)]/70 to-transparent" />
        </div>

        <ProjectsSection projects={siteContent.featuredProjects} />

        <div aria-hidden="true" className="px-1 sm:px-0">
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)]/60 to-transparent" />
        </div>

        <SectionReveal delay={0.08}>
          <ToolsSection content={siteContent} />
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <ContactSection
            title="Direct contact for recruiters, engineering teams, and prototyping work."
            description="The final section combines direct contact with the CV slot, so there is one clear place to reach out or grab the document."
            email={siteContent.contact.email}
            linkedin={siteContent.contact.linkedin}
            github={siteContent.contact.github}
            location={siteContent.location}
            phone={siteContent.contact.phone}
            cvPath={siteContent.cv.downloadPath}
            cvNote={siteContent.cv.previewNote}
            languages={siteContent.languages}
          />
        </SectionReveal>
      </div>
    </main>
  );
}
