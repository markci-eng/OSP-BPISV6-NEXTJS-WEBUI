"use client";

import { Flex } from "@chakra-ui/react";
import { useState } from "react";
import { LuChevronsDown, LuChevronsUp } from "react-icons/lu";
import { SalesAgent } from "../../common/agent-lookup/agent-lookup.type";
import AgentPersonalInfoCard from "../cards/AgentPersonalInfoCard";
import AgentEmploymentInfoCard from "../cards/AgentEmploymentInfoCard";
import AgentContactInfoCard from "../cards/AgentContactInfoCard";
import { PlanholderAddressCard } from "@/components/new-planholder-profile/sections/address-info";
import { TertiarySmButton } from "st-peter-ui";

interface AgentInfoTabsMobileProps {
  agent?: SalesAgent;
}

const AgentInfoTabsMobile = ({ agent }: AgentInfoTabsMobileProps) => {
  const [personalOpen, setPersonalOpen] = useState(true);
  const [employmentOpen, setEmploymentOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);

  const expandAll = () => {
    setPersonalOpen(true);
    setEmploymentOpen(true);
    setContactOpen(true);
    setAddressOpen(true);
  };

  const collapseAll = () => {
    setPersonalOpen(false);
    setEmploymentOpen(false);
    setContactOpen(false);
    setAddressOpen(false);
  };

  return (
    <Flex direction="column" gap={3}>
      <Flex justify="flex-end" gap={2}>
        <TertiarySmButton onClick={expandAll}>
          <LuChevronsDown size={14} />
          Expand All
        </TertiarySmButton>
        <TertiarySmButton onClick={collapseAll}>
          <LuChevronsUp size={14} />
          Collapse All
        </TertiarySmButton>
      </Flex>

      <AgentPersonalInfoCard
        agent={agent}
        isOpen={personalOpen}
        onToggle={() => setPersonalOpen((p) => !p)}
      />

      <PlanholderAddressCard
        phAddress={
          agent?.address
            ? [
                {
                  id: "1",
                  addressType: "RESIDENCE",
                  addressNo: agent.address.unit || null,
                  street: agent.address.street || null,
                  barangay: agent.address.barangay || null,
                  district: agent.address.district || null,
                  city: agent.address.city,
                  province: agent.address.province,
                  zipCode: agent.address.zipCode
                    ? parseInt(agent.address.zipCode)
                    : null,
                  isMailAddress: true,
                },
              ]
            : undefined
        }
        isOpen={addressOpen}
        onToggle={() => setAddressOpen((p) => !p)}
      />

      <AgentContactInfoCard
        agent={agent}
        isOpen={contactOpen}
        onToggle={() => setContactOpen((p) => !p)}
      />

      <AgentEmploymentInfoCard
        agent={agent}
        isOpen={employmentOpen}
        onToggle={() => setEmploymentOpen((p) => !p)}
      />
    </Flex>
  );
};

export default AgentInfoTabsMobile;
