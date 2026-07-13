import { Box, Flex, Grid, Separator, Text } from "@chakra-ui/react";
import { InfoItem } from "@splpi/summary";
import { IconType } from "react-icons";
import { BsReverseLayoutTextSidebarReverse } from "react-icons/bs";
import { FaRegCalendarDays, FaRegClock } from "react-icons/fa6";
import { FiDollarSign, FiLayers, FiTrendingDown } from "react-icons/fi";
import { LuHash } from "react-icons/lu";
import { MdOutlinePayment } from "react-icons/md";
import { PaymentRecordTable } from "../tables/payment-records-table";

export interface StatementOfAccountProps {
  lpaNumber: string;
  dueDate: Date;
  term: number;
  mode: string;
  installmentNumber: number;
  installmentAmount: number;
  totalAmountPayable: number;
  totalPayments: number;
  balance: number;
  terminationValue: number;
  paymentRecords: PhPaymentType[];
}

export interface PhPaymentType {
  lpaNumber: string;
  payClass: string;
  siNumber: string;
  siDate: Date;
  siAmount: number;
  planCode: string;
  installmentNumber: number;
  nextDueDate: Date;
  cvNumber: string;
  pcvNumber: string;
  auditDate: Date;
}

function formatPeso(amount: number) {
  return "₱ " + amount.toLocaleString("en-PH");
}

export function StatementOfAccount({
  props,
}: {
  props: StatementOfAccountProps;
}) {
  const progress = Math.min(
    100,
    Math.round((props.totalPayments / props.totalAmountPayable) * 100),
  );
  const nextDue = props.dueDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Box>
      {/* ── Desktop layout (md+) ── */}
      {/* <Box display={{ base: "none", md: "block" }}>
        <Grid
          templateColumns={{ md: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }}
          width="full"
          gap={4}
          my={4}
        >
          <HeaderCard
            Icon={FaRegCalendarDays}
            label="Due Date"
            value={props.dueDate.toLocaleDateString()}
          />
          <HeaderCard Icon={LuHash} label="Term" value={props.term + " YEARS"} />
          <HeaderCard Icon={FiLayers} label="Mode" value={props.mode ?? "N/A"} />
          <HeaderCard
            Icon={BsReverseLayoutTextSidebarReverse}
            label="Installment No."
            value={props.installmentNumber + " / " + props.term}
          />
          <HeaderCard
            Icon={MdOutlinePayment}
            label="Installment Amount"
            value={"₱ " + props.installmentAmount.toLocaleString()}
          />
        </Grid>
        <Grid
          templateColumns={{ md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
          width="full"
          gap={4}
          my={4}
        >
          <HeaderCard
            Icon={FiDollarSign}
            label="Total Amount Payable"
            value={"₱ " + props.totalAmountPayable.toLocaleString()}
          />
          <HeaderCard
            Icon={MdOutlinePayment}
            label="Total Payments"
            value={"₱ " + props.totalPayments.toLocaleString()}
          />
          <HeaderCard
            Icon={FiTrendingDown}
            label="Balance"
            value={"₱ " + props.balance.toLocaleString()}
          />
          <HeaderCard
            Icon={FaRegClock}
            label="Termination Value"
            value={"₱ " + props.terminationValue.toLocaleString()}
          />
        </Grid>
      </Box> */}

      {/* ── Mobile layout (base → md) ── */}
      <Box py={2}>
        {/* Progress card */}
        <Box
          bg="var(--chakra-colors-primary)"
          borderRadius="xl"
          p={5}
          mb={4}
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            right="-24px"
            top="-24px"
            w="110px"
            h="110px"
            borderRadius="full"
            bg="whiteAlpha.100"
            pointerEvents="none"
          />
          <Box
            position="absolute"
            right="40px"
            top="-44px"
            w="80px"
            h="80px"
            borderRadius="full"
            bg="whiteAlpha.100"
            pointerEvents="none"
          />

          <Flex direction="column" gap={4}>
            <Flex justify="space-between" align="flex-start" gap={4}>
              <Box>
                <Text
                  fontSize="10px"
                  color="whiteAlpha.700"
                  textTransform="uppercase"
                  letterSpacing="widest"
                  mb="2px"
                >
                  Total Paid
                </Text>
                <Text
                  fontSize="2xl"
                  fontWeight="extrabold"
                  color="white"
                  lineHeight="short"
                >
                  {formatPeso(props.totalPayments)}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.600" mt="2px">
                  of {formatPeso(props.totalAmountPayable)}
                </Text>
              </Box>
              <Box textAlign="right">
                <Text
                  fontSize="10px"
                  color="whiteAlpha.700"
                  textTransform="uppercase"
                  letterSpacing="widest"
                  mb="2px"
                >
                  Balance
                </Text>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="white"
                  lineHeight="short"
                >
                  {formatPeso(props.balance)}
                </Text>
              </Box>
            </Flex>

            <Box>
              <Flex justify="space-between" mb={1.5}>
                <Text fontSize="xs" color="whiteAlpha.800">
                  {props.installmentNumber} of {props.term} installments paid
                </Text>
                <Text fontSize="xs" color="white" fontWeight="bold">
                  {progress}%
                </Text>
              </Flex>
              <Box h="6px" borderRadius="full" bg="whiteAlpha.300">
                <Box
                  h="full"
                  borderRadius="full"
                  bg="white"
                  w={`${progress}%`}
                  transition="width 0.4s ease"
                />
              </Box>
            </Box>

            <Separator borderColor="whiteAlpha.200" />

            <Flex gap={6} flexWrap="wrap">
              <Box>
                <Text
                  fontSize="10px"
                  color="whiteAlpha.600"
                  textTransform="uppercase"
                  letterSpacing="widest"
                >
                  Next Due
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="white">
                  {nextDue}
                </Text>
              </Box>
              <Box>
                <Text
                  fontSize="10px"
                  color="whiteAlpha.600"
                  textTransform="uppercase"
                  letterSpacing="widest"
                >
                  Mode
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="white">
                  {props.mode}
                </Text>
              </Box>
              <Box>
                <Text
                  fontSize="10px"
                  color="whiteAlpha.600"
                  textTransform="uppercase"
                  letterSpacing="widest"
                >
                  Term
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="white">
                  {props.term} Year{props.term !== 1 ? "s" : ""}
                </Text>
              </Box>
              <Box>
                <Text
                  fontSize="10px"
                  color="whiteAlpha.600"
                  textTransform="uppercase"
                  letterSpacing="widest"
                >
                  Installment No.
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="white">
                  {props.installmentNumber} / {props.term}
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Box>

        {/* Financial summary cards */}
        <Grid templateColumns="repeat(2, 1fr)" gap={3} mb={4}>
          <FinancialCard
            icon={MdOutlinePayment}
            label="Installment Amount"
            value={formatPeso(props.installmentAmount)}
          />
          <FinancialCard
            icon={FiDollarSign}
            label="Total Payable"
            value={formatPeso(props.totalAmountPayable)}
          />
          <FinancialCard
            icon={FiTrendingDown}
            label="Balance"
            value={formatPeso(props.balance)}
            accent
          />
          <FinancialCard
            icon={FaRegClock}
            label="Termination Value"
            value={formatPeso(props.terminationValue)}
          />
        </Grid>
      </Box>

      <PaymentRecordTable payments={props.paymentRecords} />
    </Box>
  );
}

