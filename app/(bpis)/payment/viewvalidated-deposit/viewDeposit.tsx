"use client";

import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Portal,
  Separator,
  SimpleGrid,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  LuBanknote,
  LuCalendar,
  LuChevronLeft,
  LuChevronRight,
  LuLandmark,
  LuLayoutList,
} from "react-icons/lu";

import {
  Body,
  CancelSolidButton,
  DeleteOutlineButton,
  DeleteSolidButton,
  InputFloatingLabel,
  SaveButton,
} from "st-peter-ui";
import { depositHDR, samplePayments } from "../data/paymentDetails";
import { useEffect, useMemo, useState } from "react";

import {
  LookupColumn,
  LookupField,
} from "@/components/common/reusable-lookup/LookUpField";
import { Employee } from "@/data/doc-management/employeeSelector";
import { EMPLOYEES } from "@/data/doc-management/documenttype";
import DrsDataTable from "../components/drsDataTable";
import DrsPaymentSummary from "../components/drsPaymentSummary";
import { DrsFunction } from "../utils/drsFunction";
import Page from "@/claude components/layout/page/Page";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import { OSPBadge } from "@/components/common/badge/badge";
import { RowItem } from "@/claude components/info-card/row-item";

const STATUS_STYLES: Record<
  string,
  { colorPalette: "warning" | "success" | "info"; dotColor: string }
> = {
  Pending: { colorPalette: "warning", dotColor: "yellow.500" },
  Validated: { colorPalette: "success", dotColor: "green.500" },
  "For Deposit": { colorPalette: "info", dotColor: "blue.500" },
};

type MobileView = "list" | "detail";

const getStatus = (item: (typeof depositHDR)[number]) =>
  item.Status ?? (item.isApproved ? "Validated" : "Pending");

