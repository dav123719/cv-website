"use client";

import type { ModelPreset } from "./model-scenes";
import type { ReactNode } from "react";

type ToolbarButtonProps = {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  ariaLabel?: string;
};

function ToolbarButton({
  active,
  children,
  onClick,
  title,
  ariaLabel,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      style={{
        appearance: "none",
        border: "1px solid rgba(255,255,255,0.14)",
        background: active
          ? "linear-gradient(180deg, rgba(220,38,38,0.22), rgba(255,255,255,0.06))"
          : "rgba(10,10,12,0.72)",
        color: active ? "#fff" : "rgba(255,255,255,0.78)",
        padding: "0.62rem 0.85rem",
        borderRadius: 999,
        fontSize: "0.8rem",
        letterSpacing: "0.02em",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.45rem",
        transition:
          "transform 160ms ease, border-color 160ms ease, background 160ms ease, color 160ms ease",
        boxShadow: active ? "0 0 0 1px rgba(220,38,38,0.35)" : "none",
        backdropFilter: "blur(16px)",
      }}
      onPointerDown={(event) => {
        event.currentTarget.style.transform = "translateY(1px) scale(0.99)";
      }}
      onPointerUp={(event) => {
        event.currentTarget.style.transform = "translateY(0) scale(1)";
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.transform = "translateY(0) scale(1)";
      }}
    >
      {children}
    </button>
  );
}

export interface ViewerToolbarProps {
  activePreset: ModelPreset;
  fullscreen: boolean;
  onPresetChange: (preset: ModelPreset) => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  onToggleWireframe: () => void;
  title: string;
  subtitle?: string;
  wireframe: boolean;
  presetOptions?: Array<{ id: ModelPreset; label: string }>;
}

const PRESET_LABELS: Array<{ id: ModelPreset; label: string }> = [
  { id: "sim-wheel", label: "Sim Wheel" },
  { id: "elevator", label: "Elevator" },
  { id: "pcb", label: "PCB" },
  { id: "truck", label: "Fleet Truck" },
];

export function ViewerToolbar({
  activePreset,
  fullscreen,
  onPresetChange,
  onReset,
  onToggleFullscreen,
  onToggleWireframe,
  title,
  subtitle,
  wireframe,
  presetOptions = PRESET_LABELS,
}: ViewerToolbarProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "1rem",
        gap: "1rem",
      }}
    >
      <div
        style={{
          pointerEvents: "none",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div
          style={{
            maxWidth: 520,
            color: "#fff",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.55rem",
              padding: "0.45rem 0.7rem",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(8,8,10,0.55)",
              fontSize: "0.72rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.78)",
              backdropFilter: "blur(14px)",
            }}
          >
            Interactive 3D
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(1.2rem, 2vw, 1.75rem)",
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: "-0.04em",
            }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p
              style={{
                margin: "0.55rem 0 0",
                color: "rgba(255,255,255,0.72)",
                maxWidth: 600,
                fontSize: "0.94rem",
                lineHeight: 1.55,
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        <div
          style={{
            pointerEvents: "auto",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            gap: "0.5rem",
          }}
        >
          <ToolbarButton
            active={wireframe}
            onClick={onToggleWireframe}
            title="Toggle wireframe view"
            ariaLabel="Toggle wireframe view"
          >
            Wireframe
          </ToolbarButton>
          <ToolbarButton
            onClick={onReset}
            title="Reset orbit and camera"
            ariaLabel="Reset orbit and camera"
          >
            Reset
          </ToolbarButton>
          <ToolbarButton
            active={fullscreen}
            onClick={onToggleFullscreen}
            title="Toggle fullscreen"
            ariaLabel="Toggle fullscreen"
          >
            Fullscreen
          </ToolbarButton>
        </div>
      </div>

      <div
        style={{
          pointerEvents: "auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.5rem",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.45rem",
          }}
        >
          {presetOptions.map((item) => (
            <ToolbarButton
              key={item.id}
              active={activePreset === item.id}
              onClick={() => onPresetChange(item.id)}
              title={`Show ${item.label}`}
              ariaLabel={`Show ${item.label}`}
            >
              {item.label}
            </ToolbarButton>
          ))}
        </div>

        <div
          style={{
            color: "rgba(255,255,255,0.62)",
            fontSize: "0.82rem",
            letterSpacing: "0.01em",
            padding: "0.45rem 0.75rem",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(6,6,8,0.5)",
            backdropFilter: "blur(14px)",
          }}
        >
          Drag to orbit
        </div>
      </div>
    </div>
  );
}
