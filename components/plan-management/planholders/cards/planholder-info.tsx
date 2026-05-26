import { Avatar, Box, Flex, Grid, Separator } from "@chakra-ui/react";
import { PlanholderInfoType } from "../planholders.types";
import { OSPBadge as Badge } from "@/components/common/badge/badge";
import { H4 } from "st-peter-ui";
import InfoItem from "@/components/common/info-item/info-item";

export function PlanholderInfoCard({
  planholder,
}: {
  planholder: PlanholderInfoType;
}) {
  return (
    <Box width={"full"} p={5} my={5} boxShadow={"sm"} borderRadius={"md"}>
      <Flex align={"start"}>
        <Avatar.Root size={"2xl"}>
          <Avatar.Fallback
            name={planholder.firstName + " " + planholder.lastName}
          />
        </Avatar.Root>
        <Flex direction={"column"} ml={4} gap={1} w={"full"}>
          <H4 color="var(--chakra-colors-primary)">
            {planholder.firstName + " " + planholder.lastName}
          </H4>
          <Box>
            <Badge size={"sm"} type={"info"} m={1}>
              INSURABLE
            </Badge>
          </Box>
        </Flex>
      </Flex>
      <Separator my={2} />
      <Grid
        py={2}
        templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
        gap={4}
      >
        <InfoItem label="Nationality" value={planholder.nationality ?? "N/A"} />
        <InfoItem
          label="Naturalization Date"
          value={planholder.naturalizationDate?.toLocaleDateString() ?? "N/A"}
        />
        <InfoItem
          label="Date of Birth"
          value={planholder.dateOfBirth?.toLocaleDateString() ?? "N/A"}
        />
        <InfoItem
          label="Place of Birth"
          value={planholder.placeOfBirth ?? "N/A"}
        />
        <InfoItem
          label="Age"
          value={computeAge(planholder.dateOfBirth) ?? "N/A"}
        />
        <InfoItem label="Gender" value={planholder.gender ?? "N/A"} />
        <InfoItem
          label="Civil Status"
          value={planholder.civilStatus ?? "N/A"}
        />
        <InfoItem label="Height" value={planholder.height ?? "N/A"} />
        <InfoItem label="Weight" value={planholder.weight + " KG"} />
      </Grid>
    </Box>
  );
}

export function computeAge(date: Date | null): string {
  if (date === null) return "";
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
