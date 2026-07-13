# LotsGo Repository Guide

## Project Overview

- This repository contains **LotsGo**, a Lost Ark checklist, schedule, character-information, and raid-party management service.
- The application uses Next.js App Router, React, TypeScript, Tailwind CSS, HeroUI, Redux Toolkit, Firebase, Redis, and the official Lost Ark API.
- Work follows trunk-based development. Use `dev` as the normal integration branch unless the user explicitly requests another branch.
- Preserve user changes in the working tree. Before editing, run `git status -sb` and inspect relevant diffs.

## Commands

- Install dependencies: `npm install`
- Run locally: `npm run dev`
- Type-check: `npx tsc --noEmit`
- Production build: `npm run build`
- Start production output: `npm run start`
- Generate sitemap after a build: `npm run postbuild`

Run checks that are proportional to the change. At minimum, run `npx tsc --noEmit` for TypeScript changes. Run `npm run build` for routing, server/client boundaries, configuration, or broad UI changes. Do not assume `npm run lint` works without first checking the installed Next.js version and script behavior.

## Architecture

- Routes and layouts live under `src/app` and follow the Next.js App Router structure.
- Keep feature code inside its domain, such as `character`, `checklist`, `raids`, `home`, or `setting`.
- Prefer the existing feature separation:
  - `ui/`: React components and presentation-oriented hooks.
  - `lib/`: event handlers, API orchestration, parsers, calculations, and reusable feature logic.
  - `model/types.ts`: shared domain types and normalization helpers.
- Files named `*Feat.ts` contain feature logic. Follow this convention when extending an existing feature.
- API endpoints live in `src/app/api/**/route.ts`. Keep Firebase, Redis, authentication, and external API work on the server when possible.
- Shared Redux state is limited mainly to login, checklist, and party data in `src/app/store`.
- Keep screen-only state local. Existing forms commonly expose a `useXxxForm` hook that groups related `useState` values and setters.
- Static Lost Ark reference data lives in `src/data`; reusable icons live in `src/Icons`.
- The existing alias `@/*` maps to `src/*`.

## Coding Style

- Match the surrounding file's formatting, quote style, semicolon usage, and import grouping. The repository is not fully uniform.
- Use TypeScript types for new domain data. Prefer existing types from `model/types.ts` over duplicating shapes in UI files.
- Keep UI components focused on rendering and interaction wiring. Move substantial calculations, response parsing, persistence, and event workflows into `lib`.
- Reuse existing HeroUI components, `addToast`, Tailwind utilities, `clsx`, and shared color/grade helpers before introducing new abstractions.
- Preserve responsive behavior. Check both mobile and desktop layouts and account for the existing `sm:` breakpoints and `useMobileQuery()` usage.
- Preserve light/dark theme behavior and established grade, difficulty, role, and quality colors.
- Use immutable copies where feature logic expects independent data (`structuredClone`, `map`, spread syntax), while Redux Toolkit reducers may use Immer-style mutations.
- Use stable identifiers where available. Do not replace persisted IDs with array indexes.
- Treat Lost Ark API fields as nullable or version-sensitive and normalize missing arrays/fields at boundaries.
- Keep Korean user-facing copy consistent with nearby screens.

## Compatibility Rules

- Stored Firebase, Redux, localStorage, and sessionStorage data may predate the current types. Preserve normalization and fallback defaults when loading data.
- Do not casually rename legacy identifiers or paths with established misspellings. Examples include `src/utiils`, `supportor`, and `dungeonBouus`. They may be referenced by persisted data or many imports. Rename only as an explicit migration with all consumers verified.
- Do not change checklist, party, raid, character, or account persisted shapes without backward-compatible normalization and a migration plan.
- Preserve server/client boundaries and existing `'use client'` directives. Do not access `window`, `localStorage`, `sessionStorage`, or React hooks from server components.
- Large files such as checklist and character forms have wide impact. Search for all callers and related helpers before modifying shared behavior.
- When updating classes, bosses, raids, grades, titles, cards, or other game data, check both static JSON and all presentation/mapping helpers that consume it.

## API, Authentication, and Security

- Never commit `.env` files, API keys, tokens, Firebase credentials, Redis credentials, JWT secrets, or decrypted user data.
- Avoid adding secrets to `NEXT_PUBLIC_*` variables; those values are exposed to the browser.
- Do not add sensitive values to URLs or query strings. Prefer server-side lookup or protected headers/body fields.
- Validate request parameters in API routes and return explicit HTTP statuses.
- Preserve authentication and authorization checks for member and administrator endpoints.
- Do not log credentials, tokens, decrypted API keys, or sensitive user records.
- Reuse the existing Firebase Admin and Redis utilities instead of creating parallel clients.

## Change Workflow

1. Confirm the current branch and working tree with `git status -sb`.
2. Read the relevant route, UI, feature logic, types, store slice, and persisted-data boundary before changing behavior.
3. Make the smallest cohesive change that follows existing patterns.
4. Check the diff for unrelated formatting or encoding changes. Keep files UTF-8 and preserve Korean text.
5. Run relevant type/build checks and report any pre-existing failures separately.
6. Stage only files belonging to the requested change.
7. Use the repository's concise commit prefixes where appropriate: `feat:`, `fixed:`, `refactor:`, `styles:`, or `data:`.
8. For normal trunk-based work, commit and push to `dev` only when the user explicitly authorizes publishing. Do not create a feature branch or pull request unless requested.

## Completion Checklist

- Existing user changes were preserved.
- New code follows the feature's `ui / lib / model` organization.
- Persisted-data compatibility was considered.
- Mobile, desktop, and theme behavior were considered for UI changes.
- Sensitive values were not exposed or committed.
- Relevant validation commands were run and their results were reported.
- Only intended files were staged, committed, and pushed.
