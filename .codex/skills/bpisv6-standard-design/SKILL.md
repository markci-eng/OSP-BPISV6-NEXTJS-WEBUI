---
name: bpisv6-standard-design
description: Standardize and redesign BPIS v6 Next.js UI using the project design standard, existing components, st-peter-ui, Chakra UI, and production-ready responsive patterns.
---

# Skill: Project UI Standardization

## Purpose

Use this skill to redesign, standardize, or polish existing BPIS v6 pages while preserving the current functionality, data, routing, state, and business behavior. The goal is a consistent St. Peter/OSP operational interface that is clean, aligned, responsive, accessible, and production-ready.

This skill is not for creative reinvention. It converts the approved design standard into practical coding rules for this repository.

## When to Use

Use this skill when the user asks to:

- Redesign, enhance, standardize, clean up, align, or modernize an existing page.
- Create an enhanced or custom version of a BPIS v6 screen.
- Improve mobile responsiveness, spacing, layout, typography, tables, filters, forms, dialogs, drawers, empty states, loading states, reports, or navigation.
- Refactor UI markup while keeping the same data, workflow, and behavior.
- Review whether a page follows the BPIS v6/St. Peter design system.

## Non-Negotiable Rules

- Do not remove existing functionality, handlers, routes, state, validation, actions, or table behavior.
- Do not change business logic, computations, mock data shape, permissions, role logic, or API contracts unless explicitly asked.
- Preserve current data, labels, field names, route names, statuses, and user-visible text unless the user requests copy changes.
- Use existing repository components before creating new ones.
- Use `st-peter-ui`, Chakra UI, and local `/components` patterns where available.
- Keep the design responsive for desktop, tablet, and mobile.
- Keep layouts aligned, scannable, and operational. Avoid marketing-style hero sections for app screens.
- Do not create nested cards or decorative wrappers that do not support the workflow.
- Do not invent records, fields, statuses, links, buttons, or actions.
- Keep edits scoped to the requested page/component and nearby support files.
- Add `"use client"` only when the file needs hooks, browser APIs, events, Chakra hooks, or client-only state.

## Project Fit

This repository is a Next.js App Router BPIS v6 web UI using TypeScript, Chakra UI 3, `st-peter-ui`, Emotion, TanStack Table, `react-hook-form`, `sonner`, `date-fns`, `react-icons`, and internal SPLPI/OSP packages.

Use these existing patterns first:

- Page shell: `components/page/page.tsx`.
- App chrome: `components/layout` and `components/layout/data/sidebar-items.ts`.
- Providers/login gate: `app/layout.tsx`, `app/root-layout-client.tsx`, and `app/render-page.tsx`.
- Older table: `components/reusable-table/TanstackDataTable.tsx`.
- Newer table: `components/common/reusable-tableV2/DataTable.tsx` and its subcomponents.
- Shared common UI: `components/common` for breadcrumbs, badges, lookups, date picker, message boxes, progress bars, reusable lookup, and table V2.
- Forms/text/cards/drawers: `components/forms`, `components/texts`, `components/cards`, `components/drawers`, and nearby feature components.
- Feature-local patterns: local `components`, `_components`, `config`, `data`, and `utils` folders under `app/<feature>`.

When choosing between components, match the feature's current pattern first. For new dense operational tables, prefer `components/common/reusable-tableV2/DataTable.tsx` when its features fit.

## Design Standards

### Typography

- Default app font should follow the provider and existing app. The PDF standard specifies Calibri; this repo commonly uses `StPeterProvider font="Open Sans"`, so inherit project typography unless a page already establishes another local convention.
- Type scale:
  - H1/title: desktop `48px`, tablet `40px`, mobile `32px`, weight `700`, line-height `1.1-1.2`.
  - H2/primary heading: desktop `36px`, tablet `32px`, mobile `28px`, weight `600`, line-height `1.1-1.2`.
  - H3/secondary heading: desktop `28px`, tablet `24px`, mobile `22px`, weight `600`, line-height `1.2-1.3`.
  - H4/H5: desktop `22px`, tablet `20px`, mobile `18px`, weight `500`, line-height `1.2-1.3`.
  - Body: desktop `16px`, tablet `15px`, mobile `14px`, weight `400`, line-height `1.5-1.7`.
  - Buttons/CTA: desktop `16px`, tablet `15px`, mobile `14px`, weight `600`, line-height `1.5-1.7`.
  - Caption/footnote: `12px`, weight `400`, line-height `1.4-1.6`.
