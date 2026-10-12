"use client";

import { useMemo, useState } from "react";
import { Badge, Box, Flex, Grid, Separator, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, EmptyStateCard, PrimaryMdButton } from "osp-ui-kit";
import {
  LuArrowRight,
  LuCalendar,
  LuCheck,
  LuChevronRight,
  LuMinus,
  LuRepeat,
  LuShieldPlus,
} from "react-icons/lu";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  formatCount,
  formatPeso,
  installmentProgress,
  type ModeChange,
} from "./change-of-mode-utils";
import { ModeSelectionDialog } from "./mode-selection-dialog";

/** One plan whose payment mode can be changed, as the table shows it. */
export type ModePlan = {
  lpaNo: string;
  planDescription: string;
  mode: string;
  term: string;
  /** Installments paid so far. */
  instNo: number;
  totalAmountPayable: number | null;
  balance: number | null;
  /**
   * The plan's code and installment amount, when the caller already has
   * them. Otherwise the mode dialog reads them from the plan's details.
   */
  planCode?: string;
  installmentAmount?: number;
};

const PLAN_PALETTES = ["green", "blue", "purple", "orange", "teal", "pink"];

function modePalette(mode: string) {
  switch (mode.toUpperCase()) {
    case "MONTHLY":
      return "blue";
    case "QUARTERLY":
      return "orange";
    case "SEMI-ANNUAL":
      return "teal";
    case "ANNUAL":
      return "purple";
    default:
      return "gray";
  }
}

function titleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function PesoCell({ amount }: { amount: number | null }) {
  return (
    <Text fontWeight="bold">{amount == null ? "—" : formatPeso(amount)}</Text>
  );
}

