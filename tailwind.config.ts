import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        panel: "var(--panel)",
        "panel-strong": "var(--panel-strong)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        success: "var(--success)"
      },
      boxShadow: {
        glow: "0 28px 80px rgba(0, 0, 0, 0.45)"
      },
      borderRadius: {
        "3xl": "1.75rem"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -10px, 0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "0.95" }
        },
        scan: {
          "0%": { transform: "translateY(-20%)" },
          "100%": { transform: "translateY(120%)" }
        }
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
        pulseGlow: "pulseGlow 5s ease-in-out infinite",
        scan: "scan 10s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
