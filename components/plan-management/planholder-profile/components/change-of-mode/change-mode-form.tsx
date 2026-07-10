import { useEffect, useMemo, useState } from "react";
import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox, H4, Small } from "st-peter-ui";
import { LuChevronRight } from "react-icons/lu";
import { DataTable } from "@/components/common/reusable-tableV2/DataTable";
import { RowItem } from "@/components/info-card/row-item";
import { OSPBadge } from "@/components/common/badge/badge";
import type { CheckedPlanType, PlanDetails } from "@/data/plan-management/change-of-mode/change-mode.types";
import { PlanDetailsDialog } from "./plan-details-dialog";

export function ChangeModeForm({
  activePlans,
  onCheckedPlansChange,
}: {
  activePlans: PlanDetails[];
  onCheckedPlansChange?: (checked: CheckedPlanType[] | undefined) => void;
}) {
  const [checkedPlans, setCheckedPlans] = useState<CheckedPlanType[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    onCheckedPlansChange?.(checkedPlans);
  }, [checkedPlans]);

  const openDialog = (plan: PlanDetails) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handleCheckedChange = (checked: boolean, values: CheckedPlanType) => {
    setCheckedPlans((prev) => {
      const without = prev.filter((p) => p.lpa_no !== values.lpa_no);
      return checked ? [...without, values] : without;
    });
  };

  const columns = useMemo<ColumnDef<PlanDetails, any>[]>(
    () => [
      {
        id: "selected",
        header: "",
        enableSorting: false,
        enableHiding: false,
        meta: { width: "44px" },
        cell: ({ row }) => (
          <Checkbox
            readOnly
            checked={checkedPlans.some((p) => p.lpa_no === row.original.lpa_no)}
            onCheckedChange={() => {}}
          />
        ),
      },
      { accessorKey: "lpa_no", header: "LPA Number" },
      { accessorKey: "plan_type", header: "Plan Type" },
      { accessorKey: "plan_code", header: "Plan Code" },
      { accessorKey: "mode", header: "Mode" },
    ],
    [checkedPlans],
  );

  return (
    <Box py={3}>
      <Flex justify="space-between" align="center" mb={4} gap={3} flexWrap="wrap">
        <Box>
          <H4>Active Plans</H4>
          <Small fontStyle="italic">Kindly select plans you want to change mode.</Small>
        </Box>
      </Flex>

      <DataTable
        data={activePlans}
        columns={columns}
        getRowId={(row) => row.lpa_no}
        features={{
          sorting: false,
          filtering: false,
          search: true,
          pagination: false,
          columnToggle: false,
          selection: false,
          draggable: false,
          detailSidebar: false,
        }}
        rowActions={[{ id: "change-mode", label: "Change Mode", onClick: openDialog }]}
        onRowClick={openDialog}
        mobileConfig={{
          viewMode: "card",
          renderMobileCard: (row) => {
            const isChecked = checkedPlans.some((p) => p.lpa_no === row.lpa_no);
            return (
              <Box
                bg="white"
                borderWidth="1px"
                borderColor={isChecked ? "green.300" : "gray.200"}
                borderRadius="md"
                overflow="hidden"
                boxShadow="xs"
                onClick={() => openDialog(row)}
                cursor="pointer"
                position="relative"
              >
                {isChecked && (
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    bottom={0}
                    width="3px"
                    bg="green.500"
                  />
                )}
                <HStack align="flex-start" justify="space-between" gap={2} px={3} py={3}>
                  <Box flex="1" minW={0}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.900" letterSpacing="wide">
                      {row.lpa_no}
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={0.5}>
                      Plan Type:{" "}
                      <Text as="span" color="gray.700" fontWeight="500">
                        {row.plan_type}
                      </Text>
                    </Text>
                  </Box>
                  <HStack gap={1} flexShrink={0}>
                    <OSPBadge>{row.mode}</OSPBadge>
                    {isChecked && <OSPBadge type="success">Selected</OSPBadge>}
                  </HStack>
                </HStack>
                <Box borderTopWidth="1px" borderColor="gray.100" px={3} py={2.5}>
                  <RowItem label="Plan Code" value={row.plan_code} />
                  <RowItem label="Mode" value={row.mode} />
                  <Flex justify="space-between" align="center" mt={2}>
                    <Text fontSize="xs" color="gray.400">Tap to select</Text>
                    <LuChevronRight color="#a1a1aa" />
                  </Flex>
                </Box>
              </Box>
            );
          },
        }}
      />

      {selectedPlan && (
        <PlanDetailsDialog
          key={selectedPlan.lpa_no}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          checked={checkedPlans.some((p) => p.lpa_no === selectedPlan.lpa_no)}
          plan={selectedPlan}
          onCheckedChange={(checked, values) => {
            handleCheckedChange(checked, values);
            setDialogOpen(false);
          }}
        />
      )}
    </Box>
  );
}
