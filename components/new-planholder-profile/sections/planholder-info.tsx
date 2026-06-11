import { Box, Grid, Separator, useBreakpointValue } from "@chakra-ui/react";
import Card from "@/components/cards/Card";
import { RowItem } from "@/claude components/info-card/row-item";
import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";
import { LuUser, LuUserPen } from "react-icons/lu";

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
  isOpen,
  onToggle,
}: {
  planholder: PlanholderInfoProps | undefined;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  return (
    <InfoCardAccordion
      icon={<LuUser />}
      title={"Personal Information"}
      subtitle="Personal Information"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <Grid
        py={2}
        templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
        gap={1}
      >
        <RowItem label="Nationality" value={planholder?.nationality ?? "—"} />
        {/* {useBreakpointValue({ base: true, lg: false }) && <Separator />} */}
        <RowItem
          label="Date of Birth"
          value={planholder?.dateOfBirth?.toLocaleDateString() ?? "—"}
        />
        {/* {useBreakpointValue({ base: true, lg: false }) && <Separator />} */}
        <RowItem
          label="Age"
          value={computeAge(planholder?.dateOfBirth ?? null) ?? "—"}
        />
        {/* {useBreakpointValue({ base: true, lg: false }) && <Separator />} */}
        <RowItem label="Civil Status" value={planholder?.civilStatus ?? "—"} />
        {/* {useBreakpointValue({ base: true, lg: false }) && <Separator />} */}
        <RowItem
          label="Weight"
          value={planholder?.weight ? planholder.weight + " KG" : "—"}
        />
        <RowItem
          label="Naturalization Date"
          value={planholder?.naturalizationDate?.toLocaleDateString() ?? "—"}
        />
        {/* {useBreakpointValue({ base: true, lg: false }) && <Separator />} */}
        <RowItem
          label="Place of Birth"
          value={planholder?.placeOfBirth ?? "—"}
        />
        {/* {useBreakpointValue({ base: true, lg: false }) && <Separator />} */}
        <RowItem label="Gender" value={planholder?.gender ?? "—"} />
        {/* {useBreakpointValue({ base: true, lg: false }) && <Separator />} */}
        <RowItem label="Height" value={planholder?.height ?? "—"} />
      </Grid>
    </InfoCardAccordion>
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
