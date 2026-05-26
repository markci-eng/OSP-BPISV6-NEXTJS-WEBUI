import { Box, Flex, Grid, Separator, Strong } from "@chakra-ui/react";
import Card from "@/components/cards/Card";
import { LuBriefcase, LuTickets } from "react-icons/lu";
import InfoItem from "@/components/common/info-item/info-item";
import { GrSecure } from "react-icons/gr";
import { TbTax } from "react-icons/tb";

export interface EmploymentInfoProps {
  employerName?: string;
  tin?: string;
  securityNo?: string;
  sourceOfFund?: string;
}

export function EmploymentInfo({
  planholderInfo,
}: {
  planholderInfo: EmploymentInfoProps | undefined;
}) {
  return (
    <Card.Root title={"Employment Information"}>
      <Card.MainContent>
        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={4}>
          <InfoItem
            label="Employer"
            value={planholderInfo?.employerName ?? "—"}
            icon={LuBriefcase}
          />
          <InfoItem
            label="TIN"
            value={planholderInfo?.tin ?? "—"}
            icon={LuTickets}
          />
          <InfoItem
            label="SSS/GSIS Number"
            value={planholderInfo?.securityNo ?? "—"}
            icon={GrSecure}
          />
          <InfoItem
            label="Source of Fund"
            value={planholderInfo?.sourceOfFund ?? "—"}
            icon={TbTax}
          />
        </Grid>
      </Card.MainContent>
    </Card.Root>
  );
}