- Use `0` letter spacing for normal text. Button labels may use `0.5px` only if nearby components do.
- Do not use oversized headings inside compact panels, tables, drawers, or forms.

### Colors

Use semantic tokens when available. Use raw hex only when nearby code already does or no token exists. When the PDF specifies a color, use the exact hex value below; do not swap base and hover greens or substitute nearby shades.

Default BPIS/St. Peter green theme:

- Primary green: `#109448`.
- Dark green: `#006838`.
- Pastel pea green: `#ACD6A6`.
- Seafoam green: `#92DDBF`.
- Light cyan: `#D3EDEE`.
- White: `#FFFFFF`.
- Black: `#000000`.
- Grey: `#808080`.
- Ash white: `#ECECEC`.
- Destructive red: `#BF1F2F`.
- Error red: `#EF4444`.
- Gold accents: `#CBA135`, `#FFD026`, `#FFF48E`.

Theme palettes from the PDF:

- Orange: `#F4845F`, hover `#F1592B`, disabled `#F7B267`.
- Green: `#109448`, hover `#006838`, disabled `#92DDBF`.
- Pink: `#F686C3`, hover `#E13481`, disabled `#FFCEE9`.
- Blue: `#40CFFF`, hover `#026BA9`, disabled `#CAF0F8`.
- Neutral: `#22223B`, hover `#000000`, disabled `#F2E9E4`.
- Red: `#EF4444`, hover `#BF1F2F`, disabled `#F9EBEB`.

Semantic surfaces:

- Page background: light `#FFFFFF`, dark `#000000`.
- Subtle background: light `#F9FAFB`, dark `#030712`.
- Muted background: light `#F3F4F6`, dark `#111827`.
- Emphasized background: light `#E5E7EB`, dark `#1F2937`.
- Panel: light `#FFFFFF`, dark `#030712`.
- Error background: light `#FEF2F2`, dark `#450A0A`.
- Warning background: light `#FFF7ED`, dark `#431407`.
- Success background: light `#F0FDF4`, dark `#052E16`.
- Info background: light `#EFF6FF`, dark `#172554`.

### Layout, Grid, and Spacing

- Mobile: 4 columns, `16px` gutter, `16-32px` side margin, `320-768px` screen width.
- Tablet: 8 columns, `16-24px` gutter, `40-80px` margin, content width about `600-940px`.
- Desktop: 12 columns, `16-32px` gutter, `80-120px` margin, content width about `1200-1440px`.
- Page outer padding:
  - Desktop: `32-64px`.
  - Tablet: `24-32px`.
  - Mobile: `16-24px`.
- Top spacing from navigation: desktop `32-48px`, tablet `24-32px`, mobile `16-24px`.
- Standard spacing scale: small `8px`, medium `16px`, large `24-32px`, section `32-64px`.
- Box/card internal padding: `16-24px` desktop, `16-20px` mobile.
- Gap between cards: `16-24px`.
- Section gap: `48-64px` for major sections.
- Form field gap: `16px`.
- Label/value gap: `8-12px`.
- Use Chakra responsive props such as `{ base, md, lg }`; avoid fixed desktop-only widths.
- Prevent horizontal overflow on mobile.

### Shapes, Borders, and Elevation

- Buttons: rounded rectangle radius `4px`, `8px`, or `16px` by size and local pattern.
- Cards: radius `8px` default; `12-16px` only if local pattern supports it.
- Containers: radius `4-12px`; modals/drawers `8-16px`.
- Icon buttons: stable `32px`, `40px`, or `48px` square/circle.
- Profile images and circular indicators: `50%` or `9999px` radius.
- Hairline borders: `1px`; active/focus borders: `2px`.
- Dividers: `1px` horizontal or vertical, subtle neutral color.
- Shadows:
  - Level 1: `0px 2px 8px rgba(0,0,0,0.06)`.
  - Level 2: `0px 4px 12px rgba(0,0,0,0.08)`.
  - Level 3: `0px 8px 24px rgba(0,0,0,0.10)`.
  - Level 4: `0px 12px 32px rgba(0,0,0,0.12)`.
- Use `150-200ms ease-out` for hover/focus transitions.

### Cards and Page Containers

