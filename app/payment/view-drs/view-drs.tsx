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
  LuChevronLeft,
  LuFileText,
  LuCalendar,
  LuBanknote,
  LuUsers,
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

  // ── List items (shared between mobile and desktop) ───────────────────────
  const slipList = (
    <Stack gap={2}>
      {sortedDrsItems.map((item) => {
        const isSelected = selectedId === item.id;
        const status = item.Status ?? "Pending";
        const styles = STATUS_STYLES[status] ?? STATUS_STYLES.Pending;
        const isLatest = sortedDrsItems[0]?.id === item.id;

        return (
          <Box
            key={item.id}
            w="100%"
            position="relative"
            p={4}
            borderRadius="2xl"
            // bg={isSelected ? "green.50" : "white"}
            shadow="sm"
            transition="all 0.25s ease"
            _hover={{ transform: "translateY(-3px)", shadow: "lg" }}
            overflow="hidden"
            cursor="pointer"
            onClick={() => handleSelectItem(item.id)}
            borderWidth="2px"
            // borderColor={isSelected ? "green.400" : "transparent"}
          >
            {/* HEADER */}
            <Flex justify="space-between" align="start" mb={3}>
              <Flex align="center" gap={2}>
                <Box p={2} borderRadius="full" bg="gray.100">
                  <LuFileText size={18} />
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="md" lineHeight="1.2">
                    {item.name}
                  </Text>
                  <Flex align="center" gap={1} fontSize="xs" color="gray.500">
                    <LuCalendar size={12} />
                    <Text>{formatSlipDate(item.SlipDate)}</Text>
                  </Flex>
                </Box>
              </Flex>
              <OSPBadge type={styles.colorPalette}>{status}</OSPBadge>
            </Flex>

            {/* QUICK INFO CHIPS */}
            <Flex gap={2} wrap="wrap" mb={3}>
              <Box
                px={2}
                py={1}
                fontSize="xs"
                borderRadius="full"
                bg="gray.50"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <LuBanknote size={12} />
                {item.Amount}
              </Box>
              {item.Planholders != null && (
                <Box
                  px={2}
                  py={1}
                  fontSize="xs"
                  borderRadius="full"
                  bg="gray.50"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <LuUsers size={12} />
                  {item.Planholders} planholders
                </Box>
              )}
            </Flex>

            {/* FOOTER */}
            <Flex justify="space-between" align="center" mt={2}>
              <Text fontSize="xs" color="gray.400">
                {isMobile ? "Tap to view details" : "Click to view details"}
              </Text>
              <LuChevronRight color="#a1a1aa" />
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
            onRowClick={(row) => console.log("Clicked row:", row)}
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
    <Box>
      <Flex align="center" justify="space-between" mb={3}>
        <Flex align="center" gap={2}>
          <LuFileText size={16} />
          <Text fontWeight="semibold" fontSize="sm">
            Remittance Slips
          </Text>
          <Text fontSize="xs" color="gray.500">
            {sortedDrsItems.length} slip(s)
          </Text>
        </Flex>
        <IconButton
          aria-label="Collapse panel"
          size="xs"
          variant="ghost"
          onClick={() => setCollapsed(true)}
        >
          <LuChevronLeft />
        </IconButton>
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
      <Box maxH={{ md: "450px", xl: "520px" }} overflowY="auto" pr={1}>
        {slipList}
      </Box>
    </Box>
  );

  // ── Desktop: right panel ──────────────────────────────────────────────────
  const desktopDetailPanel = (
    <Box>
      {!selectedId ? (
        <EmptyStateCard
          title="No DRS Selected"
          description="Select a DRS from the left to view details"
        />
      ) : (
        <>
          <DrsDataTable
            payments={samplePayments}
            onRowClick={(row) => console.log("Clicked row:", row)}
            headerContent={
              selectedItem && (
                <Flex align="center" gap={2}>
                  <Text fontWeight="bold" fontSize="sm">
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
              )
            }
          />
          <Flex justify="flex-end" mt={4} gap={4}>
            <SecondaryMdFlexButton onClick={handleAddDisbursement}>
              Add Disbursement
            </SecondaryMdFlexButton>
            <PrimaryMdFlexButton onClick={handleEncodeDeposit}>
              Encode Deposit
            </PrimaryMdFlexButton>
          </Flex>
        </>
      )}
    </Box>
  );

  return (
    <Page.Root
      title="Digital Remittance Slip"
      description="Manage your digital remittance slip"
      headerButton="menu"
    >
      <Page.MainContent>
        {/* Mobile: show one panel at a time */}
        {isMobile ? (
          mobileView === "list" ? (
            mobileListPanel
          ) : (
            mobileDetailPanel
          )
        ) : (
          // Desktop: side-by-side panels
          <Grid
            gap={6}
            templateColumns={{
              lg: showStrip ? "56px 1fr" : "380px 1fr",
              xl: showStrip ? "56px 1fr" : "420px 1fr",
            }}
            alignItems="start"
            transition="grid-template-columns 0.3s ease"
          >
            <GridItem minW={0} overflow="hidden" h="full">
              {desktopListPanel}
            </GridItem>
            <GridItem h="full" overflow="hidden">
              {desktopDetailPanel}
            </GridItem>
          </Grid>
        )}
      </Page.MainContent>
    </Page.Root>
  );
}
