# Archived claims screens

Screens this area used to serve and no longer does. They are kept because the
arguments in them are still live — a great many of the decisions in the shipped
screens were settled here first, and the comments say why.

Two collections, and they got here two different ways. The death-claim pair were
**alternatives** built beside the winner and beaten by it. The service-payables
set were the **live screens**, replaced by a design that folded all five of them
into one page.

## Why the folder starts with an underscore

Next's App Router treats a directory whose name begins with `_` as **private**:
its contents are excluded from routing entirely. So nothing here is reachable at
a URL, no matter that every folder still contains a `page.tsx`. That is the whole
mechanism — there is no route to remove and no redirect to maintain, and the
files stay readable and importable.

They are still **type-checked and linted**, which is deliberate: an archive that
stops compiling is an archive nobody can lift from. Their imports are wired to
the live modules (`../../death-claim/…`, `../../../service-payables/…`), so a
breaking change to something shared shows up here as a build error rather than
as a surprise six months from now.

---

# `death-claim-v1/` and `death-claim-v2/`

Two answers to the same brief as `/claims/death-claim`, built beside it and
compared on 2026-09-11.

### `death-claim-v1/` — the dashboard

The original screen at `/claims/death-claim`: three queue sections, a
pending-claims summary and a recent-updates feed, with the claim opened somewhere
else. Its complaint, and the reason the other two exist, is that the widest
column belonged to the LIST — so the thing being worked was never the thing on
screen.

Its three dashboard-only components came with it. The pieces it shared with
everything else — `DeathClaimsTable`, `DeathClaimsFilter`, `PendingClaimsSummary`
and `death-claims-data` — did **not**: they stayed at
`../death-claim/`, because the shipped screen reads them too.

### `death-claim-v2/` — the inversion

The queue as a pinned rail on the right, the claim in the main column, and a
floating dock along the bottom edge so a second and third claim can be read at
once without either losing the main column. Queue-first: pick on the right, work
on the left.

Worth keeping for two things it solved that the shipped screen does not attempt:
the **dock** (`components/floating-dock.tsx` — the Gmail-compose pattern,
including the measured `boundsRef` that confines windows to the work column), and
the **sticky-rail arithmetic** in `components/queue-rail.tsx`, which is the
clearest account in this codebase of what it takes to keep a `position: sticky`
column pinned for a whole scroll.

### The one that shipped

`/claims/death-claim` — the Conveyor. Claim-first: the page serves the head
of the priority queue and brings the next one the moment this is answered, so the
order holds by construction rather than by asking people not to shop the list.
Its own components are in `death-claim/conveyor/`.

---

# `service-payables-queues/`

The five screens Service Payables was worked on until 2026-09-11, when the same
collapse the death claim had just been through was applied to it. Unlike the pair
above, these were not proposals — they were the module, and everything in them
ran against real data.

| folder | was served at |
| --- | --- |
| `dashboard/` | `/claims/service-payables` |
| `for-process/` | `/claims/service-payables/for-process` |
| `for-verification/` | `/claims/service-payables/for-verification` |
| `for-approval/` | `/claims/service-payables/for-approval` |
| `for-endorsement/` | `/claims/service-payables/for-endorsement` |

### What was wrong with them

Nothing, screen by screen. What was wrong was the count: **five pages and three
choices** between arriving and doing any work. The dashboard asked which queue;
For Process asked which TERRITORY, then which billing off an accordion, then
which account out of its table. A processor could spend a minute choosing before
terminating anything, and the queue's own order — who has been waiting longest —
was advice rather than a rule, because the accordion let anybody take the small
chapel first.

### What replaced them

`/claims/service-payables` — the Conveyor, with its own pieces in
`service-payables/conveyor/`. It serves the head of the queue at whichever of the
four stages a tab selects, opens the first account on it, and brings the next as
each is answered. Billing creation is automated, so the Create Billing step the
old screens carried does not exist on it.

### Nothing in `components/` moved

Every one of these pages still imports from `../../../service-payables/components/`
and `../../../service-payables/*`, which is why they still compile. That means a
good deal of the module is **kept alive by the archive alone** — it is on no
served path any more:

`BillingAccordionCard`, `BillingIndex`, `BillingQueueSection`, `BillingDetail`,
`BillingAction`, `CreateBillingDialog`, `ChapelBillingCard`, `ChapelBillingList`,
`ChapelPicker`, `ProcessorWorkspace`, `ProcessorCard`, `ProcessorDataTable`,
`ProcessorPicker`, `TerritoryCard`, `TerritoryDataTable`, `TerritoryPicker`,
`RecentBillings`, `ServicePayablesSummary`, `StageQuickLinks`, `StageComingSoon`,
`ServiceRecordView`, `ServiceRecordDrawer`.

`BILLING_STAGE_ROUTES` in `service-payables-data.ts` names the four URLs above,
which no longer resolve. It is read only by `StageQuickLinks`,
`ProcessorWorkspace` and `BillingQueueSection` — all three on this list — so the
dead links are reachable from nothing that is served. Left as they are rather
than repointed at the conveyor: an archived page's nav should describe the world
that page lived in.

That is a real cost and it is the deliberate one. Deleting the set would take
`ServiceRecordView`'s two-column record and the accordion's table with it, and
both are worth having on file the first time somebody asks why the conveyor does
not let you see two chapels at once.
