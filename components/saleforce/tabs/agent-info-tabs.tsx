import React from "react";
import { Tabs, Grid, Flex, Strong, Separator, Box } from "@chakra-ui/react";
import { LuUser, LuNotebook } from "react-icons/lu";
import { InfoItem } from "@splpi/summary";
import {
  getAgentNameById,
  getPositionDesc,
  SalesAgent,
} from "../../common/agent-lookup/agent-lookup.type";

interface AgentInfoTabsProps {
  agent?: SalesAgent;
}

const formatDate = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const titleCase = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "—";

const AgentInfoTabs = ({ agent }: AgentInfoTabsProps) => {
  const [value, setValue] = React.useState("personal-info");

  function getTitle(): string {
    switch (value) {
      case "personal-info":
        return "Personal Information";
      case "contact-address-info":
        return "Contact and Address Information";
      default:
        return "";
    }
  }

  return (
    <Tabs.Root
      value={value}
      onValueChange={(e) => setValue(e.value)}
      defaultValue="personal-info"
      variant="outline"
    >
      <Flex justify={{ base: "flex-end", md: "space-between" }} align="center">
        <Tabs.List w="full">
          <Tabs.Trigger
            value="personal-info"
            color="gray.400"
            bg="#f8f8ff"
            borderBottomColor="gray.200"
            _selected={{
              bg: "whiteAlpha.900",
              color: "var(--chakra-colors-primary)",
              borderBottomColor: "transparent",
            }}
          >
            <LuUser /> Personal
          </Tabs.Trigger>

          <Tabs.Trigger
            value="contact-address-info"
            color="gray.400"
            bg="#f8f8ff"
            borderBottomColor="gray.200"
            _selected={{
              bg: "whiteAlpha.900",
              color: "var(--chakra-colors-primary)",
              borderBottomColor: "transparent",
            }}
          >
            <LuNotebook /> Contact and Address
          </Tabs.Trigger>
        </Tabs.List>
      </Flex>

      <Tabs.Content value="personal-info" paddingX={4}>
        <Flex flexDir={"column"} gap="1">
          <Strong color="var(--chakra-colors-primary)">Geographic</Strong>
          <Separator />
        </Flex>

        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gapX={2}
          gapY={4}
          padding={4}
        >
          <InfoItem label="Place of Birth" value={agent?.placeOfBirth ?? "—"} />
          <InfoItem
            label="Date of Birth"
            value={formatDate(agent?.birthDate)}
          />
          <InfoItem
            label="Gender"
            value={agent?.gender ? titleCase(agent.gender) : "—"}
          />
          <InfoItem label="Civil Status" value={agent?.civilStatus ?? "—"} />
          <InfoItem label="Nationality" value={agent?.nationality ?? "—"} />
          <InfoItem
            label="Naturalization Date"
            value={agent?.naturalizationDate ?? "—"}
          />
          <InfoItem label="Height" value={agent?.height ?? "—"} />
          <InfoItem label="Weight" value={agent?.weight ?? "—"} />
        </Grid>

        <Flex mt="6" flexDir={"column"} gap="1">
          <Strong color="var(--chakra-colors-primary)">Employment</Strong>
          <Separator />
        </Flex>

        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gapX={2}
          gapY={6}
          padding={4}
        >
          <InfoItem
            label="Position"
            value={agent ? getPositionDesc(agent.position) : "—"}
          />
          <InfoItem label="Date Hired" value={formatDate(agent?.hireDate)} />
          <InfoItem
            label="Employee Status"
            value={agent?.employeeStatus ?? "—"}
          />
          <InfoItem label="Branch" value={agent?.branch ?? "—"} />
          <InfoItem
            label="Supervisor"
            value={
              agent?.superiorId
                ? (getAgentNameById(agent.superiorId) ?? "—")
                : "—"
            }
          />
          <InfoItem label="SSS No." value={agent?.sssNumber ?? "—"} />
          <InfoItem label="NBI No." value={agent?.nbiNumber ?? "—"} />
          <InfoItem label="TIN No." value={agent?.tinNumber ?? "—"} />
        </Grid>
      </Tabs.Content>

      <Tabs.Content value="contact-address-info" paddingX={4}>
        <Flex flexDir={"column"} gap="1">
          <Strong color="var(--chakra-colors-primary)">Contact</Strong>
          <Separator />
        </Flex>

        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gapX={2}
          gapY={6}
          padding={4}
        >
          <InfoItem label="Landline" value={agent?.landline ?? "—"} />
          <InfoItem label="Mobile" value={agent?.mobile ?? "—"} />
          <InfoItem label="Email" value={agent?.email ?? "—"} />
        </Grid>

        <Flex mt="6" flexDir={"column"} gap="1">
          <Strong color="var(--chakra-colors-primary)">Address</Strong>
          <Separator />
        </Flex>

        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gapX={2}
          gapY={6}
          padding={4}
        >
          <InfoItem
            label="Lot/Bldg/Unit No."
            value={agent?.address.unit ?? "—"}
          />
          <InfoItem label="Street" value={agent?.address.street ?? "—"} />
          <InfoItem label="Barangay" value={agent?.address.barangay ?? "—"} />
          <InfoItem label="District" value={agent?.address.district ?? "—"} />
          <InfoItem label="City" value={agent?.address.city ?? "—"} />
          <InfoItem label="Province" value={agent?.address.province ?? "—"} />
          <InfoItem label="Zip Code" value={agent?.address.zipCode ?? "—"} />
        </Grid>
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default AgentInfoTabs;