- Use cards for repeated records, summaries, key metrics, modals, drawers, and genuinely framed tools.
- Do not put cards inside cards.
- Do not wrap every page section in decorative cards.
- Typical sizes:
  - Small card: `280-320px`.
  - Medium card: `360-480px`.
  - Large content box: `600-800px`.
  - Form container: `480-720px`.
- On mobile, cards should be full width with `16-20px` internal padding.

### Tables and Data Views

- Prefer existing table components. Match the feature first, then use table V2 for new complex data views.
- Tables should be dense, aligned, sortable/filterable where expected, and readable at small widths.
- Use horizontal scroll for wide desktop-like mobile tables, or table V2 card/accordion mode when the data reads better as records.
- Keep actions visible and stable. Use icon buttons for row actions when space is tight.
- Include search, filters, Apply, Reset, pagination, row selection, and bulk actions when the workflow requires them.
- Empty tables must show a clear empty state, not a broken blank area.
- Do not convert tabular operational data into decorative cards unless mobile usability requires it.

### Filters and Search

- Search input desktop width: `240-320px`; mobile width: `100%`.
- Search input height: `40-48px`.
- Search icon size: `16-20px`, left aligned unless an existing component uses another pattern.
- Place filters near the table toolbar. Keep Apply/Reset labels standard.
- Do not hide active filters without visible chips, summary text, or clear affordance.

### Buttons

- Primary actions use solid green for confirm/save/create/submit/continue.
- Secondary actions use outline for cancel/back/alternate actions.
- Tertiary actions use ghost/text for low-emphasis commands.
- Destructive actions use red.
- Button labels must be short and standard.
- In paired action rows, place the secondary/cancel/back/destructive-outline action on the left and the primary/solid action on the right. Examples from the PDF: Back / Continue, Cancel / Save, Cancel / Submit, Cancel / Confirm. For approvals, Deny belongs on the left and Approve belongs on the right.
- Use these action pairs:
  - Step flow: Back / Continue.
  - Setup wizard: Back / Next.
  - Save changes: Cancel / Save.
  - Apply filters/settings: Cancel / Apply.
  - Sending: Cancel / Send.
  - Create item: Cancel / Create.
  - Upload/submit: Cancel / Submit.
  - Generic confirmation: Cancel / Confirm.
  - Destructive action: Cancel / Delete.
  - Auth: Cancel / Log in, Cancel / Sign up, Cancel / Log out, Cancel / Reset.
- Button sizes:
  - Small: `12px` text, weight `500-600`, line-height `16-20px`.
  - Medium: `14px` text, weight `500-600`, line-height `20-24px`.
  - Large: `16px` text, weight `600`, line-height `24-28px`.
  - Extra large: `18px` text, weight `600-700`, line-height `28-32px`.
- The PDF says all buttons are uppercase. In this repo, follow nearby BPIS/st-peter-ui button casing first; use uppercase only where the local screen already does.

### Forms

- Reuse existing form controls and `react-hook-form` patterns.
- Labels, helper text, validation, disabled, filled, focused, and error states must remain visible and aligned.
- Search inputs follow the search rules above.
- Date format: `MM/DD/YYYY`.
- Month/year fields: `MM/YYYY` when applicable.
- Mobile number format: starts with `+63`, followed by exactly 10 digits, numbers only.
- Mobile number error text: `Please enter a valid 10-digit mobile number`.
- Address order: Province, City/Municipality, District, Barangay, Zip Code, Street, House/Unit No.
- Address displays should be clickable when the workflow expects Waze/Maps directions.
- Contact numbers should be clickable when the workflow expects call behavior.
- First-name field may include suffix format: `FIRST NAME, SUFFIX`, for example `JUAN MIGUEL, JR.`.
- Read-only details should use left caption/title and right value/details, with clean row dividers. Preserve this on mobile in a condensed layout.

### Modals, Drawers, Messages, and Toasts

- Use existing message box/dialog providers and `sonner` where the app already does.
- Dialog structure: title, body, aligned action row.
- Modal size target: width `320-480px`, height `120-280px` unless content requires more.
- Icon size in dialogs: `24-32px`, with `12-16px` right spacing.
- Message typography:
  - Title: `16-18px`, weight `600-700`, about `40-60` characters max.
  - Description: `14-16px`, weight `400`, about `90-120` characters per line.
  - Buttons: `14px`, weight `500-600`.
