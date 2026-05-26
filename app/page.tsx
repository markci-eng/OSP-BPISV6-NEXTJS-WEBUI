"use client";
import { OSPBadge } from "@/components/common/badge/badge";
import { Chart, useChart } from "@chakra-ui/charts";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Menu,
  Portal,
  Progress,
  ScrollArea,
  Separator,
  Strong,
  Tabs,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import { LuArrowDown, LuArrowUp } from "react-icons/lu";
import {
  RiEye2Line,
  RiEyeCloseLine,
  RiUserFollowLine,
  RiUserForbidLine,
  RiUserShared2Line,
  RiUserUnfollowLine,
} from "react-icons/ri";
import { Tooltip as ToolTip } from "@/components/ui/tooltip";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Body, H3, H4, Small } from "st-peter-ui";
import {
  planholders,
  quotaAndCollections,
  agentLeaderboards,
  monthlyNewSales,
} from "./dashboard-data";
import { useState } from "react";
import { Page } from "@/components/page/page";

export default function Dashboard() {
  const [isIncomeVisible, setIncomeVisible] = useState(true);
  const [year, setYear] = useState("2026");

  const chart = useChart({
    data: monthlyNewSales.find((y) => y.year === year)?.data ?? [],
    series: [{ name: "value", color: "var(--chakra-colors-primary)" }],
  });

  const breadItem = [{ label: "Home >" }];

  return (
    <Page
      title="Dashboard"
      description="Real-time monitoring of critical business metrics."
      breadcrumbItems={breadItem}
    >
      {localStorage.getItem("user") == "sales-agent" && (
        <Flex
          mt={5}
          bg={"white"}
          borderRadius={"md"}
          boxShadow={"sm"}
          px={5}
          py={3}
          justify={"space-between"}
          align={"center"}
        >
          <H4>Hi, Senen Sawit Jr.!</H4>
          <Flex direction={"column"}>
            <Small>Your income for this month</Small>
            <Flex align={"center"} justify={"end"} gapX={3}>
              <H4 style={{ userSelect: "none" }}>
                {isIncomeVisible
                  ? "PHP 2,235.00"
                  : "PHP 2,235.00".replace(/./g, "*")}
              </H4>
              {isIncomeVisible ? (
                <RiEye2Line
                  onClick={() => setIncomeVisible(false)}
                  cursor={"pointer"}
                />
              ) : (
                <RiEyeCloseLine
                  onClick={() => setIncomeVisible(true)}
                  cursor={"pointer"}
                />
              )}
            </Flex>
          </Flex>
        </Flex>
      )}

      <Grid
        templateColumns={{
          base: "1fr",
          lg: `repeat(2, 1fr)`,
          xl: `repeat(4, 1fr)`,
        }}
        gap={4}
        mt={5}
      >
        <TileItem
          Icon={RiUserShared2Line}
          title={"New Sales"}
          value={planholders.newSales.toLocaleString()}
          prevVal={planholders.prevNewSales.toLocaleString()}
          monthOverMonthPercentage={
            ((planholders.newSales - planholders.prevNewSales) /
              planholders.prevNewSales) *
            100
          }
        />
        <TileItem
          Icon={RiUserFollowLine}
          title={"Active Accounts"}
          value={"12.1k"}
          prevVal={planholders.prevActiveAccounts.toLocaleString()}
          monthOverMonthPercentage={
            ((planholders.activeAccounts - planholders.prevActiveAccounts) /
              planholders.prevActiveAccounts) *
            100
          }
        />
        <TileItem
          Icon={RiUserForbidLine}
          title={"Lapsed Accounts"}
          value={"7.3k"}
          prevVal={planholders.prevLapsedAccounts.toLocaleString()}
          order="desc"
          monthOverMonthPercentage={
            ((planholders.lapsedAccounts - planholders.prevLapsedAccounts) /
              planholders.prevLapsedAccounts) *
            100
          }
        />
        <TileItem
          Icon={RiUserUnfollowLine}
          title={"Terminated Accounts"}
          value={"24.7k"}
          order="desc"
          prevVal={planholders.prevTerminatedAccounts.toLocaleString()}
          monthOverMonthPercentage={
            ((planholders.terminatedAccounts -
              planholders.prevTerminatedAccounts) /
              planholders.prevTerminatedAccounts) *
            100
          }
        />
      </Grid>

      <Box bg={"white"} py={5}>
        {/* <Strong color={"gray.700"}>Quota and Collection</Strong> */}
        <H4>Efficiency</H4>
        <Grid
          mt={3}
          templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }}
          gap={4}
          alignItems="stretch"
        >
          <Box bg="white" borderRadius="md" boxShadow="sm" p={5} h="full">
            <Strong color={"gray.700"}>Quota and Collection</Strong>
            <Box my={5}>
              <Small color="gray.500">Quota Commissionable Accounts</Small>
              <Strong fontSize="xl" color="gray.700">
                ₱{" "}
                {quotaAndCollections.comQuota.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Strong>
            </Box>
            <Box mb={5}>
              <Small color="gray.500">Commissionable Collection</Small>
              <Strong fontSize="xl" color="gray.700">
                ₱{" "}
                {quotaAndCollections.comCollection.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Strong>
            </Box>
            <Separator mb={5} />
            <Box mb={5}>
              <Small color="gray.500">Non-Commissionable Quota</Small>
              <Strong fontSize="xl" color="gray.700">
                ₱{" "}
                {quotaAndCollections.nComQuota.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Strong>
            </Box>
            <Box mb={5}>
              <Small color="gray.500">Non-Commissionable Collection</Small>
              <Strong fontSize="xl" color="gray.700">
                ₱{" "}
                {quotaAndCollections.nComCollection.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Strong>
            </Box>
          </Box>

          <Box bg="white" borderRadius="md" boxShadow="sm" p={5} h="full">
            <Strong color={"gray.700"}>Accounts Due and Collected</Strong>
            <Box my={5}>
              <Small color="gray.500">Due Commissionable Accounts</Small>
              <Strong fontSize="xl" color="gray.700">
                {quotaAndCollections.comAcctDue}
              </Strong>
            </Box>
            <Box my={5}>
              <Small color="gray.500">Commissionable Accounts Collected</Small>
              <Strong fontSize="xl" color="gray.700">
                {quotaAndCollections.comAcctCollection}
              </Strong>
            </Box>
            <Separator mb={5} />
            <Box mb={5}>
              <Small color="gray.500">Due Non-Commissionable Accounts</Small>
              <Strong fontSize="xl" color="gray.700">
                {quotaAndCollections.nComAcctDue}
              </Strong>
            </Box>
            <Box mt={5}>
              <Small color="gray.500">
                Non-Commissionable Accounts Collected
              </Small>
              <Strong fontSize="xl" color="gray.700">
                {quotaAndCollections.nComAcctCollection}
              </Strong>
            </Box>
          </Box>

          <Box bg="white" borderRadius="md" boxShadow="sm" p={5} h="full">
            <Grid
              templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
              mt={5}
              gap={3}
            >
              <EfficiencyDonutChart
                title={"ADE Com"}
                quota={quotaAndCollections.comAcctDue}
                collection={quotaAndCollections.comAcctCollection}
                passingRate={50}
              />
              <EfficiencyDonutChart
                title={"ADE NCom"}
                quota={quotaAndCollections.nComAcctDue}
                collection={quotaAndCollections.nComAcctCollection}
                passingRate={50}
              />
              <EfficiencyDonutChart
                title={"CVE Com"}
                quota={quotaAndCollections.comQuota}
                collection={quotaAndCollections.comCollection}
                passingRate={50}
              />
              <EfficiencyDonutChart
                title={"CVE NCom"}
                quota={quotaAndCollections.nComQuota}
                collection={quotaAndCollections.nComCollection}
                passingRate={50}
              />
            </Grid>
          </Box>
        </Grid>
        {/* <Grid
          mt={3}
          templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }}
          gap={4}
          alignItems="stretch"
        >
          <GridItem>
            <Box bg="white" borderRadius="md" boxShadow="sm" p={5} h="full">
              <Box mb={5}>
                <Small color="gray.500">Quota Commissionable Accounts</Small>
                <Strong fontSize="xl" color="gray.700">
                  ₱{" "}
                  {quotaAndCollections.comQuota.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Strong>
              </Box>
              <Box mb={5}>
                <Small color="gray.500">Commissionable Collection</Small>
                <Strong fontSize="xl" color="gray.700">
                  ₱{" "}
                  {quotaAndCollections.comCollection.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Strong>
              </Box>
              
            </Box>
          </GridItem>

          <GridItem>
            <Box bg="white" borderRadius="md" boxShadow="sm" p={5} h="full">
              <Box mt={5}>
                <Small color="gray.500">Due Commissionable Accounts</Small>
                <Strong fontSize="xl" color="gray.700">
                  {quotaAndCollections.comAcctDue}
                </Strong>
              </Box>
              <Box mt={5}>
                <Small color="gray.500">Commissionable Accounts Collected</Small>
                <Strong fontSize="xl" color="gray.700">
                  {quotaAndCollections.comAcctCollection}
                </Strong>
              </Box>
            </Box>
          </GridItem>

          <GridItem rowSpan={{ base: 1, lg: 2 }}>
            <EfficiencyTile />
          </GridItem>
          <GridItem>
            <Box bg="white" borderRadius="md" boxShadow="sm" p={5} h="full">
              <Box mb={5}>
                <Small color="gray.500">Non-Commissionable Quota</Small>
                <Strong fontSize="xl" color="gray.700">
                  ₱{" "}
                  {quotaAndCollections.nComQuota.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Strong>
              </Box>
              <Box mb={5}>
                <Small color="gray.500">Non-Commissionable Collection</Small>
                <Strong fontSize="xl" color="gray.700">
                  ₱{" "}
                  {quotaAndCollections.nComCollection.toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                  )}
                </Strong>
              </Box>
            </Box>
          </GridItem>
          <GridItem>
            <Box bg="white" borderRadius="md" boxShadow="sm" p={5} h="full">
              <Box mt={5}>
                <Small color="gray.500">Due Non-Commissionable Accounts</Small>
                <Strong fontSize="xl" color="gray.700">
                  {quotaAndCollections.nComAcctDue}
                </Strong>
              </Box>
              <Box mt={5}>
                <Small color="gray.500">
                  Non-Commissionable Accounts Collected
                </Small>
                <Strong fontSize="xl" color="gray.700">
                  {quotaAndCollections.nComAcctCollection}
                </Strong>
              </Box>
            </Box>
          </GridItem>
        </Grid> */}
      </Box>

      <Grid
        templateColumns={"repeat(5, 1fr)"}
        gapY={4}
        gapX={{ base: 0, lg: 4 }}
      >
        <GridItem colSpan={{ base: 5, xl: 2 }}>
          <Box bg={"white"} borderRadius={"md"} boxShadow={"sm"} p={5} pr={0}>
            <Strong color={"gray.700"}>Sales Agent Leaderboards</Strong>
            <ScrollArea.Root height="400px">
              <ScrollArea.Viewport
                css={{
                  "--scroll-shadow-size": "2rem",
                  maskImage:
                    "linear-gradient(#000,#000,transparent 0,#000 var(--scroll-shadow-size),#000 calc(100% - var(--scroll-shadow-size)),transparent)",
                  "&[data-at-top]": {
                    maskImage:
                      "linear-gradient(180deg,#000 calc(100% - var(--scroll-shadow-size)),transparent)",
                  },
                  "&[data-at-bottom]": {
                    maskImage:
                      "linear-gradient(0deg,#000 calc(100% - var(--scroll-shadow-size)),transparent)",
                  },
                }}
              >
                <ScrollArea.Content spaceY="4" pr={5}>
                  <Flex mt={3} gap={2} direction={"column"}>
                    {agentLeaderboards.map((agent) => {
                      return (
                        <LeaderboardItem
                          key={agent.name}
                          name={agent.name}
                          ns={agent.ns}
                          max={agentLeaderboards[0].ns}
                        />
                      );
                    })}
                  </Flex>
                </ScrollArea.Content>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar>
                <ScrollArea.Thumb />
              </ScrollArea.Scrollbar>
              <ScrollArea.Corner />
            </ScrollArea.Root>
          </Box>
        </GridItem>
        <GridItem colSpan={{ base: 5, xl: 3 }}>
          <Box bg={"white"} borderRadius={"md"} boxShadow={"sm"} p={5}>
            <Flex justify={"space-between"}>
              <Strong color={"gray.700"}>Monthly New Sales</Strong>
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button variant="outline" size="sm">
                    YEAR {year}
                  </Button>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item
                        value="new-txt"
                        onClick={() => setYear("2026")}
                      >
                        2026
                      </Menu.Item>
                      <Menu.Item
                        value="new-file"
                        onClick={() => setYear("2025")}
                      >
                        2025
                      </Menu.Item>
                      <Menu.Item
                        value="new-win"
                        onClick={() => setYear("2024")}
                      >
                        2024
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            </Flex>
            <Chart.Root maxH="372px" chart={chart} mt={5}>
              <BarChart data={chart.data}>
                <CartesianGrid
                  stroke={chart.color("border.muted")}
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  tickLine={false}
                  dataKey={chart.key("month")}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                {chart.series.map((item) => (
                  <Bar
                    key={item.name}
                    isAnimationActive={true}
                    dataKey={chart.key(item.name)}
                    fill={chart.color(item.color)}
                    radius={10}
                  />
                ))}
              </BarChart>
            </Chart.Root>
          </Box>
        </GridItem>
      </Grid>
    </Page>
    // <Box p={3}>
    //   <Flex justify={"space-between"}>
    //     {/* <Strong color="gray.700">Dashboard</Strong> */}
    //     <Box mb={8} textAlign="start" mt={4}>
    //       <H3>Dashboard</H3>
    //       <Body mt={2}>Real-time monitoring of critical business metrics.</Body>
    //     </Box>
    //   </Flex>

    // </Box>
  );
}

const TileItem = ({
  Icon,
  title,
  value,
  prevVal,
  monthOverMonthPercentage,
  order = "asc",
}: {
  Icon: IconType;
  title: string;
  value: string;
  prevVal: string;
  monthOverMonthPercentage: number;
  order?: "asc" | "desc";
}) => {
  return (
    <Box bg={"white"} borderRadius={"md"} boxShadow={"sm"} p={5}>
      <Flex gap={5} justify={"space-between"}>
        <Box my={2} mr={10} borderRadius={"md"}>
          <Icon size={"35px"} color="var(--chakra-colors-primary)" />
        </Box>
        <Flex my={1} align={"end"} direction={"column"}>
          <ToolTip
            content={"Previous Month: " + prevVal}
            contentProps={{ css: { bg: "white" } }}
            positioning={{ placement: "top-end" }}
          >
            <OSPBadge
              type={
                order === "asc"
                  ? monthOverMonthPercentage > 0
                    ? "success"
                    : "danger"
                  : monthOverMonthPercentage > 0
                    ? "danger"
                    : "success"
              }
              size={"md"}
            >
              {monthOverMonthPercentage > 0 ? (
                <LuArrowUp />
              ) : monthOverMonthPercentage === 0 ? null : (
                <LuArrowDown />
              )}{" "}
              {monthOverMonthPercentage.toFixed(2) + "%"}
            </OSPBadge>
          </ToolTip>
          <Small textAlign={"end"} color={"gray.500"}>
            vs previous month
          </Small>
        </Flex>
      </Flex>

      <Body>{title}</Body>

      <Flex gap={5} my={5}>
        <Strong fontSize={"4xl"} color={"gray.700"}>
          {value}
        </Strong>
      </Flex>
    </Box>
  );
};

// const EfficiencyTile = () => {
//   return (
//     <Flex
//       direction={"column"}
//       bg={"white"}
//       borderRadius={"md"}
//       boxShadow={"sm"}
//       p={5}
//       height={"full"}
//     >
//       <Strong color={"gray.700"}>Efficiency</Strong>
//       <Flex align={"end"} height={"full"}>
//         <Tabs.Root defaultValue="cvecom" variant={"enclosed"} width={"full"}>
//           <Tabs.Content value="cvecom" p={5}>
//             <EfficiencyDonutChart
//               title={"Commissionable Collection"}
//               quota={quotaAndCollections.comQuota}
//               collection={quotaAndCollections.comCollection}
//             />
//           </Tabs.Content>
//           <Tabs.Content value="cvencom" p={5}>
//             <EfficiencyDonutChart
//               title={"Non-Commissionable Collection"}
//               quota={quotaAndCollections.nComQuota}
//               collection={quotaAndCollections.nComCollection}
//             />
//           </Tabs.Content>
//           <Tabs.Content value="adecom" p={5}>
//             <EfficiencyDonutChart
//               title={"Commissionable Accounts Collection"}
//               quota={quotaAndCollections.comAcctDue}
//               collection={quotaAndCollections.comAcctCollection}
//             />
//           </Tabs.Content>
//           <Tabs.Content value="adencom" p={5}>
//             <EfficiencyDonutChart
//               title={"Non-Commissionable Accounts Collection"}
//               quota={quotaAndCollections.nComAcctDue}
//               collection={quotaAndCollections.nComAcctCollection}
//             />
//           </Tabs.Content>

//           <Tabs.List width={"full"} boxShadow={"sm"}>
//             <Tabs.Trigger
//               value="cvecom"
//               width={"full"}
//               fontSize={"xs"}
//               _selected={{
//                 fontWeight: "bold",
//                 color: "white",
//                 bg: "var(--chakra-colors-primary)",
//               }}
//             >
//               CVE Com
//             </Tabs.Trigger>
//             <Tabs.Trigger
//               value="cvencom"
//               width={"full"}
//               fontSize={"xs"}
//               _selected={{
//                 fontWeight: "bold",
//                 color: "white",
//                 bg: "var(--chakra-colors-primary)",
//               }}
//             >
//               CVE NCom
//             </Tabs.Trigger>
//             <Tabs.Trigger
//               value="adecom"
//               width={"full"}
//               fontSize={"xs"}
//               _selected={{
//                 fontWeight: "bold",
//                 color: "white",
//                 bg: "var(--chakra-colors-primary)",
//               }}
//             >
//               ADE Com
//             </Tabs.Trigger>
//             <Tabs.Trigger
//               value="adencom"
//               width={"full"}
//               fontSize={"xs"}
//               _selected={{
//                 fontWeight: "bold",
//                 color: "white",
//                 bg: "var(--chakra-colors-primary)",
//               }}
//             >
//               ADE NCOM
//             </Tabs.Trigger>
//           </Tabs.List>
//         </Tabs.Root>
//       </Flex>
//     </Flex>
//   );
// };

const EfficiencyDonutChart = ({
  title,
  quota,
  collection,
  passingRate,
}: {
  title: string;
  quota: number;
  collection: number;
  passingRate: number;
}) => {
  const chart = useChart({
    data: [
      {
        name: title,
        value: collection,
        color: "var(--chakra-colors-primary)",
        dangerColor: "red.400",
        overColor: "var(--chakra-colors-primary)",
      },
      {
        name: "Uncollected",
        value: quota - collection,
        color: "var(--chakra-colors-primary-disabled)",
        dangerColor: "red.200",
        overColor: "var(--chakra-colors-primary-hover)",
      },
    ],
  });

  return (
    <Chart.Root boxSize="100px" width={"full"} my={10} chart={chart} mx="auto">
      <PieChart>
        <Tooltip
          cursor={false}
          animationDuration={100}
          content={<Chart.Tooltip hideLabel />}
        />
        <Pie
          innerRadius={60}
          outerRadius={90}
          isAnimationActive={false}
          data={chart.data}
          dataKey={chart.key("value")}
          nameKey="name"
          startAngle={180}
          endAngle={0}
          radius={10}
        >
          <Label
            content={({ viewBox }) => (
              <Chart.RadialText
                viewBox={viewBox}
                title={
                  chart.getValuePercent("value", collection).toFixed(1) + "%"
                }
                description={title}
              />
            )}
          />
          {chart.data.map((item) => (
            <Cell
              key={item.name}
              fill={
                chart.getValuePercent("value", collection) < passingRate
                  ? chart.color(item.dangerColor)
                  : chart.getValuePercent("value", collection) > 100
                    ? chart.color(item.overColor)
                    : chart.color(item.color)
              }
            />
          ))}
        </Pie>
      </PieChart>
    </Chart.Root>
  );
};

const LeaderboardItem = ({
  name,
  ns,
  max,
}: {
  name: string;
  ns: number;
  max: number;
}) => {
  return (
    <Flex justify={"space-between"} py={1}>
      <Flex align={"center"} gap={2}>
        <Avatar.Root bg={"var(--chakra-colors-primary-disabled)/50"}>
          <Avatar.Fallback name={name} color={"var(--chakra-colors-primary)"} />
          {/* <Avatar.Image src="https://bit.ly/sage-adebayo" /> */}
        </Avatar.Root>
        <Flex direction={"column"}>
          <Body color={"gray.600"} fontWeight={"semibold"}>
            {name}
          </Body>
          <Small color={"gray.500"}>{ns.toLocaleString()} New Sales</Small>
        </Flex>
      </Flex>
      <Flex align={"center"} gap={2}>
        <Box width={"100px"} bg={"gray.200"} borderRadius={"md"}>
          <Box
            width={(ns / max) * 100 + "%"}
            py={1}
            bg={"var(--chakra-colors-primary)"}
            borderRadius={"md"}
            minW={2}
          ></Box>
        </Box>
        <Small w={"50px"} textAlign={"end"}>
          {((ns / max) * 100).toFixed(1)}%
        </Small>
      </Flex>
    </Flex>
  );
};
