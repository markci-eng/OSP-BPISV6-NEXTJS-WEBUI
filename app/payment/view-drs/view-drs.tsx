"use client";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

import { Body, PrimaryMdFlexButton, SecondaryMdFlexButton } from "st-peter-ui";

import { drsItems, samplePayments } from "../data/paymentDetails";
import { DepositHdr } from "../data/payment.types";
import {
  LuTrash,
  LuChevronRight,
  LuFileText,
  LuFileCheck,
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
import Page from "@/claude components/layout/page/Page";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import { OSPBadge } from "@/components/common/badge/badge";
import { InfoCardAccordion } from "@/claude components/card-accordion/info-card-accordion";
import { Card } from "@/claude components/card-accordion/card";

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
  const { totals } = DrsFunction(samplePayments);
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

  const [lookupValue, setLookupValue] = useState<DepositHdr | null>(null);
  const drsLookupColumns: LookupColumn<DepositHdr>[] = [
    { key: "name", header: "Reference" },
    { key: "Amount", header: "Amount" },
    { key: "Status", header: "Status", enableColumnFilter: true },
  ];

  const isMobile = useBreakpointValue({ base: true, lg: false }) ?? false;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const showStrip = collapsed && !isMobile;
  const showBody = !collapsed;

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

    setItems((prev) => prev.filter((x) => x.id !== item.id));

    if (selectedId === item.id) {
      setSelectedId("");
    }

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
      title="Digital Remittance Slip"
      description="Manage your digital remittance slip"
      headerButton="menu"
    >
      <Page.MainContent>
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
          <GridItem minW={0} overflow="hidden" h="full">
            {showStrip ? (
              <Box
                w="full"
                p={1}
                borderRadius="2xl"
                bg="white"
                shadow="sm"
                overflow="hidden"
                h="full"
              >
                <Flex direction="column" align="center" gap={3} py={2} h="full">
                  <IconButton
                    aria-label="Expand remittance slips panel"
                    size="sm"
                    variant="ghost"
                    onClick={() => setCollapsed(false)}
                  >
                    <LuChevronRight />
                  </IconButton>
                  <OSPBadge type="success">{sortedDrsItems.length}</OSPBadge>
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
              </Box>
            ) : (
              <InfoCardAccordion
                icon={<LuFileText size={16} />}
                title="Remittance Slips"
                subtitle={`${sortedDrsItems.length} slip(s)`}
                isOpen={showBody}
                onToggle={() => setCollapsed((p) => !p)}
              >
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
                    const isLatest = sortedDrsItems[0]?.id === item.id;

                    return (
                      <Box
                        key={item.id}
                        role="button"
                        onClick={() => setSelectedId(item.id)}
                        cursor="pointer"
                        position="relative"
                        borderWidth="1px"
                        borderRadius="lg"
                        borderColor={isSelected ? "green.300" : "border"}
                        bg={isSelected ? "green.50" : "bg"}
                        borderLeftWidth={isSelected ? "4px" : "1px"}
                        borderLeftColor={isSelected ? "green.500" : "border"}
                        p={3}
                        transition="all 0.15s"
                        _hover={{ borderColor: "green.300", bg: "green.50" }}
                      >
                        <Flex justify="space-between" align="start" gap={2}>
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
                            <OSPBadge type={styles.colorPalette}>
                              {status}
                            </OSPBadge>

                            {isLatest && (
                              <Button
                                size="xs"
                                variant="outline"
                                color="red.500"
                                borderColor="red.500"
                                _hover={{ bg: "red.500", color: "white" }}
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
              </InfoCardAccordion>
            )}
          </GridItem>

          {/* RIGHT PANEL */}
          <GridItem h="full" overflow="hidden">
            <Card
              activeIcon={<LuFileCheck size={16} />}
              title="DRS Details"
              subtitle={
                selectedItem
                  ? `${selectedItem.name} · ${selectedItem.Status ?? "Pending"}`
                  : "Select a DRS to view details"
              }
            >
              {!selectedId && (
                <EmptyStateCard
                  title="No DRS Selected"
                  description="Select a DRS from the left to view details"
                />
              )}

              {selectedId && (
                <>
                  <DrsDataTable
                    payments={samplePayments}
                    onRowClick={(row) => console.log("Clicked row:", row)}
                  />
                  <Box display={{ base: "block", md: "none" }}>
                    <DrsPaymentSummary totals={totals} displayProp={false} />
                  </Box>
                  <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="flex-end"
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
                            toast.error("Please encode the first created DRS");
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
                </>
              )}
            </Card>
          </GridItem>
        </Grid>
      </Page.MainContent>
    </Page.Root>
  );
}
