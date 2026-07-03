import { Avatar, Box, Flex, Grid, GridItem, Link, Text } from "@chakra-ui/react";
import { LuHash, LuMail, LuMapPin, LuPhone, LuSmartphone } from "react-icons/lu";
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

function toTitleCase(name?: string): string {
  return name?.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) ?? "—";
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  const local = d.startsWith("63") ? "0" + d.slice(2) : d;
  return local.startsWith("09") && local.length === 11
    ? local.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3")
    : raw;
}

/** Collapse the newline-delimited address into a single readable line. */
function formatAddress(raw?: string): string {
  return (
    raw
      ?.split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join(", ") ?? ""
  );
}

type ContactTone = "gray" | "blue" | "green";

const TONE_STYLES: Record<
  ContactTone,
  { hoverBg: string; iconBg: string; color: string }
> = {
  gray: { hoverBg: "gray.50", iconBg: "gray.100", color: "gray.600" },
  blue: { hoverBg: "blue.50", iconBg: "blue.100", color: "blue.600" },
  green: { hoverBg: "green.50", iconBg: "green.100", color: "green.600" },
};

/** Rich contact row used in the desktop layout (icon + label + value). */
function ContactRow({
  icon,
  label,
  value,
  href,
  tone = "gray",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  tone?: ContactTone;
}) {
  const t = TONE_STYLES[tone];

  const inner = (
    <Flex
      align="center"
      gap={3}
      p={2.5}
      h="full"
      borderRadius="xl"
      borderWidth={1}
      borderColor="gray.100"
      bg="white"
      transition="all 0.15s ease"
      _hover={href ? { bg: t.hoverBg, borderColor: t.iconBg } : undefined}
    >
      <Flex
        boxSize={9}
        flexShrink={0}
        borderRadius="lg"
        align="center"
        justify="center"
        bg={t.iconBg}
        color={t.color}
      >
        {icon}
      </Flex>
      <Box minW={0}>
        <Text
          fontSize="2xs"
          textTransform="uppercase"
          letterSpacing="wider"
          fontWeight="semibold"
          color="gray.400"
          lineHeight="1.2"
        >
          {label}
        </Text>
        <Text fontSize="sm" fontWeight="medium" color="gray.700" truncate>
          {value}
        </Text>
      </Box>
    </Flex>
  );

  return href ? (
    <Link
      href={href}
      display="block"
      h="full"
      _hover={{ textDecoration: "none" }}
    >
      {inner}
    </Link>
  ) : (
    inner
  );
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

  const addressLine = formatAddress(homeAddress);
  const hasAnyContact = Boolean(
    addressLine || contactNo || landlineNo || email,
  );

  return (
    <Box
      w="full"
      h="full"
      bg="white"
      borderRadius="2xl"
      borderWidth={1}
      borderColor="gray.100"
      shadow="sm"
      transition="all 0.25s ease"
      _hover={{ transform: "translateY(-3px)", shadow: "lg" }}
      overflow="hidden"
      cursor="pointer"
    >
      {/* ============================= MOBILE / TABLET ============================= */}
      <Box
        display={{ base: "block", lg: "none" }}
        p={4}
        cursor={onToggle ? "pointer" : undefined}
        aria-expanded={onToggle ? isOpen : undefined}
        aria-controls={onToggle && contentId ? contentId : undefined}
        onKeyDown={handleKeyDown}
      >
        {/* HEADER: Avatar + Name/ID + Badges */}
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
                {toTitleCase(name)}
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

          <Flex align="center" gap={2} flexShrink={0} ml={2}>
            {isInsured !== undefined && (
              <OSPBadge type={isInsured ? "success" : "danger"}>
                {isInsured ? "Insurable" : "Not Insurable"}
              </OSPBadge>
            )}
          </Flex>
        </Flex>

        {/* QUICK INFO CHIPS */}
        {homeAddress && (
          <Flex gap={2} wrap="wrap" mb={3}>
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
          </Flex>
        )}

        {contactNo && <ContactNumber contactNo={contactNo} />}
        {landlineNo && <ContactNumber contactNo={landlineNo} />}
        {email && (
          <Link href={`mailto:${email}`}>
            <Box
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

      {/* ============================= DESKTOP ============================= */}
      <Box
        display={{ base: "none", lg: "block" }}
        p={6}
        cursor={onToggle ? "pointer" : undefined}
        aria-expanded={onToggle ? isOpen : undefined}
        aria-controls={onToggle && contentId ? contentId : undefined}
        onKeyDown={handleKeyDown}
      >
        <Flex gap={6} align="stretch">
          {/* Identity — left */}
          <Flex
            direction="column"
            align="center"
            justify="center"
            textAlign="center"
            gap={3}
            w="210px"
            flexShrink={0}
          >
            <Box
              p="4px"
              borderRadius="full"
              border="2px solid"
              borderColor="var(--chakra-colors-primary-disabled)"
            >
              <Avatar.Root
                size="xl"
                bg="var(--chakra-colors-primary-disabled)/30"
              >
                <Avatar.Fallback
                  color="var(--chakra-colors-primary)"
                  fontWeight="semibold"
                  name={name}
                />
              </Avatar.Root>
            </Box>

            <Box>
              <Text fontWeight="bold" fontSize="lg" lineHeight="1.25">
                {toTitleCase(name)}
              </Text>
              {personId && (
                <Flex
                  align="center"
                  justify="center"
                  gap={1}
                  fontSize="xs"
                  color="gray.500"
                  mt={1}
                >
                  <LuHash size={12} />
                  <Text>{personId}</Text>
                </Flex>
              )}
            </Box>

            {isInsured !== undefined && (
              <OSPBadge type={isInsured ? "success" : "danger"}>
                {isInsured ? "Insurable" : "Not Insurable"}
              </OSPBadge>
            )}
          </Flex>

          {/* Contact info — right, fills the freed space */}
          <Box
            flex={1}
            minW={0}
            borderLeftWidth={1}
            borderColor="gray.100"
            pl={6}
          >
            <Text
              fontSize="2xs"
              fontWeight="semibold"
              color="gray.400"
              textTransform="uppercase"
              letterSpacing="wider"
              mb={3}
            >
              Contact Information
            </Text>

            {hasAnyContact ? (
              <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={2.5}>
                {addressLine && (
                  <GridItem colSpan={2}>
                    <ContactRow
                      icon={<LuMapPin size={16} />}
                      label="Home Address"
                      value={addressLine}
                      href={`https://maps.google.com/?q=${encodeURIComponent(homeAddress ?? "")}`}
                      tone="gray"
                    />
                  </GridItem>
                )}
                {contactNo && (
                  <GridItem colSpan={landlineNo ? 1 : 2}>
                    <ContactRow
                      icon={<LuSmartphone size={16} />}
                      label="Mobile"
                      value={formatPhone(contactNo)}
                      href={`tel:${contactNo.replace(/[^+\d]/g, "")}`}
                      tone="blue"
                    />
                  </GridItem>
                )}
                {landlineNo && (
                  <GridItem colSpan={contactNo ? 1 : 2}>
                    <ContactRow
                      icon={<LuPhone size={16} />}
                      label="Landline"
                      value={landlineNo}
                      href={`tel:${landlineNo.replace(/[^+\d]/g, "")}`}
                      tone="blue"
                    />
                  </GridItem>
                )}
                {email && (
                  <GridItem colSpan={2}>
                    <ContactRow
                      icon={<LuMail size={16} />}
                      label="Email"
                      value={email}
                      href={`mailto:${email}`}
                      tone="green"
                    />
                  </GridItem>
                )}
              </Grid>
            ) : (
              <Text fontSize="sm" color="gray.400">
                No contact information available.
              </Text>
            )}

            {actions && <Box mt={4}>{actions}</Box>}
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default ProfileHeaderCard;
