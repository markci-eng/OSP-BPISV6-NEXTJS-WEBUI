import React from "react";
import { LookupColumn, LookupField } from "../reusable-lookup/LookUpField";
import { PlanholderLookup as PlanholderLookupType } from "./planholder-lookup.type";
import { planholderLookup } from "@/app/plan-management/data/planholder-lookup";
import { Box } from "@chakra-ui/react";

const salesAgentColumns: LookupColumn<PlanholderLookupType>[] = [
  { key: "personId", header: "Person ID" },
  { key: "lpaNumber", header: "LPA Number" },
  { key: "lastName", header: "Last Name" },
  { key: "firstName", header: "First Name" },
  { key: "middleName", header: "Middle Name" },
];

export function PlanholderLookup({
  value,
  onSelectChange,
}: {
  value?: PlanholderLookupType | undefined;
  onSelectChange?: (agent: PlanholderLookupType | undefined) => void;
}) {
  const [selectAgent, setSelectAgent] =
    React.useState<PlanholderLookupType | null>(value ?? null);
  return (
    <Box w={{ base: "full", sm: "330px" }}>
      <LookupField<PlanholderLookupType>
        label=""
        placeholder="Search by LPA Number or Name..."
        modalTitle="Search Planholder"
        columns={salesAgentColumns}
        dataSource={planholderLookup}
        searchKeys={["lpaNumber", "firstName", "lastName", "middleName"]}
        onSelect={(e) => {
          onSelectChange?.(e ?? undefined);
          setSelectAgent(e);
        }}
        renderDisplay={(emp) => `${emp.lpaNumber}`}
        value={selectAgent}
      />
    </Box>
  );
}
