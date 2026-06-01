# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Run production server
```

No lint or test scripts are configured.

## Architecture

This is a **Next.js 16 App Router** internal business web UI for life insurance operations (OSP/BPISV6). It is client-side heavy with no backend API routes — all data comes from external APIs.

### Routing & Pages

All routes live under `app/` using file-based App Router conventions. Major feature areas:

- `approvals/` — Approval workflows (DRS, Movement, Reassignment, SA2)
- `claims/` + `claim-application/` — Claims processing
- `payment/` — Credit memo, DRS validation, payment encoding
- `plan-management/` — Plan holder management with dynamic `[personId]` and `lpaNumber` routes
- `disbursement/` — COMTE and RF expense processing
- `accounts-maintenance/` — Account transfer, floating accounts, MCPR, next month loading
- `sales-force/`, `loan/`, `document-management/`, `transaction/[id]`

### Authentication & Role System

Authentication is localStorage-based (no session/cookie). The `RenderPage` component in the root layout gates all pages behind a localStorage `"user"` check.

Roles are assigned by email pattern in `/api/users`:
- `branch@stpeter.com.ph` → `"branch"`
- `bm@stpeter.com.ph` / `stl@stpeter.com.ph` → `"bmstl"`
- Others → `"sales-agent"`

Sidebar items are rendered per-role: `SideBarItemsBranch`, `SideBarItemsBMSTL`, `SideBarItemsEKolekta`.

### Component Structure

```
components/
  layout/       # AppLayout, Header, Sidebar, Navbar
  common/       # Shared: MessageBox, DatePicker, Lookups, ReusableTables
  forms/        # Shared form components
  cards/, drawers/, modals/
  login/
```

Feature-specific components live in `app/<feature>/components/` alongside their pages.

### Key Patterns

**Page wrapper**: Every page uses a `<Page>` component that provides title, breadcrumbs, description, and action slot.

**Message dialogs**: Use `MessageDialogContext` / `useMessageDialog()` hook for confirmation/alert dialogs — do not add custom modal implementations for this.

**Data tables**: Use `@tanstack/react-table` v8 for all tabular data. Column definitions, sorting, filtering, and pagination are handled through that API.

**Forms**: `react-hook-form` for all form state. Drawer-based UI pattern for create/edit operations.

**Toasts**: Use `sonner` for notifications.

### UI Libraries

- **Chakra UI v3** — Primary component system
- **st-peter-ui** — Internal standard component library (wraps/extends Chakra)
- **@splpi/*** — Internal scoped packages for specific feature areas (dms-estore-upload, plan-management, operations, etc.)
- **osp.cis.nextjs.components** — Another internal component library

Prefer `st-peter-ui` and `@splpi/*` components over raw Chakra when they exist for a given use case.

### State Management

- `StickyNavbarContext` — scroll reference for sticky navbar
- `MessageDialogContext` — promise-based dialog system
- `useState` / props for everything else — no Redux or Zustand
- `localStorage` for user role and color mode

### Static / Mock Data

Static reference data lives in `data/` (role types, sales force) and `app/*/data/` directories per feature. The dashboard uses hardcoded data structures.

### PWA

Service worker is registered in `root-layout-client.tsx`. `public/service-worker.js` handles offline support.

### TypeScript

Strict mode enabled. Path alias `@/*` maps to the project root. All components should be typed; avoid `any`.
