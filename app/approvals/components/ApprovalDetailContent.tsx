"use client";

import * as React from "react";
import {
  Badge,
  Box,
  Button,
  HStack,
  Separator,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { Check, Printer, X } from "lucide-react";

import type { ApprovalConfig } from "../config/approval-config";
import { DRSPrintModal } from "./DRSPrintModal";

type ApprovalDetailContentProps = {
  row: any;
  config: ApprovalConfig;
  onApprove?: (row: any, remarks: string) => void;
  onDeny?: (row: any, remarks: string) => void;
};

function getNestedValue(row: any, path: string) {
  return path.split(".").reduce((current, key) => current?.[key], row);
}

function getApprovalStatus(row: any) {
  return row.drs?.status ?? row.status;
}

function renderDetailValue(row: any, key: string) {
  const value = getNestedValue(row, key);

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "number") {
    return value.toLocaleString();
  }

  return String(value);
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      rounded="md"
      borderWidth="1px"
      borderColor="border.muted"
      bg="bg"
      p={{ base: 3, md: 4 }}
    >
      <Text
        fontSize="xs"
        fontWeight="semibold"
        color="fg.muted"
        textTransform="uppercase"
        letterSpacing="wider"
        mb={3}
      >
        {title}
      </Text>

      {children}
    </Box>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box>
      <Text fontSize="11px" color="fg.muted" mb="0.5">
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight="medium"
        color="fg"
        overflowWrap="anywhere"
      >
        {value}
      </Text>
    </Box>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorPalette =
    status === "Approved" ? "green" : status === "Denied" ? "red" : "yellow";

  return (
    <Badge colorPalette={colorPalette} variant="subtle">
      {status}
    </Badge>
  );
}

export function ApprovalDetailContent({
  row,
  config,
  onApprove,
  onDeny,
}: ApprovalDetailContentProps) {
  const [remarks, setRemarks] = React.useState("");
  const [drsPrintOpen, setDrsPrintOpen] = React.useState(false);

  const status = getApprovalStatus(row);
  const isPending = status === "Pending";
  const isDRSApproval = config.detailLayout === "drs-print";

  const primaryField = config.detailFields[0];
  const primaryValue = primaryField
    ? renderDetailValue(row, primaryField.key)
    : "Approval Request";

  return (
    <VStack align="stretch" gap={{ base: 4, md: 5 }}>
      <Box>
        <HStack justify="space-between" align="start" gap={3}>
          <Box minW={0}>
            <Text fontSize="xs" color="fg.muted" fontWeight="medium">
              {config.title}
            </Text>

            <Text fontSize="lg" fontWeight="semibold" mt={1} lineClamp={2}>
              {primaryValue}
            </Text>
          </Box>

          <StatusBadge status={status} />
        </HStack>
      </Box>

      <SectionCard title="Request Details">
        <Box
          display="grid"
          gridTemplateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
          }}
          gap={3}
        >
          {config.detailFields.map((field) => {
            const isStatusField =
              field.key === "status" || field.key.endsWith(".status");

            return (
              <DetailItem
                key={`${field.key}-${field.label}`}
                label={field.mandatory ? `${field.label} *` : field.label}
                value={
                  isStatusField ? (
                    <StatusBadge status={status} />
                  ) : (
                    renderDetailValue(row, field.key)
                  )
                }
              />
            );
          })}
        </Box>

        {isDRSApproval && (
          <Button
            mt={4}
            variant="outline"
            size="sm"
            onClick={() => setDrsPrintOpen(true)}
          >
            <Printer size={16} />
            View / Print DRS
          </Button>
        )}
      </SectionCard>

      <SectionCard title="Remarks">
        <Textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add remarks before approving or rejecting..."
          minH="80px"
          resize="vertical"
          disabled={!isPending}
        />
      </SectionCard>

      {isPending ? (
        <>
          <Separator />

          <HStack
            gap={3}
            position={{ base: "sticky", md: "static" }}
            bottom={{ base: 0, md: "auto" }}
            bg="bg"
            py={{ base: 3, md: 0 }}
            zIndex={1}
          >
            <Button
              flex="1"
              variant="outline"
              colorPalette="red"
              onClick={() => onDeny?.(row, remarks)}
            >
              <X size={16} />
              Deny
            </Button>

            <Button
              flex="1"
              colorPalette="blue"
              onClick={() => onApprove?.(row, remarks)}
            >
              <Check size={16} />
              Approve
            </Button>
          </HStack>
        </>
      ) : (
        <Text fontSize="sm" color="fg.muted">
          This request has already been {String(status).toLowerCase()}.
        </Text>
      )}

      {isDRSApproval && (
        <DRSPrintModal
          open={drsPrintOpen}
          onClose={() => setDrsPrintOpen(false)}
          row={row}
        />
      )}
    </VStack>
  );
}
