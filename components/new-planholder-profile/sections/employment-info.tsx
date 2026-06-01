import { Grid, Separator } from "@chakra-ui/react";
import Card from "@/components/cards/Card";
import LabelText from "@/components/texts/LabelText";

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
        <Grid
          templateColumns="1fr"
          gap={2}
        >
          <LabelText
            label="Employer"
            value={planholderInfo?.employerName ?? "—"}
          />
          <Separator />
          <LabelText label="TIN" value={planholderInfo?.tin ?? "—"} />
          <Separator />
          <LabelText
            label="SSS/GSIS Number"
            value={planholderInfo?.securityNo ?? "—"}
          />
          <Separator />
          <LabelText
            label="Source of Fund"
            value={planholderInfo?.sourceOfFund ?? "—"}
          />
        </Grid>
      </Card.MainContent>
    </Card.Root>
  );
}
