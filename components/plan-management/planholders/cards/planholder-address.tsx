import {
  Box,
  EmptyState,
  Flex,
  Separator,
  Strong,
  VStack,
} from "@chakra-ui/react";
import { AddAddressCard, AddressCard } from "./address-card";
import { PlanholderAddressType } from "../planholders.types";
import { ImOffice } from "react-icons/im";

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
      <Flex direction={"column"} gap={4} mb={"77px"}>
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
      </Flex>
    </Box>
  );
}
