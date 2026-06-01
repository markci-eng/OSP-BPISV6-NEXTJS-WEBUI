---
name: osp-standard-frontend-design
description: Build frontend interfaces that conform to OSP's internal design system and St. Peter Life Plan brand standards. Use this skill for any OSP/internal-company web UI work — dashboards, forms, login/signup screens, navigation, modals, success pages, reports, or branded components — anything where output should follow OSP's typography, color, spacing, and component rules rather than a freely creative aesthetic. Trigger this skill whenever the user mentions OSP, St. Peter Life Plan, "our standard design", "company design system", "the QA team's design standards", or asks for components that need to match internal brand guidelines, even if they don't explicitly say "use the OSP system". When the user wants distinctive/creative UI without a brand constraint, prefer the general frontend-design skill instead.
---

This skill produces frontend code that conforms to the OSP Standard Design system (Design System → Style Guide + Component Library) used internally for company web UI, including St. Peter Life Plan branded surfaces. The goal is consistency and conformance — not creative differentiation. Where the general frontend-design skill encourages bold aesthetic choices, this skill encourages staying inside the documented system.

The user provides a UI requirement (component, page, form, dashboard, etc.). Produce working code (HTML/CSS/JS, React + Tailwind, or whatever the user requests) using the tokens and rules below. When the user supplies tokens, themes, or constraints, those override these defaults.

## How to apply this skill

1. Identify the deliverable type (page, form, button, navigation, message, etc.) and find the matching section below.
2. Pick a theme from the five documented palettes (Orange, Green, Pink, Blue, Neutral) — default to **Green (St. Peter)** if the work is St. Peter Life Plan branded, otherwise ask or use the theme the user names.
3. Apply the typography, spacing, shape, and component rules. Do not invent new tokens when documented ones exist.
4. Implement responsive behavior across Mobile / Tablet / Desktop using the breakpoints in the Grid section.
5. Use Lucide or react-icons for iconography; match action → icon mappings from the Icons section.

## Typography

**Font families** (in priority order, all sans-serif): Montserrat, Roboto, Open Sans, Calibri, Work Sans, Lato. Pick one for the project and use it throughout. Montserrat is the default for branded surfaces.

**Type scale** — sizes shift by breakpoint:

| Type | Desktop | Tablet | Mobile | Weight | Line height | Letter spacing |
|---|---|---|---|---|---|---|
| H1 (Title) | 48px | 40px | 32px | 700 | 1.1–1.2 | 0 to -0.5px |
| H2 (Primary heading) | 36px | 32px | 28px | 600 | 1.1–1.2 | 0 to -0.5px |
| H3 (Secondary heading) | 28px | 24px | 22px | 600 | 1.2–1.3 | 0 to -0.5px |
| H4/H5 (Tertiary heading) | 22px | 20px | 18px | 500 | 1.2–1.3 | 0 to -0.5px |
| Body | 16px | 15px | 14px | 400 | 1.5–1.7 | 0 to 0.2px |
| Button / CTA | 16px | 15px | 14px | 600 | 1.5–1.7 | 0.5px |
| Caption / Footnote | 12px | 12px | 12px | 400 | 1.4–1.6 | 0 to 0.2px |

Buttons are always **UPPERCASE**. Headings tighten letter-spacing slightly (down to -0.5px), body text stays near zero.

## Color palette

Five documented themes. Pick one per project. Each theme has six tones from lightest to darkest.

**Theme 1 — Orange:** `#F7B267` `#F79D65` `#F4845F` `#F27059` `#F1592B` `#BF1F2F`
**Theme 2 — Green (St. Peter / default for branded work):** `#ACD6A6` `#D3EDEE` `#92DDBF` `#109448` `#006838` ("St. Peter Green")
**Theme 3 — Pink:** `#FFCEE9` `#FFA8AE` `#E13481` `#F686C3` `#F6B192`
**Theme 4 — Blue:** `#026BA9` `#90E0EF` `#283D91` `#40CFFF` `#CAF0F8`
**Theme 5 — Neutral:** `#F2E9E4` `#000000` `#C9ADA7` `#22223B` `#808080`

**Full brand color reference** (always available regardless of chosen theme):

