# cv-website

Single-page technical portfolio and CV site for Davis Zvigulis. The public page presents engineering background, selected hardware/CAD projects, an interactive 3D viewer, tooling context, and direct contact actions. The repo also includes protected admin analytics backed by a local JSON store.

Primary deployment target: self-hosted `trix.lv`.

## Purpose

This site is built as a focused technical portfolio for 3D prototyping, electronics, PCB design, embedded systems, and CAD work. The public experience is intentionally compact: one page, structured content, project evidence, a 3D model viewer, CV download slot, and copyable contact details.

## Tech Stack

- Next.js App Router
- React 19
- TypeScript in strict mode
- Tailwind CSS 4 through `@tailwindcss/postcss`
- Framer Motion for section, gallery, and copy-feedback motion
- React Three Fiber, Drei, and Three.js for the 3D viewer
- lucide-react icons
- next-auth v4 for protected admin access
- Playwright for browser-level regression tests
- Local JSON analytics under `.data/analytics.json`

## Version Snapshot

Installed versions from `npm ls --depth=0` at the time of this cleanup:

- `next` 16.2.3
- `react` / `react-dom` 19.2.5
- `typescript` 6.0.2
- `tailwindcss` 4.2.2
- `@tailwindcss/postcss` 4.2.2
- `@react-three/fiber` 9.6.0
- `@react-three/drei` 10.7.7
- `three` 0.183.2
- `framer-motion` 12.38.0
- `next-auth` 4.24.13
- `playwright` / `@playwright/test` 1.59.1

If `npm ls --depth=0` reports an extraneous package after local experimentation, run `npm ci` or `npm prune` to restore the install tree from `package-lock.json`.

## Folder Structure

- `app/` - App Router pages, API routes, global CSS, metadata, and root layout.
- `app/page.tsx` - Public single-page portfolio composition.
- `app/admin/page.tsx` - Protected analytics dashboard.
- `app/sign-in/page.tsx` - Admin sign-in page.
- `app/api/analytics/route.ts` - Public analytics event ingestion and protected snapshot reads.
- `app/api/personalization/route.ts` - Project ranking scores derived from analytics.
- `app/api/auth/[...nextauth]/route.ts` - NextAuth route handler.
- `components/home/` - Public portfolio sections.
- `components/model-viewer.tsx` - 3D viewer shell and controlled preset bridge.
- `components/model-scenes.tsx` - GLB loading, procedural fallback scenes, lighting, and exploded-view logic.
- `components/viewer-toolbar.tsx` - 3D viewer controls.
- `components/admin-dashboard.tsx` - Protected analytics UI.
- `components/analytics-beacon.tsx` - Client page-view tracking.
- `data/site-content.ts` - Primary editable content model.
- `lib/analytics.ts` - File-backed analytics store.
- `lib/client-analytics.ts` - Best-effort client analytics transport and session id handling.
- `lib/personalization.ts` - Project scoring from analytics events.
- `lib/view-transitions.ts` - Safe wrapper for browser view transitions.
- `public/brand/` - Tool logos.
- `public/models/` - Web-deliverable GLB assets.
- `public/projects/` - Future project photo/media folders.
- `public/cv/` - Reserved CV PDF location.
- `scripts/convert-step-to-glb.py` - STEP-to-GLB conversion helper.
- `tests/` - Playwright regression tests.

## Architecture

The public site is composed in `app/page.tsx` from structured content in `data/site-content.ts`. Prefer changing content there before hard-coding copy in components.

The root layout loads Google fonts through `next/font/google`, initializes persisted theme state before hydration, and mounts `AnalyticsBeacon` to record page views.

Most public section components are client components because they use motion, theme state, copy-to-clipboard behavior, analytics events, or interactive 3D controls.

Project selection lives in `components/home/projects-section.tsx`. It combines:

- fixed project ordering from `siteContent.featuredProjects`
- local session scoring in `sessionStorage`
- server personalization scores from `/api/personalization`
- selector state
- gallery/evidence state
- viewer preset synchronization

The 3D viewer supports controlled and uncontrolled presets. Current public project presets are:

- `sim-wheel`
- `elevator`
- `pcb`

`truck` remains in the viewer scene type as a procedural future/optional preset, but it is not currently exposed by featured project content.

## Routes And API Surface

