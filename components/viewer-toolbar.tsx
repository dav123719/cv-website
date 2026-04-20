"use client";

import type { ReactNode } from "react";
import type { ModelPartDefinition, ModelPreset } from "./model-scenes";

type ToolbarButtonProps = {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  ariaLabel?: string;
};

function ToolbarButton({ active, children, onClick, title, ariaLabel }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      aria-pressed={active}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-3.5 py-2 text-[0.8rem] tracking-[0.02em] transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.985]"
      style={{
        appearance: "none",
        border: active ? "1px solid rgba(248,113,113,0.52)" : "1px solid rgba(255,255,255,0.16)",
        background: active
          ? "linear-gradient(180deg, rgba(220,38,38,0.95), rgba(127,29,29,0.96))"
          : "linear-gradient(180deg, rgba(28,32,40,0.98), rgba(12,14,18,0.98))",
        color: active ? "#fff" : "rgba(255,255,255,0.8)",
        boxShadow: active
          ? "0 12px 28px rgba(220,38,38,0.26), inset 0 1px 0 rgba(255,255,255,0.16)"
          : "0 10px 24px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
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
  onSetExplodeProgress: (value: number) => void;
  onToggleFullscreen: () => void;
  partDefinitions?: readonly ModelPartDefinition[];
  title: string;
  subtitle?: string;
  explodeProgress: number;
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
  onSetExplodeProgress,
  onToggleFullscreen,
  partDefinitions = [],
  title,
  subtitle,
  explodeProgress,
  presetOptions = PRESET_LABELS,
}: ViewerToolbarProps) {
  const hasInspectionControls = partDefinitions.length > 0;

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
          <ToolbarButton onClick={onReset} title="Reset model, orbit, and camera" ariaLabel="Reset model, orbit, and camera">
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
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "0.7rem",
        }}
      >
        <div
          role="group"
          aria-label="Viewer presets"
          style={{
            display: "inline-flex",
            flexWrap: "wrap",
            gap: "0.4rem",
            padding: "0.35rem",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(6,6,8,0.5)",
            backdropFilter: "blur(16px)",
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

        {hasInspectionControls ? (
          <div
            aria-label="Exploded view controls"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              padding: "0.45rem 0.65rem",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(6,6,8,0.5)",
              backdropFilter: "blur(16px)",
            }}
          >
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.55rem",
                minHeight: "2.35rem",
                padding: "0 0.45rem",
                borderRadius: 999,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              <span style={{ fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Closed
              </span>
              <input
                aria-label="Exploded view amount"
                max={1}
                min={0}
                onChange={(event) => onSetExplodeProgress(Number(event.currentTarget.value))}
                step={0.01}
                style={{ width: 180, accentColor: "#ef4444" }}
                type="range"
                value={explodeProgress}
              />
              <span style={{ fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Exploded
              </span>
              <output
                style={{
                  minWidth: "2.4rem",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: "0.22rem 0.45rem",
                  textAlign: "center",
                  fontSize: "0.72rem",
                  fontVariantNumeric: "tabular-nums",
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                {Math.round(explodeProgress * 100)}%
              </output>
            </label>
          </div>
        ) : null}
      </div>
    </div>
  );
}
