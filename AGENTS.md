# Repository Guidelines

## Codex Scope

This guide is for future Codex sessions working in this repository. Make the smallest practical change, preserve existing user edits, and do not touch application code unless the user explicitly asks for implementation. Prefer repository conventions over introducing new patterns.

## Tech Stack

This is a private Next.js App Router web UI for BPIS v6. Core stack:

- Next.js `16.1.6`, React `19.2.3`, React DOM `19.2.3`
- TypeScript 5 with `strict: true`, `moduleResolution: "bundler"`, and `@/*` path alias
- Chakra UI 3, Emotion, `st-peter-ui` `^0.2.5`, and internal SPLPI/OSP packages
- `@tanstack/react-table` for data tables
- `react-hook-form` for forms, `date-fns` for dates, `sonner` for toasts
- `react-icons` for icons, `@dnd-kit/*` for drag-and-drop interactions
- `next-themes`, `react-day-picker`, `recharts`, and Chakra chart utilities where existing features use them

There is no Tailwind, ESLint, Prettier, Jest, Vitest, or Playwright configuration in `package.json` at this time.

## Project Structure

- `app/`: Next.js routes and feature modules. Current route families include `accounts-maintenance`, `approvals`, `claims`, `claim-application`, `disbursement`, `document-management`, `loan`, `payment`, `plan-management`, `printing`, `profile`, `sales-force`, `stl-approval`, `success`, and `transaction`.
- `app/layout.tsx`: root metadata and providers. It wraps the app with `RootLayoutClient`, `StPeterProvider`, `MessageDialogProvider`, `RenderPage`, and `sonner` `Toaster`.
- `app/root-layout-client.tsx`: client wrapper that registers `/service-worker.js`. Keep browser-only service worker work in client components.
- `app/render-page.tsx`: client-side login gate using `localStorage.getItem("user")`, then renders `AppLayout`.
- `components/layout`: authenticated app chrome. `AppLayout` chooses sidebar items from `components/layout/data/sidebar-items.ts` based on the current `localStorage` user role (`branch`, `bmstl`, or eKolekta fallback).
- `components/`: shared UI grouped by concern, including `common`, `forms`, `inputs`, `layout`, `page`, `texts`, `cards`, `drawers`, `ui`, and table folders.
- `components/page/page.tsx`: standard page shell with breadcrumb, title, description, and optional action area.
- `components/reusable-table/TanstackDataTable.tsx`: older shared TanStack table component.
- `components/common/reusable-tableV2/DataTable.tsx`: newer table system with toolbar, filtering, selection, drag-and-drop, row actions, detail drawer, mobile cards/accordion, and summary rows. Prefer this for new dense operational tables when it fits the feature.
- `components/common`: newer shared BPIS primitives such as badges, breadcrumbs, date picker, employee/agent/planholder lookup dialogs, message boxes, progress bars, reusable lookup, sidebar shells, and reusable table V2.
- `components/ui`: Chakra snippet-style utilities such as color mode, tooltip, and horizontal stepper.
- `data/`: shared mock, lookup, and module data. Many features also keep local `data/`, `config/`, `components/`, or `_components/` folders under `app/<feature>/`.
- `app/Model`: legacy capitalized model/data/function folder. Preserve its casing and nearby style when editing it.
- `public/`: static files and images.
- `*.tgz`: local/internal package artifacts. Do not replace them unless package update work is requested.
- `skills/` and `.codex/`: local Codex/session support files. Do not treat them as application source unless the user asks for agent or skill maintenance.

Ignore generated/local folders such as `.next/`, `node_modules/`, `.codex-edge-profile*`, and `tsconfig.tsbuildinfo`.

## Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Next development server, normally at `http://localhost:3000`.
- `npm run build`: production build and the current TypeScript/Next validation gate.
- `npm run start`: serve the production build after `npm run build`.

No `npm test` or `npm run lint` script exists. Do not claim tests or lint passed unless you add/configure and run them as part of an explicit task.

## Coding Conventions

Use TypeScript and React function components. Follow existing formatting: 2-space indentation, double quotes, semicolons, and JSX props formatted like nearby files. Keep files ASCII unless the existing file clearly requires another encoding.

Use `@/` imports for root-relative project modules. Use PascalCase for exported components and interfaces/types where appropriate. Use camelCase for variables, handlers, and helpers. Route files must follow Next conventions such as `page.tsx` and `layout.tsx`; many current route component names are lowercase, so preserve local style when editing nearby code.

Add `"use client"` only when the file uses hooks, browser APIs, Chakra hooks, localStorage, events, or other client-only behavior. Keep server components server-side when possible.

Some legacy files contain old comments, debug logging, commented-out code, and occasional mojibake from non-ASCII symbols. Do not normalize unrelated files as drive-by cleanup. When touching nearby code, prefer ASCII text and icons from the project's icon conventions.

