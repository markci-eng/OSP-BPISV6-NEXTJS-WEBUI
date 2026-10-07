"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  Image,
  Portal,
  SimpleGrid,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import {
  LuChevronDown,
  LuChevronRight,
  LuChevronUp,
  LuIdCard,
} from "react-icons/lu";
import { StaticCard } from "osp-ui-kit";
import { RowItem } from "@/components/info-card/row-item";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { mockAvatarUrl } from "@/lib/mock-avatar";
import { isAccountInGoodStanding } from "../../../data";
import { GroupLabel } from "../../components/group-label";
import { InfoLabel } from "../../components/info-label";
import { SectionTitle } from "../../components/section-title";
import { SHEET_HEIGHT } from "../../components/sheet-height";
import { SheetTabs } from "../../components/sheet-tabs";
import { useSwipeStep } from "../../components/use-swipe-step";
import { toSurnameFirst, type Planholder } from "../../claims-data";
import { DrawerPageHeader } from "./DrawerPageHeader";
import { DetailCard } from "../../components/detail-card";
import { PlanholderCardHeader } from "./PlanholderCardHeader";
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
   * The same fact as plain text, for the layouts that draw it as one line.
   *
   * The panels set a value as a single run of type, so a status that is a pill
   * in a row becomes coloured text there — see `tone`. Only the summary needs
   * these; the drawer's panels are rows throughout.
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

/**
 * What the plan holder record says about a person who has died.
 *
 * NOT ON THE `Planholder` MODEL, and that is not an oversight: the record is of
 * a living plan until a claim says otherwise, and the date of death is filed on
 * the CLAIM. So a caller that has a claim in hand passes it, and one that does
 * not simply leaves the pair out — which is why the profile page and the claim
 * drawer are untouched by this.
 */
export interface DeceasedFacts {
  /** As the claim spells it. */
  dateOfDeath?: string;
  /** "42 yrs 7 mos 7 days" — to the day, because contestability turns on it. */
  ageAtDeath?: string;
}

