"use client";

import * as React from "react";
import {
  Box,
  HStack,
  Image,
  Table,
  Text,
} from "@chakra-ui/react";
import {
  formatApprovalDateTime,
  formatPeso as formatPesoValue,
} from "../utils/formatters";
import { APPROVAL_BRAND_COLORS } from "../utils/colors";

type PaymentDetail = {
  depositDtl: {
    SINo?: string;
  };
  payment?: {
    ORNo?: string;
    PayType?: string;
    InstNo?: string | number;
    SIDate?: string;
    SIAmount?: number | string;
    LpaNo?: string;
    LPANo?: string;
    Payor?: string;
    PayClass?: string;
    SI?: string;
    name?: string;
  } | null;
};

type DRSData = {
  drs: {
    id: string;
    referenceNo?: string;
    status?: string;
    createdAt?: string;
  };
  deposit?: {
    deposit?: {
      DepositedBy?: string;
      DepositDate?: string;
      DepositDateTime?: string;
      BankName?: string;
      BankBranch?: string;
      BankCode?: string;
      AccountNo?: string;
      CheckBookNo?: string;
      Amount?: number | string;
    } | null;
    details?: PaymentDetail[];
  } | null;
};

function safeAmount(v: unknown) {
  return Number(v ?? 0);
}

function ReportField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box>
      <Text fontSize="10px" fontWeight="700" color="gray.600" mb="1">
        {label}
      </Text>
      <Text fontSize="12px" color="black" minH="18px">
        {value || "-"}
      </Text>
    </Box>
  );
}

