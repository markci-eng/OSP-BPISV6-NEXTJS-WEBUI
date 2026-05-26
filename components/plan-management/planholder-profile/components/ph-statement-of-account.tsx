import { Box, Flex, Grid } from "@chakra-ui/react";
import { InfoItem } from "@splpi/summary";
import { IconBaseProps, IconType } from "react-icons";
import { BsReverseLayoutTextSidebarReverse } from "react-icons/bs";
import { FaRegCalendarDays, FaRegClock } from "react-icons/fa6";
import { FiDollarSign, FiLayers, FiTrendingDown } from "react-icons/fi";
import { LuHash } from "react-icons/lu";
import { MdOutlinePayment } from "react-icons/md";
import { PhPaymentRecordTable } from "./tables/ph-payment-records-table";
import { PhStatementOfAccountType } from "../planholder-profile-page";

export function StatementOfAccount({
  props,
}: {
  props: PhStatementOfAccountType;
}) {
  return (
    <Box>
      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(5, 1fr)",
        }}
        width={"full"}
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
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        width={"full"}
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
      <PhPaymentRecordTable payments={props.paymentRecords} />
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
      align={"center"}
      justify={"justify-start"}
      width={"full"}
      borderRadius={"md"}
      boxShadow={"sm"}
      p={4}
      gap={4}
    >
      {<Icon size={25} color="var(--chakra-colors-primary)" />}
      <InfoItem label={label} value={value} />
    </Flex>
  );
}
