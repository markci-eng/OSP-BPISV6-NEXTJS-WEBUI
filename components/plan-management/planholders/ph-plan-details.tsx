"use client";
import {
  Box,
  Carousel,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Separator,
  Strong,
} from "@chakra-ui/react";
import { Body, PrimaryLgFlexButton, Small } from "st-peter-ui";
import {
  LuArrowLeft,
  LuArrowRight,
  LuMail,
  LuPhone,
  LuSmartphone,
} from "react-icons/lu";
import InfoItem from "../../common/info-item/info-item";
import { PlanholdersProps } from "./planholders.types";
import { ColumnDef } from "@tanstack/react-table";
import { PlanholderLookup } from "@/components/common/planholder-lookup/planholder-lookup.type";
import { ProgressCard } from "./cards/pending-request-card";
import { PlanholderInfoCard } from "./cards/planholder-info";
import { PlanholderAddressCard } from "./cards/planholder-address";
import { PhListOfPlans } from "./cards/ph-list-of-plans";

export function PhPlanDetails({ props }: { props: PlanholdersProps }) {
  const columns: ColumnDef<PlanholderLookup>[] = [
    {
      accessorKey: "lpaNumber",
      header: "LPA Number",
      enableColumnFilter: true,
      cell: (info) => <Small>{String(info.getValue())}</Small>,
    },
    {
      accessorKey: "planDescription",
      header: "Plan Description",
      enableColumnFilter: true,
      cell: (info) => <Small>{String(info.getValue())}</Small>,
    },
    {
      accessorKey: "mode",
      header: "Mode",
      enableColumnFilter: true,
      cell: (info) => <Small>{String(info.getValue())}</Small>,
    },
    {
      accessorKey: "effectivityDate",
      header: "Effectivity Date",
      enableColumnFilter: true,
      cell: (info) => (
        <Small>{new Date(String(info.getValue())).toLocaleDateString()}</Small>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      enableColumnFilter: true,
      cell: (info) => (
        <Small>{new Date(String(info.getValue())).toLocaleDateString()}</Small>
      ),
    },
    {
      accessorKey: "installmentNo",
      header: "Installment No.",
      enableColumnFilter: true,
      cell: (info) => <Small>{String(info.getValue())}</Small>,
    },
    {
      accessorKey: "balance",
      header: "Balance",
      enableColumnFilter: true,
      cell: (info) => <Small>{String(info.getValue())}</Small>,
    },

    {
      accessorKey: "accountStatus",
      header: "Account Status",
      enableColumnFilter: true,
      cell: (info) => (
        <Small color={String(info.getValue()) == "LAPSED" ? "red" : "gray.700"}>
          {String(info.getValue())}
        </Small>
      ),
    },
    {
      accessorKey: "terminationStatus",
      header: "Termination Status",
      enableColumnFilter: true,
      cell: (info) => (
        <Small
          color={
            String(info.getValue()) == "NOT YET TERMINATED" ? "gray.700" : "red"
          }
        >
          {String(info.getValue())}
        </Small>
      ),
    },
  ];

  return (
    <Grid gap={6} templateColumns={{ base: "1fr", lg: "2fr 1fr" }}>
      {/* MAIN CONTENT — Wider */}
      <GridItem>
        <PlanholderInfoCard planholder={props.planholderInfo} />
        <PlanholderAddressCard phAddress={props.planholderAddress} />
      </GridItem>

      {/* SIDEBAR — Narrow */}
      <GridItem>
        <Box my={5} p={5} boxShadow={"sm"} borderRadius={"md"}>
          <Strong fontSize={"md"} color={"var(--chakra-colors-primary)"}>
            Pending Request
          </Strong>
          <Separator my={2} />
          <Carousel.Root slideCount={2} maxW="full" mx="auto" gap="4">
            <Carousel.Control justifyContent="center" gap="4" width="full">
              <Carousel.PrevTrigger asChild>
                <IconButton size="xs" variant="outline">
                  <LuArrowLeft />
                </IconButton>
              </Carousel.PrevTrigger>

              <Carousel.ItemGroup width="full">
                <Carousel.Item index={0}>
                  <ProgressCard
                    current={3}
                    total={7}
                    title={"Reinstatement Application"}
                    description={"Payment received. Waiting for approval."}
                    transactionId="RI-202-6311"
                    onClick={() =>
                      (window.location.href = "/transaction/RI-202-6311")
                    }
                  />
                </Carousel.Item>
                <Carousel.Item index={1}>
                  <ProgressCard
                    current={2}
                    total={3}
                    title={"Transfer of Rights Application"}
                    description={"Payment received. Waiting for approval."}
                    transactionId="TF-202-6309"
                    onClick={() =>
                      (window.location.href = "/transaction/TF-202-6311")
                    }
                  />
                </Carousel.Item>
              </Carousel.ItemGroup>

              <Carousel.NextTrigger asChild>
                <IconButton size="xs" variant="outline">
                  <LuArrowRight />
                </IconButton>
              </Carousel.NextTrigger>
            </Carousel.Control>

            <Carousel.Indicators
              transition="width 0.2s ease-in-out"
              transformOrigin="center"
              opacity="0.5"
              boxSize="2"
              _current={{
                width: "10",
                bg: "colorPalette.subtle",
                opacity: 1,
              }}
            />
          </Carousel.Root>
        </Box>

        <Box width={"full"} my={5} p={5} boxShadow={"sm"} borderRadius={"md"}>
          <Flex justify={"space-between"}>
            <Strong fontSize={"md"} color={"var(--chakra-colors-primary)"}>
              Contact Information
            </Strong>
          </Flex>
          <Separator my={2} />
          <Flex align={"center"} mt={2} gap={3}>
            <Box>
              <LuMail size={24} color="#747474" />
            </Box>
            {props.planholderContact.filter(
              (contact) => contact.type == "Email",
            ).length > 0 ? (
              props.planholderContact
                .filter((contact) => contact.type == "Email")
                .map((cc, idx) => (
                  <Body key={idx} color={"gray.600"}>
                    {cc.value}
                  </Body>
                ))
            ) : (
              <Body color={"gray.600"}>Not Set</Body>
            )}
          </Flex>
          <Flex align={"center"} mt={2} gap={3}>
            <Box>
              <LuSmartphone size={24} color="#747474" />
            </Box>
            {props.planholderContact.filter(
              (contact) => contact.type == "MobileNo",
            ).length > 0 ? (
              props.planholderContact
                .filter((contact) => contact.type == "MobileNo")
                .map((cc, idx) => (
                  <Body key={idx} color={"gray.600"}>
                    {cc.value}
                  </Body>
                ))
            ) : (
              <Body color={"gray.600"}>Not Set</Body>
            )}
          </Flex>
          <Flex align={"center"} mt={2} gap={3}>
            <Box>
              <LuPhone size={24} color="#747474" />
            </Box>
            {props.planholderContact.filter(
              (contact) => contact.type == "LandlineNo",
            ).length > 0 ? (
              props.planholderContact
                .filter((contact) => contact.type == "LandlineNo")
                .map((cc, idx) => (
                  <Body key={idx} color={"gray.600"}>
                    {cc.value}
                  </Body>
                ))
            ) : (
              <Body color={"gray.600"}>Not Set</Body>
            )}
          </Flex>
        </Box>

        <Box width={"full"} mt={5} p={5} boxShadow={"sm"} borderRadius={"md"}>
          <Flex justify={"space-between"}>
            <Strong fontSize={"md"} color={"var(--chakra-colors-primary)"}>
              Employment Information
            </Strong>
          </Flex>
          <Separator my={2} />
          <Flex direction={"column"} align={"start"} mt={5} gap={5}>
            <InfoItem
              label="Employer"
              value={props.planholderInfo.employerName ?? "N/A"}
            />
            <InfoItem
              label="Tax Identification Number"
              value={props.planholderInfo.tin ?? "N/A"}
            />
            <InfoItem
              label="SSS/GSIS Number"
              value={props.planholderInfo.securityNo ?? "N/A"}
            />
            <InfoItem
              label="Source of Fund If Not Employed"
              value={props.planholderInfo.sourceOfFund ?? "N/A"}
            />
          </Flex>
        </Box>
      </GridItem>

      <GridItem colSpan={{ base: 1, lg: 2 }}>
        <PhListOfPlans />
      </GridItem>
    </Grid>
  );
}

export function computeAge(date: Date | null): string {
  if (date === null) return "";
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDay();

  const today = new Date();
  const birth = new Date(year, month - 1, day);

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  // borrow days from previous month
  if (days < 0) {
    months--;

    const prevMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0,
    ).getDate();

    days += prevMonth;
  }

  // borrow months from previous year
  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} YRS ${months} MOS ${days} DAYS`;
}