- Standard dialog titles/actions:
  - CONFIRMATION: Cancel / Confirm.
  - INFORMATION: Later / Update.
  - WARNING: Cancel / Save.
  - ERROR: Cancel / Ok.
  - SUCCESS: Ok.
  - SESSION TIMEOUT: Log out / Yes.
  - PERMISSIONS: Deny / Allow.
- Toast severities: Information, Success, Warning, Error.

### Drawers

- Use drawers for record detail, approval review, filters on mobile, and secondary workflows.
- Keep drawer headers clear and action rows stable.
- Preserve close/cancel behavior and any existing submit handlers.
- On mobile, drawers should not create horizontal overflow or hidden primary actions.

### Navigation

- App chrome belongs in `components/layout`, not feature modules.
- Navigation patterns from the PDF include horizontal navbar, vertical sidebar, hamburger menu, breadcrumb navigation, sticky navigation, dropdown navigation, and mega menu.
- This repo uses authenticated `AppLayout`, sidebar items, sticky nav context, app header, and mobile bottom navigation. Reuse those patterns.
- Navbar heights:
  - Desktop: `64-72px`.
  - Tablet: `56-64px`.
  - Mobile: `48-56px`.
- Logo sizes:
  - Rectangle desktop: `120-150px` wide, `40-48px` high.
  - Rectangle tablet: `100-120px` wide, `36-44px` high.
  - Rectangle mobile: `60-100px` wide, `28-36px` high.
  - Square logo desktop: `32-40px`.
  - Square logo tablet: `28-36px`.
  - Square logo mobile: `24-32px`.
- Active navigation should use a green accent, subtle background, underline, or existing active style.

### Progress, Steppers, and Loading

- Use existing stepper/progress components when available.
- Desktop stepper: horizontal steps with connected lines; active step emphasized; complete state visible; future steps muted.
- Mobile stepper: compact layout with visible current step such as `1/3`, title, and concise description.
- Progress states may include In Progress, On Hold, Success, and Error/Failed.
- Loading states should reserve space to prevent layout shift and should not hide required context.

### Success and Empty States

- Success page pattern: centered green check circle, bold title, concise paragraph, light detail card with key/value rows, and standard action buttons.
- Empty state pattern: centered icon/illustration, bold title, normal description, optional primary action.
- Empty state titles should use standard language such as `No Results Found`, `No Records Available`, `Nothing to Display`, or `Your List Is Empty`.
- Empty states must explain the absence of content without inventing data.

### Images and Assets

- Use actual assets from `public/` or existing feature assets when available.
- Image guidelines from the PDF:
  - Background: `1920 x 1080`, `16:9`.
  - Hero: `1280 x 720`, `16:9`.
  - Lightbox: `1100 x 800`, `16:9`.
  - Blog/content: `1200 x 630`, `3:2`.
  - Rectangle logo: `250 x 150`, `3:2`.
  - Square logo/banner/thumbnail: `1:1`.
  - Favicon: `48 x 48`.
  - Social icons: `32 x 32`.
- Formats: JPEG for photos, PNG for transparency, SVG for icons/logos, WEBP for general web images.
- Do not add decorative stock-like images to operational screens unless the workflow needs an illustration or empty state.

### Reports

Use the BPIS report pattern:

- Header left: St. Peter Life Plan logo in green, head office line, branch address.
- Header right: report name, generated date and time.
- Section title below the header.
- Full-width report body.
- Footer signature blocks: prepared by, verified by, noted by.
- Footer bottom: `SYSTEM Version X.X.XX` left and `Page X of Y` right.
- Support portrait and landscape report layouts as needed.

### Icons

Use `react-icons` in this repository unless the local component already uses another icon source. The PDF also names Lucide equivalents, but do not introduce Lucide into new BPIS UI unless it is already part of the local component.

Standard `react-icons` mapping:

- Add: `FaPlus`.
- Edit: `FiEdit`.
- Cancel/close: `FaTimes` or nearby close icon.
- Save: `FiSave`.
- Delete: `LuTrash2`.
- Search: `LuSearch`.
- Menu: `HiBars3`.
- Show password: `FiEye`.
- Hide password: `FaEyeSlash`.
- Home: `BiHomeAlt`.
- Reports: `HiOutlineDocumentReport`.
- Profile: `HiOutlineUserCircle`.
- Logout: `FiLogOut`.
- Refresh: `FiRefreshCw`.
- Print: `FiPrinter`.
- Toggle theme: `FiMoon` / `FiSun`.
- Calendar: `LuCalendarDays`.
- Upload: `FiUpload`.
- Notifications: `FiBell`.
- Settings: `LuSettings`.
- Help: `HiOutlineQuestionMarkCircle`.
- Approval: `FiUserCheck`.
- Payment: `FiCreditCard`.
- Loan: `LuHandCoins`.

