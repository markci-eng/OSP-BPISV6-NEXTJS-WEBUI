import { Grid } from "@chakra-ui/react";
import InfoItem from "@/components/new-planholder-profile/components/info-item/info-item";
import { RowItem } from "@/claude components/info-card/row-item";
import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";
import { LuBriefcase } from "react-icons/lu";

export interface EmploymentInfoProps {
  employerName?: string;
  tin?: string;
  securityNo?: string;
  sourceOfFund?: string;
}

export function EmploymentInfo({
  planholderInfo,
  isOpen,
  onToggle,
}: {
  planholderInfo: EmploymentInfoProps | undefined;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const fields = [
    { label: "Employer", value: planholderInfo?.employerName ?? "—" },
    { label: "TIN", value: planholderInfo?.tin ?? "—" },
    { label: "SSS/GSIS Number", value: planholderInfo?.securityNo ?? "—" },
    { label: "Source of Fund", value: planholderInfo?.sourceOfFund ?? "—" },
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
      <Grid display={{ base: "grid", lg: "none" }} templateColumns="1fr" gap={2}>
        {fields.map((field) => (
          <RowItem key={field.label} label={field.label} value={field.value} />
        ))}
      </Grid>
    </InfoCardAccordion>
  );
}
