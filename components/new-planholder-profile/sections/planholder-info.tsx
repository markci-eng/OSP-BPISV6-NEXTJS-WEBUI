import { Grid, Separator, useBreakpointValue } from "@chakra-ui/react";
import Card from "@/components/cards/Card";
import LabelText from "@/components/texts/LabelText";

export interface PlanholderInfoProps {
  personId: string;
  lastName: string;
  firstName: string;
  middleName: string;
  suffix?: string | undefined;
  nationality: string;
  naturalizationDate: Date;
  dateOfBirth: Date;
  placeOfBirth: string;
  gender: string;
  civilStatus: string;
  height: string;
  weight: number;
  employerName: string;
  employmentStatus: string;
  tin: string;
  securityNo: string;
  sourceOfFund: string;
}

export function PlanholderInfo({
  planholder,
}: {
  planholder: PlanholderInfoProps | undefined;
}) {
  return (
    <Card.Root title={"Planholder Information"}>
      <Card.MainContent>
        <Grid
          py={2}
          templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
          gap={2}
        >
          <LabelText
            label="Nationality"
            value={planholder?.nationality ?? "—"}
          />
          {useBreakpointValue({ base: true, lg: false }) && <Separator />}
          <LabelText
            label="Naturalization Date"
            value={planholder?.naturalizationDate?.toLocaleDateString() ?? "—"}
          />
          {useBreakpointValue({ base: true, lg: false }) && <Separator />}
          <LabelText
            label="Date of Birth"
            value={planholder?.dateOfBirth?.toLocaleDateString() ?? "—"}
          />
          {useBreakpointValue({ base: true, lg: false }) && <Separator />}
          <LabelText
            label="Place of Birth"
            value={planholder?.placeOfBirth ?? "—"}
          />
          {useBreakpointValue({ base: true, lg: false }) && <Separator />}
          <LabelText
            label="Age"
            value={computeAge(planholder?.dateOfBirth ?? null) ?? "—"}
          />
          {useBreakpointValue({ base: true, lg: false }) && <Separator />}
          <LabelText label="Gender" value={planholder?.gender ?? "—"} />
          {useBreakpointValue({ base: true, lg: false }) && <Separator />}
          <LabelText
            label="Civil Status"
            value={planholder?.civilStatus ?? "—"}
          />
          {useBreakpointValue({ base: true, lg: false }) && <Separator />}
          <LabelText label="Height" value={planholder?.height ?? "—"} />
          {useBreakpointValue({ base: true, lg: false }) && <Separator />}
          <LabelText
            label="Weight"
            value={planholder?.weight ? planholder.weight + " KG" : "—"}
          />
        </Grid>
      </Card.MainContent>
    </Card.Root>
  );
}

export function computeAge(date: Date | null): string {
  if (date === null) return "—";
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDay();

  const today = new Date();
  const birth = new Date(year, month - 1, day);

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0,
    ).getDate();
    days += prevMonth;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} YRS ${months} MOS ${days} DAYS`;
}