function HeaderCard({
  Icon,
  label,
  value,
}: {
  Icon: IconType;
  label: string;
  value: string;
}) {
  return (
    <Flex
      align="center"
      justify="justify-start"
      width="full"
      borderRadius="md"
      boxShadow="sm"
      p={4}
      gap={4}
    >
      <Icon size={25} color="var(--chakra-colors-primary)" />
      <InfoItem label={label} value={value} />
    </Flex>
  );
}

function FinancialCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: IconType;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Box
      borderRadius="xl"
      borderWidth={1}
      borderColor={
        accent ? "var(--chakra-colors-primary-disabled)" : "gray.100"
      }
      bg={accent ? "var(--chakra-colors-primary-disabled)/10" : "white"}
      p={4}
      boxShadow="sm"
    >
      <Flex align="center" gap={3}>
        <Box
          p={2}
          borderRadius="lg"
          bg={accent ? "var(--chakra-colors-primary-disabled)/30" : "gray.50"}
          flexShrink={0}
        >
          <Icon size={18} color="var(--chakra-colors-primary)" />
        </Box>
        <Box minW={0}>
          <Text
            fontSize="10px"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wider"
            mb="1px"
          >
            {label}
          </Text>
          <Text
            fontSize="sm"
            fontWeight="bold"
            color={accent ? "var(--chakra-colors-primary)" : "gray.800"}
            lineClamp={1}
          >
            {value}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
