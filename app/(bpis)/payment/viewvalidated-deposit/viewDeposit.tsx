"use client";

import {
  Badge,
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
  LuFileText,
  LuLandmark,
  LuLayoutList,
  LuTrash,
  LuUsers,
} from "react-icons/lu";

import {
  Body,
  CancelSolidButton,
  DeleteOutlineButton,
  DeleteSolidButton,
  PrimaryMdButton,
  SaveButton,
  SecondaryMdButton,
} from "st-peter-ui";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";
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
import { DepositHdr } from "../data/payment.types";
import { RowItem } from "@/claude components/info-card/row-item";
import { SlipUpload, SlipUploadStatus } from "../components/SlipUpload";
import { toast } from "sonner";

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

type MobileView = "list" | "detail";

const getStatus = (item: (typeof depositHDR)[number]) =>
  item.Status ?? (item.isApproved ? "Validated" : "Pending");

export const MetaCard = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => (
  <>
    <Box
      px={4}
      py={3}
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.100"
      shadow="sm"
      display={{ base: "none", lg: "block" }}
    >
      <Text fontSize="xs" color="gray.500" mb={1}>
        {label}
      </Text>
      <Text fontWeight="semibold" fontSize="sm">
        {value || "-"}
      </Text>
    </Box>
    <Box display={{ base: "block", lg: "none" }}>
      <RowItem label={label} value={value || "-"} />
    </Box>
  </>
);

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

  const EMPTY_SUPPLEMENTARY_DATA = {
    depositDateTime: "",
    accountNo: "",
    bankBranch: "",
    bankCode: "",
    amount: "",
    depositedBy: "",
  };
  const [supplementaryData, setSupplementaryData] = useState(
    EMPTY_SUPPLEMENTARY_DATA,
  );
  const [slipStatus, setSlipStatus] = useState<SlipUploadStatus>("idle");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | undefined>(
    undefined,
  );
  const [slipError, setSlipError] = useState<string | undefined>(undefined);

  const mockSupplementarySlipOCR = async (_file: File) => {
    return new Promise<typeof supplementaryData>((resolve) => {
      setTimeout(() => {
        resolve({
          depositDateTime: "2026-07-16",
          accountNo: "2010073262",
          bankBranch: "Makati Branch",
          bankCode: "124",
          amount: "5000",
          depositedBy: "Juan Dela Cruz",
        });
      }, 2000);
    });
  };

  const processSupplementarySlipFile = async (file: File) => {
    setSlipFile(file);
    setSlipPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;
    });
    setSlipError(undefined);
    setSlipStatus("processing");
    try {
      const result = await mockSupplementarySlipOCR(file);
      setSupplementaryData(result);
      setSlipStatus("completed");
      toast.success("Deposit slip details extracted!");
    } catch {
      setSlipStatus("failed");
      setSlipError(
        "We couldn't read this deposit slip. Please retry or choose another file.",
      );
      toast.error("Failed to process deposit slip");
    }
  };

  const handleSupplementarySlipFilesSelected = (files: File[]) => {
    if (!files || files.length === 0) return;
    void processSupplementarySlipFile(files[0]);
  };

  const handleSupplementarySlipRetry = () => {
    if (slipFile) void processSupplementarySlipFile(slipFile);
  };

  const handleSupplementarySlipRemove = () => {
    if (slipPreviewUrl) URL.revokeObjectURL(slipPreviewUrl);
    setSlipFile(null);
    setSlipPreviewUrl(undefined);
    setSlipError(undefined);
    setSlipStatus("idle");
  };

  const resetSupplementaryDialog = () => {
    setSupplementaryData(EMPTY_SUPPLEMENTARY_DATA);
    handleSupplementarySlipRemove();
  };

  const handleOpenSupplementaryDialog = () => {
    resetSupplementaryDialog();
    setOpen(true);
  };

  const handleCloseSupplementaryDialog = () => {
    setOpen(false);
    resetSupplementaryDialog();
  };

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
    // <Stack gap={2}>
    //   {sortedDrsItems.map((item) => {
    //     const isSelected = selectedId === item.id;
    //     const status = getStatus(item);
    //     const styles = STATUS_STYLES[status] ?? STATUS_STYLES.Pending;

    //     return (
    //       <Box
    //         key={item.id}
    //         w="100%"
    //         position="relative"
    //         p={4}
    //         borderRadius="2xl"
    //         // bg={isSelected ? "green.50" : "white"}
    //         shadow="sm"
    //         transition="all 0.25s ease"
    //         _hover={{ transform: "translateY(-3px)", shadow: "lg" }}
    //         overflow="hidden"
    //         cursor="pointer"
    //         onClick={() => handleSelectItem(item.id)}
    //         borderWidth="2px"
    //         // borderColor={isSelected ? "green.400" : "transparent"}
    //       >
    //         {/* HEADER */}
    //         <Flex justify="space-between" align="start" mb={3}>
    //           <Flex align="center" gap={2}>
    //             <Box p={2} borderRadius="full" bg="gray.100">
    //               <LuBanknote size={18} />
    //             </Box>
    //             <Box>
    //               <Text fontWeight="bold" fontSize="md" lineHeight="1.2">
    //                 {item.name}
    //               </Text>
    //               <Flex align="center" gap={1} fontSize="xs" color="gray.500">
    //                 <LuCalendar size={12} />
    //                 <Text>{item.DepositDateTime}</Text>
    //               </Flex>
    //             </Box>
    //           </Flex>
    //           <OSPBadge type={styles.colorPalette}>{status}</OSPBadge>
    //         </Flex>

    //         {/* QUICK INFO CHIPS */}
    //         <Flex gap={2} wrap="wrap" mb={3}>
    //           {item.Amount && (
    //             <Box
    //               px={2}
    //               py={1}
    //               fontSize="xs"
    //               borderRadius="full"
    //               bg="gray.50"
    //               display="flex"
    //               alignItems="center"
    //               gap={1}
    //             >
    //               <LuBanknote size={12} />
    //               {item.Amount}
    //             </Box>
    //           )}
    //           {item.BankBranch && (
    //             <Box
    //               px={2}
    //               py={1}
    //               fontSize="xs"
    //               borderRadius="full"
    //               bg="gray.50"
    //               display="flex"
    //               alignItems="center"
    //               gap={1}
    //             >
    //               <LuLandmark size={12} />
    //               {item.BankBranch}
    //             </Box>
    //           )}
    //         </Flex>

    //         {/* FOOTER */}
    //         <Flex justify="space-between" align="center">
    //           <Text fontSize="xs" color="gray.400">
    //             {isMobile ? "Tap to view details" : "Click to view details"}
    //           </Text>
    //           <LuChevronRight color="#a1a1aa" />
    //         </Flex>
    //       </Box>
    //     );
    //   })}
    // </Stack>
  );

  // ── Deposit meta cards (shared) ───────────────────────────────────────────
  const depositMeta = (
    <SimpleGrid columns={{ base: 1, lg: 3 }} gap={3} mt={3}>
      <MetaCard label="Date / Time" value={selectedItem?.DepositDateTime} />
      <MetaCard label="Amount" value={selectedItem?.Amount ?? "0"} />
      <MetaCard label="Account No" value={selectedItem?.AccountNo} />
      <MetaCard label="Bank Branch" value={selectedItem?.BankBranch} />
      <MetaCard label="Bank Code" value={selectedItem?.BankCode} />
      <MetaCard label="Deposited By" value={selectedItem?.DepositedBy} />
    </SimpleGrid>
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
            <Button width="full" onClick={handleOpenSupplementaryDialog}>
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
          aria-label="Expand validated deposits panel"
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
          Validated Deposits
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
              Validated Deposits
            </Text>
            <Text fontSize="xs" color="gray.500">
              {sortedDrsItems.length} slip(s)
            </Text>
          </Box>
        </Flex>
        <Flex align="center" gap={1}>
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
        <LookupField<Employee>
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
      <Box flex="1" minH={0} overflowY="auto" pr={1} pb={3}>
        {depositList}
      </Box>
    </Flex>
  );

  // ── Desktop: right panel ──────────────────────────────────────────────────
  const desktopDetailPanel = (
    <Flex direction="column" h="full">
      {!selectedId ? (
        <EmptyStateCard
          title="No Deposit Selected"
          description="Select a deposit from the left to view details"
        />
      ) : (
        <>
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
                    {selectedItem?.name}
                  </Text>
                  <OSPBadge
                    type={
                      (
                        STATUS_STYLES[
                          getStatus(selectedItem ?? ("Pending" as any))
                        ] ?? STATUS_STYLES.Pending
                      ).colorPalette
                    }
                  >
                    {getStatus(selectedItem ?? ("Pending" as any))}
                  </OSPBadge>
                </Flex>
                <Flex gap={5} fontSize="sm" color="gray.500" align="center">
                  <Flex align="center" gap={1.5}>
                    <LuCalendar size={13} />
                    <Text>
                      {formatSlipDate(selectedItem?.DepositDateTime ?? "")}
                    </Text>
                  </Flex>
                  <Flex align="center" gap={1.5}>
                    <LuBanknote size={13} />
                    <Text fontWeight="semibold" color="gray.700">
                      {selectedItem?.Amount ?? "0"}
                    </Text>
                  </Flex>
                  {selectedItem?.Planholders != null && (
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
                  >
                    <LuTrash size={16} />
                  </IconButton>
                )}
                <PrimaryMdButton
                  width="auto"
                  onClick={handleOpenSupplementaryDialog}
                >
                  Encode Supplementary
                </PrimaryMdButton>
              </Flex>
            </Flex>
          </Box>
          <Flex
            direction={"column"}
            minW={0}
            minH={0}
            overflow="auto"
            px={1}
            pb={3}
            gapY={2}
          >
            {depositMeta}
            <DrsDataTable payments={samplePayments} />
          </Flex>
        </>
      )}
    </Flex>
  );

  return (
    <Page.Root
      title="View Validated Deposit"
      description="Review your validated deposit"
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
                borderRadius={{ base: 0, md: "xl" }}
                minH={{ base: "100dvh", md: "auto" }}
              >
                <Dialog.Header>
                  <Dialog.Title>
                    Encode Supplementary - {selectedId}
                  </Dialog.Title>
                </Dialog.Header>
                <Separator />
                <Dialog.Body>
                  <Box mb={3}>
                    <SlipUpload
                      documentLabel="deposit slip (optional)"
                      status={slipStatus}
                      fileName={slipFile?.name}
                      fileSize={slipFile?.size}
                      previewUrl={slipPreviewUrl}
                      error={slipError}
                      extractedCount={
                        Object.values(supplementaryData).filter(Boolean).length
                      }
                      onFilesSelected={handleSupplementarySlipFilesSelected}
                      onRetry={handleSupplementarySlipRetry}
                      onRemove={handleSupplementarySlipRemove}
                    />
                  </Box>
                  <SimpleGrid
                    columns={{ base: 1, sm: 2, md: 3 }}
                    gapX={2}
                    gapY={3}
                  >
                    <FloatingLabelInput
                      type="date"
                      id="depositdate"
                      label="Deposit Date Time"
                      value={supplementaryData.depositDateTime}
                      onChange={(e) =>
                        setSupplementaryData((prev) => ({
                          ...prev,
                          depositDateTime: e.target.value,
                        }))
                      }
                    />
                    <FloatingLabelInput
                      type="number"
                      id="AccountNo"
                      label="Account No#:"
                      value={supplementaryData.accountNo}
                      onChange={(e) =>
                        setSupplementaryData((prev) => ({
                          ...prev,
                          accountNo: e.target.value,
                        }))
                      }
                    />
                    <FloatingLabelInput
                      id="BankBranch"
                      label="Bank Branch"
                      value={supplementaryData.bankBranch}
                      onChange={(e) =>
                        setSupplementaryData((prev) => ({
                          ...prev,
                          bankBranch: e.target.value,
                        }))
                      }
                    />
                    <FloatingLabelInput
                      id="BankCode"
                      label="Bank Code"
                      value={supplementaryData.bankCode}
                      onChange={(e) =>
                        setSupplementaryData((prev) => ({
                          ...prev,
                          bankCode: e.target.value,
                        }))
                      }
                    />
                    <FloatingLabelInput
                      id="Amount"
                      label="Amount"
                      value={supplementaryData.amount}
                      onChange={(e) =>
                        setSupplementaryData((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                    />
                    <FloatingLabelInput
                      label="Deposited By"
                      value={supplementaryData.depositedBy}
                      onChange={(e) =>
                        setSupplementaryData((prev) => ({
                          ...prev,
                          depositedBy: e.target.value,
                        }))
                      }
                    />
                  </SimpleGrid>
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <CancelSolidButton
                      onClick={handleCloseSupplementaryDialog}
                    />
                  </Dialog.ActionTrigger>
                  <SaveButton />
                </Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <CloseButton onClick={handleCloseSupplementaryDialog} />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Page.MainContent>
    </Page.Root>
  );
}