function summaryItems(
  planholder: Planholder,
  deceased?: DeceasedFacts,
  deficient?: boolean,
): DetailItem[] {
  // Good standing rather than "is it AC": a fully paid account is the best one
  // a plan reaches, and reading it as amber would say the opposite.
  const isActive = isAccountInGoodStanding(planholder.accountStatus);
  const accountStatus = planholder.accountStatusLabel;
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
        <Pill tone="green">{accountStatus}</Pill>
      ) : (
        <Pill tone="amber">{accountStatus}</Pill>
      ),
      text: accountStatus,
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
    // DIRECTLY AFTER THE BIRTH PAIR, when there is one. Born / aged / died /
    // aged at death reads as one run of facts about a person; anywhere else in
    // the list and the reader has to carry the birth date down the page to make
    // sense of the death date. Spread, so a caller without a claim gets exactly
    // the summary it had before.
    ...(deceased?.dateOfDeath
      ? [
          {
            label: "Date of Death",
            value: deceased.dateOfDeath,
            text: deceased.dateOfDeath,
          },
        ]
      : []),
    ...(deceased?.ageAtDeath
      ? [
          {
            label: "Age at Death",
            value: deceased.ageAtDeath,
            text: deceased.ageAtDeath,
          },
        ]
      : []),
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
    // WHETHER THE FOLDER IS SHORT ANYTHING — last, and only for a caller that
    // has asked the question. See {@link PlanholderInfoCardProps.deficient}.
    //
    // YES OR NO, NOT A TICK (user, 2026-09-14: "add the same is Deficient here
    // instead make it yes or no"). Service payables draws this as a checkbox
    // beside Double Used because it stands in a row of checkboxes; here it is
    // one of twelve label-over-value pairs, and a lone box among them would be
    // the only thing in the grid a reader could mistake for a control. The
    // word is the same fact in the grid's own voice.
    //
    // AMBER WHEN IT IS YES, which is the tone this card already gives a
    // contestable plan and a lapsed account: something to look at, not
    // something wrong.
    ...(deficient === undefined
      ? []
      : [
          {
            label: "Deficient",
            value: deficient ? "Yes" : "No",
            text: deficient ? "Yes" : "No",
            tone: deficient ? "orange.600" : undefined,
          },
        ]),
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
  const name = planholder.name;
  return [
    // THE NAME IN ITS PARTS, first. The card's heading already reads it whole,
    // but a whole name has no label to say WHICH part a correction touched —
    // and the death claim's corrections are made part by part. See
    // `CORRECTABLE_PLANHOLDER_FIELDS`.
    { label: "Last Name", value: name?.lastName || "—" },
    { label: "First Name", value: name?.firstName || "—" },
    { label: "Middle Name", value: name?.middleName || "—" },
    { label: "Suffix", value: name?.suffix || "—" },
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
 * run inside a card, under the card's own title, and the section heading was set
 * exactly as the kit `InfoItem`'s value — 16px/600 either way — so a grid of
 * them under one read as a fact called "Summary". The pairs are quieter now (see
 * below) and the heading no longer collides with them, but it stays a
 * `GroupLabel`: a run inside a card is what it is regardless of what saved it.
 *
 * The pairs are {@link InfoLabel}, the claims area's own — the same component
 * the claim details card uses, so the two cards on the claim view are set alike
 * rather than one shouting its values at 16px/600 and the other not. See it for
 * the sizes and why they differ from the kit's.
 */
function DetailPanel({
  title,
  items,
  marks,
  titled = true,
}: {
  title: string;
  items: DetailItem[];
  /** See {@link PlanholderInfoCard}'s `labelMarks`. */
  marks?: LabelMarks;
  /**
   * Whether the heading is showing.
   *
   * A group label earns its place by telling one run from the next. Shut, this
   * card holds ONE run, and "Summary" over the only thing on the card names what
   * cannot be mistaken for anything else — under a card already titled
   * "Planholder Details", it is a third heading for the same block. It comes
   * back with the panels it distinguishes.
   */
  titled?: boolean;
}) {
  return (
    <Box>
      {/* Rendered or not, rather than collapsed like the panels below.
          `grid-template-rows: 0fr → 1fr` is the trick this card uses to open
          those, and it does not work for a single line: `overflow: hidden` makes
          the track's automatic minimum zero, so the `1fr` it animates to
          resolves to zero as well and the heading never comes back. A label is
          one line either way — there is nothing to animate that is worth a
          mechanism that has to be argued with. */}
      {titled && <GroupLabel>{title}</GroupLabel>}

      <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} gapX={4} gapY={3}>
        {items.map((item) => (
          <InfoLabel
            key={item.label}
            label={marks?.[item.label] ?? item.label}
            value={asText(item)}
            color={item.tone}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}

/**
 * Labels to draw as something other than their plain text, keyed by the label
 * as the card writes it ("Date of Birth"). The value under a marked label is
 * untouched — see {@link PlanholderInfoCard}'s `labelMarks`.
 */
export type LabelMarks = Partial<Record<string, ReactNode>>;

/* ------------------------------ drawer section ------------------------------ */

/** A titled block inside the details drawer. */
function DrawerSection({
  title,
  items,
}: {
  title: string;
  items: DetailItem[];
}) {
  return (
    <Box>
      <SectionTitle title={title} />
      <InfoGrid items={items} />
    </Box>
  );
}

/* ------------------------------ identity shell ------------------------------ */

/**
 * The card headed by WHO it is about — {@link PlanholderCardHeader}, the same
 * header Service Payables' planholder card carries — in place of the kit
 * card's icon / title / subtitle. See `identity`.
 *
 * The header's own clicks (the contact icon, and its sheet and hover card,
 * which React bubbles through their portals) stop here, so opening the address
 * never also opens or folds the details.
 */
function IdentityCard({
  planholder,
  edits,
  action,
  actionAtFoot = false,
  children,
}: {
  planholder: Planholder;
  /** See {@link PlanholderInfoCard}'s `headerEdits`. */
  edits?: ReactNode;
  /** The chevron, or Show more. */
  action: ReactNode;
  /**
   * Under the facts rather than at the right of the header — where Show more
   * goes (user, 2026-10-02: "place the show more at the bottom of the labels
   * and icon"), so the header's right edge is the badges' alone.
   */
  actionAtFoot?: boolean;
  children: ReactNode;
}) {
  return (
    <DetailCard>
      <Flex align="center" gap={3} mb={{ base: 4, md: 5 }} cursor="pointer">
        <Box
          flex={1}
          minW={0}
          cursor="auto"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <PlanholderCardHeader planholder={planholder} edits={edits} />
        </Box>
        {!actionAtFoot && action}
      </Flex>
      {children}
      {actionAtFoot && (
        <Flex justify="center" mt={4}>
          {action}
        </Flex>
      )}
    </DetailCard>
  );
}

/** The kit card's icon / title / subtitle shell, or the identity card. */
function DetailsShell({
  identity,
  planholder,
  edits,
  title,
  subtitle,
  action,
  actionAtFoot,
  children,
}: {
  identity: boolean;
  planholder: Planholder;
  /** The identity header's edited-fields icon. The kit card has no place for it. */
  edits?: ReactNode;
  title: string;
  subtitle: string;
  action: ReactNode;
  /** See {@link IdentityCard}. The kit card keeps its action in the header. */
  actionAtFoot?: boolean;
  children: ReactNode;
}) {
  if (identity) {
    return (
      <IdentityCard
        planholder={planholder}
        edits={edits}
        action={action}
        actionAtFoot={actionAtFoot}
      >
        {children}
      </IdentityCard>
    );
  }
  return (
    <StaticCard
      // No colour set: react-icons draw with `currentColor`, so the mark
      // takes the card's text rather than a value hard-coded here.
      activeIcon={
        <Box display="flex">
          <LuIdCard size={16} />
        </Box>
      }
      title={title}
      subtitle={subtitle}
      headerAction={action}
    >
      {children}
    </StaticCard>
  );
}

/**
 * The three places the kit card differs from the card this area already had,
 * put back. Written as CSS because the card takes no style props. Typed
 * selectors and never `nth-child`: emotion inserts its own <style> among these
 * children when the page is rendered on the server, which shifts every child
 * index by one.
 */
const KIT_CARD_CSS = {
  // 1. No 4px inset: the rule under the header runs edge to edge.
  "& > div": { padding: 0 },
  // 2. The icon has NO chip — the card's own title is beside it.
  "& > div > div:first-of-type > div:first-of-type > div:first-of-type": {
    background: "transparent",
  },
  // 3. The body: 8px under the rule, 16px around and below.
  "& > div > div:nth-of-type(2)": { padding: "8px 16px 16px" },
} as const;

/* ------------------------------ phone sheet ------------------------------ */

/**
 * WHO THE SHEET IS ABOUT, on the sheet and not in a card — the mock-up's line:
 * the photo, the name surname-first, and under it the LPA.
 */
function PlanholderIdentity({ planholder }: { planholder: Planholder }) {
  // The LPA only. Address and contact are behind the card header's icon, not
  // on a line under the name (user, 2026-10-02: "not that important").
  const line = planholder.lpaNo;

  return (
    <Flex flexShrink={0} align="center" gap={3} px={4} pt={1} pb={3}>
      <Image
        src={mockAvatarUrl(planholder.personId)}
        alt=""
        boxSize="44px"
        borderRadius="full"
        objectFit="cover"
        borderWidth="2px"
        borderColor={BRAND_COLORS.primaryGreen}
        flexShrink={0}
      />
      <Box minW={0}>
        <Text fontSize="sm" fontWeight="700" color="gray.800" lineClamp={1}>
          {planholder.name ? toSurnameFirst(planholder.name) : planholder.lpaNo}
        </Text>
        <Text fontSize="11px" color="gray.500" lineClamp={2}>
          {line}
        </Text>
      </Box>
    </Flex>
  );
}

type DetailTab = "summary" | "personal" | "plan";

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: "summary", label: "Summary" },
  { key: "personal", label: "Personal" },
  { key: "plan", label: "Plan" },
];

/**
 * THE PHONE'S PLANHOLDER DETAIL — option B of the mock-up (user, 2026-10-02): a
 * bottom sheet with the drawer's three panels as tabs, Summary first. Tap a
 * tab or swipe the list. The same fields the drawer shows and nothing more.
 *
 * THE MOCK-UP'S SHAPE (user, same day, after trying the other: "the planholder
 * is the one who is not in the card and the details is in the card"). Who it
 * is sits on the sheet as one line of identity; the rows are in the card.
 *
 * FITTED TO ITS TALLEST TAB, under the shared cap — no white space under the
 * rows, and no jump between tabs; see the body.
 *
 * Mounted always, `open` driving it — see `SectionPopup`.
 */
function PlanholderDetailSheet({
  planholder,
  deceased,
  deficient,
  open,
  onClose,
}: {
  planholder: Planholder;
  deceased?: DeceasedFacts;
  deficient?: boolean;
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<DetailTab>("summary");
  const [body, setBody] = useState<HTMLDivElement | null>(null);

  // Summary each time it opens — what the card was showing.
  useEffect(() => {
    if (open) setTab("summary");
  }, [open]);
  // A new tab starts at its top.
  useEffect(() => {
    if (body) body.scrollTop = 0;
  }, [tab, body]);

  const index = DETAIL_TABS.findIndex((t) => t.key === tab);
  const swipe = useSwipeStep({
    canGo: (dir) =>
      dir === "next" ? index < DETAIL_TABS.length - 1 : index > 0,
    onStep: (dir) => {
      const next = DETAIL_TABS[index + (dir === "next" ? 1 : -1)];
      if (next) setTab(next.key);
    },
  });

  const tabItems: Record<DetailTab, DetailItem[]> = {
    summary: summaryItems(planholder, deceased, deficient),
    personal: demographicItems(planholder),
    plan: planDetailItems(planholder),
  };

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="bottom"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            borderTopRadius="2xl"
            bg={BRAND_COLORS.subtleBg}
            maxH={SHEET_HEIGHT}
            pb="env(safe-area-inset-bottom, 0px)"
          >
            <Drawer.Header
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              px={4}
              pt={3}
              pb={2}
            >
              <Drawer.Title fontSize="md" fontWeight="700" color="gray.800">
                Planholder Detail
              </Drawer.Title>
              <Drawer.CloseTrigger asChild position="static">
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            {/* WHO, then the tabs — both stay put while the rows scroll. */}
            <PlanholderIdentity planholder={planholder} />
            <Box
              flexShrink={0}
              px={4}
              pb={3}
              borderBottomWidth="1px"
              borderColor="gray.100"
            >
              <SheetTabs
                label="Planholder Detail"
                tabs={DETAIL_TABS}
                active={tab}
                onChange={(key) => setTab(key as DetailTab)}
              />
            </Box>

            <Drawer.Body ref={setBody} px={4} pt={2} pb={4} overflowY="auto">
              {/* THE SWIPE SURFACE is the whole list — see `useSwipeStep`. */}
              <Box {...swipe.cardProps}>
                {/* THE ROWS IN THE PAGE'S OWN CARD — `InfoGrid`, the box the
                    drawer's panels use.

                    ALL THREE TABS IN ONE GRID CELL, only the one on show
                    visible — so the sheet is as tall as the TALLEST tab and no
                    taller. It fits its rows the way the History sheet does
                    (user: "remove the white space … same as the history
                    drawer"), and switching tab never changes its height. */}
                <Box style={swipe.contentStyle} display="grid">
                  {DETAIL_TABS.map((t) => (
                    <Box
                      key={t.key}
                      gridArea="1 / 1"
                      visibility={t.key === tab ? "visible" : "hidden"}
                      aria-hidden={t.key !== tab}
                    >
                      <InfoGrid items={tabItems[t.key]} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
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
  deceased,
  deficient,
  open: controlledOpen,
  onOpenChange,
  asDetails = false,
  summaryAsPairs = false,
  identity = false,
  labelMarks,
  headerEdits,
}: {
  planholder: Planholder;
  /**
   * The edited-fields icon for the identity header — see `EditedFieldsButton`.
   * The death claim passes it; nothing else tracks edits to a planholder.
   */
  headerEdits?: ReactNode;
  /**
   * Labels drawn as something other than their text — the death claim's
   * corrected fields, whose NAME is coloured and carries what changed (user,
   * 2026-09-29: only the label is highlighted, never the value). Keyed by the
   * label as written, so "Date of Birth" marks it in Summary and Personal Info
   * alike.
   *
   * THE PHONE'S ROWS TOO. A marked row is drawn as an `InfoLabel`, which is the
   * same leader row below `lg`, because the shared `RowItem` takes only a string.
   *
   * A mark on a label that only Personal Info carries — a part of the name —
   * opens Show more, so a correction is never folded away where nobody sees it.
   */
  labelMarks?: LabelMarks;
  /**
   * Head the card with WHO it is about — the photo, name, LPA, Insurable and
   * the address/contact icon of {@link PlanholderCardHeader} — in place of
   * "Planholder Summary" / "Planholder Details", where a screen has no other
   * place that says whose facts these are (the death claim). The same header
   * Service Payables' planholder card carries (user, 2026-10-02).
   */
  identity?: boolean;
  /**
   * Whether the folder read against this record is short anything — drawn as a
   * Deficient / Yes-No pair at the end of the summary.
   *
   * A CALLER'S FACT, like {@link DeceasedFacts} above it and for the same
   * reason: a deficiency belongs to the CLAIM being read, not to the plan
   * holder, so the card is told rather than working it out. Omit it and the
   * summary is exactly what it was — which is what the profile page and the
   * claim drawer pass, since neither is reading a folder against a claim.
   *
   * IT IS A READING AND NOTHING ELSE. Service payables makes its own version of
   * this clickable, because that screen has the deficiency list a few hundred
   * pixels below it to jump to; this card sits above a column where the folder
   * is already the next section but one, and a fact that navigated from inside a
   * grid of facts would be the only one that did.
   */
  deficient?: boolean;
  /**
   * The death this record is being read against, when it is being read against
   * one — see {@link DeceasedFacts}. Omit it and the card is exactly what it
   * was: a living plan holder's record.
   */
  deceased?: DeceasedFacts;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Draw the summary body as stacked label-over-value PAIRS, two across,
   * instead of dotted-leader rows.
   *
   * For the DESKTOP rails. A leader row spends its whole width on one fact and
   * the rule between its halves; the same fact as a pair is two short lines,
   * so two of them fit side by side and ten facts come to five rows instead of
   * ten. In a rail that is one column of a claim — where the height this frees
   * goes straight to the folder underneath — that is the difference between a
   * card and half a screen.
   *
   * It is also the layout the profile's details panel uses ({@link
   * DetailPanel}), so the same record is set the same way wherever a desktop
   * shows it. A status that is a pill in a row becomes coloured text here, for
   * the reason given on `DetailItem.text`.
   *
   * A caller's decision and not a breakpoint's: this card is dropped into rails
   * of about 360px and into full-width pages, and the width that matters is the
   * card's, which no media query here can see. A phone keeps rows — at that
   * width two columns of pairs is four words a line.
   */
  summaryAsPairs?: boolean;
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

  // Opened when a mark lands where only the folded panels would show it — see
  // `labelMarks`. On the change, not on every render, so shutting it again after
  // reading is the reader's to do.
  const summaryLabels = summaryItems(planholder, deceased, deficient).map(
    (item) => item.label,
  );
  const marksHidden = Object.keys(labelMarks ?? {}).some(
    (label) => !summaryLabels.includes(label),
  );
  useEffect(() => {
    if (marksHidden) setDetailsOpen(true);
  }, [marksHidden]);
  /** The card's own body, so a click can be told from a click on the header. */
  const bodyRef = useRef<HTMLDivElement>(null);
  /** Ties the toggle to the region it opens, for anything reading the page. */
  const extraPanelsId = useId();

  /** Below `lg` the details open as the phone's tabbed sheet. */
  const isPhone = useBreakpointValue({ base: true, lg: false }) ?? false;

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
        // See `KIT_CARD_CSS`. Only for the kit card.
        css={identity ? undefined : KIT_CARD_CSS}
      >
        <DetailsShell
          identity={identity}
          planholder={planholder}
          edits={headerEdits}
          title="Planholder Summary"
          subtitle="Tap to view full details"
          // WITH IDENTITY, A FULL-WIDTH "View full details" AT THE FOOT (user,
          // 2026-10-02, option A of the mock-up): a chevron in the header took
          // width from the name beside the badges and the contact icon. The
          // phone's version of the desktop's Show more; the card stays tappable.
          actionAtFoot={identity}
          action={
            identity ? (
              <Button
                w="full"
                size="sm"
                variant="subtle"
                bg="green.50"
                color={BRAND_COLORS.primaryGreen}
                _hover={{ bg: "green.100" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(true);
                }}
              >
                View full details
                <LuChevronRight size={16} />
              </Button>
            ) : (
              // The kit card stops the action's clicks from reaching the
              // wrapper — it assumes an action does something of its own — so
              // the chevron opens the drawer itself.
              <Box
                display="flex"
                color="gray.400"
                cursor="pointer"
                onClick={() => setOpen(true)}
              >
                <LuChevronRight size={18} />
              </Box>
            )
          }
        >
          {/* Summary detail only. Two shapes of the same ten facts; see
              `summaryAsPairs`. */}
          {summaryAsPairs ? (
            <SimpleGrid columns={2} gapX={4} gapY={3}>
              {summaryItems(planholder, deceased, deficient).map((item) => (
                <InfoLabel
                  key={item.label}
                  label={labelMarks?.[item.label] ?? item.label}
                  value={asText(item)}
                  color={item.tone}
                />
              ))}
            </SimpleGrid>
          ) : (
            summaryItems(planholder, deceased, deficient).map((item) =>
              labelMarks?.[item.label] ? (
                <Box key={item.label} py={1.5}>
                  <InfoLabel label={labelMarks[item.label]} value={item.value} />
                </Box>
              ) : (
                <RowItem key={item.label} label={item.label} value={item.value} />
              ),
            )
          )}
        </DetailsShell>
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
          // Typed selectors, for the reason given on the card above. Only for
          // the kit card; the identity card is ours and needs none.
          css={identity ? undefined : KIT_CARD_CSS}
        >
          <DetailsShell
            identity={identity}
            planholder={planholder}
            edits={headerEdits}
            title="Planholder Details"
            actionAtFoot
            // Names what the card holds rather than telling the processor to
            // tap: they can see the control, and on a desktop they are not
            // tapping anything.
            subtitle="Summary, personal info and plan detail"
            // The kit card stops this from bubbling, so it carries the toggle
            // itself. It is also the only part of the control a screen reader
            // is told about — the card's header row has no `aria-expanded` to
            // set — so the state and the region it owns live here.
            action={
              <Button
                size="xs"
                // `plain`, not `ghost`: a ghost button is transparent until it
                // is hovered and then fills. This one never has a background at
                // all, and never takes a colour of its own — it is the control
                // for the card it sits on, not a thing on the card.
                variant="plain"
                aria-expanded={detailsOpen}
                aria-controls={extraPanelsId}
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailsOpen((v) => !v);
                }}
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
              {/* Always — but only headed once there is a second panel for the
                  heading to tell it apart from. See `titled`. */}
              <DetailPanel
                title="Summary"
                items={summaryItems(planholder, deceased, deficient)}
                marks={labelMarks}
                titled={detailsOpen}
              />

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
                      marks={labelMarks}
                    />
                    <DetailPanel
                      title="Plan Detail"
                      items={planDetailItems(planholder)}
                    />
                  </VStack>
                </Box>
              </Box>
            </Box>
          </DetailsShell>
        </Box>
      )}

      {/* THE PHONE'S SHEET — see `PlanholderDetailSheet`. Below `lg`, where
          every claims screen takes its phone layout. */}
      <PlanholderDetailSheet
        planholder={planholder}
        deceased={deceased}
        deficient={deficient}
        open={open && isPhone}
        onClose={() => setOpen(false)}
      />

      {/* Details drawer, from `lg` — built the same way the claim detail
          drawer is: same root sizing, same content shell, and the shared
          page-style header, so the two read as one flow. Both always mounted,
          `open` choosing between them. */}
      <Drawer.Root
        open={open && !isPhone}
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
                    items={summaryItems(planholder, deceased, deficient)}
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
