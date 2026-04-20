export type ProjectAccent = "red" | "crimson" | "steel" | "graphite";
export type ProjectPreset = "sim-wheel" | "elevator" | "pcb" | "truck";

export type FeaturedProject = {
  slug: string;
  name: string;
  category: string;
  description: string;
  highlights: string[];
  tags: string[];
  accent: ProjectAccent;
  preset: ProjectPreset;
  assetPath: string;
};

export type ExperienceEntry = {
  title: string;
  subtitle: string;
  date: string;
  summary: string;
};

export type ToolEntry = {
  name: string;
  description: string;
  logo: "fusion360" | "kicad" | "creality" | "prusaslicer" | "arduino" | "github";
};

export type ToolGroup = {
  title: string;
  note: string;
  items: ToolEntry[];
};

export const siteContent = {
  name: "D\u0101vis Zv\u012Bgulis",
  asciiName: "Davis Zvigulis",
  role: "3D prototyping, electronics, and PCB design",
  location: "Riga, Latvia",
  summary:
    "D\u0101vis Zv\u012Bgulis is an electrical engineering student at the University of Southern Denmark. His work sits between PCB layout, embedded systems, control systems, and functional 3D-printed assemblies, with a strong bias toward buildable, physically useful design.",
  contact: {
    email: "ddabbis@gmail.com",
    phone: "+371 22056110",
    linkedin: "https://www.linkedin.com/in/d%C4%81vis-zv%C4%ABgulis-91383b34b/",
    github: "https://github.com/dav123719"
  },
  heroPoints: [
    "Electrical engineering student, 6th semester",
    "Technical CAD, PCB, and prototype-focused work"
  ],
  stats: [
    { label: "Focus", value: "PCB + CAD + 3D" },
    { label: "Preferred roles", value: "3D CAD / Hardware" }
  ],
  formats: ["GLB", "STL", "STEP", "PDF"],
  featuredProjects: [
    {
      slug: "simracing-wheel",
      name: "Williams-inspired simracing wheel",
      category: "Personal project",
      description:
        "Designed in Fusion 360 as a functional Formula 1-inspired wheel shell with motor mounting, wheel-to-motor interface, and printed hardware integration, carrying over the same fit, strength, and printability thinking used in production-oriented modeling work.",
      highlights: [
        "Printed on an Ender 3 V2",
        "Integrated with a self-assembled OpenFFBoard setup",
        "Focused on mounting, ergonomics, print orientation, and usable assembly"
      ],
      tags: ["Fusion 360", "3D print", "mechanical integration", "functional prototype"],
      accent: "red",
      preset: "sim-wheel",
      assetPath: "/projects/simracing-wheel"
    },
    {
      slug: "elevator-model",
      name: "Elevator scale model",
      category: "University project",
      description:
        "Built a multi-floor elevator model with cabin, counterweight, belt drive, tensioning system, sensored BLDC motor, mini FOC motor driver, and Arduino Nano control, with the mechanical system designed to be printable, revisable, and easy to assemble.",
      highlights: [
        "3 floors, counterweight, and belt system",
        "Code written with AI assistance to accelerate development",
        "Built as a demonstration rig and hardware learning platform"
      ],
      tags: ["Fusion 360", "mechanical system", "motor control", "3D print"],
      accent: "crimson",
      preset: "elevator",
      assetPath: "/projects/elevator-model"
    },
    {
      slug: "h-bridge-driver",
      name: "H-bridge motor driver",
      category: "University project",
      description:
        "Designed a brushed DC motor driver for an RC car and later used it as a demonstrator for an elevator project. The board used SMD components and heavy solder pooling for higher current handling, linking the mechanical prototype work back to the electronics underneath it.",
      highlights: [
        "Designed end-to-end in KiCad",
        "Functional board with clear room for layout improvement",
        "Strong foundation for a tighter future revision"
      ],
      tags: ["KiCad", "SMD", "PCB layout", "high current"],
      accent: "steel",
      preset: "pcb",
      assetPath: "/projects/h-bridge-driver"
    },
  ] as FeaturedProject[],
  experience: [
    {
      title: "Simon Moos A/S",
      subtitle: "3D modeling and printing",
      date: "Commercial work",
      summary:
        "Designed and printed multiple scale exhibition models for marketing use, translating technical source geometry into durable presentation pieces optimized for printability, strength, fit, and finish quality. That commercial work established the same production mindset carried into the project section below."
    }
  ] as ExperienceEntry[],
  education: [
    {
      title: "University of Southern Denmark",
      subtitle: "Bachelor in Electrical Engineering (Electronics)",
      date: "Ongoing",
      summary:
        "Relevant focus areas include electronic circuit design, embedded systems, control systems, microchip design, and 3D modeling and prototyping."
    }
  ],
  languages: ["Latvian - Native", "English - Professional"],
  toolGroups: [
    {
      title: "CAD and electronics",
      note: "The core engineering stack used for modeling parts, laying out boards, and building technical prototypes.",
      items: [
        {
          name: "Fusion 360",
          description: "Mechanical CAD, assemblies, mounting studies, and printable part design.",
          logo: "fusion360"
        },
        {
          name: "KiCad",
          description: "Schematics, PCB layout, routing, and board iteration.",
          logo: "kicad"
        },
        {
          name: "Arduino",
          description: "Controller bring-up, quick hardware tests, and integration prototypes.",
          logo: "arduino"
        }
      ]
    },
    {
      title: "Fabrication and delivery",
      note: "Tools around slicing, printing, and publishing technical work in a presentable way.",
      items: [
        {
          name: "Creality Print",
          description: "Print preparation for larger functional parts and model batches.",
          logo: "creality"
        },
        {
          name: "PrusaSlicer",
          description: "Refined slicing profiles and print setup for smaller prototype runs.",
          logo: "prusaslicer"
        },
        {
          name: "GitHub",
          description: "Versioned delivery for code, site work, and public project context.",
          logo: "github"
        }
      ]
    }
  ],
  cv: {
    previewLabel: "CV PDF placeholder",
    previewNote:
      "The CV file will be added later. The layout is already reserved for a preview and download slot.",
    downloadPath: "/cv/davis-zvigulis-cv.pdf"
  }
} as const;

export type SiteContent = typeof siteContent;
