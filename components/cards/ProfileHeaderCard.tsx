import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
import InfoItem from "../common/info-item/info-item";
import ProfileHeaderLabel from "../texts/ProfileHeaderLabel";

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
    <Box
      w="full"
      bg="white"
      borderRadius="xl"
      borderWidth={1}
      borderColor="gray.100"
      boxShadow="sm"
      p={{ base: 4, lg: 6 }}
    >
      <Flex align="center" justify="space-between" gap={4}>
        <Flex align="center" gap={{ base: 3, lg: 5 }} minW={0}>
          <Box
            p="3px"
            borderRadius="full"
            border="2px solid"
            borderColor="var(--chakra-colors-primary-disabled)"
            flexShrink={0}
          >
            <Avatar.Root
              size={{ base: "xl", lg: "2xl" }}
              bg="var(--chakra-colors-primary-disabled)/30"
            >
              <Avatar.Fallback
                color="var(--chakra-colors-primary)"
                fontWeight="semibold"
                name={name}
              />
            </Avatar.Root>
          </Box>

          <Flex direction="column" gap={1} minW={0}>
            <Text
              fontSize={{ base: "lg", lg: "xl" }}
              fontWeight="semibold"
              color="var(--chakra-colors-primary)"
              lineHeight="short"
              truncate
            >
              {name ?? "—"}
            </Text>

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

        {headerInfo && name && (
          <Box display={{ base: "none", lg: "block" }} flexShrink={0}>
            <InfoItem label={headerInfo.label} value={headerInfo.value} />
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default ProfileHeaderCard;
