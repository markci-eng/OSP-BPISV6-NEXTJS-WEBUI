import {
  Flex,
  Strong,
  Avatar,
  Grid,
  Badge,
  useBreakpointValue,
  Show,
} from "@chakra-ui/react";
import React from "react";
import { FaUser, FaTrash } from "react-icons/fa";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { IoMdPersonAdd } from "react-icons/io";
import { Box, Small } from "st-peter-ui";
import { EmptyState } from "../components/empty-state/empty-state";
import InfoItem from "../components/info-item/info-item";

export interface BeneficiaryProps {
  personId: string;
  lpaNumber: string;
  beneficiaryClass: "PRINCIPAL" | "CONTINGENT";
  lastName: string;
  firstName: string;
  middleInitial: string;
  relationship: string;
  age: number;
  address: string;
}

export function Beneficiaries({
  beneficiaries,
}: {
  beneficiaries: BeneficiaryProps[];
}) {
  const principalBeneficiaries = beneficiaries?.filter(
    (b) => b.beneficiaryClass === "PRINCIPAL",
  );
  const contingentBeneficiaries = beneficiaries?.filter(
    (b) => b.beneficiaryClass === "CONTINGENT",
  );
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <React.Fragment>
      <Box width={"full"}>
        <Box
          my={3}
          w={"full"}
          borderRadius={"lg"}
          borderWidth={1}
          borderColor={isMobile ? "transparent" : "gray.300"}
          p={isMobile ? 0 : 5}
        >
          <Flex align={"center"} gap={3} mb={3}>
            <Box
              p={4}
              borderRadius={"xl"}
              bg={"var(--chakra-colors-primary-disabled)/30"}
            >
              <FaUser
                color="var(--chakra-colors-primary)"
                size={isMobile ? 15 : 25}
              />
            </Box>
            <Flex direction={"column"}>
              <Strong>
                Principal Beneficiaries{" "}
                {principalBeneficiaries &&
                  principalBeneficiaries.length > 0 && (
                    <Badge
                      size={isMobile ? "sm" : "md"}
                      bg={"var(--chakra-colors-danger-hover)"}
                      color={"white"}
                    >
                      {principalBeneficiaries.length}
                    </Badge>
                  )}
              </Strong>
              <Small>Receive benefits first</Small>
            </Flex>
          </Flex>
          {!principalBeneficiaries ||
            (principalBeneficiaries && principalBeneficiaries.length === 0 && (
              <EmptyState
                title={"No Principal Beneficiaries"}
                description={"Click Add Principal Beneficiary button below."}
              />
            ))}

          {principalBeneficiaries &&
            principalBeneficiaries.map((beneficiary) => (
              <Flex
                key={beneficiary.personId}
                my={2}
                w={"full"}
                borderRadius={"xl"}
                borderWidth={1}
                borderColor={"gray.300"}
                justify={"space-between"}
                p={5}
              >
                <Flex gap={3} align={"center"}>
                  <Show when={!isMobile}>
                    <Avatar.Root>
                      <Avatar.Fallback
                        name={
                          beneficiary.firstName + " " + beneficiary.lastName
                        }
                      />
                    </Avatar.Root>
                  </Show>
                  <Grid
                    w={"full"}
                    p={1}
                    templateColumns={{
                      base: "1fr",
                      md: "repeat(4, 1fr)",
                    }}
                    gap={isMobile ? 1 : 8}
                    justifyItems={"space-between"}
                  >
                    <InfoItem
                      label="Name"
                      value={
                        beneficiary.firstName +
                        " " +
                        beneficiary.middleInitial +
                        ". " +
                        beneficiary.lastName
                      }
                    />
                    <InfoItem
                      label="Relationship"
                      value={beneficiary.relationship}
                    />
                    <InfoItem label="Age" value={beneficiary.age.toString()} />
                    <InfoItem label="Address" value={beneficiary.address} />
                  </Grid>
                </Flex>
                <Flex align={"center"} gap={"3"}>
                  <HiOutlinePencilAlt size={20} color="#444" />
                  <FaTrash color="#db4b4bff" />
                </Flex>
              </Flex>
            ))}
          <Flex
            my={2}
            w={"full"}
            borderRadius={"lg"}
            borderWidth={1}
            borderColor={"gray.300"}
            justify={"center"}
            p={5}
            align={"center"}
          >
            <Box mx={2}>
              <IoMdPersonAdd />
            </Box>
            Add Principal Beneficiary
          </Flex>
        </Box>
        <Box
          my={3}
          w={"full"}
          borderRadius={"lg"}
          borderWidth={1}
          borderColor={isMobile ? "transparent" : "gray.300"}
          p={isMobile ? 0 : 5}
        >
          <Flex align={"center"} gap={3} mb={3}>
            <Box
              p={4}
              borderRadius={"xl"}
              bg={"var(--chakra-colors-primary-disabled)/30"}
            >
              <FaUser
                color="var(--chakra-colors-primary)"
                size={isMobile ? 15 : 25}
              />
            </Box>
            <Flex direction={"column"}>
              <Strong>
                Contingent Beneficiaries{" "}
                {contingentBeneficiaries &&
                  contingentBeneficiaries.length > 0 && (
                    <Badge
                      size={"md"}
                      bg={"var(--chakra-colors-danger-hover)"}
                      color={"white"}
                    >
                      {contingentBeneficiaries.length}
                    </Badge>
                  )}
              </Strong>
              <Small>Receive benefits if principal is unavailable</Small>
            </Flex>
          </Flex>

          {!contingentBeneficiaries ||
            (contingentBeneficiaries &&
              contingentBeneficiaries.length === 0 && (
                <EmptyState
                  title={"No Contingent Beneficiaries"}
                  description={"Click Add Contingent Beneficiary button below."}
                />
              ))}

          {contingentBeneficiaries &&
            contingentBeneficiaries.map((beneficiary) => (
              <Flex
                key={beneficiary.personId}
                my={2}
                w={"full"}
                borderRadius={"xl"}
                borderWidth={1}
                borderColor={"gray.300"}
                justify={"space-between"}
                p={5}
              >
                <Flex gap={3} align={"center"}>
                  <Avatar.Root>
                    <Avatar.Fallback
                      name={beneficiary.firstName + " " + beneficiary.lastName}
                    />
                  </Avatar.Root>
                  <Grid
                    w={"full"}
                    p={1}
                    templateColumns={{
                      base: "2fr",
                      md: "repeat(4, 1fr)",
                    }}
                    gap={8}
                    justifyItems={"space-between"}
                  >
                    <InfoItem
                      label="Name"
                      value={
                        beneficiary.firstName +
                        " " +
                        beneficiary.middleInitial +
                        ". " +
                        beneficiary.lastName
                      }
                    />
                    <InfoItem
                      label="Relationship"
                      value={beneficiary.relationship}
                    />
                    <InfoItem label="Age" value={beneficiary.age.toString()} />
                    <InfoItem label="Address" value={beneficiary.address} />
                  </Grid>
                </Flex>
                <Flex align={"center"} gap={"3"}>
                  <HiOutlinePencilAlt size={20} color="#444" />
                  <FaTrash color="#db4b4bff" />
                </Flex>
              </Flex>
            ))}
          <Flex
            my={2}
            w={"full"}
            borderRadius={"lg"}
            borderWidth={1}
            borderColor={"gray.300"}
            justify={"center"}
            p={5}
            align={"center"}
          >
            <Box mx={2}>
              <IoMdPersonAdd />
            </Box>
            Add Contingent Beneficiary
          </Flex>
        </Box>
      </Box>
    </React.Fragment>
  );
}
