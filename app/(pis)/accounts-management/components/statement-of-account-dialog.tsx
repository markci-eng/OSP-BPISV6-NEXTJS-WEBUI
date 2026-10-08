"use client";

// Statement of Account — opened from the Transfer and Reinstatement headers.
//
// DRAWN AS THE PRINTED PIS REPORT, not as a card: the letterhead, the two
// rounded fact boxes, the ledger split into two columns of receipts, the totals,
// remarks and signatories, then the footer. Processors know the paper; the
// dialog shows them the same sheet. It is a fixed-width page, so on a narrow
// screen it scrolls sideways inside the dialog rather than reflowing.
//
// PRINT goes through a hidden iframe holding only the sheet, so the dialog's
// backdrop, scroll box and the page behind it stay off the paper.

import { useMemo, useRef, type ReactNode } from "react";
import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  Grid,
  Image,
  Portal,
  Text,
} from "@chakra-ui/react";
import { PrimarySmButton } from "osp-ui-kit";
import { Printer } from "lucide-react";
import { toast } from "sonner";

import type {
  SoaPayment,
  StatementOfAccount,
} from "../data/statement-of-account";
import { formatTerminationStatus } from "../data/termination-status";

const PAPER_WIDTH = "816px";
const INK = "#222";
const FRAME = "#9a9a9a";
const LABEL_WIDTH = "92px";

// Pay Class · Plan Code · OR No · OR Date (branch + date) · Amount · Next Due
const LEDGER_COLUMNS = "34px 50px 74px minmax(0, 1fr) 64px 70px";

/** Signatories as the printed report carries them. */
const SIGNATORIES = {
  preparedBy: { name: "JOHN MICHAEL DUMAUA", title: "Associate - AMD" },
  certifiedBy: [
    { name: "ARNOLD V. EVANGELISTA", title: "AVP - AMD" },
    { name: "CATALINO MARIUS A. GUINGON", title: "EVP & CIO - AAMIT" },
  ],
};

/**
 * The page's CSS as text. Chakra's emotion styles are inserted through the
 * CSSOM, so their <style> tags are empty — the rules are read from the sheets
 * instead. Cross-origin sheets (fonts) cannot be read; they are linked.
 */
function collectStyles(): string {
  return Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return `<style>${Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n")}</style>`;
      } catch {
        return sheet.href ? `<link rel="stylesheet" href="${sheet.href}">` : "";
      }
    })
    .join("\n");
}

// US Letter at 96 CSS px per inch: 8.5in × 11in. The page is a hair short of
// 11in so rounding never spills a blank second sheet.
const LETTER_WIDTH_PX = 816;
const LETTER_HEIGHT_PX = 1054;

/**
 * Prints `node` on its own, on exactly one Letter page, without the page
 * around it. A sheet too tall for the page (a long ledger) is scaled down to
 * fit rather than running onto a second.
 */
function printNode(node: HTMLElement, title: string) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  // Laid out at Letter size, off screen, so the sheet can be measured.
  Object.assign(frame.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: `${LETTER_WIDTH_PX}px`,
    height: `${LETTER_HEIGHT_PX}px`,
    border: "0",
  });
  document.body.appendChild(frame);

  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    toast.error("Unable to open the print preview.");
    return;
  }

  doc.open();
  doc.write(`<!doctype html>
<html class="${document.documentElement.className}">
<head>
<base href="${window.location.origin}/">
<title>${title}</title>
${collectStyles()}
<style>
  @page { size: letter portrait; margin: 0; }
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    width: ${LETTER_WIDTH_PX}px;
    height: ${LETTER_HEIGHT_PX}px;
    overflow: hidden;
  }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .soa-page {
    width: ${LETTER_WIDTH_PX}px;
    height: ${LETTER_HEIGHT_PX}px;
    overflow: hidden;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .soa-sheet {
    box-shadow: none !important;
    margin: 0 !important;
    transform-origin: top left;
  }
</style>
</head>
<body><div class="soa-page">${node.outerHTML}</div></body>
</html>`);
  doc.close();

  const cleanUp = () => window.setTimeout(() => frame.remove(), 500);
  win.addEventListener("afterprint", cleanUp);

  // Wait for the letterhead logo (or it prints as a blank box) and the fonts
  // (or the sheet is measured at the wrong height).
  const images = Array.from(doc.images);
  Promise.all([
    ...images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }),
    ),
    doc.fonts?.ready,
  ]).then(() => {
    const sheet = doc.querySelector<HTMLElement>(".soa-sheet");
    if (sheet) {
      const scale = Math.min(
        1,
        LETTER_WIDTH_PX / sheet.offsetWidth,
        LETTER_HEIGHT_PX / sheet.offsetHeight,
      );
      if (scale < 1) {
        // Centred across the page once it is narrower than the paper.
        const offsetX = (LETTER_WIDTH_PX - sheet.offsetWidth * scale) / 2;
        sheet.style.transform = `translateX(${offsetX}px) scale(${scale})`;
      }
    }
    win.focus();
    win.print();
  });
}

