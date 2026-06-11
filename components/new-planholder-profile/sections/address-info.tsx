import { Box, Flex, Grid, Separator, Strong, Text } from "@chakra-ui/react";
import { ImOffice } from "react-icons/im";
import { OSPBadge } from "@/components/common/badge/badge";
import { FaHome } from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import { EmptyState } from "../components/empty-state/empty-state";
import Card from "@/components/cards/Card";
import { SectionTitle } from "st-peter-ui";
import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";

export interface Address {
  id: string;
  addressType: string;
  addressNo: string | null;
  street: string | null;
  barangay: string | null;
  district: string | null;
  city: string;
  province: string;
  zipCode: number | null;
  isMailAddress?: boolean;
  personId?: string;
}

export function AddressCard({
  addressType,
  addressNo,
  street,
  barangay,
  district,
  city,
  province,
  zipCode,
  isMailAddress,
}: Address) {
  const isResidence = addressType === "RESIDENCE";

  const line1 = [addressNo, street].filter(Boolean).join(" ");
  const line2 = [barangay, district].filter(Boolean).join(", ");
  const line3 = [city, province].filter(Boolean).join(", ");

  const fullAddress = [line1, line2, line3, zipCode ? String(zipCode) : ""]
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
            {isMailAddress && (
              <OSPBadge type="info">Mail / Collect At</OSPBadge>
            )}
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
                px={2}
                py={1}
                borderRadius="full"
                border="1px solid"
                borderColor="gray.200"
                color="gray.400"
                fontSize="xs"
                fontWeight="medium"
                _hover={{
                  borderColor: "var(--chakra-colors-primary)",
                  color: "var(--chakra-colors-primary)",
                  bg: "var(--chakra-colors-primary-disabled)/10",
                }}
                transition="all 0.15s"
                cursor="pointer"
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
            {zipCode ? (
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
                {zipCode}
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
  phAddress: Address[] | undefined;
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
            <EmptyState
              title={"No Residence Address"}
              description={"No residence address available"}
            />
          ) : (
            phAddress
              ?.filter((address) => address.addressType === "RESIDENCE")
              .map((address, idx) => (
                <AddressCard
                  key={idx}
                  id={idx.toString()}
                  addressType={address.addressType}
                  addressNo={address.addressNo ?? ""}
                  street={address.street ?? ""}
                  barangay={
                    !address.barangay ? "" : "Brgy. " + address.barangay
                  }
                  district={
                    !address.district ? "" : "District " + address.district
                  }
                  city={address.city}
                  province={address.province}
                  zipCode={address.zipCode ?? 0}
                  isMailAddress={address.isMailAddress}
                />
              ))
          )}

          {(
            phAddress?.filter((address) => address.addressType === "OFFICE") ??
            []
          ).length === 0 ? (
            <EmptyState
              title={"No Office Address"}
              description={"No office address available"}
            />
          ) : (
            phAddress
              ?.filter((address) => address.addressType === "OFFICE")
              .map((address, idx) => (
                <AddressCard
                  key={idx}
                  id={idx.toString()}
                  addressType={address.addressType}
                  addressNo={address.addressNo ?? ""}
                  street={address.street ?? ""}
                  barangay={
                    !address.barangay ? "" : "Brgy. " + address.barangay
                  }
                  district={
                    !address.district ? "" : "District " + address.district
                  }
                  city={address.city}
                  province={address.province}
                  zipCode={address.zipCode ?? 0}
                  isMailAddress={address.isMailAddress}
                />
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
            <EmptyState
              title={"No Residence Address"}
              description={"No residence address available"}
            />
          ) : (
            phAddress
              ?.filter((address) => address.addressType === "RESIDENCE")
              .map((address, idx) => (
                <AddressCard
                  key={idx}
                  id={idx.toString()}
                  addressType={address.addressType}
                  addressNo={address.addressNo ?? ""}
                  street={address.street ?? ""}
                  barangay={
                    !address.barangay ? "" : "Brgy. " + address.barangay
                  }
                  district={
                    !address.district ? "" : "District " + address.district
                  }
                  city={address.city}
                  province={address.province}
                  zipCode={address.zipCode ?? 0}
                  isMailAddress={address.isMailAddress}
                />
              ))
          )}

          {(
            phAddress?.filter((address) => address.addressType === "OFFICE") ??
            []
          ).length === 0 ? (
            <EmptyState
              title={"No Office Address"}
              description={"No office address available"}
            />
          ) : (
            phAddress
              ?.filter((address) => address.addressType === "OFFICE")
              .map((address, idx) => (
                <AddressCard
                  key={idx}
                  id={idx.toString()}
                  addressType={address.addressType}
                  addressNo={address.addressNo ?? ""}
                  street={address.street ?? ""}
                  barangay={
                    !address.barangay ? "" : "Brgy. " + address.barangay
                  }
                  district={
                    !address.district ? "" : "District " + address.district
                  }
                  city={address.city}
                  province={address.province}
                  zipCode={address.zipCode ?? 0}
                  isMailAddress={address.isMailAddress}
                />
              ))
          )}
        </Grid>
      </InfoCardAccordion>
    );
  }
}