export function ChangeOfModeTable({
  plans,
  onChangeMode,
}: {
  plans: ModePlan[];
  onChangeMode?: (changes: ModeChange[]) => void;
}) {
  // Keyed by lpaNo. A plan is "selected" once a new mode is chosen for it in
  // the dialog, so the table's own checkbox selection is off.
  const [changes, setChanges] = useState<Record<string, ModeChange>>({});
  const [activePlan, setActivePlan] = useState<ModePlan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const openDialog = (plan: ModePlan) => {
    setActivePlan(plan);
    setDialogOpen(true);
  };

  const planTypes = useMemo(
    () => [...new Set(plans.map((p) => p.planDescription))].sort(),
    [plans],
  );

  const columns = useMemo<ColumnDef<ModePlan>[]>(
    () => [
      {
        id: "plan",
        header: "Plan & Contract No.",
        // Both, so the search box finds a plan by either.
        accessorFn: (plan) => `${plan.lpaNo} ${plan.planDescription}`,
        enableColumnFilter: false,
        cell: ({ row }) => (
          <PlanIdentity plan={row.original} planTypes={planTypes} />
        ),
      },
      {
        accessorKey: "mode",
        header: "Mode",
        cell: ({ row }) => <ModeBadge mode={row.original.mode} />,
      },
      {
        accessorKey: "totalAmountPayable",
        meta: { numeric: false },
        header: "Total Amount Payable",
        enableColumnFilter: false,
        cell: ({ row }) => (
          <PesoCell amount={row.original.totalAmountPayable} />
        ),
      },
      {
        accessorKey: "instNo",
        meta: { numeric: false },
        header: "Installment No.",
        enableColumnFilter: false,
        enableGlobalFilter: false,
        cell: ({ row }) => <InstallmentProgress plan={row.original} />,
      },
      {
        accessorKey: "balance",
        meta: { numeric: false },
        header: "Balance",
        enableColumnFilter: false,
        cell: ({ row }) => <PesoCell amount={row.original.balance} />,
      },
      {
        // No accessor: TanStack caches accessor values per row and only
        // rebuilds them when `data` changes, so one reading `changes` would
        // go stale. The cell re-renders with the columns instead.
        id: "newMode",
        header: "New Mode",
        enableSorting: false,
        enableColumnFilter: false,
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <NewModeBadge change={changes[row.original.lpaNo]} />
        ),
      },
    ],
    [planTypes, changes],
  );

  const renderMobileCard = (plan: ModePlan) => (
    <PlanCard
      plan={plan}
      planTypes={planTypes}
      change={changes[plan.lpaNo]}
      onOpen={openDialog}
    />
  );

  const selected = Object.values(changes);
  const pendingTotal = selected.reduce((sum, c) => sum + c.pendingAmount, 0);

  return (
    <Flex direction="column" gap={5}>
      <Box bg="surface" borderRadius="card" boxShadow="card" p={3}>
        <DataTable<ModePlan>
          columns={columns}
          data={plans}
          getRowId={(plan) => plan.lpaNo}
          onRowClick={openDialog}
          mobileConfig={{ viewMode: "card", renderMobileCard }}
          defaultPageSize={10}
          size="md"
          headerContent={
            <>
              <Text
                fontWeight="semibold"
                fontSize="lg"
                color="primaryHover"
                lineHeight={1.2}
              >
                Plans eligible for change of mode
              </Text>
              <Text fontSize="sm" color="mutedStrong">
                Click a plan to choose its new payment mode.
              </Text>
            </>
          }
          labels={{
            searchPlaceholder: "Search plans...",
            resultsCountLabel: (n) =>
              `${formatCount(n)} plan${n === 1 ? "" : "s"}`,
            rangeSummary: (start, end, n) =>
              `${formatCount(start)}–${formatCount(end)} of ${formatCount(n)} plans`,
          }}
          emptyState={
            <EmptyStateCard
              title="No Plans Found"
              description="This planholder has no plans eligible for a change of mode."
            />
          }
          features={{
            search: true,
            filtering: true,
            sorting: true,
            // The toolbar hides its page controls on a phone, so list every card.
            pagination: !isMobile,
            showToolbarPagination: true,
            columnToggle: false,
            selection: false,
            detailSidebar: false,
            infiniteScroll: false,
          }}
        />
      </Box>

      {/* Selection summary. Sticky rather than fixed, so it stays within the
          content column instead of sliding under the sidebar. */}
      <Flex
        position="sticky"
        bottom={{ base: 2, md: 4 }}
        zIndex="sticky"
        bg="surface"
        borderRadius="card"
        boxShadow="card"
        p={{ base: 4, md: 5 }}
        gap={5}
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
      >
        <Flex align="center" gap={5}>
          <Flex
            align="center"
            justify="center"
            boxSize={10}
            flexShrink={0}
            borderRadius="full"
            bg={selected.length > 0 ? "green.600" : "gray.300"}
            color="white"
          >
            <LuCheck size={18} strokeWidth={3} />
          </Flex>
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="green.600">
              {selected.length} plan{selected.length === 1 ? "" : "s"} selected
            </Text>
            <Text fontSize="2xl" fontWeight="bold" lineHeight="short">
              {formatPeso(pendingTotal)}
            </Text>
          </Box>
        </Flex>
        <Separator
          orientation="vertical"
          h={14}
          display={{ base: "none", md: "block" }}
        />
        <Box flex={1} fontSize="sm" color="fg.muted">
          {selected.length > 0 ? (
            <>
              <Text>
                You have selected {selected.length} plan
                {selected.length === 1 ? "" : "s"} for a change of mode.
              </Text>
              <Text>
                The amount shown is the pending installments to settle first.
              </Text>
            </>
          ) : (
            <Text>Click a plan to choose its new payment mode.</Text>
          )}
        </Box>
        <PrimaryMdButton
          disabled={selected.length === 0}
          onClick={() => onChangeMode?.(selected)}
        >
          <LuRepeat />
          Change Mode
          <LuArrowRight />
        </PrimaryMdButton>
      </Flex>

      {activePlan && (
        <ModeSelectionDialog
          // A fresh dialog per plan, so its chosen mode starts from that plan.
          key={activePlan.lpaNo}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          plan={activePlan}
          change={changes[activePlan.lpaNo]}
          onSelect={(change) => {
            setChanges((prev) => ({ ...prev, [change.lpaNo]: change }));
            setDialogOpen(false);
          }}
          onUnselect={() => {
            setChanges((prev) => {
              const next = { ...prev };
              delete next[activePlan.lpaNo];
              return next;
            });
            setDialogOpen(false);
          }}
        />
      )}
    </Flex>
  );
}