## Workflow

1. Inspect the existing page, route, component tree, data files, config files, and nearby examples.
2. Identify all current data, props, handlers, state, form registration, table columns, filters, modals, drawers, and navigation behavior.
3. Identify reusable components from `/components`, `st-peter-ui`, Chakra UI, feature-local components, and table components.
4. Choose the closest existing BPIS pattern: page shell, form, table, drawer, modal, detail display, success page, empty state, report, or stepper.
5. Plan the layout for desktop, tablet, and mobile before editing.
6. Implement safely with scoped changes. Preserve function names, exports, route behavior, and data shape unless change is requested.
7. Use responsive Chakra props and stable dimensions for buttons, tables, cards, toolbars, and drawers.
8. Verify text fit, alignment, spacing, overflow, empty/loading states, and action visibility.
9. Run `npm run build` for code changes when feasible. For visible UI changes, run `npm run dev` and inspect desktop and mobile widths.
10. Avoid unrelated cleanup, broad refactors, dependency changes, and business-logic changes.

## Enhanced Version Rules

Use enhanced versions when the user wants a cleaner, more polished, more standard version of an existing page.

- Keep the same route purpose, data, actions, labels, and workflow.
- Use `Page` for the shell when appropriate.
- Use existing `/components/common`, `/components/forms`, `/components/texts`, `/components/cards`, `/components/drawers`, and feature-local components.
- Use `st-peter-ui` typography/buttons/inputs where the current feature already uses them.
- Improve hierarchy with better grouping, spacing, table toolbar layout, filter placement, and responsive behavior.
- Replace ad hoc markup with existing components only when it does not break behavior.
- Keep visual polish practical: aligned columns, consistent widths, stable buttons, readable cards, visible focus states, clean empty/loading states.

## Custom Version Rules

Use custom versions only when the user asks for a more distinct or creative page variant.

- Preserve the same data, required fields, actions, and business purpose.
- Stay inside the BPIS/St. Peter design system: green primary theme, restrained operational layout, clear hierarchy, and professional spacing.
- Creativity may appear in composition, summaries, responsive record views, icons, and workflow grouping, not in business logic or invented content.
- Do not make the screen look like a marketing landing page unless the route is explicitly a public/marketing page.
- Custom mobile layouts must still expose all required actions and fields.

## Do Not

- Do not make minimal cosmetic-only changes when the page needs real standardization.
- Do not create ugly, cramped, misaligned, or inconsistent layouts.
- Do not ignore mobile, tablet, horizontal overflow, or text wrapping.
- Do not break existing functions, form submissions, table row actions, filters, drawers, modals, routing, login gate, or role behavior.
- Do not invent data, statuses, fields, routes, permissions, or workflows.
- Do not remove required fields, required buttons, validation messages, or table columns.
- Do not replace existing project components with new custom components without a clear need.
- Do not add Tailwind, new UI libraries, new icon libraries, or test tools unless the user explicitly asks.
- Do not change package versions or local `.tgz` artifacts unless package work is requested.
- Do not normalize unrelated legacy code, comments, or formatting.

## Final Checklist

Before finishing, verify:

- Existing functionality and business logic are preserved.
- Current data, text, statuses, columns, fields, and actions are preserved unless requested otherwise.
- Existing components and `st-peter-ui` were used where appropriate.
- Layout follows BPIS spacing, grid, typography, colors, and button standards.
- Page is responsive on desktop, tablet, and mobile.
- No horizontal overflow, text overlap, clipped buttons, unstable action widths, or nested cards.
- Tables have usable search/filter/pagination/empty behavior where applicable.
- Forms show labels, errors, helper text, disabled states, and required fields correctly.
- Modals/drawers/toasts use standard titles, actions, sizing, and alignment.
- Empty, loading, success, and error states are present and polished where relevant.
- Icons come from `react-icons` unless local code already uses another source.
- Code uses TypeScript, `@/` imports, 2-space indentation, double quotes, semicolons, and local naming style.
- `"use client"` is present only when needed.
- Verification was run or the reason it was not run is clearly reported.
