"use client";

import {
  Box,
  Flex,
  Text,
  Heading,
  Badge,
  Separator,
  Dialog,
  Portal,
  CloseButton,
  Button,
  IconButton,
  Grid,
} from "@chakra-ui/react";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Body, DynamicButton, SaveButton } from "st-peter-ui";
import DrsDataTable, { columns } from "../components/drsDataTable";
import { DrsRowData, PaymentRecord } from "../data/payment.types";

import { DrsFunction } from "../utils/drsFunction";

import DrsPaymentSummary from "../components/drsPaymentSummary";
import Card from "@/components/cards/Card";
import { BsPrinter } from "react-icons/bs";
import DataTable from "@/components/common/reusable-tableV2/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { TblLoanHdrData } from "@/app/Model/Data/rawData";
import LabelText from "@/components/texts/LabelText";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_ICON_BUTTON_STYLES,
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

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
    { accessorKey: "Name", header: "Name" },
    { accessorKey: "InstNo", header: "IntsNo", meta: { numeric: true } },
    { accessorKey: "PayClass", header: "PayClass" },
    { accessorKey: "ARDate", header: "AR Date" },
    { accessorKey: "ARNo", header: "AR Number", meta: { numeric: true } },
    { accessorKey: "ARAmount", header: "AR Amount", meta: { numeric: true } },
  ];
  const LPColumns: ColumnDef<LafRowData>[] = columns;
  const isLaf = TblLoanHdrData.some((a) => a.LAFNo === payments[0]?.LPANo);
  const drsColumns = isLaf ? [...LPColumns, ...Lafcolumns] : LPColumns;
  return (
    <Box mx="auto">
      <Card.Root title={"Digital Remittance"}>
        <Card.ButtonSection>
          <IconButton
            aria-label="Print digital remittance"
            variant="outline"
            borderColor={BRAND_COLORS.primaryGreen}
            color={BRAND_COLORS.primaryGreen}
            _hover={{ bg: BRAND_COLORS.successBg }}
            {...STANDARD_ICON_BUTTON_STYLES.sm}
          >
            <BsPrinter />
          </IconButton>
        </Card.ButtonSection>
        <Card.MainContent>
          {/* <Separator my={4} /> */}

          {/* TABLE */}
          <Box overflowX="auto" mt={3}>
            <DataTable
              columns={drsColumns}
              data={rows}
              features={{
                search: false,
                sorting: false,
                draggable: false,
                selection: false,
                filtering: false,
                columnToggle: false,
              }}
              headerContent={
                <Flex justify="space-between" wrap="wrap" gap={4}>
                  <Box>
                    <Heading size="md" color={BRAND_COLORS.neutralText}>
                      REMITTANCE (HEAD OFFICE)
                    </Heading>

                    <Text mt={1} fontWeight="bold">
                      KIRK PATRICK OLIVAR
                    </Text>
                  </Box>
                </Flex>
              }
              headerActions={
                <Box w={"full"}>
                  <Heading fontSize="sm">
                    Payment Type <Badge colorPalette="green">CASH</Badge>
                  </Heading>

                  <Text mt={1} fontWeight="bold">
                    {`DRS${Math.floor(100000000000 + Math.random() * 900000000000)}`}
                  </Text>
                </Box>
              }
              summaryRows={[
                {
                  id: "assigned-documents-summary",
                  label: "Total",
                  labelColumnId: "SI",
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
                <Card.Root title={`${row.SI} - ${row.LPANo}`}>
                  <Card.MainContent>
                    <Grid
                      templateColumns={{
                        base: "1fr",
                      }}
                      gap={2}
                    >
                      <LabelText label="Name" value={row.name} />
                      <LabelText label="SI Date" value={row.SIDate} />
                      <LabelText
                        label="Installment Number"
                        value={row.InstNo}
                      />
                      <LabelText label="Pay Class" value={row.PayClass} />
                      <LabelText
                        label="Amount"
                        value={
                          row.GrossCom && row.GrossCom !== 0
                            ? row.GrossCom.toString()
                            : (row.ncom?.toString() ?? "0")
                        }
                      />
                      <LabelText
                        label="CBI"
                        value={row.ComDue?.toString() ?? "0"}
                      />
                      <LabelText
                        label="Commission"
                        value={row.COMPCV?.toString() ?? "0"}
                      />
                      <LabelText
                        label="TE"
                        value={row.TEPCV?.toString() ?? "0"}
                      />

                      <LabelText
                        label="NET"
                        value={row.net?.toString() ?? "0"}
                      />
                    </Grid>
                  </Card.MainContent>
                </Card.Root>
              )}
            />
            {/* <DrsDataTable
            columns={columns}
            data={rows}
            totals={totals}
            onRowClick={(row) => console.log("Clicked:", row)}
          /> */}
            {/* <DrsDataTable
              payments={payments}
              onRowClick={(row) => console.log(row)}
            /> */}
            <Box display={{ base: "block", md: "none" }}>
              <DrsPaymentSummary totals={totals} />
            </Box>
            {/* <Flex justify="flex-end" mt={2}>
            <SaveButton onClick={handleConfirm} />
          </Flex> */}
          </Box>

          {/* CONFIRM DIALOG */}
          <Dialog.Root open={open} size="md" placement="center">
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content
                  borderRadius={STANDARD_RADIUS.lg}
                  boxShadow={STANDARD_SHADOWS.level3}
                >
                  <Dialog.Header>
                    <Dialog.Title>Confirmation</Dialog.Title>
                  </Dialog.Header>

                  <Dialog.Body>
                    <Body>
                      Would you like to create Digital Remittance Slip?
                    </Body>
                  </Dialog.Body>

                  <Dialog.Footer>
                    <Button
                      variant="outline"
                      borderColor={BRAND_COLORS.destructiveRed}
                      color={BRAND_COLORS.destructiveRed}
                      w="120px"
                      _hover={{ bg: BRAND_COLORS.errorBg }}
                      onClick={() => setOpen(false)}
                    >
                      NO
                    </Button>

                    <DynamicButton
                      label="YES"
                      onClick={() => {
                        // handleYes();
                        setOpen(false);
                      }}
                    />
                  </Dialog.Footer>

                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" onClick={() => setOpen(false)} />
                  </Dialog.CloseTrigger>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        </Card.MainContent>
      </Card.Root>
    </Box>
  );
}
