import { Box, Dialog, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { OSPBadge } from "@/components/common/badge/badge";
import { CheckCircle2 } from "lucide-react";
import type { CheckedPlanType, PlanDetails } from "./change-mode.types";
import { Checkbox, H4, Small } from "st-peter-ui";
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/reusable-tableV2/DataTable";
import { PlanDetailsDialog } from "./plan-details-dialog";

export function ChangeModeForm({
  activePlans,
  onCheckedPlansChange,
}: {
  activePlans: PlanDetails[];
  onCheckedPlansChange?: (checked: CheckedPlanType[] | undefined) => void;
}) {
  const [checkedPlans, setCheckedPlans] = useState<CheckedPlanType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogPlan, setDialogPlan] = useState<PlanDetails | null>(null);

  const openDialog = (plan: PlanDetails) => {
    setDialogPlan(plan);
    setDialogOpen(true);
  };

  const handleCheckedChange = (checked: boolean, values: CheckedPlanType) => {
    setCheckedPlans((prev) => {
      if (checked) {
        const filtered = prev.filter((p) => p.lpa_no !== values.lpa_no);
        return [...filtered, values];
      }
      return prev.filter((p) => p.lpa_no !== values.lpa_no);
    });
  };

  useEffect(() => {
    onCheckedPlansChange?.(checkedPlans);
  }, [checkedPlans]);

  const columns: ColumnDef<PlanDetails, any>[] = [
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
    {
      accessorKey: "lpa_no",
      header: "LPA Number",
    },
    {
      accessorKey: "plan_type",
      header: "Plan Type",
    },
    {
      accessorKey: "plan_code",
      header: "Plan Code",
    },
    {
      accessorKey: "mode",
      header: "Mode",
    },
  ];

  return (
    <Box py={3}>
      <Flex justify="space-between" align="center" mb={4} gap={3} flexWrap="wrap">
        <Box>
          <H4>Active Plans</H4>
          <Small fontStyle="italic">
            Kindly select plans you want to change mode.
          </Small>
        </Box>
        <HStack
          gap={3}
          bg="var(--chakra-colors-primary-disabled)"
          border="1px solid"
          borderColor="var(--chakra-colors-primary)"
          borderRadius="xl"
          px={4}
          py={2}
          w={{ base: "full", md: "auto" }}
        >
          <CheckCircle2
            size={28}
            color="var(--chakra-colors-primary)"
          />
          <Box>
            <Small color="var(--chakra-colors-primary-hover)" fontWeight="medium">
              Plans Selected
            </Small>
            <HStack gap={1} align="baseline">
              <Text fontSize="xl" fontWeight="bold" color="var(--chakra-colors-primary-hover)" lineHeight="1">
                {checkedPlans.length}
              </Text>
              <Text fontSize="sm" color="gray.500" lineHeight="1">
                / {activePlans.length}
              </Text>
            </HStack>
          </Box>
        </HStack>
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
        rowActions={[
          {
            id: "change-mode",
            label: "Change Mode",
            onClick: openDialog,
          },
        ]}
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
                    {isChecked && (
                      <OSPBadge type="success">Selected</OSPBadge>
                    )}
                  </HStack>
                </HStack>
                <Box borderTopWidth="1px" borderColor="gray.100" px={3} py={2.5}>
                  <VStack align="stretch" gap={2}>
                    <HStack justify="space-between" gap={4}>
                      <Text fontSize="xs" color="gray.500" minW="110px">Plan Code</Text>
                      <Text fontSize="xs" color="gray.900" fontWeight="600" textAlign="right" flex="1">
                        {row.plan_code}
                      </Text>
                    </HStack>
                    <HStack justify="space-between" gap={4}>
                      <Text fontSize="xs" color="gray.500" minW="110px">Mode</Text>
                      <Text fontSize="xs" color="gray.900" fontWeight="600" textAlign="right" flex="1">
                        {row.mode}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </Box>
            );
          },
        }}
      />

      <Dialog.Root
        open={dialogOpen}
        onOpenChange={({ open }) => setDialogOpen(open)}
        size={{ base: "full", md: "xl" }}
        placement="center"
      >
        {dialogPlan && (
          <PlanDetailsDialog
            key={dialogPlan.lpa_no}
            checked={checkedPlans.some((p) => p.lpa_no === dialogPlan.lpa_no)}
            plan={dialogPlan}
            onCheckedChange={(checked, values) => {
              handleCheckedChange(checked, values);
              setDialogOpen(false);
            }}
          />
        )}
      </Dialog.Root>
    </Box>
  );
}
