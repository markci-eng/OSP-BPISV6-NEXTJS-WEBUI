"use client";
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  IconButton,
  SimpleGrid,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

import {
  Body,
  PrimaryMdButton,
  PrimaryMdFlexButton,
  SecondaryMdButton,
  SecondaryMdFlexButton,
} from "st-peter-ui";

import { drsItems, samplePayments } from "../data/paymentDetails";
import { DepositHdr } from "../data/payment.types";
import {
  LuTrash,
  LuChevronRight,
  LuChevronLeft,
  LuFileText,
  LuCalendar,
  LuBanknote,
  LuUsers,
  LuPlus,
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
import { MetaCard } from "../viewvalidated-deposit/viewDeposit";

const STATUS_STYLES: Record<
  string,
  {
    colorPalette: "warning" | "success" | "info";
    dotColor: string;
    stripeColor: string;
  }
> = {
  Pending: {
    colorPalette: "warning",
    dotColor: "yellow.500",
    stripeColor: "yellow.400",
  },
  Validated: {
    colorPalette: "success",
    dotColor: "green.500",
    stripeColor: "green.500",
  },
  "For Deposit": {
    colorPalette: "info",
    dotColor: "blue.500",
    stripeColor: "blue.500",
  },
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

type MobileView = "list" | "detail";

export default function ViewDrs() {
  const { totals } = DrsFunction(samplePayments);
  const router = useRouter();

  const [selectedId, setSelectedId] = useState<string>("");
  const [items, setItems] = useState(drsItems);
  const [mobileView, setMobileView] = useState<MobileView>("list");

  const sortedDrsItems = useMemo(
    () => [...items].sort((a, b) => Number(b.id) - Number(a.id)),
    [items],
  );
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
      if (isMobile) setMobileView("list");
    }

    messageBox({
      title: "SUCCESS",
      message: "DRS successfully deleted.",
      confirmText: "OK",
      variant: "error",
    });
    toast.success(`Deleted ${item.name}`);
  };

  const handleSelectItem = (id: string) => {
    setSelectedId(id);
    if (isMobile) setMobileView("detail");
  };

  const handleLookupSelect = (item: DepositHdr | null) => {
    setLookupValue(item);
    if (item) handleSelectItem(item.id);
  };

  const handleAddDisbursement = () => {
    const selected = items.find((x) => x.id === selectedId);
    sessionStorage.setItem("selectedDRS", JSON.stringify(selected));
    router.push("/disbursement/comte");
  };

  const handleEncodeDeposit = () => {
    const selected = items.find((x) => x.id === selectedId);
    if (!selected) return;
    const firstCreated = drsItems[0];
    if (selected.id !== firstCreated?.id) {
      toast.error("Please encode the first created DRS");
      return;
    }
    sessionStorage.setItem("selectedDRS", JSON.stringify(selected));
    router.push("/payment/encodevalidated-deposit");
  };

  const drsMeta = (
    <SimpleGrid columns={{ base: 1, lg: 3 }} gap={3} mt={3}>
      <MetaCard
        label="Date Prepared"
        value={formatSlipDate(selectedItem?.SlipDate)}
      />
      <MetaCard label="Amount" value={selectedItem?.Amount ?? "0"} />
      <MetaCard label="Prepared By" value={selectedItem?.DepositedBy} />
    </SimpleGrid>
  );

  // ── List items (shared between mobile and desktop) ───────────────────────
  const slipList = (
    <Stack gap={2}>
      {sortedDrsItems.map((item) => {
        const isSelected = selectedId === item.id;
        const status = item.Status ?? "Pending";
        const styles = STATUS_STYLES[status] ?? STATUS_STYLES.Pending;

        return (
          <Box
            key={item.id}
            w="100%"
            position="relative"
            pl={5}
            pr={4}
            pt={4}
            pb={3}
            borderRadius="xl"
            bg={isSelected ? "blue.50" : "white"}
            shadow={isSelected ? "md" : "sm"}
            transition="all 0.2s ease"
            _hover={{ transform: "translateY(-2px)", shadow: "md" }}
            overflow="hidden"
            cursor="pointer"
            onClick={() => handleSelectItem(item.id)}
            borderWidth="1.5px"
            borderColor={isSelected ? "blue.300" : "gray.100"}
          >
            {/* Status stripe */}
            <Box
              position="absolute"
              left={0}
              top={0}
              bottom={0}
              w="4px"
              bg={styles.stripeColor}
              borderLeftRadius="xl"
            />

            {/* HEADER */}
            <Flex justify="space-between" align="start" mb={2}>
              <Flex align="center" gap={2}>
                <Box
                  p={1.5}
                  borderRadius="lg"
                  bg={isSelected ? "blue.100" : "gray.100"}
                >
                  <LuFileText size={15} />
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="sm" lineHeight="1.2">
                    {item.name}
                  </Text>
                  <Flex
                    align="center"
                    gap={1}
                    fontSize="xs"
                    color="gray.500"
                    mt={0.5}
                  >
                    <LuCalendar size={11} />
                    <Text>{formatSlipDate(item.SlipDate)}</Text>
                  </Flex>
                </Box>
              </Flex>
              <OSPBadge type={styles.colorPalette}>{status}</OSPBadge>
            </Flex>

            {/* QUICK INFO CHIPS */}
            <Flex gap={2} wrap="wrap" mb={2}>
              <Flex
                px={2}
                py={0.5}
                fontSize="xs"
                borderRadius="full"
                bg={isSelected ? "blue.100" : "gray.50"}
                align="center"
                gap={1}
                fontWeight="medium"
              >
                <LuBanknote size={11} />
                {item.Amount}
              </Flex>
              {item.Planholders != null && (
                <Flex
                  px={2}
                  py={0.5}
                  fontSize="xs"
                  borderRadius="full"
                  bg={isSelected ? "blue.100" : "gray.50"}
                  align="center"
                  gap={1}
                >
                  <LuUsers size={11} />
                  {item.Planholders} planholders
                </Flex>
              )}
            </Flex>

            {/* FOOTER */}
            <Flex justify="space-between" align="center">
              <Text fontSize="xs" color="gray.400">
                {isMobile ? "Tap to view" : "Click to view"}
              </Text>
              <LuChevronRight
                size={14}
                color={isSelected ? "#3b82f6" : "#a1a1aa"}
              />
            </Flex>
          </Box>
        );
      })}
    </Stack>
  );

  // ── Mobile: list view ─────────────────────────────────────────────────────
  const mobileListPanel = (
    <Box w="full" borderRadius="2xl" bg="white" shadow="sm" overflow="hidden">
      <Flex
        align="center"
        gap={2}
        px={4}
        py={3}
        borderBottomWidth={1}
        borderColor="gray.100"
      >
        <Box p={2} borderRadius="full" bg="gray.100">
          <LuFileText size={16} />
        </Box>
        <Box>
          <Text fontWeight="bold" fontSize="md" lineHeight="1.2">
            Remittance Slips
          </Text>
          <Text fontSize="xs" color="gray.500">
            {sortedDrsItems.length} slip(s)
          </Text>
        </Box>
      </Flex>

      <Box p={4}>
        <Box mb={3}>
          <LookupField<DepositHdr>
            placeholder="Search by reference or ID..."
            modalTitle="Search Remittance Slip"
            columns={drsLookupColumns}
            dataSource={items}
            searchKeys={["name"]}
            value={lookupValue}
            onSelect={handleLookupSelect}
            renderDisplay={(item) => item.name}
          />
        </Box>
        {slipList}
      </Box>
    </Box>
  );

  // ── Mobile: detail view ───────────────────────────────────────────────────
  const mobileDetailPanel = (
    <Box pb="120px">
      {!selectedId ? (
        <EmptyStateCard
          title="No DRS Selected"
          description="Select a DRS from the left to view details"
        />
      ) : (
        <>
          <DrsDataTable
            payments={samplePayments}
            onRowClick={(row) => {}}
            headerContent={
              <Flex align="center" gap={2}>
                <IconButton
                  aria-label="Back to list"
                  size="sm"
                  variant="ghost"
                  onClick={() => setMobileView("list")}
                >
                  <LuChevronLeft />
                </IconButton>
                <Text fontWeight="bold" fontSize="sm">
                  {selectedItem?.name ?? "DRS Details"}
                </Text>
                {selectedItem && (
                  <OSPBadge
                    type={
                      (
                        STATUS_STYLES[selectedItem.Status ?? "Pending"] ??
                        STATUS_STYLES.Pending
                      ).colorPalette
                    }
                  >
                    {selectedItem.Status ?? "Pending"}
                  </OSPBadge>
                )}
              </Flex>
            }
          />
          <DrsPaymentSummary totals={totals} displayProp={false} />
        </>
      )}

      {/* Sticky bottom action bar */}
      {selectedId && (
        <Box
          // position="fixed"
          bottom={0}
          left={0}
          right={0}
          px={4}
          py={3}
          bg="white"
          mt={"20px"}
          borderTopWidth={1}
          borderColor="gray.100"
          borderRadius={"md"}
          shadow="lg"
          zIndex={10}
        >
          <Stack gap={2}>
            <PrimaryMdFlexButton width="full" onClick={handleEncodeDeposit}>
              Encode Deposit
            </PrimaryMdFlexButton>
            <SecondaryMdFlexButton width="full" onClick={handleAddDisbursement}>
              Add Disbursement
            </SecondaryMdFlexButton>
            {sortedDrsItems[0]?.id === selectedId && (
              <Button
                width="full"
                variant="outline"
                color="red.500"
                borderColor="red.500"
                _hover={{ bg: "red.500", color: "white" }}
                onClick={() =>
                  handleDelete(items.find((x) => x.id === selectedId))
                }
              >
                {/* <LuTrash /> */}
                Delete DRS
              </Button>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );

  // ── Desktop: left panel ───────────────────────────────────────────────────
  const desktopListPanel = showStrip ? (
    <Box
      px={5}
      p={1}
      borderRadius="lg"
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
        <Badge size={"lg"} colorPalette={"red"} borderRadius={"full"}>
          {sortedDrsItems.length}
        </Badge>
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
    <Flex direction="column" h="full">
      <Flex align="center" justify="space-between" mb={3}>
        <Flex align="center" gap={2}>
          <Box p={1.5} borderRadius="lg" bg="gray.100">
            <LuFileText size={14} />
          </Box>
          <Box>
            <Text fontWeight="semibold" fontSize="sm" lineHeight="1.1">
              Remittance Slips
            </Text>
            <Text fontSize="xs" color="gray.500">
              {sortedDrsItems.length} slip(s)
            </Text>
          </Box>
        </Flex>
        <Flex align="center" gap={1}>
          <IconButton
            aria-label="New DRS"
            size="xs"
            variant="ghost"
            onClick={() => router.push("/payment/encode-payment")}
          >
            <LuPlus />
          </IconButton>
          <IconButton
            aria-label="Collapse panel"
            size="xs"
            variant="ghost"
            onClick={() => setCollapsed(true)}
          >
            <LuChevronLeft />
          </IconButton>
        </Flex>
      </Flex>
      <Box mb={3}>
        <LookupField<DepositHdr>
          placeholder="Search by reference or ID..."
          modalTitle="Search Remittance Slip"
          columns={drsLookupColumns}
          dataSource={items}
          searchKeys={["name"]}
          value={lookupValue}
          onSelect={handleLookupSelect}
          renderDisplay={(item) => item.name}
        />
      </Box>
      <Box flex="1" minH={0} overflowY="auto" pr={1}>
        {slipList}
      </Box>
    </Flex>
  );

  // ── Desktop: right panel ──────────────────────────────────────────────────
  const desktopDetailPanel = (
    <Flex direction="column" h="full">
      {!selectedId ? (
        <EmptyStateCard
          title="No DRS Selected"
          description="Select a remittance slip from the left panel to view its payment details"
        />
      ) : (
        <>
          {/* DRS info bar */}
          {selectedItem && (
            <Box
              mb={4}
              px={5}
              py={4}
              bg="white"
              borderRadius="xl"
              shadow="sm"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                <Box>
                  <Flex align="center" gap={3} mb={1.5}>
                    <Text fontWeight="bold" fontSize="lg" letterSpacing="tight">
                      {selectedItem.name}
                    </Text>
                    <OSPBadge
                      type={
                        (
                          STATUS_STYLES[selectedItem.Status ?? "Pending"] ??
                          STATUS_STYLES.Pending
                        ).colorPalette
                      }
                    >
                      {selectedItem.Status ?? "Pending"}
                    </OSPBadge>
                  </Flex>
                  <Flex gap={5} fontSize="sm" color="gray.500" align="center">
                    <Flex align="center" gap={1.5}>
                      <LuCalendar size={13} />
                      <Text>{formatSlipDate(selectedItem.SlipDate)}</Text>
                    </Flex>
                    <Flex align="center" gap={1.5}>
                      <LuBanknote size={13} />
                      <Text fontWeight="semibold" color="gray.700">
                        {selectedItem.Amount}
                      </Text>
                    </Flex>
                    {selectedItem.Planholders != null && (
                      <Flex align="center" gap={1.5}>
                        <LuUsers size={13} />
                        <Text>{selectedItem.Planholders} planholders</Text>
                      </Flex>
                    )}
                  </Flex>
                </Box>
                <Flex gap={2} align="center" flexShrink={0}>
                  {sortedDrsItems[0]?.id === selectedId && (
                    <IconButton
                      aria-label="Delete DRS"
                      size="md"
                      variant="outline"
                      color="red.500"
                      borderColor="red.200"
                      _hover={{ bg: "red.50", borderColor: "red.400" }}
                      onClick={() =>
                        handleDelete(items.find((x) => x.id === selectedId))
                      }
                    >
                      <LuTrash size={16} />
                    </IconButton>
                  )}
                  <SecondaryMdButton
                    width="auto"
                    onClick={handleAddDisbursement}
                  >
                    Add Disbursement
                  </SecondaryMdButton>
                  <PrimaryMdButton width="auto" onClick={handleEncodeDeposit}>
                    Encode Deposit
                  </PrimaryMdButton>
                </Flex>
              </Flex>
            </Box>
          )}

          <Flex
            direction={"column"}
            minW={0}
            minH={0}
            overflow="auto"
            px={1}
            gapY={2}
          >
            {drsMeta}
            <DrsDataTable payments={samplePayments} />

            <Box display={{ base: "block", lg: "none" }}>
              <DrsPaymentSummary totals={totals} displayProp={false} />
            </Box>
          </Flex>
        </>
      )}
    </Flex>
  );

  return (
    <Page.Root
      title="Digital Remittance Slip"
      description="Manage your digital remittance slip"
      headerButton="menu"
      paddingBottom={{ base: "96px", lg: 0 }}
      overflowY={{ base: "auto", lg: "hidden" }}
    >
      <Page.MainContent h={{ base: "auto", lg: "full" }} minH={0}>
        {/* Mobile: show one panel at a time */}
        {isMobile ? (
          mobileView === "list" ? (
            mobileListPanel
          ) : (
            mobileDetailPanel
          )
        ) : (
          // Desktop: panels fill the page height; only the panels scroll
          <Grid
            gap={6}
            templateColumns={{
              lg: showStrip ? "56px 1fr" : "380px 1fr",
              xl: showStrip ? "56px 1fr" : "420px 1fr",
            }}
            templateRows="minmax(0, 1fr)"
            alignItems="stretch"
            h="full"
            minH={0}
            overflow="hidden"
            transition="grid-template-columns 0.3s ease"
          >
            <GridItem minW={0} overflow="hidden" h="full" p={2}>
              {desktopListPanel}
            </GridItem>
            <GridItem minW={0} h="full" overflow="hidden" py={2}>
              {desktopDetailPanel}
            </GridItem>
          </Grid>
        )}
      </Page.MainContent>
    </Page.Root>
  );
}