- *Primary:* Emerald/St. Peter Green `#006838`, Middle Green `#109448`, Pastel Pea Green `#ACD6A6`
- *Secondary:* Persian Pink `#F686C3`, Pastel Pink `#FFCEE9`, Ash White `#ECECEC`
- *Neutral:* White `#FFFFFF`, Black `#000000`, Grey `#808080`
- *Accent reds/oranges:* Cardinal Red `#BF1F2F`, Red Orange `#F1592B`, Cerise Pink `#E13481`, Coral Pink `#FFA8AE`, Olive Drab `#92792D`
- *Accent blues/cyans:* Cobalt Blue `#283D91`, Cerulean Blue `#026BA9`, Sky Blue `#40CFFF`, Light Cyan `#D3EDEE`, Seafoam Green `#92DDBF`
- *Accent golds:* Satin Sheen Gold `#CBA135`, Bright Gold `#FFD026`, Radiant Gold `#FFF48E`, Salmon `#F6B192`

**Semantic background tokens** (use these for surfaces, not raw hex):

| Token | Light RGB | Dark RGB |
|---|---|---|
| BG | 255,255,255 | 0,0,0 |
| BG.SUBTLE | 249,250,251 | 3,7,18 |
| BG.MUTED | 243,244,246 | 17,24,39 |
| BG.EMPHASIZED | 229,231,235 | 31,41,55 |
| BG.INVERTED | 0,0,0 | 255,255,255 |
| BG.PANEL | 255,255,255 | 3,7,18 |
| BG.ERROR | 254,242,242 | 69,10,10 |
| BG.WARNING | 255,247,237 | 67,20,7 |
| BG.SUCCESS | 240,253,244 | 5,46,22 |
| BG.INFO | 239,246,255 | 23,37,84 |

Implement these as CSS custom properties so the system flips between light and dark by swapping the values.

## Grid and breakpoints

| Device | Screen | Content width | Columns | Gutter | Margin X (rec.) | Margin Y (rec.) |
|---|---|---|---|---|---|---|
| Mobile | 320–767px | 100% | 4 | 16px | 16px | 24px |
| Tablet | 768–1279px | 640–960px | 8 | 24px | 40px | 32px |
| Desktop | ≥1280px | 1200–1440px | 12 | 24–32px | 80px | 48px |

## Page-level spacing

| Device | Page padding (outer) | Top margin (from header) | Content container width |
|---|---|---|---|
| Desktop | 32–64px | 32–48px | 1200–1440px |
| Tablet | 24–32px | 24–32px | 720–900px |
| Mobile | 16–24px | 16–24px | 100% minus margins |

**Card/box sizes (Desktop):** Small card 280–320px · Medium card 360–480px · Large content box 600–800px · Form container 480–720px.

**Internal page spacing (all breakpoints):** box padding 16–24px · gap between cards 16–24px · section gap 48–64px · form field gap 16px · label-to-value gap 8–12px.

## Margins & paddings (spacing scale)

| Scale | Mobile | Tablet | Desktop | Use for |
|---|---|---|---|---|
| Small | 8px | 8–12px | 8–16px | Icon gap, label spacing |
| Medium | 16px | 16–20px | 16–24px | Input padding, card spacing |
| Large | 24px | 24–32px | 24–40px | Container padding |
| Section | 32px | 40–56px | 48–64px | Section-to-section spacing |

## Shapes (border radius reference)

Match the shape to its role — don't free-style values when there's a documented one.

- **Rounded rectangle buttons:** 4 / 8 / 16px (S/M/L)
- **Rounded square buttons:** 8 / 12–16 / 16–24px
- **Circle buttons / profile pics / indicators:** always 50% (or 9999px)
- **Ellipse/oval buttons & search bars:** 16 / 20–24 / 28px (search bars: 16 / 20 / 24px)
- **Rounded square icons:** 4 / 8 / 12–16px
- **Cards:** 8 / 12 / 16–20px
- **Containers:** 4–6 / 8–12 / 16–20px
- **Modals:** 8 / 12–16 / 16–24px
- **Thumbnails:** 0 / 4–8 / 12–16px
- **Progress bar:** 2px subtle, 4px standard, 50%/9999px for pill

Outline widths: hairline 1px, medium 2px, thick 3–4px. Default border on inputs/cards is 1px; emphasize with 2px on focus or active states.

## Buttons

**Three variants:** Primary (solid fill), Secondary (outline), Tertiary (ghost / underlined text). On a destructive/confirm pair, the destructive primary should be visually clear — use the theme's primary for confirm, outline for cancel.

**Color states per theme:**

| Theme | Primary (default) | Hover (darker) | Disabled (light) |
|---|---|---|---|
| Orange | `#F4845F` white text | `#F1592B` white text | `#F7B267` black text |
| Green | `#109448` white text | `#006838` white text | `#92DDBF` black text |
| Pink | `#F686C3` white text | `#E13481` white text | `#FFCEE9` black text |
| Blue | `#40CFFF` white text | `#026BA9` white text | `#CAF0F8` black text |
| Neutral | `#22223B` white text | `#000000` white text | `#F2E9E4` black text |
| Red (destructive) | `#EF4444` white text | `#BF1F2F` white text | `#F9EBEB` black text |

