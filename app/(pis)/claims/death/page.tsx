"use client";

import { useMemo } from "react";
import { Box, Flex, Grid, GridItem } from "@chakra-ui/react";
import { Page } from "osp-ui-kit";
import { useClaimStore } from "../claim-store";
import {
  getForEndorsementClaims,
  getForProcessClaims,
  getForVerificationClaims,
} from "./death-claims-data";
import { PlanholderQuickSearch } from "../components/planholder-quick-search";
import { ClaimQueuesSection } from "./components/ClaimQueuesSection";
import { PendingClaimsSummary } from "./components/PendingClaimsSummary";
import { RecentUpdates } from "./components/RecentUpdates";

const QUOTE =
  "You don't buy life insurance because you are going to die, but because those you love are going to live. — Suze Orman";

/**
 * The page's own name, which differs by width — and differs in CSS rather than
 * in JavaScript.
 *
 * On a desktop the heading is the subject itself, "Death Claim", and the
 * "DEATH CLAIM" kicker that used to sit above it goes: the word it qualified
 * is gone, and the greeting it shared the corner with is now the banner's job.
 * A phone gets none of that — the kit's mobile header does not render the
 * kicker at all, and there is no banner there — so its heading stays the word
 * it has always been.
 *
 * Both are rendered and one is hidden, rather than picking with
 * `useBreakpointValue`: that hook answers `undefined` on the server and on the
 * first client render, which would flash the wrong heading — in the page's
 * largest text — on every load.
 */
const DESKTOP_ONLY = { base: "none", lg: "inline" } as const;
const MOBILE_ONLY = { base: "inline", lg: "none" } as const;

/**
 * `Page.Root` declares `title` as `React.ReactNode`, but `RootProps` intersects
 * `BoxProps`, and its HTML `title?: string` narrows the pair back down to
 * `string & ReactNode` — which nothing satisfies. The kit renders the prop
 * straight into a heading as children, so a node is right at runtime; this is
 * only to get past the collision.
 */
const asTitle = (node: React.ReactNode) => node as unknown as string;

