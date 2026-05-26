"use client";

import { Avatar, Flex } from "@chakra-ui/react";
import { H4 } from "st-peter-ui";
import InfoItem from "@/components/common/info-item/info-item";
import ProfileHeaderLabel from "@/components/texts/ProfileHeaderLabel";
import ProfileSectionCard from "@/components/saleforce/components/profile-section-card";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  SalesAgent,
  getPositionDesc,
} from "../../common/agent-lookup/agent-lookup.type";

interface AgentProfileHeaderCardProps {
  agent?: SalesAgent;
}

const AgentProfileHeaderCard = ({ agent }: AgentProfileHeaderCardProps) => {
  const isActive = agent?.employeeStatus?.toLowerCase() === "active";
  const positionDesc =
    getPositionDesc(agent?.position ?? "") +
    (agent?.branch ? ` - ${agent.branch}` : "");

  return (
    <ProfileSectionCard>
      <Flex
        direction="row"
        align="center"
        justify="space-between"
        gap={{ base: 2, md: 4 }}
      >
        <Flex
          align="center"
          gap={{ base: 2, md: 4 }}
          direction="row"
          textAlign="left"
          minW={0}
        >
          <Avatar.Root
            size={{
              base: "lg",
              md: "2xl",
            }}
            bg="#f8f8ff"
          >
            <Avatar.Fallback color="gray.400" name={agent?.name} />
          </Avatar.Root>

          <Flex direction="column" gap={1} minW={0}>
            <H4 color={BRAND_COLORS.primaryGreen}>{agent?.name ?? "-"}</H4>

            {agent?.name && (
              <Flex
                align="center"
                gap={2}
                justify={{ base: "center", sm: "flex-start" }}
              >
                <ProfileHeaderLabel isActive={isActive} value={positionDesc} />
              </Flex>
            )}
          </Flex>
        </Flex>

        <Flex
          direction="column"
          align={{
            base: "center",
            md: "flex-end",
          }}
          display={{
            base: "none",
            md: "flex",
          }}
          gap={1}
        >
          {agent?.name && (
            <InfoItem label="Agent ID" value={agent?.id ?? "-"} />
          )}
        </Flex>
      </Flex>
    </ProfileSectionCard>
  );
};

export default AgentProfileHeaderCard;