- `/` - Public portfolio/CV page.
- `/sign-in` - Admin sign-in page.
- `/admin` - Protected analytics dashboard.
- `/api/auth/[...nextauth]` - NextAuth API endpoint.
- `/api/analytics`
  - `POST` records public analytics events.
  - `GET` returns analytics snapshot and requires an admin session.
- `/api/personalization`
  - `GET` returns ranked project scores based on analytics events.

`proxy.ts` protects `/admin/*` and redirects signed-in admins away from `/sign-in`.

## Content Model

Primary content lives in `data/site-content.ts`.

Editable areas include:

- name, role, location, and summary
- contact details
- featured project records
- resume/education/independent project entries
- tool groups and logo keys
- CV download path and placeholder note

Project records include:

- `slug`
- `name`
- `category`
- `description`
- `highlights`
- `tags`
- `accent`
- `preset`
- `assetPath`
- optional `gallery`
- optional `modelParts`

Keep project `preset` values aligned with `ModelPreset` in `components/model-scenes.tsx`.

## Styling

Global design tokens and shared primitives live in `app/globals.css`.

Important shared classes:

- `.section-eyebrow`
- `.section-title`
- `.chip`
- `.button-primary`
- `.button-secondary`
- `.opaque-button`
- `.premium-card`

The site uses CSS variables for dark/light themes. Theme mode is stored in `localStorage` under `theme-mode` and applied on `<html>` before hydration.

Component-specific project/contact selectors currently also live in `app/globals.css`. If those surfaces grow further, consider moving them into smaller component modules or CSS modules to reduce global coupling.

## Animation And Interaction

- Framer Motion handles section reveals, hero motion, project gallery transitions, selector/media active states, and copy feedback.
- Browser view transitions are used where supported for in-page anchor and theme transitions.
- The project evidence gallery has main-preview arrows and thumbnail browsing.
- Contact email and phone are copy buttons, with `Copied` / `Failed` feedback and a screen-reader status region.
- The 3D viewer uses Drei `OrbitControls` for drag, zoom, pan, and reset behavior.

## 3D Models And Asset Pipeline

Public GLB assets live in `public/models/`:

- `public/models/simracing-wheel.glb`
- `public/models/elevator-model.glb`

Ignored source CAD files live locally under `3d Files/`. That folder is intentionally ignored and should not be committed.

`scripts/convert-step-to-glb.py` converts colored STEP files to structured GLB files. It expects Python dependencies outside `package.json`, including `numpy`, `trimesh`, and OpenCascade/OCP bindings.

Example:

```bash
python scripts/convert-step-to-glb.py "3d Files/source.step" public/models/output.glb
```

Exploded-view part matching depends on generated GLB mesh/node names and `modelParts` entries in `data/site-content.ts`.

## Analytics And Personalization

Analytics are local and file-backed. Events are written to `.data/analytics.json` by `lib/analytics.ts`.

Tracked event names include:

- `page_view`
- `project_open`
- `viewer_preset_change`
- `contact_copy`
- `contact_click`
- `cv_download`

Only the latest 5000 events are retained.

`.data/` is ignored and should not be committed. The store is suitable for a single self-hosted Node process. It is not designed as a distributed or multi-instance analytics backend.

Project personalization reads analytics events and scores projects based on project paths and event metadata.

## Authentication And Admin Access

Admin access uses NextAuth with JWT sessions.

Credentials auth is always registered. Google auth is enabled only when both Google OAuth variables are present.

Allowed admin emails are read from:

1. `ADMIN_EMAILS`
2. `ADMIN_EMAIL`
3. the built-in default in `auth.ts` / `proxy.ts`

`ADMIN_PASSWORD_HASH` is preferred. It should be a SHA-256 hex digest of the admin password. `ADMIN_PASSWORD` can be used for simple local deployments.

For production, always set `NEXTAUTH_SECRET` and prefer `ADMIN_PASSWORD_HASH` over `ADMIN_PASSWORD`.

## Environment Variables

