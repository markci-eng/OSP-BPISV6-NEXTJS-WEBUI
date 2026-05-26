import {
  Avatar,
  Flex,
  Grid,
  Separator,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Box, H4 } from "st-peter-ui";
import { Badge } from "../components/badge/badge";
import InfoItem from "../components/info-item/info-item";
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
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Card.Root title={"Planholder Information"}>
      <Card.MainContent>
        {!isMobile ? (
          <Grid
            py={2}
            templateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              xl: "repeat(3, 1fr)",
            }}
            gap={{ base: 3, md: 4 }}
          >
            <InfoItem
              label="Nationality"
              value={planholder?.nationality ?? "—"}
            />
            <InfoItem
              label="Naturalization Date"
              value={
                planholder?.naturalizationDate?.toLocaleDateString() ?? "—"
              }
            />
            <InfoItem
              label="Date of Birth"
              value={planholder?.dateOfBirth?.toLocaleDateString() ?? "—"}
            />
            <InfoItem
              label="Place of Birth"
              value={planholder?.placeOfBirth ?? "—"}
            />
            <InfoItem
              label="Age"
              value={computeAge(planholder?.dateOfBirth ?? null) ?? "—"}
            />
            <InfoItem label="Gender" value={planholder?.gender ?? "—"} />
            <InfoItem
              label="Civil Status"
              value={planholder?.civilStatus ?? "—"}
            />
            <InfoItem label="Height" value={planholder?.height ?? "—"} />
            <InfoItem
              label="Weight"
              value={planholder?.weight ? planholder.weight + " KG" : "—"}
            />
          </Grid>
        ) : (
          <VStack align="stretch" gap={2}>
            <LabelText
              // orientation="horizontal"
              label="Nationality"
              value={planholder?.nationality ?? "—"}
            />
            {/* <Separator my={1} /> */}
            <LabelText
              // orientation="horizontal"
              label="Naturalization Date"
              value={
                planholder?.naturalizationDate?.toLocaleDateString() ?? "—"
              }
            />
            {/* <Separator my={1} /> */}
            <LabelText
              // orientation="horizontal"
              label="Date of Birth"
              value={planholder?.dateOfBirth?.toLocaleDateString() ?? "—"}
            />
            {/* <Separator my={1} /> */}
            <LabelText
              // orientation="horizontal"
              label="Place of Birth"
              value={planholder?.placeOfBirth ?? "—"}
            />
            {/* <Separator my={1} /> */}
            <LabelText
              // orientation="horizontal"
              label="Age"
              value={computeAge(planholder?.dateOfBirth ?? null) ?? "—"}
            />
            {/* <Separator my={1} /> */}
            <LabelText
              // orientation="horizontal"
              label="Gender"
              value={planholder?.gender ?? "—"}
            />
            {/* <Separator my={1} /> */}
            <LabelText
              // orientation="horizontal"
              label="Civil Status"
              value={planholder?.civilStatus ?? "—"}
            />
            {/* <Separator my={1} /> */}
            <LabelText
              // orientation="horizontal"
              label="Height"
              value={planholder?.height ?? "—"}
            />
            {/* <Separator my={1} /> */}
            <LabelText
              // orientation="horizontal"
              label="Weight"
              value={planholder?.weight ? planholder.weight + " KG" : "—"}
            />
          </VStack>
        )}
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

  // borrow days from previous month
  if (days < 0) {
    months--;

    const prevMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0,
    ).getDate();

    days += prevMonth;
  }

  // borrow months from previous year
  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} YRS ${months} MOS ${days} DAYS`;
}
