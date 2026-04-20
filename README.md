  # cv-website

Single-page portfolio and CV site for Dāvis Zvīgulis.

Built with `Next.js`, `React`, `TypeScript`, `Tailwind CSS`, and `React Three Fiber`, with a self-hosted deployment target on `trix.lv`.

## Stack

- `Next.js` App Router
- `React` + `TypeScript`
- `Tailwind CSS`
- `React Three Fiber` + `drei`
- `next-auth` for admin access
- local file analytics

## Project Structure

- `app/` app router pages, API routes, and global styles
- `components/` site sections, viewer components, and shared UI
- `data/site-content.ts` primary site copy and structured content
- `public/` static assets such as CV PDFs and project media
- `tests/` Playwright coverage for the viewer

## Local Development

```bash
npm install
npm run dev:stable
```

If local dev starts behaving inconsistently:

```bash
npm run clean
npm run dev:stable
```

## Useful Scripts

```bash
npm run clean
npm run dev:stable
npm run build
npm run typecheck
npm run typecheck:fresh
npm run test:viewer
npm run verify
```

## Environment Variables

Create `.env.local` when needed:

```bash
NEXTAUTH_SECRET=
ADMIN_EMAIL=
ADMIN_EMAILS=
ADMIN_PASSWORD=
ADMIN_PASSWORD_HASH=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Notes:

- `ADMIN_PASSWORD_HASH` is preferred over `ADMIN_PASSWORD`.
- `ADMIN_EMAILS` can be a comma-separated allowlist.
- Google auth is optional and intended for admin login only.

## Content And Assets

- Main editable site content lives in `data/site-content.ts`.
- Global design tokens and motion primitives live in `app/globals.css`.
- Final CV PDF should be added at `public/cv/davis-zvigulis-cv.pdf`.
- Project media and 3D assets should be added under `public/projects/<slug>/`.
- Local analytics are stored in `.data/analytics.json`.

## Notes

- Generated files such as `.next/`, `test-results/`, and `tsconfig.tsbuildinfo` are local artifacts and should not be committed.
- The repo includes a self-hosted admin/auth setup and a mailto-based contact form fallback.
