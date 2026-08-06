"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  Box,
  Button,
  Drawer,
  Flex,
  Portal,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  LuChevronDown,
  LuChevronRight,
  LuChevronUp,
  LuIdCard,
} from "react-icons/lu";
import { InfoItem, StaticCard } from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { RowItem } from "@/components/info-card/row-item";
import { GroupLabel } from "../../components/group-label";
import { SectionTitle } from "../../components/section-title";
import type { Planholder } from "../../claims-data";
import { DrawerPageHeader } from "./DrawerPageHeader";
import { PlanholderProfileHeader } from "./PlanholderProfileHeader";

/* ------------------------------ formatting ------------------------------ */

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatPeso(amount: number): string {
  return "₱" + amount.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

/* ------------------------------ info grid ------------------------------ */

interface DetailItem {
  label: string;
  /** How the row renders it — a string, or a {@link Pill} for a status. */
  value: ReactNode;
  /**
   * The same fact as plain text, for the layouts that cannot take a node.
   *
   * The shared {@link InfoItem} draws a value as one line of type, so a status
   * that is a pill in a row becomes coloured text there — see `tone`. Only the
   * summary needs these; the drawer's panels are rows throughout.
   */
  text?: string;
  /** Colour for `text`, when the fact carries one. */
  tone?: string;
}

/** A card holding label · dotted leader · value rows. */
function InfoGrid({ items }: { items: DetailItem[] }) {
  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      boxShadow="xs"
      p={{ base: 4, md: 5 }}
    >
      {items.map((item) => (
        <RowItem key={item.label} label={item.label} value={item.value} />
      ))}
    </Box>
  );
}

/** Small coloured status pill used for the boolean-ish summary values. */
function Pill({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "green" | "red" | "amber" | "gray";
}) {
  const styles = {
    green: { bg: "green.50", color: "green.600" },
    red: { bg: "red.50", color: "red.600" },
    amber: { bg: "orange.50", color: "orange.600" },
    gray: { bg: "gray.100", color: "gray.600" },
  }[tone];
  return (
    <Box
      as="span"
      display="inline-flex"
      px={2}
      py="2px"
      borderRadius="full"
      fontSize="xs"
      fontWeight="semibold"
      bg={styles.bg}
      color={styles.color}
    >
      {children}
    </Box>
  );
}

/* ------------------------------ item builders ------------------------------ */

function summaryItems(planholder: Planholder): DetailItem[] {
  const isActive = planholder.accountStatus === "AC";
  const isWithin = planholder.contestability === "within";

  return [
    {
      label: "Termination Status",
      value: planholder.terminationStatus,
      text: planholder.terminationStatus,
    },
    {
      label: "Account Status",
      value: isActive ? (
        <Pill tone="green">Active</Pill>
      ) : (
        <Pill tone="amber">Lapsed</Pill>
      ),
      text: isActive ? "Active" : "Lapsed",
      tone: isActive ? "green.600" : "orange.600",
    },
    {
      label: "Date of Birth",
      value: formatDate(planholder.dateOfBirth),
      text: formatDate(planholder.dateOfBirth),
    },
    {
      label: "Age",
      value: planholder.age !== undefined ? `${planholder.age} yrs` : "—",
      text: planholder.age !== undefined ? `${planholder.age} yrs` : "—",
    },
    // {
    //   label: "Insurability",
    //   value: planholder.insurability ? (
    //     <Pill tone="green">Insurable</Pill>
    //   ) : (
    //     <Pill tone="red">Not Insurable</Pill>
    //   ),
    // },
    {
      label: "Contestability",
      value: (
        <Pill tone={isWithin ? "amber" : "gray"}>
          {isWithin ? "Within" : "Over"}
        </Pill>
      ),
      text: isWithin ? "Within" : "Over",
      tone: isWithin ? "orange.600" : "gray.600",
    },
    {
      label: "Effectivity",
      value: formatDate(planholder.effectivityDate),
      text: formatDate(planholder.effectivityDate),
    },
    {
      label: "New Effectivity",
      value: formatDate(planholder.newEffectivityDate),
      text: formatDate(planholder.newEffectivityDate),
    },
    {
      label: "RI Date",
      value: formatDate(planholder.riDate),
      text: formatDate(planholder.riDate),
    },
    {
      label: "LAF",
      value: planholder.laf ? planholder.laf : "—",
      text: planholder.laf ? planholder.laf : "—",
    },
  ];
}

