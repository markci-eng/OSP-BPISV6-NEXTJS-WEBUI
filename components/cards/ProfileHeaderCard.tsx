import React from "react";
import Card from "./Card";
import { Avatar, Flex } from "@chakra-ui/react";
import InfoItem from "../common/info-item/info-item";
import ProfileHeaderLabel from "../texts/ProfileHeaderLabel";
import { H4 } from "st-peter-ui";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

interface HeaderInfo {
  label: string;
  value: string;
}

interface NameSubtitle {
  active: boolean;
  value: string;
}

interface ProfileHeaderCardProps {
  name?: string;
  headerInfo?: HeaderInfo;
  nameSubtitle?: NameSubtitle;
}

const ProfileHeaderCard = ({
  name,
  headerInfo,
  nameSubtitle,
}: ProfileHeaderCardProps) => {
  return (
    <Card.Root>
      <Card.MainContent>
        <Flex
          direction={{ base: "column", sm: "row" }}
          align={{ base: "flex-start", sm: "center" }}
          justify="space-between"
          gap={4}
        >
          <Flex align="center" gap={{ base: 3, md: 4 }} minW={0}>
            <Avatar.Root
              size={{ base: "lg", md: "2xl" }}
              bg={BRAND_COLORS.successBg}
              borderWidth="1px"
              borderColor={BRAND_COLORS.primaryGreen}
              flexShrink={0}
            >
              <Avatar.Fallback color={BRAND_COLORS.primaryGreen} name={name} />
            </Avatar.Root>

            <Flex direction="column" gap={1} minW={0}>
              <H4 color={BRAND_COLORS.primaryGreen}>{name ?? "-"}</H4>

              {nameSubtitle && name && (
                <Flex align="center" gap={2}>
                  <ProfileHeaderLabel
                    isActive={nameSubtitle.active}
                    value={nameSubtitle.value}
                  />
                </Flex>
              )}
            </Flex>
          </Flex>

          <Flex
            direction="column"
            align={{ base: "flex-start", md: "flex-end" }}
            display={{ base: "none", md: "flex" }}
            gap={1}
          >
            {headerInfo && name && (
              <InfoItem label={headerInfo.label} value={headerInfo.value} />
            )}
          </Flex>
        </Flex>
      </Card.MainContent>
    </Card.Root>
  );
};

export default ProfileHeaderCard;