export function DRSPrintLayout({
  drs,
  companyName = "ST. PETER LIFE PLAN, INC.",
  companyAddress = "Head Office, Quezon City, Philippines",
}: {
  drs: DRSData;
  companyName?: string;
  companyAddress?: string;
}) {
  const depositHdr = drs.deposit?.deposit ?? null;
  const details = drs.deposit?.details ?? [];

  const totalAmount = details.reduce(
    (sum, item) => sum + safeAmount(item.payment?.SIAmount),
    0,
  );

  const declaredAmount = safeAmount(depositHdr?.Amount);
  const difference = totalAmount - declaredAmount;
  const isShort = difference < 0;
  const generatedAt = formatApprovalDateTime(new Date().toISOString());

  return (
    <Box
      bg="white"
      color="black"
      w="full"
      maxW="960px"
      mx="auto"
      p={8}
      borderWidth="1px"
      borderColor="blackAlpha.300"
      className="print-area"
      fontFamily="Arial, sans-serif"
    >
      {/* HEADER */}
      <HStack align="start" justify="space-between" gap={6} mb={6}>
        <HStack align="start" gap={3}>
          <Image
            src="/images/osp-chakra-reusable-components/stpeter-logo.png"
            alt="St. Peter Life Plan"
            h="44px"
            w="auto"
            objectFit="contain"
          />
          <Box>
            <Text fontSize="15px" fontWeight="700" letterSpacing="0.3px">
              {companyName}
            </Text>
            <Text fontSize="10px">{companyAddress}</Text>
            <Text fontSize="10px">Branch Office Address</Text>
          </Box>
        </HStack>

        <Box textAlign="right">
          <Text fontSize="16px" fontWeight="700">
            DIGITAL REMITTANCE SLIP
          </Text>
          <Text fontSize="10px" color="gray.700" mt={1}>
            Generated: {generatedAt}
          </Text>
        </Box>
      </HStack>

      {/* REPORT META */}
      <Box borderWidth="1px" borderColor="black" mb={4}>
        <HStack justify="space-between" align="stretch">
          <Box flex="1" p={3}>
            <Text fontSize="10px" fontWeight="700" color="gray.600" mb="1">
              REFERENCE NO.
            </Text>
            <Text fontSize="12px" fontWeight="700">
              {drs.drs.referenceNo ?? drs.drs.id ?? "-"}
            </Text>
          </Box>

          <Box flex="1" p={3}>
            <Text fontSize="10px" fontWeight="700" color="gray.600" mb="1">
              STATUS
            </Text>
            <Text fontSize="12px">{drs.drs.status ?? "-"}</Text>
          </Box>

          <Box flex="1" p={3}>
            <Text fontSize="10px" fontWeight="700" color="gray.600" mb="1">
              CREATED AT
            </Text>
            <Text fontSize="12px">
              {formatApprovalDateTime(drs.drs.createdAt)}
            </Text>
          </Box>
        </HStack>
      </Box>

      {/* DEPOSIT INFORMATION */}
      <Box borderWidth="1px" borderColor="black" mb={4}>
        <Box
          px={3}
          py={2}
          borderBottomWidth="1px"
          borderColor="black"
          bg="gray.100"
        >
          <Text fontSize="11px" fontWeight="700">
            DEPOSIT INFORMATION
          </Text>
        </Box>

        <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={0}>
          <Box
            p={3}
            borderRightWidth="1px"
            borderBottomWidth="1px"
            borderColor="black"
          >
            <ReportField label="Deposited By" value={depositHdr?.DepositedBy} />
          </Box>
          <Box
            p={3}
            borderRightWidth="1px"
            borderBottomWidth="1px"
            borderColor="black"
          >
            <ReportField
              label="Deposit Date and Time"
              value={formatApprovalDateTime(depositHdr?.DepositDateTime)}
            />
          </Box>
          <Box p={3} borderBottomWidth="1px" borderColor="black">
            <ReportField label="Bank Name" value={depositHdr?.BankName} />
          </Box>

          <Box
            p={3}
            borderRightWidth="1px"
            borderBottomWidth="1px"
            borderColor="black"
          >
            <ReportField label="Bank Branch" value={depositHdr?.BankBranch} />
          </Box>
          <Box
            p={3}
            borderRightWidth="1px"
            borderBottomWidth="1px"
            borderColor="black"
          >
            <ReportField label="Bank Code" value={depositHdr?.BankCode} />
          </Box>
          <Box p={3} borderBottomWidth="1px" borderColor="black">
            <ReportField label="Account No." value={depositHdr?.AccountNo} />
          </Box>

          <Box p={3} borderRightWidth="1px" borderColor="black">
            <ReportField
              label="Checkbook No."
              value={depositHdr?.CheckBookNo}
            />
          </Box>
          <Box p={3} borderRightWidth="1px" borderColor="black">
            <ReportField
              label="Declared Deposit Amount"
              value={formatPesoValue(safeAmount(depositHdr?.Amount))}
            />
          </Box>
          <Box p={3}>
            <ReportField
              label="Computed Payment Total"
              value={formatPesoValue(totalAmount)}
            />
          </Box>

          <Box p={3}>
            <ReportField
              label="Difference (Excess / Short)"
              value={
                <Text
                  fontWeight="bold"
                  color={
                    isShort
                      ? APPROVAL_BRAND_COLORS.errorRed
                      : APPROVAL_BRAND_COLORS.warningText
                  }
                >
                  {difference >= 0
                    ? `+${formatPesoValue(difference)}`
                    : `-${formatPesoValue(Math.abs(difference))}`}
                </Text>
              }
            />
          </Box>
        </Box>
      </Box>

      {/* PAYMENT DETAILS TABLE */}
      <Box borderWidth="1px" borderColor="black" mb={4}>
        <Box
          px={3}
          py={2}
          borderBottomWidth="1px"
          borderColor="black"
          bg="gray.100"
        >
          <Text fontSize="11px" fontWeight="700">
            PAYMENT DETAILS
          </Text>
        </Box>

        <Table.Root size="sm" variant="outline">
          <Table.Header>
            <Table.Row bg="gray.50">
              <Table.ColumnHeader
                borderColor="black"
                fontSize="10px"
                color="black"
              >
                SI NO.
              </Table.ColumnHeader>
              <Table.ColumnHeader
                borderColor="black"
                fontSize="10px"
                color="black"
              >
                OR NO.
              </Table.ColumnHeader>
              <Table.ColumnHeader
                borderColor="black"
                fontSize="10px"
                color="black"
              >
                LPA NO.
              </Table.ColumnHeader>
              <Table.ColumnHeader
                borderColor="black"
                fontSize="10px"
                color="black"
              >
                PH Name
              </Table.ColumnHeader>
              <Table.ColumnHeader
                borderColor="black"
                fontSize="10px"
                color="black"
              >
                PAY CLASS
              </Table.ColumnHeader>
              <Table.ColumnHeader
                borderColor="black"
                fontSize="10px"
                color="black"
              >
                INSTNO
              </Table.ColumnHeader>
              <Table.ColumnHeader
                borderColor="black"
                fontSize="10px"
                color="black"
              >
                SI DATE
              </Table.ColumnHeader>
              <Table.ColumnHeader
                borderColor="black"
                fontSize="10px"
                color="black"
                textAlign="right"
              >
                AMOUNT
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {details.length > 0 ? (
              details.map((item, idx) => (
                <Table.Row key={`${item.depositDtl.SINo}-${idx}`}>
                  <Table.Cell borderColor="black" fontSize="11px">
                    {item.depositDtl.SINo ?? "-"}
                  </Table.Cell>
                  <Table.Cell borderColor="black" fontSize="11px">
                    {(item.payment as any)?.ORNo ?? item.payment?.SI ?? "-"}
                  </Table.Cell>
                  <Table.Cell borderColor="black" fontSize="11px">
                    {(item.payment as any)?.LpaNo ?? item.payment?.LPANo ?? "-"}
                  </Table.Cell>
                  <Table.Cell borderColor="black" fontSize="11px">
                    {(item.payment as any)?.Payor ?? item.payment?.name ?? "-"}
                  </Table.Cell>
                  <Table.Cell borderColor="black" fontSize="11px">
                    {(item.payment as any)?.PayType ??
                      item.payment?.PayClass ??
                      "-"}
                  </Table.Cell>
                  <Table.Cell borderColor="black" fontSize="11px">
                    {item.payment?.InstNo ?? "-"}
                  </Table.Cell>
                  <Table.Cell borderColor="black" fontSize="11px">
                    {formatApprovalDateTime(item.payment?.SIDate)}
                  </Table.Cell>
                  <Table.Cell
                    borderColor="black"
                    fontSize="11px"
                    textAlign="right"
                    fontWeight="medium"
                  >
                    {formatPesoValue(safeAmount(item.payment?.SIAmount))}
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell
                  colSpan={8}
                  borderColor="black"
                  textAlign="center"
                  fontSize="11px"
                  py={4}
                >
                  No payment details found.
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>

        <Box
          display="flex"
          justifyContent="flex-end"
          px={4}
          py={3}
          borderTopWidth="1px"
          borderColor="black"
          bg="gray.50"
        >
          <HStack gap={8}>
            <Text fontSize="12px" fontWeight="700">
              TOTAL:
            </Text>
            <Text
              fontSize="12px"
              fontWeight="700"
              minW="140px"
              textAlign="right"
            >
              {formatPesoValue(totalAmount)}
            </Text>
          </HStack>
        </Box>
      </Box>

      {/* FOOTER / SIGNATURES */}
      <Box borderWidth="1px" borderColor="black" p={4}>
        <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={8} mt={6}>
          {["Prepared By", "Verified By", "Noted By"].map((label) => (
            <Box key={label} textAlign="center">
              <Box h="36px" />
              <Box borderTopWidth="1px" borderColor="black" pt={1}>
                <Text fontSize="10px" fontWeight="700">
                  {label}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <HStack justify="space-between" mt={4}>
        <Text fontSize="9px" color="gray.700">
          SYSTEM Version X.X.XX
        </Text>
        <Text fontSize="9px" color="gray.700">
          Page 1 of 1
        </Text>
      </HStack>
    </Box>
  );
}
