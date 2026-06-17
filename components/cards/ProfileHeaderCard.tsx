import { Avatar, Box, Flex, Link, Text } from "@chakra-ui/react";
import {
  LuCalendar,
  LuChevronDown,
  LuChevronUp,
  LuHash,
  LuMapPin,
  LuPhone,
} from "react-icons/lu";
import { OSPBadge } from "../common/badge/badge";
import { ContactNumber } from "@/claude components/contact-number/contact-number";

interface ProfileHeaderCardProps {
  name?: string;
  personId?: string;
  isInsured?: boolean;
  homeAddress?: string;
  contactNo?: string;
  email?: string;
  landlineNo?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  contentId?: string;
  actions?: React.ReactNode;
}

function getStatusType(
  status?: string,
): "success" | "info" | "warning" | "danger" | undefined {
  if (!status) return undefined;
  const s = status.toLowerCase();
  if (s === "active") return "success";
  if (s === "lapsed") return "warning";
  if (s.includes("termin")) return "danger";
  return undefined;
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  const local = d.startsWith("63") ? "0" + d.slice(2) : d;
  return local.startsWith("09") && local.length === 11
    ? local.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3")
    : raw;
}

const ProfileHeaderCard = ({
  name,
  personId,
  isInsured,
  homeAddress,
  contactNo,
  email,
  landlineNo,
  isOpen,
  onToggle,
  contentId,
  actions,
}: ProfileHeaderCardProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onToggle && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <Box
      w="full"
      bg="white"
      borderRadius="2xl"
      borderWidth={1}
      borderColor="gray.100"
      shadow="sm"
      overflow="hidden"
      transition="all 0.25s ease"
      mt={5}
    >
      {/* Trigger area — accordion toggle */}
      <Box
        p={{ base: 4, lg: 5 }}
        cursor={onToggle ? "pointer" : undefined}
        aria-expanded={onToggle ? isOpen : undefined}
        aria-controls={onToggle && contentId ? contentId : undefined}
        onKeyDown={handleKeyDown}
      >
        {/* HEADER: Avatar + Name/ID + Badges + Chevron */}
        <Flex justify="space-between" align="start" mb={3}>
          <Flex align="center" gap={3} minW={0} flex={1}>
            <Box
              p="3px"
              borderRadius="full"
              border="2px solid"
              borderColor="var(--chakra-colors-primary-disabled)"
              flexShrink={0}
            >
              <Avatar.Root
                size="md"
                bg="var(--chakra-colors-primary-disabled)/30"
              >
                <Avatar.Fallback
                  color="var(--chakra-colors-primary)"
                  fontWeight="semibold"
                  name={name}
                />
              </Avatar.Root>
            </Box>

            <Box minW={0}>
              <Text fontWeight="bold" fontSize="md" lineHeight="1.2" truncate>
                {name?.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) ??
                  "—"}
              </Text>
              {personId && (
                <Flex
                  align="center"
                  gap={1}
                  fontSize="xs"
                  color="gray.500"
                  mt={0.5}
                >
                  <LuHash size={12} />
                  <Text>{personId}</Text>
                </Flex>
              )}
            </Box>
          </Flex>

          {/* Status badge + Insurability badge + Chevron */}
          <Flex align="center" gap={2} flexShrink={0} ml={2}>
            {isInsured !== undefined && (
              <OSPBadge type={isInsured ? "success" : "danger"}>
                {isInsured ? "Insurable" : "Not Insurable"}
              </OSPBadge>
            )}
            {/* {onToggle &&
              (isOpen ? (
                <LuChevronUp size={16} />
              ) : (
                <LuChevronDown size={16} />
              ))} */}
          </Flex>
        </Flex>

        {/* QUICK INFO CHIPS */}
        {homeAddress && (
          <Flex gap={2} wrap="wrap" mb={3}>
            {homeAddress && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(homeAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Box
                  px={2}
                  py={1}
                  fontSize="xs"
                  borderRadius="full"
                  bg="gray.50"
                  display="flex"
                  alignItems="center"
                  gap={1}
                  width={"full"}
                  color="gray.600"
                >
                  <LuMapPin size={12} />
                  {homeAddress}
                </Box>
              </a>
            )}
          </Flex>
        )}

        {/* CONTACT NUMBER */}
        {contactNo && <ContactNumber contactNo={contactNo} />}
        {landlineNo && <ContactNumber contactNo={landlineNo} />}
        {email && (
          <Link href={`mailto:${email}`}>
            <Box
              // as="a"
              px={2}
              py={1}
              fontSize="xs"
              borderRadius="full"
              bg="blue.50"
              color="blue.600"
              display="flex"
              alignItems="center"
              gap={1}
              cursor="pointer"
              _hover={{ bg: "blue.100" }}
            >
              ✉️ {email}
            </Box>
          </Link>
        )}
      </Box>
    </Box>
  );
};

export default ProfileHeaderCard;