function planDetailItems(planholder: Planholder): DetailItem[] {
  const d = planholder.planDetail;
  return [
    { label: "Plan", value: `${planholder.planDesc} (${planholder.planCode})` },
    {
      label: "Term",
      value: planholder.term !== undefined ? `${planholder.term} yrs` : "—",
    },
    { label: "Contract Price", value: formatPeso(d.contractPrice) },
    { label: "TAP", value: formatPeso(d.tap) },
    { label: "Balance", value: formatPeso(d.balance) },
    { label: "Inst. Amount", value: formatPeso(d.instAmount) },
    { label: "Total Amount Paid", value: formatPeso(d.totalAmountPaid) },
    { label: "Due Date", value: formatDate(d.dueDate) },
    { label: "Inst. No.", value: d.instNo },
    { label: "Last RI Date", value: formatDate(d.lastRIDate) },
    { label: "Last Payment Date", value: formatDate(d.lastPaymentDate) },
  ];
}

function demographicItems(planholder: Planholder): DetailItem[] {
  const p = planholder.person;
  return [
    { label: "Date of Birth", value: formatDate(planholder.dateOfBirth) },
    { label: "Place of Birth", value: p?.placeOfBirth ?? "—" },
    {
      label: "Age",
      value: planholder.age !== undefined ? `${planholder.age} yrs` : "—",
    },
    { label: "Gender at Birth", value: p?.genderAtBirth ?? "—" },
    { label: "Preferred Gender", value: p?.preferredGender ?? "—" },
    { label: "Civil Status", value: p?.civilStatus ?? "—" },
    { label: "Height", value: p ? `${p.height} cm` : "—" },
    { label: "Weight", value: p ? `${p.weight} kg` : "—" },
  ];
}

function contactAddressItems(planholder: Planholder): DetailItem[] {
  const p = planholder.person;
  return [
    { label: "Address", value: p?.address ?? "—" },
    { label: "Contact", value: p?.contact ?? "—" },
  ];
}

/* ------------------------------ panels ------------------------------ */

/**
 * A detail as one line of text, for the layouts that draw a value rather than
 * render it. Prefers what the item says it reads as; falls back to the value
 * itself when that is already a string, and to a dash when it is a node with no
 * plain-text stand-in.
 */
const asText = (item: DetailItem): string =>
  item.text ?? (typeof item.value === "string" ? item.value : "—");

/**
 * A titled panel of stacked label-over-value pairs, in as many columns as the
 * card is wide enough for — the layout the details take once they have a full
 * column to sit in. See the note on `asDetails`.
 *
 * Headed by a {@link GroupLabel} and not the page's `SectionTitle`: this is a
 * run inside a card, under the card's own title, and the section heading is set
 * exactly as an `InfoItem`'s value — 16px/600 either way — so a grid of them
 * under one would read as a fact called "Summary".
 */
