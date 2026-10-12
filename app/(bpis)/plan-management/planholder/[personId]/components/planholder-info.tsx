"use client";
import { Grid } from "@chakra-ui/react";
import { InfoItem, RowItem } from "osp-ui-kit";
import { LuUser } from "react-icons/lu";
import { InfoCardAccordion } from "osp-ui-kit";
import type {
  PersonalInfo,
  PlanholderInfo,
} from "@/types/plan-management.types";

export function PlanholderInfo({
  planholder,
  isOpen,
  onToggle,
}: {
  planholder: PersonalInfo | undefined;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const dateOfBirth = planholder?.dateOfBirth
    ? new Date(planholder.dateOfBirth)
    : null;
  const naturalizationDate = planholder?.naturalizationDate
    ? new Date(planholder.naturalizationDate)
    : null;
  const fields = [
    { label: "Nationality", value: planholder?.nationality ?? "—" },
    {
      label: "Date of Birth",
      value: dateOfBirth === null ? "—" : dateOfBirth.toLocaleDateString(),
    },
    { label: "Age", value: computeAge(dateOfBirth ?? null) ?? "—" },
    { label: "Civil Status", value: planholder?.civilStatus ?? "—" },
    {
      label: "Weight",
      value: planholder?.weight ? planholder.weight + " KG" : "—",
    },
    {
      label: "Naturalization Date",
      value: naturalizationDate?.toLocaleDateString() ?? "—",
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
          <InfoItem
            key={field.label}
            label={field.label}
            value={field.value as string}
          />
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

const MS_PER_DAY = 86_400_000;

/**
 * Age as whole years, months and days since `date`.
 *
 * Counts whole months first, then the days since the last month-anniversary.
 * An anniversary that falls past the end of a short month (the 31st, or 29
 * February) lands on that month's last day, so the day count never goes
 * negative.
 */
export function computeAge(
  date: Date | null,
  today: Date = new Date(),
  yearOnly?: boolean,
): string {
  if (date === null || Number.isNaN(date.getTime())) return "—";

  const birthYear = date.getFullYear();
  const birthMonth = date.getMonth();
  const birthDay = date.getDate();

  let months =
    (today.getFullYear() - birthYear) * 12 + (today.getMonth() - birthMonth);
  if (today.getDate() < birthDay) months--;

  // Born in the future: there is no age to give.
  if (months < 0) return "—";

  const anchorYear = birthYear + Math.floor((birthMonth + months) / 12);
  const anchorMonth = (birthMonth + months) % 12;
  const lastDayOfAnchorMonth = new Date(
    anchorYear,
    anchorMonth + 1,
    0,
  ).getDate();
  const anchorDay = Math.min(birthDay, lastDayOfAnchorMonth);

  // Calendar dates in UTC, so a daylight-saving shift can't eat a day.
  const days = Math.round(
    (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
      Date.UTC(anchorYear, anchorMonth, anchorDay)) /
      MS_PER_DAY,
  );

  if (yearOnly) return `${Math.floor(months / 12)} YEARS OLD`;

  return `${Math.floor(months / 12)} YRS ${months % 12} MOS ${days} DAYS`;
}