**Outline variants** use white background, themed border + matching text color, and darken on hover the same way solids do.

**Button typography** (uppercase across all breakpoints, but line-heights differ):

| Size | Font size | Weight | Letter spacing | Line height (mobile / tablet / desktop) |
|---|---|---|---|---|
| Small | 12px | 500 | 0.5px | 16 / 18 / 20px |
| Medium | 14px | 500–600 | 0.5–1px | 20 / 22 / 24px |
| Large | 16px | 600 | 1px | 24 / 26 / 28px |
| Extra Large | 18px | 600–700 | 1–1.5px | 28 / 30 / 32px |

**Standard button pairings — use these exact labels:**

- *Step-by-step flow:* Back / Continue
- *Checkout flow:* Back / Order
- *Setup wizard:* Back / Next
- *Save changes:* Cancel / Save
- *Apply filters or settings:* Cancel / Apply
- *Send message/email:* Cancel / Send
- *Create something:* Cancel / Create
- *Upload or submit:* Cancel / Submit
- *Generic confirmation:* Cancel / Confirm
- *Destructive (delete):* Cancel / Delete — always use red (`#BF1F2F`)
- *Exit with/without saving:* Cancel / Save
- *Auth:* Cancel / Log in · Cancel / Sign up · Cancel / Log out · Cancel / Reset

Clear and Delete buttons are always RED `#BF1F2F` and may use solid, outline, or ghost — pick by emphasis level.

## Forms

**Login & Sign-up:** Stack vertically inside a rounded card. Email → Password (with eye toggle) → primary action button (`LOG IN` / `SIGN UP`). Below the button: small text link to the opposite flow ("Don't have an account? Sign up" / "Already have an account? Log in"). Then a divider with "Or" and a Google login row.

**Search input:**

| Size | Width | Height | Font | Icon |
|---|---|---|---|---|
| Small | 160–200px | 32–36px | 12–14px / 400 | 16–20px left-aligned |
| Medium | 240–300px | 40–44px | 14–16px / 400 | 16–20px left-aligned |
| Large | 320–480px | 48–56px | 16–18px / 400 | 16–20px left-aligned |

On desktop, search is typically 240–320px wide and 40–48px tall. On mobile it goes full width.

**Textbox states** — always implement all four: Default (label inside, light gray border), Focused (label floats up, themed border 2px), Filled (label floats up, value in bold dark text), Error (red border, error icon, error message below).

**Address form hierarchy** — render fields in this order: Province → City/Municipality → District → Barangay → Zip Code → Street → House/Unit No. The address itself, when displayed back, is clickable and opens Waze/Google Maps.

**Display details (read-only):** Two-column layout with caption/title on the LEFT and value/details on the RIGHT, separated by a thin divider per row. On mobile, same left-right pattern but condensed.

**Suffix on names:** First name field accepts `FIRST NAME, SUFFIX` format (e.g., `JUAN MIGUEL, JR.`) — comma-separated within the same field.

**Mobile number format:** Country selector defaults to `+63`, followed by exactly 10 digits, numbers only. Show validation error inline ("Please enter a valid 10-digit mobile number") with red border. Displayed mobile numbers are clickable and open the device dialer.

**Date format:** `MM/DD/YYYY` everywhere. Month-only fields use `MM/YYYY`. Calendar icon on the right of the input.

## Navigation

**Patterns available:** Horizontal nav bar · Vertical sidebar (icon-only or icon-with-label) · Hamburger menu (mobile) · Breadcrumb (Home > Menu > Products > Main Dish) · Sticky nav · Dropdown · Mega menu.

**For St. Peter Life Plan branded apps:**
- Upper bar (finalization style): hamburger left, logo center-left, search/notifications/profile icons right.
- Bottom bar (mobile finalization style): 5 tabs — Home · Buy My Plan · Pay My Plan · Products · Track My Request — line icons above labels.

**Sizing:**

| Element | Desktop | Tablet | Mobile |
|---|---|---|---|
| Nav bar height | 64–72px | 56–64px | 48–56px |
| Logo (rectangle) | 40–48 × 120–150px | 36–44 × 100–120px | 28–36 × 60–100px |
| Logo (square) | 32–40 × 32–40px | 28–36 × 28–36px | 24–32 × 24–32px |