export default function ViewDeposit() {
  const { totals } = DrsFunction(samplePayments);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [open, setOpen] = useState(false);

  const sortedDrsItems = useMemo(
    () => [...depositHDR].sort((a, b) => Number(b.id) - Number(a.id)),
    [],
  );

  const selectedItem = useMemo(
    () => sortedDrsItems.find((item) => item.id === selectedId),
    [selectedId, sortedDrsItems],
  );

  const employeeColumns: LookupColumn<Employee>[] = [
    { key: "id", header: "Employee ID" },
    { key: "name", header: "Name" },
    { key: "branch", header: "Branch" },
  ];
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const isMobile = useBreakpointValue({ base: true, lg: false }) ?? false;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const showStrip = collapsed && !isMobile;

  const handleSelectItem = (id: string) => {
    setSelectedId(id);
    if (isMobile) setMobileView("detail");
  };

  // ── Deposit list items (shared) ───────────────────────────────────────────
  const depositList = (
    <Stack gap={2}>
      {sortedDrsItems.map((item) => {
        const isSelected = selectedId === item.id;
        const status = getStatus(item);
        const styles = STATUS_STYLES[status] ?? STATUS_STYLES.Pending;

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
                  <LuBanknote size={18} />
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="md" lineHeight="1.2">
                    {item.name}
                  </Text>
                  <Flex align="center" gap={1} fontSize="xs" color="gray.500">
                    <LuCalendar size={12} />
                    <Text>{item.DepositDateTime}</Text>
                  </Flex>
                </Box>
              </Flex>
              <OSPBadge type={styles.colorPalette}>{status}</OSPBadge>
            </Flex>

            {/* QUICK INFO CHIPS */}
            <Flex gap={2} wrap="wrap" mb={3}>
              {item.Amount && (
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
              )}
              {item.BankBranch && (
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
                  <LuLandmark size={12} />
                  {item.BankBranch}
                </Box>
              )}
            </Flex>

            {/* FOOTER */}
            <Flex justify="space-between" align="center">
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

  // ── Deposit meta rows (shared) ────────────────────────────────────────────
  const depositMeta = (
    <Box mt={3}>
      <RowItem
        label="Date / Time"
        value={selectedItem?.DepositDateTime ?? ""}
      />
      <RowItem label="Amount" value={selectedItem?.Amount ?? "0"} />
      <RowItem label="Account No" value={selectedItem?.AccountNo ?? ""} />
      <RowItem label="Bank Branch" value={selectedItem?.BankBranch ?? ""} />
      <RowItem label="Bank Code" value={selectedItem?.BankCode ?? ""} />
      <RowItem label="Deposited By" value={selectedItem?.DepositedBy || "-"} />
    </Box>
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
          <LuLayoutList size={16} />
        </Box>
        <Box>
          <Text fontWeight="bold" fontSize="md" lineHeight="1.2">
            Validated Deposits
          </Text>
          <Text fontSize="xs" color="gray.500">
            {sortedDrsItems.length} deposit(s)
          </Text>
        </Box>
      </Flex>

      <Box p={4}>
        <Box mb={3}>
          <LookupField<Employee>
            label=""
            placeholder="Search by name or ID..."
            modalTitle="Search Employee"
            columns={employeeColumns}
            dataSource={EMPLOYEES}
            searchKeys={["id", "name", "branch"]}
            onSelect={setSelectedEmployee}
            renderDisplay={(emp) => `${emp.name} (${emp.id})`}
            value={selectedEmployee}
          />
        </Box>
        {depositList}
      </Box>
    </Box>
  );

  // ── Mobile: detail view ───────────────────────────────────────────────────
  const mobileDetailPanel = (
    <Box pb="140px">
      {!selectedId ? (
        <EmptyStateCard
          title="No Deposit Selected"
          description="Select a deposit from the list to view details"
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
                  {selectedItem?.name ?? "Deposit Details"}
                </Text>
                {selectedItem && (
                  <OSPBadge
                    type={
                      (
                        STATUS_STYLES[getStatus(selectedItem)] ??
                        STATUS_STYLES.Pending
                      ).colorPalette
                    }
                  >
                    {getStatus(selectedItem)}
                  </OSPBadge>
                )}
              </Flex>
            }
          />
          {depositMeta}
          <DrsPaymentSummary totals={totals} displayProp={false} />
        </>
      )}

      {selectedId && (
        <Box
          // position="fixed"
          bottom={0}
          left={0}
          right={0}
          mt={"10px"}
          borderRadius={"md"}
          px={4}
          py={3}
          bg="white"
          borderTopWidth={1}
          borderColor="gray.100"
          shadow="lg"
          zIndex={10}
        >
          <Stack gap={2}>
            <Button width="full" onClick={() => setOpen(true)}>
              Encode Supplementary
            </Button>
            <Button
              width="full"
              variant="outline"
              color="red.500"
              borderColor="red.500"
              _hover={{ bg: "red.500", color: "white" }}
            >
              {/* <LuTrash /> */}
              Delete Deposit
            </Button>
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
          aria-label="Expand deposits panel"
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
          Validated Deposits
        </Body>
      </Flex>
    </Box>
  ) : (
    <Box>
      <Flex align="center" justify="space-between" mb={3}>
        <Flex align="center" gap={2}>
          <LuLayoutList size={16} />
          <Text fontWeight="semibold" fontSize="sm">
            Validated Deposits
          </Text>
          <Text fontSize="xs" color="gray.500">
            {sortedDrsItems.length} deposit(s)
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
        <LookupField<Employee>
          label=""
          placeholder="Search by name or ID..."
          modalTitle="Search Employee"
          columns={employeeColumns}
          dataSource={EMPLOYEES}
          searchKeys={["id", "name", "branch"]}
          onSelect={setSelectedEmployee}
          renderDisplay={(emp) => `${emp.name} (${emp.id})`}
          value={selectedEmployee}
        />
      </Box>
      <Box maxH={{ md: "450px", xl: "520px" }} overflowY="auto" pr={1}>
        {depositList}
      </Box>
    </Box>
  );

  // ── Desktop: right panel ──────────────────────────────────────────────────
  const desktopDetailPanel = (
    <Box>
      {!selectedId ? (
        <EmptyStateCard
          title="No Deposit Selected"
          description="Select a deposit from the left to view details"
        />
      ) : (
        <>
          <DrsDataTable
            payments={samplePayments}
            onRowClick={(row) => {}}
            headerContent={
              selectedItem && (
                <Flex align="center" gap={2}>
                  <Text fontWeight="bold" fontSize="sm">
                    {selectedItem.name}
                  </Text>
                  <OSPBadge
                    type={
                      (
                        STATUS_STYLES[getStatus(selectedItem)] ??
                        STATUS_STYLES.Pending
                      ).colorPalette
                    }
                  >
                    {getStatus(selectedItem)}
                  </OSPBadge>
                </Flex>
              )
            }
          />
          {depositMeta}
          <Flex justify="space-between" align="center" mt={4}>
            <Button size="sm" onClick={() => setOpen(true)}>
              Encode Supplementary
            </Button>
            <DeleteSolidButton />
          </Flex>
        </>
      )}
    </Box>
  );

  return (
    <Page.Root
      title="View Validated Deposit"
      description="Review your validated deposit"
      headerButton="menu"
    >
      <Page.MainContent>
        {isMobile ? (
          mobileView === "list" ? (
            mobileListPanel
          ) : (
            mobileDetailPanel
          )
        ) : (
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

        {/* Encode Supplementary Dialog */}
        <Dialog.Root
          open={open}
          size={{ base: "full", md: "xl" }}
          placement="center"
          scrollBehavior="inside"
          motionPreset="slide-in-bottom"
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner p={{ base: 0, md: undefined }}>
              <Dialog.Content
                borderRadius={{ base: 0, md: undefined }}
                h={{ base: "100dvh", md: "auto" }}
              >
                <Dialog.Header>
                  <Dialog.Title>
                    Encode Supplementary - {selectedId}
                  </Dialog.Title>
                </Dialog.Header>
                <Separator />
                <Dialog.Body>
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gapX={2}>
                    <InputFloatingLabel
                      type="date"
                      id="depositdate"
                      label="Deposit Date Time"
                    />
                    <InputFloatingLabel
                      type="number"
                      id="AccountNo"
                      label="Account No#:"
                    />
                    <InputFloatingLabel id="BankBranch" label="Bank Branch" />
                    <InputFloatingLabel id="BankCode" label="Bank Code" />
                    <InputFloatingLabel id="Amount" label="Amount" />
                    <InputFloatingLabel label="Deposited By" />
                  </SimpleGrid>
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <CancelSolidButton onClick={() => setOpen(false)} />
                  </Dialog.ActionTrigger>
                  <SaveButton />
                </Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <CloseButton onClick={() => setOpen(false)} />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Page.MainContent>
    </Page.Root>
  );
}