No `NEXT_PUBLIC_*` variables are currently required.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXTAUTH_SECRET` | Production yes | Secret used by NextAuth JWT/session handling. |
| `ADMIN_EMAIL` | Optional | Single allowed admin email. |
| `ADMIN_EMAILS` | Optional | Comma-separated admin email allowlist. Takes precedence over `ADMIN_EMAIL`. |
| `ADMIN_PASSWORD` | Optional | Raw credentials password fallback. Prefer hash. |
| `ADMIN_PASSWORD_HASH` | Recommended | SHA-256 hex digest for credentials login. |
| `GOOGLE_CLIENT_ID` | Optional | Enables Google login when paired with `GOOGLE_CLIENT_SECRET`. |
| `GOOGLE_CLIENT_SECRET` | Optional | Enables Google login when paired with `GOOGLE_CLIENT_ID`. |

## Commands

Install dependencies:

```bash
npm install
```

Run local development:

```bash
npm run dev
```

Preferred stable local dev command, also used by Playwright:

```bash
npm run dev:stable
```

Clean generated build/type artifacts:

```bash
npm run clean
```

Build for production:

```bash
npm run build
```

Start a production build:

```bash
npm run start
```

Typecheck:

```bash
npm run typecheck
```

Fresh production build plus typecheck:

```bash
npm run typecheck:fresh
```

Run Playwright regression tests:

```bash
npm run test:viewer
```

Full verification gate:

```bash
npm run verify
```

`npm run verify` runs a production build, typecheck, and Playwright tests.

There is currently no dedicated lint script. Do not treat `npm run lint --if-present` as a real quality gate.

## Testing And Verification

Playwright config lives in `playwright.config.ts`.

Tests use `http://localhost:3000`; Playwright starts `npm run dev:stable` through its `webServer` config if a reusable server is not already running.

Current browser coverage includes:

- 3D viewer canvas sizing, drag, and reset behavior
- project media gallery navigation through all items
- main-preview arrows and thumbnail browsing
- selector and thumbnail clipping across breakpoints
- consistent thumbnail gaps, including H-bridge
- contact email/phone copy behavior
- major-section horizontal overflow checks

Tests depend on development-only `window.__cvViewerDebug`, which is disabled in production.

## Deployment Notes

This app requires a Node runtime because analytics and personalization use filesystem access and explicitly set `runtime = "nodejs"`.

Before deploying:

- set production auth environment variables
- ensure `.data/` can be created by the server process
- ensure the process can write `.data/analytics.json`
- add the final CV PDF at `public/cv/davis-zvigulis-cv.pdf`
- confirm public GLB assets are present under `public/models/`

## Repo Constraints

Do not commit:

- `.next/`
- `.data/`
- `.env.local`
- `node_modules/`
- `test-results/`
- `playwright-report/`
- `dev-server.*.log`
- `tsconfig.tsbuildinfo`
- `3d Files/`

`3d Files/` is local source CAD input. `public/models/` contains web-deliverable GLB outputs.

## AI Agent Guidance

Before changing UI, read:

- `data/site-content.ts`
- `app/page.tsx`
- the affected component under `components/home/`
- `app/globals.css`
- relevant tests in `tests/viewer.spec.ts`

Prefer content edits in `data/site-content.ts` over hard-coding copy inside components.

Preserve:

- strict TypeScript
- App Router conventions
- path alias `@/*`
- the CSS variable theme system
- theme persistence through `theme-mode`
- analytics event names used by personalization
- project `slug` and `preset` relationships
- accessible names used by Playwright tests

When editing the project viewer:

- keep `ModelPreset` values aligned across `data/site-content.ts`, `components/model-scenes.tsx`, and `components/model-viewer.tsx`
- keep development-only `window.__cvViewerDebug` unless tests are updated
- verify desktop and mobile layouts with Playwright after changing gallery, viewer, contact, or project selector behavior

When editing auth/admin:

- keep `/admin` protected by session checks and `proxy.ts`
- avoid exposing analytics snapshots publicly
- do not commit secrets or `.env.local`

When editing analytics:

- remember `.data/analytics.json` is local mutable runtime state
- do not treat analytics data as source-controlled content
- preserve best-effort failure behavior for client analytics

## Known Gaps

- Add the final CV PDF at `public/cv/davis-zvigulis-cv.pdf`.
- Add real project photos under `public/projects/<slug>/`.
- Document or automate Python environment setup for `scripts/convert-step-to-glb.py`.
- Consider adding a real lint tool/script if this project grows.
- Consider splitting the large project and viewer modules if future feature work continues there.
