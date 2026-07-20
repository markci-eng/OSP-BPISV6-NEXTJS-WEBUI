import {
  Box,
  createListCollection,
  Flex,
  Grid,
  RadioCard,
  ScrollArea,
  Separator,
  Strong,
  Table,
} from "@chakra-ui/react";
import { useState } from "react";
import { FloatingLabelSelect } from "@/components/inputs/floating-label-select";
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
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";

const lpaNumbers = createListCollection({
  items: [
    { label: "RI - NEW", value: "new" },
    { label: "RI - OLD", value: "old" },
  ],
});

export function PlanSelectionPage({ plans }: { plans: PlanholderLookup[] }) {
  const [checkedPlans, setCheckedPlans] = useState<CheckedPlan[]>([]);

  return (
    <Box py={2}>
      <Box p={5} boxShadow={"sm"} borderRadius={"lg"}>
        <Strong color={"var(--chakra-colors-primary)"}>
          Basic Information
        </Strong>
        <Separator my={3} />
        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gapX={5}>
          <FloatingLabelSelect label={"Select Plan To Transfer"}>
            {lpaNumbers.items.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </FloatingLabelSelect>
          <FloatingLabelInput label="Contact Number" type="number" required />
        </Grid>
      </Box>
    </Box>
  );
}
