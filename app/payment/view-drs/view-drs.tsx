"use client";
import {
  Badge,
  Box,
  Button,
  Collapsible,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Body, PrimaryMdFlexButton, SecondaryMdFlexButton } from "st-peter-ui";

import { drsItems, samplePayments } from "../data/paymentDetails";
import { DepositHdr } from "../data/payment.types";
import {
  LuTrash,
  LuChevronLeft,
  LuChevronRight,
  LuChevronDown,
  LuChevronUp,
} from "react-icons/lu";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import DrsDataTable from "../components/drsDataTable";

import {
  LookupColumn,
  LookupField,
} from "@/components/common/reusable-lookup/LookUpField";
import DrsPaymentSummary from "../components/drsPaymentSummary";
import { DrsFunction } from "../utils/drsFunction";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import Page from "@/components/layout/page/Page";
import Card from "@/components/cards/Card";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import { OSPBadge } from "@/components/common/badge/badge";

const STATUS_STYLES: Record<
  string,
  { colorPalette: "warning" | "success" | "info"; dotColor: string }
> = {
  Pending: { colorPalette: "warning", dotColor: "yellow.500" },
  Validated: { colorPalette: "success", dotColor: "green.500" },
  "For Deposit": { colorPalette: "info", dotColor: "blue.500" },
};

const formatSlipDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function ViewDrs() {
  const { rows, totals } = DrsFunction(samplePayments);
  const router = useRouter();

  const [selectedId, setSelectedId] = useState<string>("");
  const [items, setItems] = useState(drsItems);
  const sortedDrsItems = useMemo(() => {
    return [...items].sort((a, b) => Number(b.id) - Number(a.id));
  }, [items]);
  const selectedItem = useMemo(
    () => items.find((x) => x.id === selectedId),
    [selectedId, items],
  );

  // ── Lookup (search / filter) state ──
  const [lookupValue, setLookupValue] = useState<DepositHdr | null>(null);
  const drsLookupColumns: LookupColumn<DepositHdr>[] = [
    { key: "name", header: "Reference" },
    { key: "Amount", header: "Amount" },
    { key: "Status", header: "Status", enableColumnFilter: true },
  ];

  // ── Collapsible panel state ──
  const isMobile = useBreakpointValue({ base: true, lg: false }) ?? false;
  const [collapsed, setCollapsed] = useState(false);

  // Mobile defaults to collapsed (accordion closed); desktop defaults to open.
  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const showStrip = collapsed && !isMobile; // desktop minimized rail
  const showBody = !collapsed;

  //delete function
  const { messageBox } = useMessageDialog();
  const handleDelete = async (item: any) => {
    const confirmed = await messageBox({
      title: "CONFIRMATION",
      message: "Do you want to delete DRS?",
      confirmText: "Yes",
      cancelText: "No",
      variant: "confirmation",
    });

    if (!confirmed) return;

    //  perform delete
    setItems((prev) => prev.filter((x) => x.id !== item.id));

    if (selectedId === item.id) {
      setSelectedId("");
    }

    //  show success (use toast OR messageBox, not both)
    messageBox({
      title: "SUCCESS",
      message: "DRS successfully deleted.",
      confirmText: "OK",
      variant: "error",
    });

    toast.success(`Deleted ${item.name}`);
  };

  return (
    <Page.Root
      title={"Digital Remittance Slip"}
      description="Manage your digital remittance slip"
    >
      <Page.MainContent>
        {/* MAIN GRID */}
        <Grid
          gap={{ base: 4, lg: 6 }}
          templateColumns={{
            base: "1fr",
            lg: showStrip ? "56px 1fr" : "380px 1fr",
            xl: showStrip ? "56px 1fr" : "420px 1fr",
          }}
          alignItems="start"
          transition="grid-template-columns 0.3s ease"
        >
          {/* LEFT PANEL */}
          <Card.Root>
            <Card.MainContent>
              <GridItem minW={0} overflow="hidden" h={"full"}>
                {showStrip ? (
                  /* ── DESKTOP COLLAPSED RAIL ── */
                  <Flex
                    direction="column"
                    align="center"
                    gap={3}
                    py={1}
                    h="full"
                  >
                    <IconButton
                      aria-label="Expand remittance slips panel"
                      size="sm"
                      variant="ghost"
                      onClick={() => setCollapsed(false)}
                    >
                      <LuChevronRight />
                    </IconButton>
                    <OSPBadge
                      // colorPalette="green"
                      // variant="subtle"
                      // borderRadius="full"
                      // px={2}
                      type="success"
                    >
                      {sortedDrsItems.length}
                    </OSPBadge>
                    <Body
                      fontWeight="semibold"
                      fontSize="sm"
                      color="fg.muted"
                      css={{ writingMode: "vertical-rl" }}
                      transform="rotate(180deg)"
                      whiteSpace="nowrap"
                    >
                      Remittance Slips
                    </Body>
                  </Flex>
                ) : (
                  <>
                    {/* HEADER */}
                    <Flex align="center" justify="space-between" gap={2} mb={3}>
                      <Flex align="center" gap={2} minW={0}>
                        <Heading size="md" lineClamp={1}>
                          Remittance Slips
                        </Heading>
                        <OSPBadge type="success">
                          {sortedDrsItems.length}
                        </OSPBadge>
                      </Flex>
                      <IconButton
                        aria-label={
                          collapsed
                            ? "Expand remittance slips panel"
                            : "Collapse remittance slips panel"
                        }
                        size="sm"
                        variant="ghost"
                        flexShrink={0}
                        onClick={() => setCollapsed((prev) => !prev)}
                      >
                        {isMobile ? (
                          collapsed ? (
                            <LuChevronDown />
                          ) : (
                            <LuChevronUp />
                          )
                        ) : (
                          <LuChevronLeft />
                        )}
                      </IconButton>
                    </Flex>

                    <AnimatePresence initial={false}>
                      {showBody && (
                        <motion.div
                          key="drs-panel-body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          {/* SEARCH — reusable lookup */}
                          <Box mb={3}>
                            <LookupField<DepositHdr>
                              placeholder="Search by reference or ID..."
                              modalTitle="Search Remittance Slip"
                              columns={drsLookupColumns}
                              dataSource={items}
                              searchKeys={["name"]}
                              value={lookupValue}
                              onSelect={(item) => {
                                setLookupValue(item);
                                if (item) setSelectedId(item.id);
                              }}
                              renderDisplay={(item) => item.name}
                            />
                          </Box>

                          {/* CARD LIST */}
                          <Stack
                            gap={2}
                            maxH={{ base: "360px", md: "450px", xl: "520px" }}
                            overflowY="auto"
                            pr={1}
                          >
                            {sortedDrsItems.map((item) => {
                              const isSelected = selectedId === item.id;
                              const status = item.Status ?? "Pending";
                              const styles =
                                STATUS_STYLES[status] ?? STATUS_STYLES.Pending;
                              const isLatest =
                                sortedDrsItems[0]?.id === item.id;

                              return (
                                <Box
                                  key={item.id}
                                  role="button"
                                  onClick={() => setSelectedId(item.id)}
                                  cursor="pointer"
                                  position="relative"
                                  borderWidth="1px"
                                  borderRadius="lg"
                                  borderColor={
                                    isSelected ? "green.300" : "border"
                                  }
                                  bg={isSelected ? "green.50" : "bg"}
                                  borderLeftWidth={isSelected ? "4px" : "1px"}
                                  borderLeftColor={
                                    isSelected ? "green.500" : "border"
                                  }
                                  p={3}
                                  transition="all 0.15s"
                                  _hover={{
                                    borderColor: "green.300",
                                    bg: "green.50",
                                  }}
                                >
                                  <Flex
                                    justify="space-between"
                                    align="start"
                                    gap={2}
                                  >
                                    <Text
                                      fontWeight="bold"
                                      color="green.700"
                                      fontSize="sm"
                                    >
                                      {item.name}
                                    </Text>
                                    <Text
                                      fontWeight="bold"
                                      color="green.700"
                                      fontSize="sm"
                                      whiteSpace="nowrap"
                                    >
                                      {item.Amount}
                                    </Text>
                                  </Flex>

                                  <Flex
                                    justify="space-between"
                                    align="center"
                                    mt={2}
                                    gap={2}
                                  >
                                    <Text fontSize="xs" color="fg.muted">
                                      {formatSlipDate(item.SlipDate)}
                                      {item.Planholders != null &&
                                        ` · ${item.Planholders} planholders`}
                                    </Text>

                                    <Flex align="center" gap={2}>
                                      <OSPBadge
                                        type={styles.colorPalette}
                                        // variant="subtle"
                                        // borderRadius="full"
                                        // px={2}
                                      >
                                        {/* <Box
                                          as="span"
                                          boxSize="6px"
                                          borderRadius="full"
                                          bg={styles.dotColor}
                                          mr={1}
                                        /> */}
                                        {status}
                                      </OSPBadge>

                                      {isLatest && (
                                        <Button
                                          size="xs"
                                          variant="outline"
                                          color="red.500"
                                          borderColor="red.500"
                                          _hover={{
                                            bg: "red.500",
                                            color: "white",
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(item);
                                          }}
                                        >
                                          <LuTrash />
                                        </Button>
                                      )}
                                    </Flex>
                                  </Flex>
                                </Box>
                              );
                            })}
                          </Stack>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </GridItem>
            </Card.MainContent>
          </Card.Root>

          {/* RIGHT PANEL */}

          <GridItem bg="white" overflow="hidden" h="full">
            <Card.Root>
              <Card.MainContent>
                {!selectedId && (
                  /* EMPTY STATE */
                  <EmptyStateCard
                    title={"No DRS Selected"}
                    description="Select a DRS from the left to view details"
                  />
                )}
                <Collapsible.Root open={selectedId != ""}>
                  <Collapsible.Content>
                    <DrsDataTable
                      payments={samplePayments}
                      onRowClick={(row) => console.log("Clicked row:", row)}
                    />
                    <Box display={{ base: "block", md: "none" }}>
                      <DrsPaymentSummary totals={totals} displayProp={false} />
                    </Box>
                    {/* ACTION BUTTON */}
                    <Flex
                      direction={{ base: "column", md: "row" }}
                      justify={{ base: "flex-end" }}
                      mt={4}
                      gap={{ base: 2, xl: 4 }}
                      width="full"
                    >
                      <Box width={{ base: "full", md: "auto" }}>
                        <SecondaryMdFlexButton
                          width={{ base: "full", md: "auto" }}
                          onClick={() => {
                            const selected = items.find(
                              (x) => x.id === selectedId,
                            );

                            sessionStorage.setItem(
                              "selectedDRS",
                              JSON.stringify(selected),
                            );

                            router.push("/disbursement/comte");
                          }}
                        >
                          Add Disbursement
                        </SecondaryMdFlexButton>
                      </Box>

                      <Box width={{ base: "full", md: "auto" }}>
                        <PrimaryMdFlexButton
                          width={{ base: "full", md: "auto" }}
                          onClick={() => {
                            const selected = items.find(
                              (x) => x.id === selectedId,
                            );

                            if (!selected) return;

                            const firstCreated = drsItems[0];

                            if (selected.id !== firstCreated?.id) {
                              toast.error(
                                "Please encode the first created DRS",
                              );
                              return;
                            }

                            sessionStorage.setItem(
                              "selectedDRS",
                              JSON.stringify(selected),
                            );

                            router.push("/payment/encodevalidated-deposit");
                          }}
                        >
                          Encode Deposit
                        </PrimaryMdFlexButton>
                      </Box>
                    </Flex>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card.MainContent>
            </Card.Root>
          </GridItem>
        </Grid>
      </Page.MainContent>
    </Page.Root>
  );
}
