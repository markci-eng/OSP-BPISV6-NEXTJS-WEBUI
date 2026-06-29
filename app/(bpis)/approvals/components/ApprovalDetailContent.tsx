"use client";

import * as React from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Separator,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import {
  Check,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Printer,
  X,
  XCircle,
} from "lucide-react";

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
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box
      rounded="lg"
      borderWidth="1px"
      borderColor="border.muted"
      overflow="hidden"
    >
      <HStack
        gap={2}
        px={4}
        py={2.5}
        borderBottomWidth="1px"
        borderColor="border.muted"
        bg="bg.subtle"
      >
        {icon && <Box color="fg.muted">{icon}</Box>}
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color="fg.muted"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          {title}
        </Text>
      </HStack>

      <Box bg="bg" p={3}>
        {children}
      </Box>
    </Box>
  );
}

function DetailItem({
  label,
  value,
  mandatory,
}: {
  label: string;
  value: React.ReactNode;
  mandatory?: boolean;
}) {
  return (
    <Box width={"full"}>
      <Flex align="center" py={1.5} fontSize="sm">
        {/* LABEL */}
        <Text color="gray.500" whiteSpace="nowrap">
          {label}
        </Text>
        {mandatory && (
          <Text fontSize="10px" color="red.400" ml={1} fontWeight="700">
            *
          </Text>
        )}

        {/* LINE */}
        <Box
          flex="1"
          mx={3}
          borderBottom="1px dashed"
          borderColor="gray.300"
          transform="translateY(2px)"
        />

        {/* VALUE */}
        <Text fontWeight="medium" textAlign="right" whiteSpace="nowrap">
          {value ?? "-"}
        </Text>
      </Flex>

      {/* <HStack gap={0.5} mb={0.5}>
        <Text
          fontSize="10px"
          fontWeight="700"
          color="fg.subtle"
          textTransform="uppercase"
          letterSpacing="wide"
        >
          {label}
        </Text>
        {mandatory && (
          <Text fontSize="10px" color="red.400" fontWeight="700">
            *
          </Text>
        )}
      </HStack>
      <Text
        fontSize="sm"
        fontWeight="medium"
        color="fg"
        overflowWrap="anywhere"
      >
        {value}
      </Text> */}
    </Box>
  );
}

const STATUS_META = {
  Approved: {
    colorPalette: "green",
    color: "green.600",
    bg: "green.50",
    borderColor: "green.200",
    icon: CheckCircle2,
  },
  Denied: {
    colorPalette: "red",
    color: "red.600",
    bg: "red.50",
    borderColor: "red.200",
    icon: XCircle,
  },
  Pending: {
    colorPalette: "yellow",
    color: "yellow.700",
    bg: "yellow.50",
    borderColor: "yellow.200",
    icon: Clock,
  },
};

function StatusBadge({ status }: { status: string }) {
  const meta =
    STATUS_META[status as keyof typeof STATUS_META] ?? STATUS_META.Pending;
  const Icon = meta.icon;

  return (
    <Badge
      colorPalette={meta.colorPalette}
      variant="subtle"
      gap={1}
      flexShrink={0}
    >
      <Icon size={11} />
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

  const statusMeta =
    STATUS_META[status as keyof typeof STATUS_META] ?? STATUS_META.Pending;

  return (
    <VStack align="stretch" gap={3}>
      {/* Header with status accent */}
      <Box
        rounded="lg"
        borderWidth="1px"
        borderColor={statusMeta.borderColor}
        // borderLeftWidth="4px"
        // borderLeftColor={statusMeta.color}
        bg={statusMeta.bg}
        p={4}
      >
        <HStack justify="space-between" align="start" gap={3}>
          <Box minW={0}>
            <Text
              fontSize="10px"
              fontWeight="700"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color="fg.muted"
              mb={1}
            >
              {config.title}
            </Text>
            <Text fontSize="md" fontWeight="semibold" lineClamp={2} color="fg">
              {primaryValue}
            </Text>
          </Box>
          <StatusBadge status={status} />
        </HStack>
      </Box>

      <SectionCard title="Request Details" icon={<FileText size={13} />}>
        <Box
          display="grid"
          gridTemplateColumns="1fr"
          gap={3}
        >
          {config.detailFields.map((field) => {
            const isStatusField =
              field.key === "status" || field.key.endsWith(".status");

            return (
              <DetailItem
                key={`${field.key}-${field.label}`}
                label={field.label}
                mandatory={field.mandatory}
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
          <Box mt={4} pt={4} borderTopWidth="1px" borderColor="border.muted">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDrsPrintOpen(true)}
            >
              <Printer size={14} />
              View / Print DRS
            </Button>
          </Box>
        )}
      </SectionCard>

      <SectionCard title="Remarks" icon={<MessageSquare size={13} />}>
        <Textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder={
            isPending
              ? "Add remarks before approving or rejecting..."
              : "No remarks added."
          }
          minH="80px"
          resize="vertical"
          disabled={!isPending}
          fontSize="sm"
        />
        {isPending && (
          <Text fontSize="xs" color="fg.subtle" mt={1.5}>
            Remarks are optional but recommended.
          </Text>
        )}
      </SectionCard>

      {isPending ? (
        <>
          <Separator />

          <HStack
            gap={3}
            position="sticky"
            bottom={0}
            bg="bg"
            py={3}
            zIndex={1}
          >
            <Button
              flex="1"
              variant="outline"
              colorPalette="red"
              onClick={() => onDeny?.(row, remarks)}
            >
              <X size={15} />
              Deny
            </Button>

            <Button
              flex="1"
              colorPalette="blue"
              onClick={() => onApprove?.(row, remarks)}
            >
              <Check size={15} />
              Approve
            </Button>
          </HStack>
        </>
      ) : (
        <Box
          rounded="lg"
          borderWidth="1px"
          borderColor={statusMeta.borderColor}
          bg={statusMeta.bg}
          px={4}
          py={3}
        >
          <Text fontSize="sm" color={statusMeta.color} fontWeight="medium">
            This request has been {String(status).toLowerCase()}.
          </Text>
        </Box>
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