**Nav text:** Logo/brand 18–24px @ 600–700. Default link 14–16px @ 400–500. Active/hover 12–14px @ 500–600 (often with underline or background pill in theme color).

## Cards (elevation system)

| Level | Shadow | Use for |
|---|---|---|
| 1 — Default | `0px 2px 8px rgba(0,0,0,0.06)` | Standard cards, list items |
| 2 — Hover/Interactive | `0px 4px 12px rgba(0,0,0,0.08)` | Hover state on clickable cards |
| 3 — Highlighted | `0px 8px 24px rgba(0,0,0,0.10)` | Featured/important content |
| 4 — Modal/Floating | `0px 12px 32px rgba(0,0,0,0.12)` | Dialogs, overlays, popups |

Always animate hover transitions in 150–200ms ease-out — never snap between elevations.

## Messages & notifications

Four severities, each with an icon + colored accent: **Information** (blue, info icon) · **Success** (green, check icon) · **Warning** (yellow, triangle-exclaim icon) · **Error** (red, X icon).

Three visual styles, choose by context:
- *Outlined card* — neutral inline message with a small OK button.
- *Solid filled bar* — strong toast/banner across a section width.
- *Dark card with colored icon badge* — for elevated toast notifications.

**Modal/dialog patterns** (title bar + body + button row aligned right):

| Type | Title | Button pair |
|---|---|---|
| Confirmation | CONFIRMATION | Cancel / Confirm |
| Information | INFORMATION | Later / Update |
| Warning | WARNING | Cancel / Save |
| Error | ERROR | Cancel / Ok |
| Success | SUCCESS | Ok (single button) |
| Session Timeout | SESSION TIMEOUT | Log out / Yes |
| Permissions | PERMISSIONS | Deny / Allow |

**Sizing:** Modal 320–480px wide × 120–280px tall. Icons inside messages 24–32px with 12–16px right margin. Title 16–18px @ 600–700, 40–60 chars. Description 14–16px @ 400, 90–120 chars per line. Button text 14px @ 500–600, 10–12 chars (`OK`, `Cancel`, `Yes`, `No`).

## Progress bars

- **Striped/animation bar** — solid fill with optional percentage badge or animated diagonal stripes.
- **Stepper** — numbered circles connected by lines. Completed steps show check icon + filled circle; current step is filled and emphasized; future steps are outlined.
- **Completion states** — full bar with leading status icon: In Progress (ellipsis), On Hold (pause), Success (check), Error/Failed (X).

## Success page pattern

Centered layout: green check circle icon → bold title ("Payment Successful!" / "Thank You!") → short paragraph description → light gray detail card with key-value rows (Transaction ID, Date & Time, etc.) → two-button row: outlined "Go back to Home" on the left, solid primary "Track My Request" on the right.

## Empty states

Center-aligned vertical stack: large outlined illustration/icon → bold title ("No applications yet", "No Results Found") → one-line gray description encouraging next action ("Get started by creating your first application").

## Stepper format

- *Desktop:* Horizontal row of icon+label pairs connected by lines. Active step has filled icon background, blue/theme label, and an underline accent. Future steps are gray.
- *Mobile:* Compact card with circular progress ring showing `1/3`, step title in bold beside it, and a short description below.

## Accordion

Two visual variants — chevron (▾) or plus/minus (+/−). Each row has: optional left icon in a tinted circle → bold title → gray description below → toggle on the right. Provide "Collapse All" and "Expand All" actions above the list. Smooth height transition on expand.

## Icons

Use **Lucide** (preferred) or **react-icons** consistently — don't mix in one screen. Match action to icon name:

| Action | Lucide | react-icons |
|---|---|---|
| Add | `Plus` | `FaPlus` |
| Edit | `Pencil` | `FiEdit` |
| Save | `Save` | `FiSave` |
| Delete | `Trash-2` | `LuTrash2` |
| Search | `Search` | `LuSearch` |
| Menu | `Menu` | `HiBars3` |
| Show password | `Eye` | `FiEye` |
| Hide password | `EyeOff` | `FaEyeSlash` |
| Home | `House` | `BiHomeAlt` |
| Reports | `FileChart` | `HiOutlineDocumentReport` |
| Profile | `CircleUserRound` | `HiOutlineUserCircle` |
| Logout | `Logout` | `FiLogOut` |
| Refresh | `RefreshCw` | `FiRefreshCw` |
| Print | `Printer` | `FiPrinter` |
| Theme (dark) | `Moon` | `FiMoon` |
| Theme (light) | `Sun` | `FiSun` |
| Calendar | `CalendarDays` | `LuCalendarDays` |
| Upload | `Upload` | `FiUpload` |
| Notifications | `Bell` | `FiBell` |
| Settings | `Settings` | `LuSettings` |
| Help | `CircleQuestionMark` | `HiOutlineQuestionMarkCircle` |
| Approval | `UserCheck` | `FiUserCheck` |
| Payment | `CreditCard` | `FiCreditCard` |
| Loan | `HandCoins` | `LuHandCoins` |

