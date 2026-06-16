import { Flex } from "@chakra-ui/react";
import {
  LuUser,
  LuPhone,
  LuMapPin,
  LuBuilding2,
} from "react-icons/lu";
import { RowItem } from "@/claude components/info-card/row-item";
import { InputCardAccordion } from "@/claude components/card-accordion/input-card-accordion";

const AgentSummary = () => (
  <Flex flexDir="column" gap={3}>
    <InputCardAccordion
      icon={<LuUser size={16} />}
      title="Personal"
      subtitle="Name and demographics"
      defaultOpen
    >
      <Flex flexDir="column">
        <RowItem label="Last Name" value="Doe" />
        <RowItem label="First Name" value="John" />
        <RowItem label="Middle Name" value="N/A" />
        <RowItem label="Suffix" value="N/A" />
        <RowItem label="Date of Birth" value="Sept. 11, 1998" />
        <RowItem label="Place of Birth" value="Lopez, Quezon" />
        <RowItem label="Civil Status" value="Single" />
        <RowItem label="Gender" value="Male" />
        <RowItem label="Nationality" value="Filipino" />
        <RowItem label="Naturalization Date" value="N/A" />
      </Flex>
    </InputCardAccordion>

    <InputCardAccordion
      icon={<LuPhone size={16} />}
      title="Contact"
      subtitle="Phone and email"
      defaultOpen
    >
      <Flex flexDir="column">
        <RowItem label="Mobile" value="09123456789" />
        <RowItem label="Landline" value="021234567" />
        <RowItem label="Email" value="john.doe@example.com" />
      </Flex>
    </InputCardAccordion>

    <InputCardAccordion
      icon={<LuMapPin size={16} />}
      title="Address"
      subtitle="Residential details"
      defaultOpen
    >
      <Flex flexDir="column">
        <RowItem label="Lot Number" value="123" />
        <RowItem label="Street" value="Main Street" />
        <RowItem label="District" value="District 1" />
        <RowItem label="City" value="Antipolo" />
        <RowItem label="Province" value="Rizal" />
        <RowItem label="Zip Code" value="1870" />
      </Flex>
    </InputCardAccordion>

    <InputCardAccordion
      icon={<LuBuilding2 size={16} />}
      title="Employment"
      subtitle="Work details and government IDs"
      defaultOpen
    >
      <Flex flexDir="column">
        <RowItem label="Employer" value="St. Peter Life Plan Inc." />
        <RowItem label="Position" value="Sales Agent 1" />
        <RowItem label="Hired Date" value="Feb. 20, 2025" />
        <RowItem label="NBI" value="N/A" />
        <RowItem label="TIN" value="N/A" />
        <RowItem label="SSS" value="N/A" />
      </Flex>
    </InputCardAccordion>
  </Flex>
);

export default AgentSummary;
