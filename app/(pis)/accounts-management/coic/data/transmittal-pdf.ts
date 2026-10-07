// A memo's transmittal as a PDF — cloned from COFP's (user, 2026-10-06): the
// memo's number, branch and date at the top, one line per certificate, and the
// release and receipt signatures at the foot. A QR code sits at the top right,
// level with the memo's facts.
//
// Browser-only, and `jspdf` and `qrcode` are loaded on the first print.

import { byBranch } from "./coic-pdf";
import type { CoicForPrinting, CoicMemo } from "./types";

// A4 portrait.
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const ROW_H = 7;

const GREEN: [number, number, number] = [19, 138, 63];
const INK: [number, number, number] = [26, 26, 26];
const MUTED: [number, number, number] = [110, 110, 110];
const RULE: [number, number, number] = [210, 210, 210];

type Doc = InstanceType<typeof import("jspdf").jsPDF>;

/** The table's columns: header, left edge in mm, and what goes in the cell. */
const COLUMNS: { header: string; x: number; cell: (row: CoicForPrinting, n: number) => string }[] = [
  { header: "#", x: MARGIN, cell: (_, n) => String(n) },
  { header: "LPA NO", x: MARGIN + 10, cell: (row) => row.lpaNo },
  {
    header: "PLAN HOLDER",
    x: MARGIN + 42,
    cell: (row) =>
      `${row.lastName}, ${row.firstName}${row.middleName ? ` ${row.middleName.charAt(0)}.` : ""}`.toUpperCase(),
  },
  { header: "COIC NO", x: MARGIN + 112, cell: (row) => row.coicNo },
  { header: "SIGNATURE", x: MARGIN + 150, cell: () => "" },
];

/** "October 1, 2026" — the calendar date, never shifted by the time zone. */
const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

function drawHeader(doc: Doc, memo: CoicMemo, branchName: string) {
  doc.setTextColor(...GREEN);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("ST. PETER LIFE PLAN INCORPORATED", PAGE_W / 2, MARGIN + 4, { align: "center" });
  doc.setTextColor(...INK);
  doc.setFontSize(12);
  doc.text("TRANSMITTAL OF CERTIFICATES OF INSURANCE COVERAGE", PAGE_W / 2, MARGIN + 11, {
    align: "center",
  });

  const facts: [string, string][] = [
    ["Memo No", memo.memoNo],
    ["Branch", branchName === memo.branch ? memo.branch : `${memo.branch} — ${branchName}`],
    ["Date Transmitted", longDate(memo.dateTransmitted)],
    ["No. of Printed", String(memo.rows.length)],
  ];
  doc.setFontSize(10);
  facts.forEach(([label, value], i) => {
    const y = MARGIN + 22 + i * 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(`${label}:`, MARGIN, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text(value, MARGIN + 34, y);
  });
}

// The QR code: top right, level with the memo's facts.
const QR_SIZE = 26;
const QR_X = PAGE_W - MARGIN - QR_SIZE;
const QR_Y = MARGIN + 17;

/**
 * What the transmittal's QR code reads back — a SAMPLE for now, as on COFP's:
 * the memo's facts as plain labelled lines.
 */
function qrText(memo: CoicMemo, branchName: string): string {
  return [
    `Memo No: ${memo.memoNo}`,
    `Branch: ${memo.branch} - ${branchName}`,
    `Date Transmitted: ${memo.dateTransmitted}`,
    `No. of Printed: ${memo.rows.length}`,
  ].join("\n");
}

/** Drawn as vector squares, one per run of dark modules. */
function drawQr(doc: Doc, modules: { size: number; data: Uint8Array }) {
  const cell = QR_SIZE / modules.size;
  doc.setFillColor(...INK);
  for (let r = 0; r < modules.size; r += 1) {
    let c = 0;
    while (c < modules.size) {
      if (!modules.data[r * modules.size + c]) {
        c += 1;
        continue;
      }
      const start = c;
      while (c < modules.size && modules.data[r * modules.size + c]) c += 1;
      doc.rect(QR_X + start * cell, QR_Y + r * cell, (c - start) * cell, cell + 0.02, "F");
    }
  }
}

function drawTableHeader(doc: Doc, y: number) {
  doc.setFillColor(240, 244, 241);
  doc.rect(MARGIN, y - 5, PAGE_W - MARGIN * 2, ROW_H, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  COLUMNS.forEach((col) => doc.text(col.header, col.x + 1, y));
}

function drawSignatures(doc: Doc, y: number) {
  const width = 70;
  const blocks: [string, number][] = [
    ["Released by", MARGIN],
    ["Received by (Branch)", PAGE_W - MARGIN - width],
  ];
  doc.setDrawColor(...INK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  blocks.forEach(([label, x]) => {
    doc.setTextColor(...MUTED);
    doc.text(label, x, y);
    doc.line(x, y + 14, x + width, y + 14);
    doc.text("Signature over printed name / Date", x, y + 18);
  });
}

/**
 * Build the memo's transmittal and hand back a blob URL for it, for the caller
 * to open.
 */
export async function buildCoicTransmittalPdf(
  memo: CoicMemo,
  branchName: string,
): Promise<string> {
  const [{ jsPDF }, { default: QRCode }] = await Promise.all([
    import("jspdf"),
    import("qrcode"),
  ]);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setDocumentProperties({ title: `Transmittal ${memo.memoNo}` });

  drawHeader(doc, memo, branchName);
  drawQr(
    doc,
    QRCode.create(qrText(memo, branchName), { errorCorrectionLevel: "M" }).modules,
  );

  let y = MARGIN + 52;
  drawTableHeader(doc, y);
  y += ROW_H;

  byBranch(memo.rows).forEach((row, i) => {
    // Room for the row, and on the last page for the signatures under it.
    if (y > PAGE_H - MARGIN - 10) {
      doc.addPage("a4", "portrait");
      y = MARGIN + 6;
      drawTableHeader(doc, y);
      y += ROW_H;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    COLUMNS.forEach((col) => doc.text(col.cell(row, i + 1), col.x + 1, y));
    doc.setDrawColor(...RULE);
    doc.line(MARGIN, y + 2, PAGE_W - MARGIN, y + 2);
    y += ROW_H;
  });

  if (y > PAGE_H - MARGIN - 30) {
    doc.addPage("a4", "portrait");
    y = MARGIN;
  }
  drawSignatures(doc, y + 12);

  return String(doc.output("bloburl"));
}
