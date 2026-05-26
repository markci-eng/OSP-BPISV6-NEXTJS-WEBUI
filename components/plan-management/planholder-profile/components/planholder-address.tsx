import {
  Box,
  EmptyState,
  Flex,
  Separator,
  Strong,
  VStack,
} from "@chakra-ui/react";
import { ImOffice } from "react-icons/im";
import { Body } from "st-peter-ui";
import { OSPBadge } from "@/components/common/badge/badge";
import { FaHome } from "react-icons/fa";
import { PlanholderAddressType } from "../planholder-profile-page";

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

export function PlanholderAddressCard({
  phAddress,
}: {
  phAddress: PlanholderAddressType[];
}) {
  return (
    <Box
      width={"full"}
      mt={5}
      p={5}
      boxShadow={"sm"}
      w={"full"}
      borderRadius={"md"}
    >
      <Flex justify={"space-between"}>
        <Strong fontSize={"md"} color={"var(--chakra-colors-primary)"}>
          Address Information
        </Strong>
      </Flex>
      <Separator my={2} />
      <Flex direction={"column"} gap={4} mb={"70px"}>
        {phAddress
          .filter((address) => address.addressType == "RESIDENCE")
          .map((address, idx) => (
            <AddressCard
              key={idx}
              id={idx.toString()}
              addressType={address.addressType}
              addressNo={address.addressNo ?? ""}
              street={address.street ?? ""}
              barangay={!address.barangay ? "" : "BARANGAY " + address.barangay}
              district={!address.district ? "" : "DISTRICT " + address.district}
              city={address.city}
              province={address.province}
              zipCode={address.zipCode?.toString() ?? ""}
              isMailAddress
            />
          ))}

        {phAddress
          .filter((address) => address.addressType == "OFFICE")
          .map((address, idx) => (
            <AddressCard
              key={idx}
              id={idx.toString()}
              addressType={address.addressType}
              addressNo={address.addressNo ?? ""}
              street={address.street ?? ""}
              barangay={!address.barangay ? "" : "BARANGAY " + address.barangay}
              district={!address.district ? "" : "DISTRICT " + address.district}
              city={address.city}
              province={address.province}
              zipCode={address.zipCode?.toString() ?? ""}
              isMailAddress
            />
          ))}
      </Flex>
    </Box>
  );
}