function PlanIdentity({
  plan,
  planTypes,
}: {
  plan: ModePlan;
  planTypes: string[];
}) {
  const palette =
    PLAN_PALETTES[
      planTypes.indexOf(plan.planDescription) % PLAN_PALETTES.length
    ];
  return (
    <Flex align="center" gap={3} minW={0}>
      <Flex
        align="center"
        justify="center"
        boxSize={10}
        flexShrink={0}
        borderRadius="lg"
        bg={`${palette}.100`}
        color={`${palette}.600`}
      >
        <LuShieldPlus size={20} />
      </Flex>
      <Box minW={0}>
        <Text fontWeight="semibold" fontSize="sm" truncate>
          {plan.lpaNo}
        </Text>
        <Text fontSize="xs" color="fg.muted" truncate>
          {plan.planDescription}
        </Text>
      </Box>
    </Flex>
  );
}

function ModeBadge({ mode }: { mode: string }) {
  return (
    <Badge
      colorPalette={modePalette(mode)}
      variant="subtle"
      borderRadius="full"
      px={3}
      py={1}
      gap={1.5}
    >
      <LuCalendar />
      {titleCase(mode)}
    </Badge>
  );
}

function NewModeBadge({ change }: { change: ModeChange | undefined }) {
  return change ? (
    <Badge
      colorPalette={modePalette(change.newMode)}
      color={`white`}
      variant="solid"
      borderRadius="full"
      px={3}
      py={1}
      gap={1.5}
    >
      <LuCheck />
      {titleCase(change.newMode)}
    </Badge>
  ) : (
    <Flex align="center" gap={1} color="fg.muted" fontSize="sm">
      <LuMinus />
      <Text>Unchanged</Text>
    </Flex>
  );
}

function InstallmentProgress({ plan }: { plan: ModePlan }) {
  const { total, progress } = installmentProgress(plan);
  return (
    <Box width="full" minW="120px" px={2}>
      <Flex justify="space-between" align="center" mb={1}>
        <Text fontSize="xs" color="mutedStrong">
          {plan.instNo} / {total}
        </Text>
        <Text fontSize="xs" color="mutedStrong" fontWeight="semibold">
          {progress}%
        </Text>
      </Flex>
      <Box h="5px" borderRadius="full" bg="hairline">
        <Box
          h="full"
          borderRadius="full"
          bg="var(--chakra-colors-primary)"
          w={`${progress}%`}
          transition="width 0.4s ease"
        />
      </Box>
    </Box>
  );
}

/** The mobile stand-in for a table row: tapping it opens the mode dialog. */
function PlanCard({
  plan,
  planTypes,
  change,
  onOpen,
}: {
  plan: ModePlan;
  planTypes: string[];
  change: ModeChange | undefined;
  onOpen: (plan: ModePlan) => void;
}) {
  return (
    <Box
      as="button"
      w="full"
      textAlign="left"
      bg={change ? "primaryTint" : "surface"}
      borderWidth="1px"
      borderColor={change ? "primary" : "hairline"}
      borderRadius="card"
      boxShadow="card"
      p={3}
      cursor="pointer"
      transition="background 0.15s ease, border-color 0.15s ease"
      onClick={() => onOpen(plan)}
    >
      <Flex align="center" gap={3}>
        <Box flex={1} minW={0}>
          <PlanIdentity plan={plan} planTypes={planTypes} />
        </Box>
        <ModeBadge mode={plan.mode} />
      </Flex>

      <Grid templateColumns="repeat(2, 1fr)" gap={3} mt={3}>
        <CardField label="Total Amount Payable">
          <PesoCell amount={plan.totalAmountPayable} />
        </CardField>
        <CardField label="Balance">
          <PesoCell amount={plan.balance} />
        </CardField>
      </Grid>

      <Box mt={3} mx={-2}>
        <InstallmentProgress plan={plan} />
      </Box>

      <Separator my={3} />

      <Flex align="center" justify="space-between" gap={3}>
        <CardField label="New Mode">
          <NewModeBadge change={change} />
        </CardField>
        <Box color="fg.muted">
          <LuChevronRight size={20} />
        </Box>
      </Flex>
    </Box>
  );
}

function CardField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box minW={0}>
      <Text fontSize="xs" color="fg.muted" mb={1}>
        {label}
      </Text>
      {children}
    </Box>
  );
}