Avoid adding new dependencies without an explicit package task. If a local component already references an unlisted package, verify whether the path is actually used before expanding that pattern.

## UI Rules

Use existing UI primitives before creating new ones:

- Page-level screens should usually use `Page` from `components/page/page.tsx`.
- App chrome belongs in `components/layout`, not feature modules.
- Use Chakra layout primitives (`Box`, `Flex`, `Grid`, `HStack`, `Show`, etc.) and `st-peter-ui` typography/buttons where existing screens do.
- Use `react-icons` for icons to match the current dependency set. Do not introduce a second icon library for new UI unless the existing local component already requires it.
- Use `components/common/reusable-tableV2/DataTable.tsx`, `TanstackDataTable`, or an established feature table pattern for data-heavy views. Match the table already used by the feature first.
- Preserve the established green St. Peter theme from `StPeterProvider`.

Design for mobile and desktop. Use Chakra responsive props (`base`, `md`, `lg`) instead of fixed desktop-only sizing. Avoid text overlap, horizontal page overflow, nested cards, and decorative layout changes that do not serve the workflow. Keep operational screens dense, clear, and task-focused rather than marketing-like.

For BPIS v6 design tasks, strictly follow the local `.codex/skills/bpisv6-standard-design/SKILL.md` when available. Load that skill before planning or editing UI and treat its design configurations as the source of truth for spacing, widths, heights, typography, colors, buttons, tables, forms, drawers, dialogs, empty/loading states, mobile layout, and reports. If this guide and the skill differ on UI details, use the skill.

Follow the skill's button ordering rules exactly: in paired action rows, the secondary/cancel/back/destructive-outline action goes on the left and the primary/solid action goes on the right. Examples include `Cancel / Save`, `Cancel / Submit`, `Cancel / Confirm`, and for approvals `Deny / Approve`.

For authenticated UI checks, account for the `localStorage` login gate. Useful role values seen in the app are `branch`, `bmstl`, `ekolekta`, and `sales-agent`; sidebars and dashboards can change by role.

## Feature Patterns

- Approvals live under `app/approvals` with local `components`, `config`, and `data` folders. Keep approval terminology consistent with the active feature labels.
- Payment screens live under `app/payment` with local `components`, `data`, and `utils`. DRS and validated deposit flows have separate routes.
- Plan-management screens are split between route files under `app/plan-management` and reusable feature components under `components/plan-management` and `components/new-planholder-profile`.
- Document management uses both `app/document-management/_components` and shared document uploader components.
- Sales-force functionality is split between `app/sales-force`, `components/saleforce`, and `data/saleforce`. Preserve the existing misspelled `saleforce` folder names when importing or editing.
- Accounts maintenance has separate route modules for MCPR, next month loading, floating accounts, and account transfer.
- Common lookup dialogs already exist for employee, agent, and planholder search. Reuse them before creating new lookup UIs.

## Testing & Verification

Current baseline verification is `npm run build`. For UI work, also run `npm run dev` and manually inspect affected routes in browser-sized desktop and mobile widths. Check authenticated screens with the app's current `localStorage` login gate behavior.

When adding tests in future work, prefer colocated `*.test.ts` or `*.test.tsx` files near the feature or component. Add the test runner scripts to `package.json` only when requested or clearly necessary for the task.

For visible UI changes, verify the relevant role path by setting the browser's `localStorage.user` to the role needed for that route, then reload. Check desktop and mobile widths, especially routes with sidebars, bottom navigation, sticky nav contexts, drawers, or horizontally scrollable tables.

If a build fails on unrelated existing code, report the exact failing file and keep the requested change isolated. Do not fix unrelated build failures unless the user asks.

## Commit & PR Guidance

Recent commit messages are short, imperative summaries, for example `Remove colon from value display in LabelText component` and `Refactor approval terminology from "Reject" to "Deny" across components`. Keep commits focused.

PR descriptions should include the changed routes/components, verification commands, screenshots for visible UI changes, related ticket links, and any package or environment changes.

## Safety Notes

Do not commit secrets, `.next/`, `node_modules/`, local browser profiles, or generated caches. The worktree may already contain user changes; inspect before editing and never revert unrelated files. If Git reports dubious ownership, use a one-off command such as `git -c safe.directory='C:/Users/Marcus Sensano/Desktop/OSP-BPISV6-NEXTJS-WEBUI' status --short` rather than changing global config.

## Security Review

When asked to audit security, use the `security-reviewer` subagent if available.

Security review should focus on:

- authentication and authorization
- API routes and server actions
- database access
- input validation
- sensitive data exposure
- environment variables
- cookies, sessions, and tokens
- file uploads
- dependency risks
- logging and error handling
- OWASP Top 10 issues

Security reviews should return:

- severity
- exact files/code areas
- why the issue matters
- smallest safe fix
- whether the issue needs runtime or production config verification
