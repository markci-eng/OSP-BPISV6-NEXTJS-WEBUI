import { Box, Flex, Grid, Separator, Strong, VStack } from "@chakra-ui/react";
import { ImOffice } from "react-icons/im";
import { Body } from "st-peter-ui";
import { OSPBadge } from "@/components/common/badge/badge";
import { FaBuilding, FaHome } from "react-icons/fa";
import { EmptyState } from "../components/empty-state/empty-state";
import { IconBaseProps } from "react-icons";
import Card from "@/components/cards/Card";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { STANDARD_RADIUS } from "@/lib/theme/standard-design-tokens";

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
}

export function AddressCard({
  id,
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
  return (
    <Flex
      align={"start"}
      justify={"justify-start"}
      gap={{ base: 3, md: 4 }}
      padding={{ base: 3, md: 4 }}
      border={"1px solid"}
      borderColor={"gray.200"}
      borderRadius={STANDARD_RADIUS.md}
      minW={0}
    >
      <Box
        p={3}
        borderRadius={STANDARD_RADIUS.md}
        bg={BRAND_COLORS.successBg}
        flexShrink={0}
      >
        {addressType === "RESIDENCE" ? (
          <FaHome color={BRAND_COLORS.primaryGreen} size={22} />
        ) : (
          <ImOffice color={BRAND_COLORS.primaryGreen} size={22} />
        )}
      </Box>
      <Box minW={0}>
        <Flex gap={2} wrap="wrap">
          <Strong color={"gray.700"}>
            {addressType === "RESIDENCE" ? "Home" : "Office"}
          </Strong>
          {isMailAddress ? (
            <OSPBadge type="info">Mail / Collect At</OSPBadge>
          ) : (
            ""
          )}
        </Flex>
        <Body mt={3} wordBreak="break-word" overflowWrap="anywhere">
          {(!addressNo ? "" : addressNo + " ") +
            (!street ? "" : street + " ") +
            (!barangay ? "" : barangay + " ") +
            (!district ? "" : district + " ")}
        </Body>
        <Body wordBreak="break-word" overflowWrap="anywhere">
          {(!city ? "" : city + " ") +
            (!province ? "" : province) +
            (!zipCode ? "" : ", " + zipCode + " ")}
        </Body>
      </Box>
    </Flex>
  );
}

export function PlanholderAddressCard({
  phAddress,
}: {
  phAddress: Address[] | undefined;
}) {
  return (
    <Card.Root title={"Address Information"}>
      <Card.MainContent>
        <Grid gap={4} templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}>
          {(
            phAddress?.filter(
              (address) => address.addressType == "RESIDENCE",
            ) ?? []
          ).length === 0 ? (
            <EmptyState
              title={"No Residence Address"}
              description={"No residence address available"}
            />
          ) : (
            phAddress
              ?.filter((address) => address.addressType == "RESIDENCE")
              .map((address, idx) => (
                <AddressCard
                  key={idx}
                  id={idx.toString()}
                  addressType={address.addressType}
                  addressNo={address.addressNo ?? ""}
                  street={address.street ?? ""}
                  barangay={
                    !address.barangay ? "" : "BARANGAY " + address.barangay
                  }
                  district={
                    !address.district ? "" : "DISTRICT " + address.district
                  }
                  city={address.city}
                  province={address.province}
                  zipCode={address.zipCode ?? 0}
                  isMailAddress={address.isMailAddress}
                />
              ))
          )}

          {(
            phAddress?.filter((address) => address.addressType == "OFFICE") ??
            []
          ).length === 0 ? (
            <EmptyState
              title={"No Office Address"}
              description={"No office address available"}
            />
          ) : (
            phAddress
              ?.filter((address) => address.addressType == "OFFICE")
              .map((address, idx) => (
                <AddressCard
                  key={idx}
                  id={idx.toString()}
                  addressType={address.addressType}
                  addressNo={address.addressNo ?? ""}
                  street={address.street ?? ""}
                  barangay={
                    !address.barangay ? "" : "BARANGAY " + address.barangay
                  }
                  district={
                    !address.district ? "" : "DISTRICT " + address.district
                  }
                  city={address.city}
                  province={address.province}
                  zipCode={address.zipCode ?? 0}
                  isMailAddress
                />
              ))
          )}
        </Grid>
      </Card.MainContent>
    </Card.Root>
  );
}
