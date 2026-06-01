import React from "react";
import { LookupColumn, LookupField } from "../reusable-lookup/LookUpField";
import { PlanholderLookup as PlanholderLookupType } from "./planholder-lookup.type";
import { planholderLookup } from "@/app/plan-management/data/planholder-lookup";
import { Box } from "@chakra-ui/react";

const salesAgentColumns: LookupColumn<PlanholderLookupType>[] = [
  { key: "lpaNumber", header: "LPA Number" },
  {
    key: "lastName",
    header: "Full Name",
    render: (_, row) =>
      `${row.lastName}, ${row.firstName}${row.middleName ? " " + row.middleName : ""}`,
  },
  { key: "planDescription", header: "Plan" },
];

export function PlanholderLookup({
  value,
  onSelectChange,
  mobileFullscreen = false,
}: {
  value?: PlanholderLookupType | undefined;
  onSelectChange?: (agent: PlanholderLookupType | undefined) => void;
  mobileFullscreen?: boolean;
}) {
  const [selectAgent, setSelectAgent] =
    React.useState<PlanholderLookupType | null>(value ?? null);
  return (
    <Box w={{ base: "full", lg: "330px" }}>
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
        renderDisplay={(emp) =>
          `${emp.firstName}${emp.middleName ? " " + emp.middleName : ""} ${emp.lastName}`
        }
        value={selectAgent}
        mobileFullscreen={mobileFullscreen}
      />
    </Box>
  );
}