export default function DeathClaimsPage() {
  // Creating a claim moves it from the first queue to the second, so all of
  // them are re-read whenever the claim store changes.
  const storeVersion = useClaimStore();
  const forProcessClaims = useMemo(
    () => getForProcessClaims(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeVersion],
  );
  const forVerificationClaims = useMemo(
    () => getForVerificationClaims(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeVersion],
  );
  const forEndorsementClaims = useMemo(
    () => getForEndorsementClaims(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeVersion],
  );

  // The overview counts the queue a processor is answerable for — the claims
  // waiting to be worked — so it stays on the For Process figures even though
  // the section below it now covers three queues.
  const counts = useMemo(
    () => ({
      regular: forProcessClaims.filter((c) => c.type === "regular").length,
      special: forProcessClaims.filter((c) => c.type === "special").length,
      all: forProcessClaims.length,
    }),
    [forProcessClaims],
  );

  return (
    // `headerButton="menu"`: a sidebar destination has no parent to go back
    // to, so its header carries the menu, not a back chevron. The shell
    // defaults to "back", so this has to be said explicitly.
    <Page.Root
      title={asTitle(
        <>
          <Box as="span" display={MOBILE_ONLY}>
            Dashboard
          </Box>
          <Box as="span" display={DESKTOP_ONLY}>
            Death Claim
          </Box>
        </>,
      )}
      description={QUOTE}
      headerButton="menu"
      // The shell reserves 96px under every page for the bottom navigation.
      // That navigation is mobile-only, so on a desktop the reserve is a strip
      // of nothing that the page has to scroll to reach — and a dashboard whose
      // sections each measure themselves to fit the screen then scrolls anyway,
      // for empty space. Handed back on `lg`, which is exactly where the
      // navigation stops being rendered.
      // Room below the last section: twice the gap BETWEEN sections, so it is
      // the page's own rhythm rather than a number of its own — 10 and 12 are
      // double the 5 and 6 the grid sets below.
      //
      // Enough to lift the queue clear of the bottom of the window, and no more.
      // Scrolling it all the way to the TOP of the screen would take about the
      // 200px its own height cap leaves over, which is a band of empty page the
      // whole time it is not being used; `useKeepInView` gets it whole and on
      // screen either way, which is the part that matters.
      //
      // A phone is the same rhythm plus what the bottom navigation takes. That
      // bar overlays the last 62px of the viewport, so the first 62px of any
      // reserve is not space at all — it is the part that is covered. The 40px
      // after it is the doubled gap again, and it is what actually shows under
      // the last card.
      //
      // `env()` adds the home-indicator inset on the phones that have one and
      // resolves to 0 everywhere else. This is the page's ONLY bottom reserve;
      // the queue used to carry a second one of its own, which stacked with
      // this one to nearly 200px of dead page.
      paddingBottom={{
        base: "calc(62px + 40px + env(safe-area-inset-bottom, 0px))",
        lg: 10,
        xl: 12,
      }}
      // No `overflowY`, deliberately: passing it at ALL switches the shell into
      // a full-height flex column that does not scroll, which is what this page
      // used to be. It scrolls now, at every width, so the shell is left as the
      // ordinary block it is by default — and the queue below bounds its own
      // list with a maximum height instead of with a chain of `height: 100%`
      // from here down.
    >
      <Page.MainContent>
        <Page.Row>
          <Grid
            templateColumns={{
              base: "1fr",
              xl: "minmax(0, 1fr) 340px",
              "2xl": "minmax(0, 1fr) 380px",
            }}
            // 20px matches the gap `Page.MainContent` puts between its own
            // children, so the stacked layout is spaced exactly as it was when
            // these three sections were three children of it.
            gap={{ base: 5, xl: 6 }}
            // Each column is as tall as its own content, at every width. The
            // queue used to be stretched to fill the row, because filling it was
            // what gave its list a height to be bounded by; the list carries its
            // own maximum now, so stretching the column would only leave the
            // rail beside it padded out to a height it has no use for.
            alignItems="start"
          >
            {/* The side rail, written FIRST so that stacked — every phone, and
                every window under `xl` — the order is the mobile one: where the
                processor's own queue stands, then what has moved on it, then the
                queues themselves. `order` swaps it on a wide screen, where the
                queues take the left column and this becomes the right. */}
            {/* Sticky from `xl`, where this is a column beside the work rather
                than a section above it. The processor scrolls the queue for
                minutes at a time, and a feed of what has just moved is only
                context if it is still on screen while they do — scrolled away
                it is a section they have to leave the queue to consult.
                `align-self: start` is what makes it possible: it leaves the
                grid AREA the full height of the row while the item itself is
                only as tall as its contents, which is the room the sticky box
                travels through. Stacked, none of this applies. */}
            <GridItem
              order={{ base: 0, xl: 1 }}
              minW={0}
              alignSelf="start"
              position={{ xl: "sticky" }}
              top={{ xl: "16px" }}
            >
              {/* No card around this any more. The panel existed to hold TWO
                  headings together so neither floated loose in the gutter; the
                  overview has moved to the head of the queue column, and one
                  section does not need an edge drawn round it to read as one
                  section. Stacked, nothing changes — the card was never applied
                  below `xl`. */}
              <Flex direction="column" gap={5}>
                {/* Stacked only. On a wide screen this same section is the band
                    under the welcome banner, one column over; rendering it here
                    as well would say the same three figures twice. Below `xl`
                    there is no banner and no second column, so this is the only
                    place it can be — and that is the mobile design, unchanged. */}
                <Box display={{ base: "block", xl: "none" }}>
                  <PendingClaimsSummary counts={counts} />
                </Box>

                {/* Its own row above the feed, not a control inside it. The
                    feed is what has just moved; this searches the whole file,
                    and a field sitting within the feed's own heading would read
                    as a filter over those few updates.

                    From `xl` only — the width at which the rail becomes a
                    column beside the work. Stacked below that it is full-width
                    and gets a design of its own, so this one stays out of the
                    way rather than being the wrong shape in the meantime. */}
                <Box display={{ base: "none", xl: "block" }}>
                  <PlanholderQuickSearch />
                </Box>

                <RecentUpdates />
              </Flex>
            </GridItem>

            {/* The three queues a claim passes through, behind one set of tabs.
                This is the work — everything else on the dashboard is context
                for it — so on a wide screen it takes every pixel the rail does
                not, and its cards lay themselves out in as many columns as that
                leaves room for. */}
            <GridItem order={{ base: 1, xl: 0 }} minW={0}>
              {/* The figures, then the work. The welcome banner that used to
                  head this column is gone: it greeted a processor who is
                  already named in the header above it, and it cost the queue a
                  banner's height on every load of the page they live in.

                  What is left is still `xl` and no lower — this is the top of a
                  COLUMN, and `xl` is where there is a second column for it to be
                  the top of. Below that the layout is one stack in mobile order
                  (the rail first, then the queues) and this would land between
                  two sections rather than above everything.

                  Laid out for the width it has here: three tiles across one row
                  rather than a headline over two, no line under the heading, and
                  the short name. */}
              <Box display={{ base: "none", xl: "block" }} mb={5}>
                <PendingClaimsSummary
                  counts={counts}
                  title="Pending Overview"
                  subtitle={null}
                  singleRow
                />
              </Box>

              <ClaimQueuesSection
                forProcess={forProcessClaims}
                forVerification={forVerificationClaims}
                forEndorsement={forEndorsementClaims}
              />
            </GridItem>
          </Grid>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
