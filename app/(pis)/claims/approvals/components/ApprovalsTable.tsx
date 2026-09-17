"use client";

import * as React from "react";
import {
  Box,
  Button,
  Carousel,
  Flex,
  HStack,
  IconButton,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Bandage,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Files,
  HandCoins,
  HeartPulse,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "osp-ui-kit";
import type {
  BulkAction,
  RowAction,
} from "osp-ui-kit";

import { approvalConfig, type ApprovalConfig } from "../config/approval-config";
import { ApprovalDetailContent } from "./ApprovalDetailContent";
import { ApprovalStatusBadge } from "./ApprovalStatusBadge";
import type { ApprovalView } from "../data/types";
import { useMessageDialog } from "osp-ui-kit";

function getApprovalStatus(row: any) {
  return row.status;
}

type CardSpec = {
  label: string;
  value: number;
  /** What pressing it narrows the table to. "All" clears the filter. */
  filter: string;
  sub: string;
  icon: typeof Files;
  /** A Chakra palette name — the card reads `${accent}.50` and friends. */
  accent: string;
};

/**
 * THE THREE NATURES A CLAIM CAN BE (user, 2026-09-15), in the order they were
 * asked for.
 *
 * `filter` is the `ClaimKind` string the row carries, so pressing a card is a
 * plain equality and nothing maps between two spellings.
 *
 * THE LABEL IS THE EYEBROW AND IT MUST HOLD ONE LINE. "Waiver of Installment"
 * spelled out wraps to two at 10px uppercase in a quarter of the strip, and a
 * wrapped eyebrow makes that one card taller than the three beside it — the row
 * stops reading as a row. So the label is the sidebar's "WOI" and the sub-line
 * underneath spells it out, which is the one place on the card with the width
 * for it. The other two fit as they are.
 *
 * The accents deliberately avoid green and red: those mean approved and denied
 * everywhere else on this page, and a nature is not an outcome.
 */
const CLAIM_KIND_CARDS = [
  {
    label: "Death Claim",
    filter: "Death Claim",
    sub: "Death benefit",
    icon: HeartPulse,
    accent: "teal",
  },
  {
    label: "Dismemberment",
    filter: "Dismemberment",
    sub: "Loss of limb or sense",
    icon: Bandage,
    accent: "purple",
  },
  {
    label: "WOI",
    filter: "Waiver of Installment",
    sub: "Waiver of installment",
    icon: HandCoins,
    accent: "orange",
  },
] as const;

/**
 * The card each queue opens on.
 *
 * "All" WHERE THE CARDS SPLIT BY KIND, because none of the three is the one a
 * supervisor is here for — narrowing to Death Claim on arrival would hide the
 * other two behind a card nobody pressed. The status cards keep their Pending
 * default: there, "All" and "Pending" hold the same rows anyway, and Pending is
 * the one that says what the list is.
 */
function defaultCardFilter(facet: ApprovalConfig["cardFacet"]): string {
  return facet === "kind" ? "All" : "Pending";
}

export function ApprovalsTable({
  view,
  setView,
}: {
  view: ApprovalView;
  setView: (v: ApprovalView) => void;
}) {
  const { messageBox } = useMessageDialog();

  const config = approvalConfig[view];

  const [dataByView, setDataByView] = React.useState<
    Record<ApprovalView, any[]>
  >(
    () =>
      Object.fromEntries(
        Object.entries(approvalConfig).map(([key, cfg]) => [key, cfg.getData()]),
      ) as Record<ApprovalView, any[]>,
  );

  const data = dataByView[view];

  // WHICH CARD IS PRESSED — a status on one queue and a claim nature on the
  // other, which is why this is not called `statusFilter` any more. What it
  // means is decided by `config.cardFacet`, in one place: `matchesCard`.
  const facet = config.cardFacet;
  const [cardFilter, setCardFilter] = React.useState<string>(() =>
    defaultCardFilter(facet),
  );
  const [carouselIdx, setCarouselIdx] = React.useState(
    facet === "kind" ? 0 : 1,
  );
  const carouselReady = React.useRef(false);

  // Only mount the mobile carousel on mobile viewports. When hidden with
  // `display: none` on desktop it can't measure its slides and re-emits
  // onPageChange(0), which would clobber the default with the first card.
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 47.99em)"); // below Chakra `md`
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    setCardFilter(defaultCardFilter(facet));
    setCarouselIdx(facet === "kind" ? 0 : 1);
  }, [facet, view]);

  const filteredData = React.useMemo(() => {
    if (cardFilter === "All") return data;

    return data.filter((row) =>
      facet === "kind"
        ? row.kind === cardFilter
        : getApprovalStatus(row) === cardFilter,
    );
  }, [cardFilter, data, facet]);

  function updateApprovalStatus(row: any, status: "Approved" | "Denied") {
    return {
      ...row,
      status,
    };
  }

  /**
   * Write the decision through to the module the record came from, where that
   * module has somewhere to put it. See `ApprovalConfig.commit`.
   *
   * Called for each row rather than once per action, so the single and the bulk
   * paths make the same writes and a batch cannot take a shortcut the single
   * one does not.
   */
  const commit = React.useCallback(
    (rows: any[], status: "Approved" | "Denied") => {
      if (!config.commit) return;
      for (const row of rows) config.commit(row, status);
    },
    [config],
  );

  const handleApprove = React.useCallback(
    async (row: any) => {
      const confirmed = await messageBox({
        title: "CONFIRM",
        message: "Are you sure you want to approve this request?",
        confirmText: "Approve",
        variant: "confirmation",
      });

      if (!confirmed) return;

      const rowId = config.getRowId(row, 0);

      commit([row], "Approved");

      setDataByView((prev) => ({
        ...prev,
        [view]: prev[view].map((item, index) =>
          config.getRowId(item, index) === rowId
            ? updateApprovalStatus(item, "Approved")
            : item,
        ),
      }));

      toast.success("Request approved");
    },
    [commit, config, messageBox, view],
  );

  const handleReject = React.useCallback(
    async (row: any) => {
      const confirmed = await messageBox({
        title: "CONFIRM",
        message: "Are you sure you want to deny this request?",
        confirmText: "Deny",
        variant: "confirmation",
      });

      if (!confirmed) return;

      const rowId = config.getRowId(row, 0);

      commit([row], "Denied");

      setDataByView((prev) => ({
        ...prev,
        [view]: prev[view].map((item, index) =>
          config.getRowId(item, index) === rowId
            ? updateApprovalStatus(item, "Denied")
            : item,
        ),
      }));

      toast.error("Request denied");
    },
    [commit, config, messageBox, view],
  );

  const handleBulkApprove = React.useCallback(
    async (rows: any[]) => {
      const confirmed = await messageBox({
        title: "CONFIRM BULK APPROVAL",
        message: `Are you sure you want to approve ${rows.length} selected request(s)?`,
        confirmText: "Approve",
        variant: "confirmation",
      });

      if (!confirmed) return;

      const selectedIds = new Set(
        rows.map((row, index) => config.getRowId(row, index)),
      );

      commit(rows, "Approved");

      setDataByView((prev) => ({
        ...prev,
        [view]: prev[view].map((item, index) =>
          selectedIds.has(config.getRowId(item, index))
            ? updateApprovalStatus(item, "Approved")
            : item,
        ),
      }));

      toast.success(`Approved ${rows.length} request(s)`);
    },
    [commit, config, messageBox, view],
  );

  const handleBulkDeny = React.useCallback(
    async (rows: any[]) => {
      const confirmed = await messageBox({
        title: "CONFIRM BULK DENIAL",
        message: `Are you sure you want to deny ${rows.length} selected request(s)?`,
        confirmText: "Deny All",
        variant: "confirmation",
      });

      if (!confirmed) return;

      const selectedIds = new Set(
        rows.map((row, index) => config.getRowId(row, index)),
      );

      commit(rows, "Denied");

      setDataByView((prev) => ({
        ...prev,
        [view]: prev[view].map((item, index) =>
          selectedIds.has(config.getRowId(item, index))
            ? updateApprovalStatus(item, "Denied")
            : item,
        ),
      }));

      toast.error(`Denied ${rows.length} request(s)`);
    },
    [commit, config, messageBox, view],
  );

  // A QUEUE THAT CANNOT BE DENIED OFFERS NO DENIAL, anywhere — see
  // `ApprovalConfig.canDeny`. Filtered out rather than disabled: a greyed Deny
  // says "not for this row", and the truth is "not for this kind of work".
  const rowActions = React.useMemo<RowAction<any>[]>(
    () =>
      [
        config.canDeny && {
          id: "deny",
          label: "Deny",
          icon: X,
          variant: "destructive" as const,
          hidden: (row: any) => getApprovalStatus(row) !== "Pending",
          onClick: handleReject,
        },
        {
          id: "approve",
          label: "Approve",
          icon: Check,
          hidden: (row: any) => getApprovalStatus(row) !== "Pending",
          onClick: handleApprove,
        },
      ].filter(Boolean) as RowAction<any>[],
    [config.canDeny, handleApprove, handleReject],
  );

  const bulkActions = React.useMemo<BulkAction<any>[]>(
    () =>
      [
        {
          id: "bulk-approve",
          label: "Approve All",
          icon: Check,
          onClick: handleBulkApprove,
        },
        config.canDeny && {
          id: "bulk-reject",
          label: "Deny All",
          icon: X,
          variant: "destructive" as const,
          onClick: handleBulkDeny,
        },
      ].filter(Boolean) as BulkAction<any>[],
    [config.canDeny, handleBulkApprove, handleBulkDeny],
  );

  /**
   * APPROVE AND DENY IN THE ROW — see `ApprovalConfig.decisionColumn`.
   *
   * Appended to the configured columns rather than written into the column file,
   * because the two buttons have to call this component's handlers: those are
   * what ask for confirmation, write through to the source module and move the
   * row. A column file is a static description of a cell and has none of that.
   *
   * ONCE DECIDED IT IS A BADGE. The buttons go — a decided claim is not offered
   * the other answer, the same rule the "…" menu applied with `hidden` — and
   * what stands in their place is what was chosen. On a table with no Status
   * column that is the only report the row gets.
   */
  const decisionColumn = React.useMemo<ColumnDef<any, any>>(
    () => ({
      id: "decision",
      header: "Decision",
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      meta: { responsivePriority: 1, alwaysVisible: true },
      cell: ({ row }: any) => {
        const status = getApprovalStatus(row.original);
        if (status !== "Pending") return <ApprovalStatusBadge status={status} />;

        // THE CLICK MUST NOT REACH THE ROW. The row itself opens the detail
        // drawer, so without this, pressing Approve put the confirmation dialog
        // and the drawer on screen together — the dialog asking about a claim
        // whose record was sliding in behind it.
        const decide = (act: (row: any) => void) => (event: React.MouseEvent) => {
          event.stopPropagation();
          act(row.original);
        };

        return (
          <HStack gap={1.5}>
            <Button
              size="xs"
              variant="outline"
              colorPalette="green"
              borderRadius="full"
              onClick={decide(handleApprove)}
            >
              <Check size={13} />
              Approve
            </Button>
            {config.canDeny && (
              <Button
                size="xs"
                variant="outline"
                colorPalette="red"
                borderRadius="full"
                onClick={decide(handleReject)}
              >
                <X size={13} />
                Deny
              </Button>
            )}
          </HStack>
        );
      },
    }),
    [config.canDeny, handleApprove, handleReject],
  );

  const columns = React.useMemo(
    () =>
      config.decisionColumn
        ? [...config.columns, decisionColumn]
        : config.columns,
    [config.columns, config.decisionColumn, decisionColumn],
  );

  const countOf = React.useCallback(
    (predicate: (row: any) => boolean) => data.filter(predicate).length,
    [data],
  );

  const cards = React.useMemo(() => {
    const total: CardSpec = {
      label: "Total Requests",
      value: data.length,
      filter: "All",
      sub: "All requests",
      icon: Files,
      accent: "blue",
    };

    // ONE CARD PER NATURE, AND ALL THREE ARE ALWAYS DRAWN — including the ones
    // reading zero. The strip is a map of what this queue can hold, and a
    // supervisor who has learned that WOI is the last card should not have to
    // find it again on a morning when none is waiting. Same rule the service
    // payables stage strip keeps, and the opposite of the Rejected card above:
    // that one could NEVER be anything but zero, these are empty today.
    //
    // Note `isNatureBuilt` — only Death has a pipeline behind it so far, so the
    // other two read zero until a dismemberment or a waiver can be verified.
    if (facet === "kind") {
      return [
        total,
        ...CLAIM_KIND_CARDS.map((kind) => ({
          label: kind.label,
          value: countOf((row) => row.kind === kind.filter),
          filter: kind.filter,
          sub: kind.sub,
          icon: kind.icon,
          accent: kind.accent,
        })),
      ];
    }

    return [
      total,
      {
        label: "Pending",
        value: countOf((r) => getApprovalStatus(r) === "Pending"),
        filter: "Pending",
        sub: "Awaiting review",
        icon: Clock,
        accent: "orange",
      },
      {
        label: "Approved",
        value: countOf((r) => getApprovalStatus(r) === "Approved"),
        filter: "Approved",
        sub: "Completed",
        icon: CheckCircle,
        accent: "green",
      },
      // NO REJECTED CARD WHERE NOTHING CAN BE REJECTED — see
      // `ApprovalConfig.canDeny`. A card that can only ever read zero invites
      // the one click on this strip that can never show anything.
      ...(config.canDeny
        ? [
            {
              label: "Rejected",
              value: countOf((r) => getApprovalStatus(r) === "Denied"),
              filter: "Denied",
              sub: "Denied",
              icon: XCircle,
              accent: "red",
            },
          ]
        : []),
    ];
  }, [config.canDeny, countOf, data.length, facet]);

  const renderCardContent = (card: CardSpec, i: number) => {
    const isActive = cardFilter === card.filter;
    return (
      <Box
        position="relative"
        bg={isActive ? `${card.accent}.100` : `${card.accent}.50`}
        border="2px solid"
        borderColor={isActive ? `${card.accent}.500` : `${card.accent}.200`}
        borderRadius="xl"
        p={4}
        mt={2}
        boxShadow={isActive ? "lg" : "xs"}
        cursor="pointer"
        transform={isActive ? "translateY(-2px)" : "none"}
        onClick={() => {
          setCardFilter(card.filter);
          setCarouselIdx(i);
        }}
        transition="all 0.15s ease"
        _hover={{
          bg: `${card.accent}.100`,
          borderColor: `${card.accent}.400`,
        }}
      >
        {isActive && (
          <Box
            position="absolute"
            top={-2}
            right={-2}
            zIndex={2}
            w="22px"
            h="22px"
            borderRadius="full"
            bg={`${card.accent}.500`}
            color="white"
            border="2px solid"
            borderColor="white"
            display={{ base: "none", md: "flex" }}
            alignItems="center"
            justifyContent="center"
            fontSize="11px"
            fontWeight="800"
            boxShadow="sm"
          >
            ✓
          </Box>
        )}
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Text
              fontSize="10px"
              fontWeight={isActive ? "800" : "700"}
              letterSpacing="0.08em"
              textTransform="uppercase"
              color={isActive ? `${card.accent}.600` : `${card.accent}.500`}
              mb={1}
            >
              {card.label}
            </Text>
            <Text
              fontSize={isActive ? "4xl" : "2xl"}
              fontWeight="bold"
              color={isActive ? `${card.accent}.700` : `${card.accent}.600`}
              lineHeight="1"
              mb={1}
              transition="font-size 0.15s ease"
            >
              {card.value}
            </Text>
            <Text fontSize="xs" color={`gray.600`} fontWeight="medium">
              {card.sub}
            </Text>
          </Box>
          <Box
            p={2}
            borderRadius="lg"
            bg={isActive ? `${card.accent}.200` : `${card.accent}.100`}
            color={`${card.accent}.500`}
          >
            <card.icon size={18} />
          </Box>
        </Flex>
      </Box>
    );
  };

  return (
    <Flex direction="column" gap={4}>
      {/* Desktop: one column per card — three where the queue has no denial. */}
      <SimpleGrid
        columns={cards.length}
        gap={3}
        display={{ base: "none", md: "grid" }}
      >
        {cards.map((card, i) => (
          <Box key={card.label}>{renderCardContent(card, i)}</Box>
        ))}
      </SimpleGrid>

      {/* Mobile: carousel (only mounted on mobile so its page events can't
          leak into cardFilter on desktop) */}
      {isMobile && (
        <Box>
          <Carousel.Root
            slideCount={cards.length}
            page={carouselIdx}
            onPageChange={(details: { page: number }) => {
              // The carousel emits an initial onPageChange(0) on mount (even while
              // hidden on desktop), which would clobber the Pending default. Skip
              // that first firing and only react to real page changes afterward.
              if (!carouselReady.current) {
                carouselReady.current = true;
                return;
              }
              setCarouselIdx(details.page);
              setCardFilter(cards[details.page].filter);
            }}
          >
            <Carousel.ItemGroup>
              {cards.map((card, i) => (
                <Carousel.Item key={card.label} index={i}>
                  {renderCardContent(card, i)}
                </Carousel.Item>
              ))}
            </Carousel.ItemGroup>

            <Carousel.Control justifyContent="center" gap="4">
              <Carousel.PrevTrigger asChild>
                <IconButton size="xs" variant="ghost" aria-label="Previous">
                  <ChevronLeft size={16} />
                </IconButton>
              </Carousel.PrevTrigger>

              <Carousel.Indicators />

              <Carousel.NextTrigger asChild>
                <IconButton size="xs" variant="ghost" aria-label="Next">
                  <ChevronRight size={16} />
                </IconButton>
              </Carousel.NextTrigger>
            </Carousel.Control>
          </Carousel.Root>
        </Box>
      )}

      <DataTable<any>
        key={view}
        title={config.title}
        description={config.description}
        data={filteredData}
        columns={columns}
        getRowId={config.getRowId}
        // NOT BOTH. Where the decision is in the row, the "…" menu would be a
        // second control offering the same two answers one click further away.
        rowActions={config.decisionColumn ? undefined : rowActions}
        bulkActions={bulkActions}
        renderDetail={(row) => (
          <ApprovalDetailContent
            row={row}
            config={config}
            onApprove={(selectedRow, remarks) => {
              handleApprove(selectedRow);
              console.log("Approve remarks:", remarks);
            }}
            onDeny={(selectedRow, remarks) => {
              handleReject(selectedRow);
              console.log("Deny remarks:", remarks);
            }}
          />
        )}
        features={{
          search: true,
          filtering: true,
          sorting: true,
          pagination: true,
          columnToggle: true,
          selection: true,
          detailSidebar: true,
        }}
        mobileConfig={{
          viewMode: "accordion",
          primaryField: config.mobile.primaryField as any,
          secondaryField: config.mobile.secondaryField as any,
          badgeField: config.mobile.badgeField as any,
          visibleFields: config.mobile.visibleFields as any,
          labelMap: config.mobile.labelMap as any,
          badgeColorMap: {
            Pending: "orange",
            Approved: "green",
            Denied: "red",
          },
        }}
      />
    </Flex>
  );
}
