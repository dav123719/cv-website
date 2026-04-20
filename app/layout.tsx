import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body"
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Davis Zvigulis | 3D prototyping, electronics, and PCB design",
  description:
    "Single-page portfolio and CV for Dāvis Zvīgulis, focused on 3D prototyping, PCB design, embedded systems, and technical CAD.",
  applicationName: "Davis Zvigulis CV",
  keywords: [
    "Davis Zvigulis",
    "PCB design",
    "Fusion 360",
    "3D printing",
    "electrical engineering",
    "embedded systems",
    "technical portfolio"
  ],
  metadataBase: new URL("https://trix.lv")
};

const themeInitScript = `
(() => {
  try {
    const stored = localStorage.getItem("theme-mode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const mode = stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : "system";
    const theme = mode === "system"
      ? (prefersDark ? "dark" : "light")
      : mode;
    document.documentElement.dataset.themeMode = mode;
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.themeMode = "system";
    document.documentElement.dataset.theme = "dark";
  }
})();
`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AnalyticsBeacon />
        {children}
      </body>
    </html>
  );
}
