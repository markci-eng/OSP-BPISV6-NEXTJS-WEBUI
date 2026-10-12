import { Grid } from "@chakra-ui/react";
import { InfoItem, RowItem } from "osp-ui-kit";
import { LuBriefcase } from "react-icons/lu";
import { InfoCardAccordion } from "osp-ui-kit";

export interface EmploymentInfoProps {
  employerName?: string | null;
  tin?: string | null;
  securityNo?: string | null;
  sourceOfFund?: string | null;
}

/** Formats a TIN as 123-456-789-000, right-padding with zeros to 12 digits. */
function formatTin(tin?: string | null) {
  const digits = (tin ?? "").replace(/\D/g, "").slice(0, 12);
  if (!digits) return "—";
  return digits.padEnd(12, "0").match(/\d{3}/g)!.join("-");
}

export function EmploymentInfo({
  employmentInfo,
  isOpen,
  onToggle,
}: {
  employmentInfo: EmploymentInfoProps | undefined;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const fields = [
    {
      label: "Employer",
      value:
        employmentInfo?.employerName === ""
          ? "—"
          : (employmentInfo?.employerName ?? "—"),
    },
    {
      label: "TIN",
      value: formatTin(employmentInfo?.tin),
    },
    {
      label: "SSS/GSIS Number",
      value:
        employmentInfo?.securityNo === ""
          ? "—"
          : (employmentInfo?.securityNo ?? "—"),
    },
    {
      label: "Source of Fund",
      value:
        employmentInfo?.sourceOfFund === ""
          ? "—"
          : (employmentInfo?.sourceOfFund ?? "—"),
    },
  ];

  return (
    <InfoCardAccordion
      icon={<LuBriefcase />}
      title={"Employment Information"}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {/* Desktop: grid of InfoItems */}
      <Grid
        display={{ base: "none", lg: "grid" }}
        templateColumns="repeat(2, 1fr)"
        gap={2}
      >
        {fields.map((field) => (
          <InfoItem key={field.label} label={field.label} value={field.value} />
        ))}
      </Grid>

      {/* Mobile: RowItems */}
      <Grid
        display={{ base: "grid", lg: "none" }}
        templateColumns="1fr"
        gap={2}
      >
        {fields.map((field) => (
          <RowItem key={field.label} label={field.label} value={field.value} />
        ))}
      </Grid>
    </InfoCardAccordion>
  );
}
