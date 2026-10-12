import { Box, Flex, Grid, Separator, Strong, Text } from "@chakra-ui/react";
import { ImOffice } from "react-icons/im";
import { OSPBadge } from "osp-ui-kit";
import { FaHome } from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import { EmptyStateCard, InfoCardAccordion } from "osp-ui-kit";
import { AddressInfo } from "@/types/plan-management.types";

export function AddressCard({ address }: { address: AddressInfo }) {
  const isResidence = address.addressType === "RESIDENCE";

  const line1 = [address.addNo, address.street].filter(Boolean).join(" ");
  const line2 = [address.barangay, address.district].filter(Boolean).join(", ");
  const line3 = [address.city, address.province].filter(Boolean).join(", ");

  const fullAddress = [
    line1,
    line2,
    line3,
    address.zipCode ? String(address.zipCode) : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Box
      borderRadius="xl"
      borderWidth={1}
      borderColor="gray.100"
      bg="white"
      boxShadow="sm"
      overflow="hidden"
    >
      {/* Header */}
      <Flex align="center" gap={3} px={4} pt={4} pb={3}>
        <Box
          p={2.5}
          borderRadius="lg"
          bg="var(--chakra-colors-primary-disabled)/20"
          flexShrink={0}
        >
          {isResidence ? (
            <FaHome color="var(--chakra-colors-primary)" size={17} />
          ) : (
            <ImOffice color="var(--chakra-colors-primary)" size={17} />
          )}
        </Box>

        <Box flex={1} minW={0}>
          <Flex align="center" gap={2} flexWrap="wrap">
            <Strong fontSize="sm" color="gray.800">
              {isResidence ? "Home Address" : "Office Address"}
            </Strong>
            {address.isPrimary && <OSPBadge type="danger">Primary</OSPBadge>}
          </Flex>
          <Text fontSize="xs" color="gray.400" mt="1px">
            {isResidence ? "Residential" : "Business"} address on record
          </Text>
        </Box>

        {/* Open in Maps link */}
        {fullAddress && (
          <Box flexShrink={0}>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                px={2.5}
                py={1}
                borderRadius="full"
                border="1px solid"
                borderColor="rgba(255,255,255,0.55)"
                color="var(--chakra-colors-primary)"
                fontSize="xs"
                fontWeight="semibold"
                cursor="pointer"
                userSelect="none"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.10) 100%), var(--chakra-colors-primary-disabled)/50",
                  boxShadow:
                    "inset 0 1.5px 0 rgba(255,255,255,0.80), inset 0 -0.5px 0 rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.08)",
                  backdropFilter: "blur(12px) saturate(160%)",
                  WebkitBackdropFilter: "blur(12px) saturate(160%)",
                  transition:
                    "background 0.22s ease, box-shadow 0.22s ease, transform 0.14s ease",
                }}
                _hover={{
                  bg: "linear-gradient(160deg, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.18) 100%), var(--chakra-colors-primary-disabled)/70",
                  boxShadow:
                    "inset 0 1.5px 0 rgba(255,255,255,0.90), inset 0 -0.5px 0 rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.12)",
                }}
                _active={{ transform: "scale(0.92)" }}
              >
                <LuMapPin size={11} />
                <Text as="span" fontSize="10px">
                  Map
                </Text>
              </Box>
            </a>
          </Box>
        )}
      </Flex>

      <Separator borderColor="gray.100" />

      {/* Address body */}
      <Flex align="flex-start" gap={3} px={4} py={3}>
        <Box color="gray.400" mt="3px" flexShrink={0}>
          <LuMapPin size={13} />
        </Box>
        <Flex direction="column" gap="2px">
          {line1 && (
            <Text fontSize="sm" color="gray.700" fontWeight="medium">
              {line1}
            </Text>
          )}
          {line2 && (
            <Text fontSize="sm" color="gray.500">
              {line2}
            </Text>
          )}
          <Flex align="center" gap={2} mt="2px" flexWrap="wrap">
            <Text fontSize="sm" color="gray.500">
              {line3 || "—"}
            </Text>
            {address.zipCode ? (
              <Box
                px={1.5}
                py="1px"
                bg="gray.100"
                borderRadius="md"
                fontSize="xs"
                color="gray.500"
                fontWeight="semibold"
                letterSpacing="wide"
              >
                {address.zipCode}
              </Box>
            ) : null}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}

export function PlanholderAddressCard({
  phAddress,
  noBorder = false,
  isOpen,
  onToggle,
}: {
  phAddress: AddressInfo[] | undefined;
  noBorder?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  if (noBorder) {
    return (
      <Box>
        <Strong>Address Information</Strong>
        <Separator mb={3} />
        <Grid gap={4} templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}>
          {(
            phAddress?.filter(
              (address) => address.addressType === "RESIDENCE",
            ) ?? []
          ).length === 0 ? (
            <EmptyStateCard
              title={"No Residence Address"}
              description={"No residence address available"}
            />
          ) : (
            phAddress
              ?.filter((address) => address.addressType === "RESIDENCE")
              .map((address, idx) => (
                <AddressCard key={idx} address={address} />
              ))
          )}

          {(
            phAddress?.filter((address) => address.addressType === "OFFICE") ??
            []
          ).length === 0 ? (
            <EmptyStateCard
              title={"No Office Address"}
              description={"No office address available"}
            />
          ) : (
            phAddress
              ?.filter((address) => address.addressType === "OFFICE")
              .map((address, idx) => (
                <AddressCard key={idx} address={address} />
              ))
          )}
        </Grid>
      </Box>
    );
  } else {
    return (
      <InfoCardAccordion
        icon={<LuMapPin />}
        title={"Address Information"}
        subtitle="Address Information"
        defaultOpen
        isOpen={isOpen}
        onToggle={onToggle}
      >
        <Grid gap={4} templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}>
          {(
            phAddress?.filter(
              (address) => address.addressType === "RESIDENCE",
            ) ?? []
          ).length === 0 ? (
            <EmptyStateCard
              title={"No Residence Address"}
              description={"No residence address available"}
            />
          ) : (
            phAddress
              ?.filter((address) => address.addressType === "RESIDENCE")
              .map((address, idx) => (
                <AddressCard key={idx} address={address} />
              ))
          )}

          {(
            phAddress?.filter((address) => address.addressType === "OFFICE") ??
            []
          ).length === 0 ? (
            <EmptyStateCard
              title={"No Office Address"}
              description={"No office address available"}
            />
          ) : (
            phAddress
              ?.filter((address) => address.addressType === "OFFICE")
              .map((address, idx) => (
                <AddressCard key={idx} address={address} />
              ))
          )}
        </Grid>
      </InfoCardAccordion>
    );
  }
}
