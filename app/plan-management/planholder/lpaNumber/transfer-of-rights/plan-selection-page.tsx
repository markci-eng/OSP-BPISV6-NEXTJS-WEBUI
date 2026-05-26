import { Box, Flex, Table } from "@chakra-ui/react";
import { useState } from "react";
import { Body, Checkbox, H4, Small } from "st-peter-ui";
import { CheckedPlan } from "./transfer-of-rights.types";
import { PlanDetailType } from "@/components/plan-management/planholders/planholders.types";
import { TanstackDataTable } from "@/components/reusable-table/TanstackDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { OSPBadge } from "@/components/common/badge/badge";
import { planholderLookup } from "../../../data/planholder-lookup";
import {
  PlanholderListTable,
  PlanholderLookup,
} from "@/components/plan-management/planholders/tables/planholder-list-table";

export function PlanSelectionPage({ plans }: { plans: PlanholderLookup[] }) {
  const [checkedPlans, setCheckedPlans] = useState<CheckedPlan[]>([]);

  return (
    <Box py={3}>
      <Flex justify="space-between">
        <Box>
          <H4>Plans</H4>
          <Small mb="4" fontStyle="italic">
            Kindly select plans you want to transfer.
          </Small>
        </Box>
        <Box textAlign="right">
          <Body fontSize="sm" fontStyle="italic">
            No. of plans selected:
          </Body>
          <H4>
            {checkedPlans.length}/{plans.length}
          </H4>
        </Box>
      </Flex>

      {/* <TanstackDataTable
        data={plans}
        columns={columns}
        table={{ initialPageSize: 50 }}
        features={{ rowSelection: true }}
      /> */}
      <PlanholderListTable planholders={[]} />
    </Box>
  );
}
