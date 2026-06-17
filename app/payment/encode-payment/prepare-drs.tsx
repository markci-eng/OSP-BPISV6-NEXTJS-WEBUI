"use client";

import {
  Box,
  Flex,
  Badge,
  Dialog,
  Portal,
  CloseButton,
  Button,
  IconButton,
} from "@chakra-ui/react";

import { toast } from "sonner";
import { useMemo, useState } from "react";
import { Body, DynamicButton } from "st-peter-ui";
import { DrsRowData, PaymentRecord } from "../data/payment.types";
import { columns } from "../components/drsDataTable";

import { DrsFunction } from "../utils/drsFunction";

import DrsPaymentSummary from "../components/drsPaymentSummary";
import { BsPrinter } from "react-icons/bs";
import DataTable from "@/components/common/reusable-tableV2/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { TblLoanHdrData } from "@/app/Model/Data/rawData";
import { Card } from "@/claude components/card-accordion/card";
import { RowItem } from "@/claude components/info-card/row-item";

type Props = {
  payments: PaymentRecord[];
};

export default function PrepareDRS({ payments }: Props) {
  const [open, setOpen] = useState(false);
  const { rows, totals } = DrsFunction(payments);

  type LafRowData = DrsRowData & {
    LAFNo?: string;
    ARDate?: string;
    ARNo?: number;
    ARAmount?: number;
  };

  const Lafcolumns: ColumnDef<LafRowData>[] = [
    { accessorKey: "LAFNo", header: "LAF" },
    { accessorKey: "LPANo", header: "LPA" },
    { accessorKey: "name", header: "Planholder" },
    { accessorKey: "InstNo", header: "InstNo", meta: { numeric: true } },
    { accessorKey: "PayClass", header: "PayClass" },
    { accessorKey: "ARDate", header: "AR Date" },
    { accessorKey: "ARNo", header: "AR Number", meta: { numeric: true } },
    { accessorKey: "ARAmount", header: "AR Amount", meta: { numeric: true } },
  ];

  const LPColumns: ColumnDef<LafRowData>[] = columns;
  const isLaf = TblLoanHdrData.some((a) => a.LAFNo === payments[0]?.LPANo);
  const drsColumns = isLaf ? Lafcolumns : LPColumns;

  const lafRows: LafRowData[] = useMemo(() => {
    if (!isLaf) return [];
    return rows.map((row) => {
      const loanHdr = TblLoanHdrData.find((a) => a.LAFNo === row.LPANo);
      return {
        ...row,
        LAFNo: row.LPANo,
        LPANo: loanHdr?.LPANo ?? row.LPANo,
        ARDate: row.SIDate,
        ARNo: Number(row.SI) || undefined,
        ARAmount: row.GrossCom,
      };
    });
  }, [isLaf, rows]);

  const drsRows: LafRowData[] = isLaf ? lafRows : rows;
  const totalARAmount = useMemo(
    () => lafRows.reduce((sum, r) => sum + (r.ARAmount ?? 0), 0),
    [lafRows],
  );

  const [drsNo] = useState(
    () => `DRS${Math.floor(100000000000 + Math.random() * 900000000000)}`,
  );

  const handlePrint = () => {
    const escapeHtml = (value: unknown) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    type PrintColumn = {
      accessorKey: string;
      header: string;
      numeric?: boolean;
    };
    const printColumns = drsColumns.reduce<PrintColumn[]>((acc, col) => {
      const accessorKey = (col as { accessorKey?: string }).accessorKey;
      if (!accessorKey) return acc;
      const header = typeof col.header === "string" ? col.header : accessorKey;
      const numeric = (col.meta as { numeric?: boolean } | undefined)?.numeric;
      acc.push({ accessorKey, header, numeric });
      return acc;
    }, []);

    const formatCell = (value: unknown, numeric?: boolean) => {
      if (numeric && typeof value === "number") {
        return value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }
      return escapeHtml(value);
    };

    const headerCells = printColumns
      .map(
        (c) =>
          `<th style="text-align:${c.numeric ? "right" : "left"}">${escapeHtml(c.header)}</th>`,
      )
      .join("");

    const bodyRows = drsRows
      .map((row) => {
        const cells = printColumns
          .map(
            (c) =>
              `<td style="text-align:${c.numeric ? "right" : "left"}">${formatCell(
                (row as Record<string, unknown>)[c.accessorKey],
                c.numeric,
              )}</td>`,
          )
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    const totalsMap: Record<string, number> = {
      ...(totals as Record<string, number>),
      ARAmount: totalARAmount,
    };
    const totalCells = printColumns
      .map((c, idx) => {
        if (idx === 0) return `<td><strong>Total</strong></td>`;
        const total = totalsMap[c.accessorKey];
        if (typeof total === "number") {
          return `<td style="text-align:right"><strong>${total.toLocaleString(
            undefined,
            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
          )}</strong></td>`;
        }
        return `<td></td>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
<title>Digital Remittance Slip - ${escapeHtml(drsNo)}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 24px; color: #1a1a1a; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .meta { font-size: 12px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #ccc; padding: 4px 6px; }
  thead th { background: #f0f0f0; }
  tfoot td { background: #f7f7f7; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
  <h1>REMITTANCE (HEAD OFFICE)</h1>
  <div class="meta">
    <div><strong>KIRK PATRICK OLIVAR</strong></div>
    <div>DRS No: ${escapeHtml(drsNo)}</div>
    <div>Payment Type: CASH</div>
  </div>

  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
    <tfoot><tr>${totalCells}</tr></tfoot>
  </table>
</body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.srcdoc = html;

    iframe.onload = () => {
      const frameWindow = iframe.contentWindow;
      if (!frameWindow) {
        toast.error("Unable to prepare the print preview.");
        iframe.remove();
        return;
      }

      const cleanup = () => {
        iframe.remove();
        frameWindow.removeEventListener("afterprint", cleanup);
      };
      frameWindow.addEventListener("afterprint", cleanup);

      frameWindow.focus();
      frameWindow.print();
    };

    document.body.appendChild(iframe);
  };

  return (
    <Box mx="auto">
      <Card
        activeIcon={<BsPrinter />}
        title="Digital Remittance"
        subtitle={drsNo}
      >
        <Flex justify="flex-end" mb={3}>
          <IconButton
            size="sm"
            variant="outline"
            onClick={handlePrint}
            aria-label="Print DRS report"
          >
            <BsPrinter />
          </IconButton>
        </Flex>

        <Box overflowX="auto">
          <DataTable
            columns={drsColumns}
            data={drsRows}
            features={{
              search: false,
              sorting: false,
              draggable: false,
              selection: false,
              filtering: false,
              columnToggle: false,
            }}
            headerContent={
              <Flex
                justify="space-between"
                align="flex-start"
                w="full"
                gap={4}
                wrap="wrap"
              >
                <Box>
                  <Body>REMITTANCE (HEAD OFFICE)</Body>
                  <Body mt={1} fontWeight="bold">
                    KIRK PATRICK OLIVAR
                  </Body>
                </Box>
                <Box textAlign={{ base: "left", md: "right" }}>
                  <Body fontSize="sm">
                    Payment Type <Badge colorPalette="green">CASH</Badge>
                  </Body>
                  <Body fontWeight="bold">{drsNo}</Body>
                </Box>
              </Flex>
            }
            summaryRows={[
              isLaf
                ? {
                    id: "assigned-documents-summary",
                    label: "Total",
                    labelColumnId: "LPANo",
                    aggregations: { ARAmount: "sum" },
                  }
                : {
                    id: "assigned-documents-summary",
                    label: "Total",
                    labelColumnId: "LPANo",
                    aggregations: {
                      GrossCom: "sum",
                      ncom: "sum",
                      ComDue: "sum",
                      others: "sum",
                      TEPCV: "sum",
                      COMPCV: "sum",
                      net: "sum",
                    },
                  },
            ]}
            renderDetail={(row) => (
              <Box px={2} py={3}>
                <RowItem label="Name" value={row.name} />
                <RowItem label="SI Date" value={row.SIDate} />
                <RowItem label="Installment Number" value={row.InstNo} />
                <RowItem label="Pay Class" value={row.PayClass} />
                <RowItem
                  label="Amount"
                  value={
                    row.GrossCom && row.GrossCom !== 0
                      ? row.GrossCom.toString()
                      : (row.ncom?.toString() ?? "0")
                  }
                />
                <RowItem label="CBI" value={row.ComDue?.toString() ?? "0"} />
                <RowItem
                  label="Commission"
                  value={row.COMPCV?.toString() ?? "0"}
                />
                <RowItem label="TE" value={row.TEPCV?.toString() ?? "0"} />
                <RowItem label="NET" value={row.net?.toString() ?? "0"} />
              </Box>
            )}
          />

          <Box display={{ base: "block", md: "none" }}>
            <DrsPaymentSummary
              totals={totals}
              items={
                isLaf
                  ? [{ label: "AR Total Amount", value: totalARAmount }]
                  : undefined
              }
            />
          </Box>
        </Box>

        <Dialog.Root
          open={open}
          size={{ base: "full", md: "md" }}
          placement="center"
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner p={{ base: 0, md: undefined }}>
              <Dialog.Content borderRadius={{ base: 0, md: undefined }}>
                <Dialog.Header>
                  <Dialog.Title>Confirmation</Dialog.Title>
                </Dialog.Header>

                <Dialog.Body>
                  <Body>Would you like to create Digital Remittance Slip?</Body>
                </Dialog.Body>

                <Dialog.Footer>
                  <DynamicButton label="YES" onClick={() => setOpen(false)} />
                  <Button bg="red.600" w="120px" onClick={() => setOpen(false)}>
                    NO
                  </Button>
                </Dialog.Footer>

                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" onClick={() => setOpen(false)} />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Card>
    </Box>
  );
}