function parseIso(iso: string): Date | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/** "January 07, 2025" */
function longDate(iso: string): string {
  return longDateOf(parseIso(iso));
}

function longDateOf(date: Date | undefined): string {
  if (!date) return "";
  const month = date.toLocaleString("en-US", { month: "long" });
  return `${month} ${String(date.getDate()).padStart(2, "0")}, ${date.getFullYear()}`;
}

/** "01/07/2025" */
function shortDate(date: Date | undefined): string {
  if (!date) return "";
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${date.getFullYear()}`;
}

function time(date: Date): string {
  return date.toLocaleTimeString("en-GB", { hour12: false });
}

function peso(amount: number): string {
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** A `Label : value` line of the fact boxes. */
function Fact({
  label,
  value,
  labelWidth = LABEL_WIDTH,
}: {
  label: string;
  value: ReactNode;
  labelWidth?: string;
}) {
  return (
    <Grid templateColumns={`${labelWidth} 12px minmax(0, 1fr)`} py="1px">
      <Text fontWeight="700">{label}</Text>
      <Text fontWeight="700">:</Text>
      <Text>{value}</Text>
    </Grid>
  );
}

function LedgerHeader() {
  return (
    <Grid
      templateColumns={LEDGER_COLUMNS}
      columnGap="6px"
      alignItems="center"
      fontWeight="700"
      px="8px"
      py="6px"
      borderBottom="3px solid"
      borderColor="#bbb"
    >
      <Text textAlign="center" lineHeight="1.15">
        Pay
        <br />
        Class
      </Text>
      <Text lineHeight="1.15">
        Plan
        <br />
        Code
      </Text>
      <Text>OR No</Text>
      <Text textAlign="center">OR Date</Text>
      <Text textAlign="right">Amount</Text>
      <Text textAlign="right">Next Due</Text>
    </Grid>
  );
}

function LedgerRows({ rows }: { rows: SoaPayment[] }) {
  return (
    <Box px="8px" pt="16px">
      {rows.map((row) => (
        <Grid
          key={`${row.orNo}-${row.payClass}`}
          templateColumns={LEDGER_COLUMNS}
          columnGap="6px"
          py="1px"
        >
          <Text textAlign="center">{row.payClass}</Text>
          <Text>{row.planCode}</Text>
          <Text>{row.orNo}</Text>
          <Flex gap="6px" justify="space-between" minW={0}>
            <Text truncate>{row.branch}</Text>
            <Text>{shortDate(parseIso(row.orDate))}</Text>
          </Flex>
          <Text textAlign="right">{peso(row.amount)}</Text>
          <Text textAlign="right">
            {row.nextDue ? shortDate(parseIso(row.nextDue)) : ""}
          </Text>
        </Grid>
      ))}
    </Box>
  );
}

function Signatory({ name, title }: { name: string; title: string }) {
  return (
    <Box>
      <Text
        borderBottom="1.5px solid"
        borderColor={INK}
        pb="4px"
        pr="24px"
        display="inline-block"
        minW="180px"
      >
        {name}
      </Text>
      <Text mt="8px">{title}</Text>
    </Box>
  );
}

/** The printed sheet itself. */
export function StatementOfAccountSheet({
  soa,
  generatedAt,
}: {
  soa: StatementOfAccount;
  generatedAt: Date;
}) {
  // The report fills the left column first, then the right.
  const half = Math.ceil(soa.payments.length / 2);
  const left = soa.payments.slice(0, half);
  const right = soa.payments.slice(half);
  const asOf = `${longDateOf(generatedAt)} ${time(generatedAt)}`;

  return (
    <Box
      className="soa-sheet"
      w={PAPER_WIDTH}
      minW={PAPER_WIDTH}
      mx="auto"
      bg="white"
      color={INK}
      fontFamily="Tahoma, Verdana, 'Segoe UI', sans-serif"
      fontSize="11px"
      px="32px"
      pt="28px"
      pb="20px"
      boxShadow="0 1px 4px rgba(0,0,0,0.18)"
    >
      {/* Letterhead */}
      <Box borderBottom="1.5px solid" borderColor={INK} pb="6px">
        <Image
          src="/images/osp-chakra-reusable-components/stpeter-logo.png"
          alt="St. Peter Life Plan, Inc."
          h="34px"
        />
        <Text fontSize="13px" mt="4px">
          St. Peter Corporate Center, 999 EDSA, Quezon City 1105 (Across SM
          North EDSA Annex)
        </Text>
      </Box>

      <Text fontSize="13px" fontWeight="700" color="#7a7a7a" mt="14px" mb="8px">
        Statement of Account
      </Text>

      {/* Fact boxes — the planholder, then the plan and its standing. */}
      <Grid templateColumns="45fr 55fr" gap="10px">
        <Box
          border="1px solid"
          borderColor={FRAME}
          borderRadius="10px"
          px="16px"
          py="10px"
        >
          <Fact label="Contract No" value={soa.contractNo} />
          <Fact label="Name" value={soa.name} />
          <Fact label="Birth Date" value={longDate(soa.birthDate)} />
          <Fact label="Branch" value={soa.branch} />
          <Fact label="Address" value={soa.address} />
          <Fact label="Sales Agent" value={soa.salesAgent} />
          <Fact label="Sales Agent2" value={soa.salesAgent2} />
        </Box>

        <Grid
          templateColumns="44fr 56fr"
          columnGap="12px"
          border="1px solid"
          borderColor={FRAME}
          borderRadius="10px"
          px="10px"
          py="10px"
        >
          <Box>
            <Fact labelWidth="84px" label="Plan Type" value={soa.planType} />
            <Fact
              labelWidth="84px"
              label="Contract Price"
              value={peso(soa.contractPrice)}
            />
            <Fact labelWidth="84px" label="Mode" value={soa.mode} />
            <Fact labelWidth="84px" label="Term(Yrs)" value={soa.termYears} />
            <Fact
              labelWidth="84px"
              label="Inst. Amt."
              value={peso(soa.instAmount)}
            />
            <Fact labelWidth="84px" label="Plan TAP" value={peso(soa.planTap)} />
            <Fact labelWidth="84px" label="Inst. No." value={soa.instNo} />
          </Box>
          <Box>
            <Fact labelWidth="96px" label="Insurability" value={soa.insurability} />
            <Fact
              labelWidth="96px"
              label="Effectivity"
              value={longDate(soa.effectivity)}
            />
            <Fact
              labelWidth="96px"
              label="New Effectivity"
              value={longDate(soa.newEffectivity)}
            />
            <Fact labelWidth="96px" label="Due Date" value={longDate(soa.dueDate)} />
            <Fact
              labelWidth="96px"
              label="Account Status"
              value={soa.accountStatus}
            />
            <Fact
              labelWidth="96px"
              label="Termi. Status"
              value={formatTerminationStatus(soa.terminationStatus)}
            />
            <Fact labelWidth="96px" label="COFP No." value={soa.cofpNo} />
          </Box>
        </Grid>
      </Grid>

      {/* Ledger — two columns of receipts under a heavy rule. */}
      <Grid
        templateColumns="1fr 1fr"
        mt="14px"
        borderTop="1px solid"
        borderBottom="1px solid"
        borderColor={FRAME}
        minH="560px"
      >
        <Box borderRight="1px solid" borderColor={FRAME}>
          <LedgerHeader />
          <LedgerRows rows={left} />
          {soa.payments.length === 0 && (
            <Text color="#888" px="8px">
              No payments on file.
            </Text>
          )}
        </Box>
        <Box>
          <LedgerHeader />
          <LedgerRows rows={right} />
        </Box>
      </Grid>

      {/* Totals */}
      <Grid templateColumns="1fr 1fr" px="16px" pt="14px" pb="6px">
        <Box w="230px">
          <Fact labelWidth="84px" label="Insurance" value={<Amount n={soa.insurance} />} />
          <Fact labelWidth="84px" label="Others" value={<Amount n={soa.others} />} />
          <Fact
            labelWidth="84px"
            label="Miscellaneous"
            value={<Amount n={soa.miscellaneous} />}
          />
          <Fact labelWidth="84px" label="Loan" value={<Amount n={soa.loan} />} />
        </Box>
        <Box pl="110px">
          <Grid templateColumns="100px 40px minmax(0, 1fr)" fontWeight="700">
            <Text textAlign="right">Total Payments</Text>
            <Text textAlign="center">:</Text>
            <Text>{peso(soa.totalPayments)}</Text>
          </Grid>
          <Grid
            templateColumns="100px 40px minmax(0, 1fr)"
            fontWeight="700"
            mt="20px"
          >
            <Text textAlign="right">Balance</Text>
            <Text textAlign="center">:</Text>
            <Text>{peso(soa.balance)}</Text>
          </Grid>
        </Box>
      </Grid>

      {/* Remarks */}
      <Box
        border="1px solid"
        borderColor={FRAME}
        borderRadius="10px"
        px="16px"
        py="12px"
        minH="72px"
      >
        <Fact label="Remarks" value={soa.remarks} />
      </Box>

      {/* Signatories */}
      <Box borderBottom="1.5px solid" borderColor={INK} pb="12px" mt="18px">
        <Grid templateColumns="34fr 22fr 30fr 14fr" columnGap="12px" px="16px">
          <Text fontWeight="700">Prepared By:</Text>
          <Text fontWeight="700" gridColumn="span 2">
            Certified By:
          </Text>
          <Text fontWeight="700">Generated:</Text>
        </Grid>
        <Grid
          templateColumns="34fr 22fr 30fr 14fr"
          columnGap="12px"
          px="16px"
          mt="20px"
        >
          <Signatory {...SIGNATORIES.preparedBy} />
          <Signatory {...SIGNATORIES.certifiedBy[0]} />
          <Signatory {...SIGNATORIES.certifiedBy[1]} />
          <Text whiteSpace="nowrap">
            {shortDate(generatedAt)}&nbsp;&nbsp;{time(generatedAt)}
          </Text>
        </Grid>
      </Box>

      {/* Footer */}
      <Grid templateColumns="1fr auto 1fr" mt="14px">
        <Text>PIS Version 5</Text>
        <Text>*Statement of Account as of {asOf}</Text>
        <Text textAlign="right">Page 1 of 1</Text>
      </Grid>
    </Box>
  );
}

function Amount({ n }: { n: number }) {
  return (
    <Box as="span" display="block" textAlign="right">
      {peso(n)}
    </Box>
  );
}

export interface StatementOfAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  soa: StatementOfAccount;
}

export function StatementOfAccountDialog({
  open,
  onOpenChange,
  soa,
}: StatementOfAccountDialogProps) {
  // Stamped each time the dialog opens, as the report stamps when generated.
  const generatedAt = useMemo(() => new Date(), [open, soa.contractNo]);
  const sheetRef = useRef<HTMLDivElement>(null);

  const print = () => {
    const sheet = sheetRef.current?.firstElementChild;
    if (sheet instanceof HTMLElement) {
      printNode(sheet, `Statement of Account - ${soa.contractNo}`);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      size="xl"
      motionPreset="scale"
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="xl" maxW="900px">
            <Dialog.Header pb={3} alignItems="center">
              <Dialog.Title fontSize="md" fontWeight="700" color="gray.800">
                Statement of Account
              </Dialog.Title>
              <Text fontSize="xs" fontFamily="mono" color="gray.400" ml={3}>
                {soa.contractNo}
              </Text>
              {/* Clear of the close button in the corner. */}
              <Box ml="auto" mr={8}>
                <PrimarySmButton onClick={print}>
                  <Printer size={14} />
                  Print
                </PrimarySmButton>
              </Box>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" position="absolute" top={3} right={3} />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body bg="gray.100" py={5} px={{ base: 2, md: 5 }} overflowX="auto">
              <Box ref={sheetRef}>
                <StatementOfAccountSheet soa={soa} generatedAt={generatedAt} />
              </Box>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export default StatementOfAccountDialog;
