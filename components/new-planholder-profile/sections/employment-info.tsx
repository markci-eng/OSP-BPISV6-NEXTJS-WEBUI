import { Grid, Separator } from "@chakra-ui/react";
import InfoItem from "@/components/new-planholder-profile/components/info-item/info-item";
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
  return (
    <InfoCardAccordion
      icon={<LuBriefcase />}
      title={"Employment Information"}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <Grid templateColumns="repeat(2, 1fr)" gap={2}>
        <InfoItem label="Employer" value={planholderInfo?.employerName ?? "—"} />
        {/* <Separator display={{ base: "block", lg: "none" }} /> */}
        <InfoItem label="TIN" value={planholderInfo?.tin ?? "—"} />
        {/* <Separator display={{ base: "block", lg: "none" }} /> */}
        <InfoItem
          label="SSS/GSIS Number"
          value={planholderInfo?.securityNo ?? "—"}
        />
        {/* <Separator display={{ base: "block", lg: "none" }} /> */}
        <InfoItem
          label="Source of Fund"
          value={planholderInfo?.sourceOfFund ?? "—"}
        />
      </Grid>
    </InfoCardAccordion>
  );
}