function DetailPanel({ title, items }: { title: string; items: DetailItem[] }) {
  return (
    <Box>
      <GroupLabel>{title}</GroupLabel>
      <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} gapX={4} gapY={3}>
        {items.map((item) => (
          <InfoItem
            key={item.label}
            label={item.label}
            value={asText(item)}
            color={item.tone}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}

/* ------------------------------ drawer section ------------------------------ */

/** A titled block inside the details drawer. */
function DrawerSection({ title, items }: { title: string; items: DetailItem[] }) {
  return (
    <Box>
      <SectionTitle title={title} />
      <InfoGrid items={items} />
    </Box>
  );
}

/* ------------------------------ component ------------------------------ */

/**
 * Plan holder information — one card, two forms of it.
 *
 * Where the card is narrow (a phone, the create-claim rail) it is a compact,
 * clickable SUMMARY: the summary details as dotted-leader rows, and a tap opens
 * the "Planholder Detail" drawer, which leads with the profile card and lays out
 * every panel — Summary, Personal Info, Plan Detail — on one scrollable screen.
 * That is the same interaction model as the death page's "Recent Updates" card,
 * and the drawer is built the same way the claim detail drawer is: same root
 * sizing, same content shell, same {@link DrawerPageHeader}.
 *
 * Given `asDetails` and the width to use it, the card is instead the page's
 * DETAILS panel — every panel the drawer holds, in an accordion, open on the
 * page. See that prop for why.
 *
 * Replaces {@link PlanholderInfoTabs}, which is kept for reference.
 *
 * The drawer can be driven externally (e.g. a floating trigger elsewhere on
 * the page) by passing `open` / `onOpenChange`; left uncontrolled it manages
 * its own open state from the card click.
 */
export function PlanholderInfoCard({
  planholder,
  open: controlledOpen,
  onOpenChange,
  asDetails = false,
}: {
  planholder: Planholder;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether this card is the page's details panel rather than a summary of one.
   *
   * Given it, from `md` up the card becomes "Planholder Details": an accordion
   * holding the panels the drawer holds, laid out as grids of stacked label-
   * over-value pairs. Three things change together, and they are the same
   * decision seen from three sides.
   *
   * A drawer is right on a phone. It borrows the whole screen because the phone
   * has no room to show the details beside anything else, and it gives it back
   * on the way out. On a desktop that same drawer covers a page the processor is
   * working from to show them what is already on it — and every look costs an
   * open and a close. An accordion puts the details on the page instead, where
   * they can be read against the claim requests beside them and shut when the
   * column is wanted for something else.
   *
   * And once the whole record is on the page, "Summary" is the wrong name for
   * the card: it is the details now, so it says so.
   *
   * Rows and a drawer everywhere else, which is the phone and the create-claim
   * rail — 360px, a phone's width by another name. A leader between a label and
   * its value is the most facts that width will hold; across a full column it
   * stretches half a foot and the eye has to travel it nine times.
   */
  asDetails?: boolean;
}) {
  /**
   * Whether Personal Info and Plan Detail are showing, in the details layout.
   *
   * Shut to start with — see the block that renders them. The summary above them
   * is not part of this and never closes.
   */
  const [detailsOpen, setDetailsOpen] = useState(false);
  /** The card's own body, so a click can be told from a click on the header. */
  const bodyRef = useRef<HTMLDivElement>(null);
  /** Ties the toggle to the region it opens, for anything reading the page. */
  const extraPanelsId = useId();

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (onOpenChange) onOpenChange(next);
    if (!isControlled) setInternalOpen(next);
  };

  // Safety net: Chakra v3 (zag-js) can leave `pointer-events: none` / `data-inert`
  // stuck on <body> after a modal closes, freezing the page. Restore it.
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      const anyModalOpen = document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
      );
      if (!anyModalOpen) {
        document.body.style.pointerEvents = "";
        document.body.removeAttribute("data-inert");
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <>
      {/* The shared {@link StaticCard}: icon, title, subtitle, an action at the
          right and a ruled body underneath — which is exactly this card, and was
          a hand-made copy of it until now. The copy had drifted in the small
          ways copies do (its own padding, its own icon chip), and every one of
          those was a decision this area had no reason to be making.

          The click is on this wrapper rather than on the card, which takes no
          handler of its own. No `role` here either: the card's header row is
          already the button, so this only has to catch what bubbles out of it —
          a click from anywhere on the card, and Enter or Space from the header
          once it has focus. */}
      <Box
        // Below `md` when this card is the page's details panel, since the
        // accordion takes over from there; at every width otherwise.
        display={asDetails ? { base: "block", md: "none" } : undefined}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        // The three places the shared card differs from the card this area
        // already had, put back — the structure and the behaviour come from
        // `StaticCard`, the finished look stays exactly as designed.
        //
        // Written as CSS because the card takes no style props: `activeIcon`,
        // `title`, `subtitle`, `headerAction`, `children`, `h`, and nothing else.
        // Each rule is measured against what this card rendered before the swap,
        // and each is anchored to a numbered child of the card's own structure —
        // header first, body second — so a change to that structure upstream is
        // what would break them.
        // `of-type` and never `nth-child`: emotion inserts its own <style> among
        // these children when the page is rendered on the server, which shifts
        // every child index by one and lands each rule on the wrong box. Typed
        // selectors count only the divs, so the insert cannot move them.
        css={{
          // 1. The card insets itself by 4px. Ours does not: the rule under the
          //    header runs edge to edge, and 4px of inset is exactly what would
          //    stop it doing that.
          "& > div": { padding: 0 },
          // 2. The icon chip is the brand's pale green, not the card's grey.
          "& > div > div:first-of-type > div:first-of-type > div:first-of-type":
            { background: "#eaf5ee" },
          // 3. The body sits closer under the rule and further from the edges
          //    than the card's even 12px — 8px above, 16px around and below.
          "& > div > div:nth-of-type(2)": { padding: "8px 16px 16px" },
        }}
      >
        <StaticCard
          // The chip around it is the card's, and grey; the icon inside it is
          // ours, and the brand's.
          activeIcon={
            <Box display="flex" color={BRAND_COLORS.darkGreen}>
              <LuIdCard size={16} />
            </Box>
          }
          title="Planholder Summary"
          subtitle="Tap to view full details"
          // The card stops the action's clicks from reaching the wrapper — it
          // assumes an action does something of its own — so the chevron opens
          // the drawer itself rather than being the one place on the card that
          // does nothing.
          headerAction={
            <Box
              display="flex"
              color="gray.400"
              cursor="pointer"
              onClick={() => setOpen(true)}
            >
              <LuChevronRight size={18} />
            </Box>
          }
        >
          {/* Body — Summary detail only. The card rules it off and pads it. */}
          {summaryItems(planholder).map((item) => (
            <RowItem key={item.label} label={item.label} value={item.value} />
          ))}
        </StaticCard>
      </Box>

      {/* The same card as a details panel, from `md` up — see `asDetails`.
          Summary is the card's body and is always there; Personal Info and Plan
          Detail are behind the toggle, and when it is shut they are not on the
          page at all.

          Which is why this is `StaticCard` and not the kit's `InfoCardAccordion`
          — that one collapses EVERYTHING it is given, and the summary is the one
          part that must not go. What it does with the collapse is copied exactly:
          a grid whose single row goes from `1fr` to `0fr` over a quarter second,
          with the content clipped inside it. Same motion as every accordion in
          the kit, without giving up the persistent body.

          Shut on arrival. The summary is what the page has always shown at a
          glance and it still does; the other two panels are five hundred pixels
          of record that a processor asks for when they want it. */}
      {asDetails && (
        <Box
          display={{ base: "none", md: "block" }}
          // The header toggles, the body does not: a click that lands on the
          // details — selecting a policy number, say — must not shut them. The
          // body is this component's own element, so asking whether the click
          // came from inside it costs no assumption about the card's structure.
          onClick={(e) => {
            if (bodyRef.current?.contains(e.target as Node)) return;
            setDetailsOpen((v) => !v);
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            if (bodyRef.current?.contains(e.target as Node)) return;
            e.preventDefault();
            setDetailsOpen((v) => !v);
          }}
          // Typed selectors, for the reason given on the card above.
          css={{
            "& > div": { padding: 0 },
            "& > div > div:first-of-type > div:first-of-type > div:first-of-type":
              { background: "#eaf5ee" },
            "& > div > div:nth-of-type(2)": { padding: "8px 16px 16px" },
          }}
        >
          <StaticCard
            activeIcon={
              <Box display="flex" color={BRAND_COLORS.darkGreen}>
                <LuIdCard size={16} />
              </Box>
            }
            title="Planholder Details"
            // Names what the card holds rather than telling the processor to
            // tap: they can see the control, and on a desktop they are not
            // tapping anything.
            subtitle="Summary, personal info and plan detail"
            // The card stops this from bubbling, so it carries the toggle
            // itself. It is also the only part of the control a screen reader
            // is told about — the card's header row has no `aria-expanded` to
            // set — so the state and the region it owns live here.
            headerAction={
              <Button
                size="xs"
                // `plain`, not `ghost`: a ghost button is transparent until it
                // is hovered and then fills. This one never has a background at
                // all, and never takes a colour of its own — it is the control
                // for the card it sits on, not a thing on the card.
                variant="plain"
                aria-expanded={detailsOpen}
                aria-controls={extraPanelsId}
                onClick={() => setDetailsOpen((v) => !v)}
              >
                {detailsOpen ? "Show less" : "Show more"}
                {detailsOpen ? (
                  <LuChevronUp size={14} />
                ) : (
                  <LuChevronDown size={14} />
                )}
              </Button>
            }
          >
            <Box ref={bodyRef}>
              {/* Always. */}
              <DetailPanel title="Summary" items={summaryItems(planholder)} />

              {/* And the rest, when asked for. `0fr` is a row of no height, so
                  the panels inside are clipped to nothing — off the page, and
                  out of the way of a click. */}
              <Box
                id={extraPanelsId}
                display="grid"
                gridTemplateRows={detailsOpen ? "1fr" : "0fr"}
                transition="grid-template-rows 0.25s ease"
              >
                <Box overflow="hidden" minH={0}>
                  <VStack align="stretch" gap={6} pt={6}>
                    <DetailPanel
                      title="Personal Info"
                      items={demographicItems(planholder)}
                    />
                    <DetailPanel
                      title="Plan Detail"
                      items={planDetailItems(planholder)}
                    />
                  </VStack>
                </Box>
              </Box>
            </Box>
          </StaticCard>
        </Box>
      )}

      {/* Details drawer — built the same way the claim detail drawer is: same
          root sizing, same content shell, and the shared page-style header, so
          the two read as one flow. */}
      <Drawer.Root
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        size={{ base: "full", md: "md" }}
      >
        <Portal>
          <Drawer.Backdrop bg="blackAlpha.400" backdropFilter="blur(4px)" />
          <Drawer.Positioner>
            <Drawer.Content
              display="flex"
              flexDirection="column"
              overflow="hidden"
            >
              {/* A fixed title, not the plan holder's name: the profile card
                  at the top of the body names them now. */}
              <DrawerPageHeader
                title="Planholder Detail"
                onBack={() => setOpen(false)}
              />

              <Drawer.Body py={5} overflowY="auto">
                <VStack align="stretch" gap={6}>
                  {/* The same profile card the page header carries — who this
                      is, before any of the panels about them. */}
                  <PlanholderProfileHeader planholder={planholder} />

                  <DrawerSection
                    title="Summary"
                    items={summaryItems(planholder)}
                  />
                  <DrawerSection
                    title="Personal Info"
                    items={demographicItems(planholder)}
                  />
                  <DrawerSection
                    title="Plan Detail"
                    items={planDetailItems(planholder)}
                  />
                </VStack>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  );
}

export default PlanholderInfoCard;