## Shape → use case map

| Shape | Use it for |
|---|---|
| Rounded rectangle | Buttons, cards, containers |
| Rounded square | Icons, thumbnails, action buttons |
| Circle | Icon buttons, profile pictures, status indicators |
| Ellipse / oval | Search bars, pill-shaped buttons |
| Triangle | Dropdown carets, alerts, directional indicators |
| Line | Dividers, progress bars, navigation underlines |
| Polygon | Custom icons, grid badges |
| Star | Ratings, favorites |
| Heart | Social actions, emotion indicators |

## Images

Reach for the right format and dimension by role:

| Role | Dimensions | Aspect |
|---|---|---|
| Background image (page backdrop) | 1920 × 1080 | 16:9 |
| Hero image (header) | 1280 × 720 | 16:9 |
| Lightbox / fullscreen | 1100 × 800 | 16:9 |
| Blog image | 1200 × 630 | 3:2 |
| Logo (rectangle) | 250 × 150 | 3:2 |
| Banner (promo) | 250 × 250 | 1:1 |
| Thumbnail | 150 × 150 | 1:1 |
| Logo (square) | 100 × 100 | 1:1 |
| Favicon | 48 × 48 | 1:1 |
| Social icon | 32 × 32 | 1:1 |

Format choice: **JPEG** for photos, **PNG** for transparent assets like logos, **SVG** for illustrations/icons/logos, **WebP** as the default for general website images.

## Reports

Two formats — Portrait and Landscape. Both share the same structure:

- **Top header** (left): St. Peter Life Plan logo in green, head office line, branch address. **Top header (right):** "TEST REPORT" (or report name), generated date and time.
- **Section title** in bold below the header (e.g., "Daily Collection Report").
- **Body** content, full-width.
- **Footer left:** signature blocks — "NAME OF BC/BE, BRANCH CASHIER/ENCODER · PREPARED BY" / "NAME OF STL/CS, STL/CS · VERIFIED BY" / "NAME OF BM, BRANCH MANAGER · NOTED BY".
- **Footer bottom:** `SYSTEM Version X.X.XX` left, `Page X of Y` right.

## Generic vocabulary

Use these standard labels — don't invent synonyms. They appear consistently across the system:

- **Navigation:** Home · Dashboard · Menu · Overview · Search · Explore · Categories · Activity · History · Notifications · Profile · Settings · Help · Support · More
- **Actions:** Add · Create · Edit · Update · Save · Submit · Cancel · Delete · Remove · Confirm · Continue · Back · Next · Close · Retry · Refresh · Apply · Reset · Download · Upload · Share · View
- **Form labels:** Name · Description · Details · Type · Category · Status · Date · Start Date · End Date · Amount · Quantity · Address · Contact Number · Email · Notes · Remarks · Required · Optional
- **Data display:** Total · Summary · Details · Result · Value · Count · Information · Records · List · Table · Recent · Latest · Preview
- **Status labels:** Active · Inactive · Pending · Processing · Approved · Rejected · Completed · Failed · Cancelled · Expired · Draft · Published · Archived
- **Feedback:** Success · Error · Warning · Loading · No Data Available · Something Went Wrong · Changes Saved · Try Again · Action Completed · Connection Lost · Syncing
- **Auth:** Sign In · Sign Out · Register · Forgot Password · Verify · Continue as Guest · Remember Me
- **Empty states:** No Results Found · No Records Available · Start by Adding a New Item · Nothing to Display · Your List Is Empty

## Implementation notes

- Use CSS custom properties (`--bg`, `--bg-subtle`, `--theme-primary`, `--theme-primary-hover`, `--theme-primary-disabled`, etc.) so light/dark and theme swaps are one-line changes.
- Set responsive type with `clamp()` or a mobile-first set of breakpoint overrides — don't repeat font-size manually on each component.
- Default transitions: 150–200ms ease-out for hover/focus, 250–300ms for accordion/modal entry.
- Keep accessibility intact: visible focus rings (2px outline in theme color), sufficient contrast on disabled states, semantic HTML for nav/form/dialog landmarks.
- This skill is about *conformance*, not creative differentiation. If the user wants something genuinely novel or off-brand, suggest the general frontend-design skill instead.
