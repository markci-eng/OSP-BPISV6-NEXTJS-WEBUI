import { OSPBadge } from "@/components/common/badge/badge";
import { Box, EmptyState, Flex, Strong, VStack } from "@chakra-ui/react";
import { FaHome } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { ImOffice } from "react-icons/im";
import { IoAddCircle } from "react-icons/io5";
import { Body } from "st-peter-ui";

interface Address {
  id: string;
  addressType: string;
  addressNo: string;
  street: string;
  barangay: string;
  district: string;
  city: string;
  province: string;
  zipCode: string;
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
      gap={4}
      padding={5}
      boxShadow={"sm"}
      borderRadius={"xl"}
    >
      <Box
        p={4}
        borderRadius={"xl"}
        bg={"var(--chakra-colors-primary-disabled)/30"}
      >
        {addressType === "RESIDENCE" ? (
          <FaHome color="var(--chakra-colors-primary)" size={25} />
        ) : (
          <ImOffice color="var(--chakra-colors-primary)" size={25} />
        )}
      </Box>
      <Box>
        <Flex gap={3}>
          <Strong color={"gray.700"}>
            {addressType === "RESIDENCE" ? "Home" : "Office"}
          </Strong>
          {isMailAddress ? (
            <OSPBadge type="info">Mail / Collect At</OSPBadge>
          ) : (
            ""
          )}
        </Flex>
        <Body mt={3}>
          {(!addressNo ? "" : addressNo + " ") +
            (!street ? "" : street + " ") +
            (!barangay ? "" : barangay + " ") +
            (!district ? "" : district + " ")}
        </Body>
        <Body>
          {(!city ? "" : city + " ") +
            (!province ? "" : province) +
            (!zipCode ? "" : ", " + zipCode + " ")}
        </Body>
      </Box>
    </Flex>
  );
}

export function AddAddressCard() {
  return (
    <EmptyState.Root
      border={"2px dashed"}
      borderColor={"gray.300"}
      borderRadius={"xl"}
      bg={"gray.50"}
    >
      <EmptyState.Content>
        <EmptyState.Indicator>
          <IoAddCircle color="var(--chakra-colors-primary-disabled)" />
        </EmptyState.Indicator>
        <VStack textAlign="center">
          <EmptyState.Title>Add New Address</EmptyState.Title>
        </VStack>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}
