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
import { ClaimQueuesSection } from "./components/ClaimQueuesSection";
import { PendingClaimsSummary } from "./components/PendingClaimsSummary";
import { RecentUpdates } from "./components/RecentUpdates";

const QUOTE =
  "You don't buy life insurance because you are going to die, but because those you love are going to live. — Suze Orman";

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
      subtitle="Death Claim"
      title="Dashboard"
      description={QUOTE}
      headerButton="menu"
      // The shell reserves 96px under every page for the bottom navigation.
      // That navigation is mobile-only, so on a desktop the reserve is a strip
      // of nothing that the page has to scroll to reach — and a dashboard whose
      // sections each measure themselves to fit the screen then scrolls anyway,
      // for empty space. Handed back on `lg`, which is exactly where the
      // navigation stops being rendered.
      paddingBottom={{ base: "96px", lg: "24px" }}
      // Passing `overflowY` at all switches the shell into a full-height flex
      // column, which is what lets a section inside it bound its own list with
      // `flex: 1; min-height: 0` instead of a measured pixel height. `visible`
      // on a phone keeps the page scrolling exactly as it always has; `hidden`
      // on a desktop is what stops the PAGE scrolling, so the only thing that
      // moves is the list.
      overflowY={{ base: "visible", lg: "hidden" }}
    >
      {/* `h`/`minH` all the way down to the list: a `flex: 1` child can only be
          bounded by its parent's height if every box between them has one, and
          `min-height: 0` is what lets those boxes shrink below their content
          instead of growing to fit it. Break the chain anywhere and the list
          stops being bounded and the page starts scrolling again. Desktop only —
          on a phone every one of these is the browser default. */}
      <Page.MainContent h={{ lg: "100%" }} minH={{ lg: 0 }}>
        <Page.Row h={{ lg: "100%" }} minH={{ lg: 0 }}>
          <Grid
            h={{ lg: "100%" }}
            minH={{ lg: 0 }}
            templateColumns={{
              base: "1fr",
              xl: "minmax(0, 1fr) 340px",
              "2xl": "minmax(0, 1fr) 380px",
            }}
            // 20px matches the gap `Page.MainContent` puts between its own
            // children, so the stacked layout is spaced exactly as it was when
            // these three sections were three children of it.
            gap={{ base: 5, xl: 6 }}
            // Stacked, each column is as tall as its own content — without that
            // the side rail would be stretched to the queue's height and its two
            // sections left floating in the middle of it. Side by side, the
            // queue column has to be able to FILL the row instead, since that is
            // what gives its list a height to be bounded by.
            alignItems={{ base: "start", xl: "stretch" }}
          >
            {/* The side rail, written FIRST so that stacked — every phone, and
                every window under `xl` — the order is the mobile one: where the
                processor's own queue stands, then what has moved on it, then the
                queues themselves. `order` swaps it on a wide screen, where the
                queues take the left column and this becomes the right. */}
            <GridItem
              order={{ base: 0, xl: 1 }}
              minW={0}
              minH={{ xl: 0 }}
              display={{ xl: "flex" }}
              flexDirection="column"
            >
              {/* The rail is a CARD from `xl` — and only from `xl`, which is
                  exactly where it stops being a stacked section and becomes the
                  column beside the queues. Stacked, on every phone and every
                  window under `xl`, none of this is applied: the mobile design is
                  finished and reads as sections of the page, not as a panel.
                  Standing on its own beside the queues it needs an edge, or two
                  headings float in the gutter with nothing holding them together.
                  Same surface as every other card in the area — white, hairline
                  border, `2xl` radius. */}
              <Box
                bg={{ xl: "white" }}
                borderWidth={{ base: "0", xl: "1px" }}
                borderColor="gray.200"
                borderRadius={{ xl: "2xl" }}
                boxShadow={{ xl: "sm" }}
                p={{ xl: 4 }}
                // A column, so the two sections inside can divide the card's
                // height between them: the tiles take what they need and the
                // feed takes the rest. See the chain note on `RecentUpdates`.
                display={{ xl: "flex" }}
                flexDirection="column"
                // Fills the row the way the queue column does, so the two are the
                // same height rather than a full-height list beside a card that
                // stops wherever its content happens to end.
                h={{ xl: "100%" }}
                // A backstop, and normally idle: the feed inside gives way until
                // it reaches its own floor, so nothing overflows this box until
                // the window is too short even for that. Then the rail scrolls
                // INSIDE the card rather than pushing the page taller.
                minH={{ xl: 0 }}
                overflowY={{ xl: "auto" }}
              >
                <Flex
                  direction="column"
                  gap={5}
                  // Fills the card, so the feed below the tiles has a height to
                  // be bounded by rather than one it sets by being as long as
                  // its own contents.
                  flex={{ xl: 1 }}
                  minH={{ xl: 0 }}
                >
                  <PendingClaimsSummary counts={counts} />
                  <RecentUpdates />
                </Flex>
              </Box>
            </GridItem>

            {/* The three queues a claim passes through, behind one set of tabs.
                This is the work — everything else on the dashboard is context
                for it — so on a wide screen it takes every pixel the rail does
                not, and its cards lay themselves out in as many columns as that
                leaves room for. */}
            <GridItem
              order={{ base: 1, xl: 0 }}
              minW={0}
              minH={{ lg: 0 }}
              display={{ lg: "flex" }}
              flexDirection="column"
            >
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
