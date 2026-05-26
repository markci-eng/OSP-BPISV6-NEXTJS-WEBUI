import { Box, Flex, Grid } from "@chakra-ui/react";
import { InfoItem } from "@splpi/summary";
import { IconBaseProps, IconType } from "react-icons";
import { BsReverseLayoutTextSidebarReverse } from "react-icons/bs";
import { FaRegCalendarDays, FaRegClock } from "react-icons/fa6";
import { FiDollarSign, FiLayers, FiTrendingDown } from "react-icons/fi";
import { LuCalendar, LuHash } from "react-icons/lu";
import { MdOutlinePayment } from "react-icons/md";
import { PlanholderListTable } from "./tables/planholder-list-table";
import { PhPaymentRecordTable } from "./tables/ph-payment-records-table";

export function StatementOfAccount() {
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
          value="03/09/2026"
        />
        <HeaderCard Icon={LuHash} label="Term" value="5 YEARS" />
        <HeaderCard Icon={FiLayers} label="Mode" value="QUARTERLY" />
        <HeaderCard
          Icon={BsReverseLayoutTextSidebarReverse}
          label="Installment No."
          value="2 / 20"
        />
        <HeaderCard
          Icon={MdOutlinePayment}
          label="Installment Amount"
          value="₱ 2,915.00"
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
          value="₱ 58,300.00"
        />
        <HeaderCard
          Icon={MdOutlinePayment}
          label="Total Payments"
          value="₱ 5,830.00"
        />
        <HeaderCard Icon={FiTrendingDown} label="Balance" value="₱ 52,470.00" />
        <HeaderCard
          Icon={FaRegClock}
          label="Termination Value"
          value="₱ 418.01"
        />
      </Grid>
      <PhPaymentRecordTable />
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
