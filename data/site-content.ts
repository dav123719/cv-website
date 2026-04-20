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
  gallery?: ProjectMediaItem[];
  modelParts?: ModelPartDefinition[];
};

export type ProjectMediaItem = {
  type: "photo" | "model";
  label: string;
  caption: string;
  src?: string;
};

export type ModelPartDefinition = {
  id: string;
  label: string;
  match: string[];
};

export type ResumeRelatedItem = {
  title: string;
  summary: string;
};

export type ResumeEntry = {
  title: string;
  subtitle: string;
  date: string;
  summary: string;
  relatedLabel?: string;
  relatedItems?: ResumeRelatedItem[];
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
      assetPath: "/models/simracing-wheel.glb",
      gallery: [
        {
          type: "photo",
          label: "Final build",
          caption: "Real wheel assembly photo slot for the finished print and mounting."
        },
        {
          type: "photo",
          label: "Motor interface",
          caption: "Close-up photo slot for the motor mount and wheel-to-motor connection."
        },
        {
          type: "model",
          label: "Interactive CAD",
          caption: "Structured GLB prepared for exploded CAD inspection.",
          src: "/models/simracing-wheel.glb"
        },
        {
          type: "photo",
          label: "Print setup",
          caption: "Future photo slot for slicer orientation, supports, and surface finish."
        },
        {
          type: "photo",
          label: "Assembly detail",
          caption: "Future photo slot for fasteners, inserts, and mounted hardware."
        }
      ],
      modelParts: [
        { id: "wheel-shell", label: "Dark shell", match: ["black_powdercoat", "graphite"] },
        { id: "light-details", label: "Light details", match: ["warm_white"] },
        { id: "red-details", label: "Red details", match: ["dark_red"] }
      ]
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
      assetPath: "/models/elevator-model.glb",
      gallery: [
        {
          type: "photo",
          label: "Full rig",
          caption: "Real elevator assembly photo slot showing the complete build."
        },
        {
          type: "photo",
          label: "Drive system",
          caption: "Photo slot for the belt, tensioning, motor, and moving assembly."
        },
        {
          type: "model",
          label: "Interactive CAD",
          caption: "Structured GLB prepared for exploded frame and mechanism inspection.",
          src: "/models/elevator-model.glb"
        },
        {
          type: "photo",
          label: "Cabin detail",
          caption: "Future photo slot for cabin, guide rails, and moving interface."
        },
        {
          type: "photo",
          label: "Control electronics",
          caption: "Future photo slot for Arduino, mini FOC driver, and wiring."
        }
      ],
      modelParts: [
        { id: "frame-panels", label: "Frame panels", match: ["warm_white"] },
        { id: "dark-structure", label: "Dark structure", match: ["black_powdercoat", "graphite"] },
        { id: "red-hardware", label: "Red hardware", match: ["dark_red"] }
      ]
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
      assetPath: "/projects/h-bridge-driver",
      gallery: [
        {
          type: "photo",
          label: "PCB close-up",
          caption: "Photo slot for the assembled H-bridge board."
        },
        {
          type: "photo",
          label: "Test setup",
          caption: "Photo slot for the board wired into a motor demonstration."
        },
        {
          type: "model",
          label: "Procedural model",
          caption: "Current viewer preset represents the board concept until a CAD/PCB asset is added."
        }
      ]
    },
  ] as FeaturedProject[],
  experience: [
    {
      title: "Simon Moos A/S",
      subtitle: "3D modeling and printing",
      date: "Commercial work",
      summary:
        "Broader workplace work centered on turning technical source geometry into durable exhibition models for marketing use. The emphasis was on printability, strength, fit, and finish so the pieces held up as presentation assets, not just one-off prototypes.",
      relatedLabel: "Work scope",
      relatedItems: [
        {
          title: "Scale exhibition models",
          summary: "Commercial presentation pieces translated from technical source geometry."
        },
        {
          title: "Print-ready revisions",
          summary: "Iterated part orientation, support strategy, and fit to keep the parts robust."
        },
        {
          title: "Finish and durability",
          summary: "Kept the output clean and sturdy enough for repeated handling and display."
        }
      ]
    }
  ] as ResumeEntry[],
  education: [
    {
      title: "University of Southern Denmark",
      subtitle: "Bachelor in Electrical Engineering (Electronics)",
      date: "Ongoing",
      summary:
        "Relevant focus areas include electronic circuit design, embedded systems, control systems, microchip design, and 3D modeling and prototyping.",
      relatedLabel: "Linked projects",
      relatedItems: [
        {
          title: "H-bridge motor driver",
          summary: "KiCad PCB work built for an RC car and later used as a demonstrator for the elevator project."
        },
        {
          title: "Elevator scale model",
          summary: "A multi-floor motion system with cabin, counterweight, BLDC drive, and Arduino Nano control."
        }
      ]
    }
  ] as ResumeEntry[],
  independentProjects: [
    {
      title: "Self-directed prototype",
      subtitle: "Independent build",
      date: "Personal work",
      summary:
        "Williams-inspired simracing wheel designed in Fusion 360 and printed on an Ender 3 V2, with motor mounting and wheel-to-motor integration treated like a self-directed prototype rather than a formal course assignment.",
      relatedLabel: "Prototype link",
      relatedItems: [
        {
          title: "Simracing wheel",
          summary: "Self-directed Fusion 360 build with printability and assembly constraints carried through the design."
        }
      ]
    }
  ] as ResumeEntry[],
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
