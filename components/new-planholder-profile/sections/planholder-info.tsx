import { Grid } from "@chakra-ui/react";
import Card from "@/components/cards/Card";
import InfoItem from "@/components/new-planholder-profile/components/info-item/info-item";
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
  const fields = [
    { label: "Nationality", value: planholder?.nationality ?? "—" },
    {
      label: "Date of Birth",
      value: planholder?.dateOfBirth?.toLocaleDateString() ?? "—",
    },
    { label: "Age", value: computeAge(planholder?.dateOfBirth ?? null) ?? "—" },
    { label: "Civil Status", value: planholder?.civilStatus ?? "—" },
    {
      label: "Weight",
      value: planholder?.weight ? planholder.weight + " KG" : "—",
    },
    {
      label: "Naturalization Date",
      value: planholder?.naturalizationDate?.toLocaleDateString() ?? "—",
    },
    { label: "Place of Birth", value: planholder?.placeOfBirth ?? "—" },
    { label: "Gender", value: planholder?.gender ?? "—" },
    { label: "Height", value: planholder?.height ?? "—" },
  ];

  return (
    <InfoCardAccordion
      icon={<LuUser />}
      title={"Personal Information"}
      subtitle="Personal Information"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {/* Desktop: grid of InfoItems */}
      <Grid
        display={{ base: "none", lg: "grid" }}
        py={2}
        templateColumns="repeat(4, 1fr)"
        gap={1}
        gapY={2}
      >
        {fields.map((field) => (
          <InfoItem key={field.label} label={field.label} value={field.value} />
        ))}
      </Grid>

      {/* Mobile: RowItems */}
      <Grid
        display={{ base: "grid", lg: "none" }}
        py={2}
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
