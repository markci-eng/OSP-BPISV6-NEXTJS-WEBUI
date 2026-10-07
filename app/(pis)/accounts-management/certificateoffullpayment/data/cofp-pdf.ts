// The For Printing run as a PDF — one Certificate of Full Payment per page,
// laid out after the printed form (user, 2026-10-02): letterhead on the left,
// the certification centred on the right, branch and CFP number along the
// bottom, over a tinted sheet tiled with the company's name. A QR code at the
// bottom right, beside the signatory, reads back the name, COFP and LPA
// numbers and plan type.
//
// GROUPED BY BRANCH: the pages run branch by branch (and by LPA number inside
// a branch), and each branch is a bookmark, so a branch's stack can be found
// and printed on its own.
//
// Browser-only, and `jspdf` and `qrcode` are loaded on the first print rather than with the
// page, so the screen does not carry a PDF library it may never use.

import { amountInWords } from "../../cofp/components/cofp-certificate";
import { formatAddress } from "./regions";
import type { CofpForPrinting } from "./types";

// The sheet: 11in wide, at the printed form's own proportions.
const PAGE_W = 279.4;
const PAGE_H = 130.5;

const GREEN: [number, number, number] = [19, 138, 63];
const INK: [number, number, number] = [26, 26, 26];
const PAPER: [number, number, number] = [248, 250, 222];
const WATERMARK: [number, number, number] = [233, 238, 196];

const LOGO_SRC = "/images/logo/St. Peter Miter Logo.png";
/** The logo is a 3000px square; embedded at this size it stays sharp and small. */
const LOGO_PX = 240;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ordinal(day: number): string {
  if (day > 3 && day < 21) return `${day}th`;
  return `${day}${["th", "st", "nd", "rd"][day % 10] ?? "th"}`;
}

/** "2026-03-23" → "23rd day of March 2026" */
function givenOn(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${ordinal(d)} day of ${MONTHS[m - 1]} ${y}`;
}

/** MM/DD/YYYY */
function mdy(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`;
}

const peso = (value: number) =>
  value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "AMPARO F. OLARTE" — first name, middle initial, surname. */
function printedName(row: CofpForPrinting): string {
  const initial = row.middleName ? ` ${row.middleName.charAt(0)}.` : "";
  return `${row.firstName}${initial} ${row.lastName}`.toUpperCase();
}

/** The logo, scaled down on a canvas; null if it cannot be loaded. */
async function loadLogo(): Promise<string | null> {
  try {
    const image = new Image();
    image.src = LOGO_SRC;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = LOGO_PX;
    canvas.height = LOGO_PX;
    canvas.getContext("2d")?.drawImage(image, 0, 0, LOGO_PX, LOGO_PX);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/** Branch first, then LPA number — the order the pages print in. */
export function byBranch(rows: CofpForPrinting[]): CofpForPrinting[] {
  return [...rows].sort(
    (a, b) => a.branch.localeCompare(b.branch) || a.lpaNo.localeCompare(b.lpaNo),
  );
}

/**
 * Build the run's PDF and hand back a blob URL for it, for the caller to open.
 */
export async function buildCofpPdf(rows: CofpForPrinting[]): Promise<string> {
  const [{ jsPDF }, { default: QRCode }, logo] = await Promise.all([
    import("jspdf"),
    import("qrcode"),
    loadLogo(),
  ]);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [PAGE_W, PAGE_H] });
  const printed = mdy(new Date());
  const sorted = byBranch(rows);

  doc.setDocumentProperties({ title: "Certificates of Full Payment" });

  let branch = "";
  sorted.forEach((row, index) => {
    if (index > 0) doc.addPage([PAGE_W, PAGE_H], "landscape");
    if (row.branch !== branch) {
      branch = row.branch;
      doc.outline.add(null, branch, { pageNumber: index + 1 });
    }
    drawCertificate(doc, row, logo, printed);
    drawQr(doc, QRCode.create(qrText(row), { errorCorrectionLevel: "M" }).modules);
  });

  return String(doc.output("bloburl"));
}

type Doc = InstanceType<typeof import("jspdf").jsPDF>;

/**
 * What the QR code reads back when scanned (user, 2026-10-02): the
 * certificate's details as plain labelled lines, so any phone's camera shows
 * them without an app or a network.
 */
function qrText(row: CofpForPrinting): string {
  // These four and nothing else (user, 2026-10-02) — which also keeps the code
  // sparse enough to scan at this size.
  return [
    `Name: ${printedName(row)}`,
    `COFP No: ${row.cofpNo}`,
    `LPA No: ${row.lpaNo}`,
    `Plan Type: ${row.planName}`,
  ].join("\n");
}

// Bottom right, level with the signatory and clear of it.
const QR_SIZE = 20;
const QR_X = 247;
const QR_Y = 99;
/** The white margin round the code — about the four modules scanners expect. */
const QR_PAD = 2.5;

/**
 * The QR code, drawn as vector squares rather than an image, so it stays sharp
 * at any print size. A white pad behind it gives scanners the quiet margin the
 * tinted, watermarked sheet would otherwise deny them.
 */
function drawQr(doc: Doc, modules: { size: number; data: Uint8Array }) {
  const cell = QR_SIZE / modules.size;

  doc.setFillColor(255, 255, 255);
  doc.rect(QR_X - QR_PAD, QR_Y - QR_PAD, QR_SIZE + QR_PAD * 2, QR_SIZE + QR_PAD * 2, "F");

  doc.setFillColor(...INK);
  for (let r = 0; r < modules.size; r += 1) {
    // One rectangle per run of dark modules along the row, not one per module.
    let c = 0;
    while (c < modules.size) {
      if (!modules.data[r * modules.size + c]) {
        c += 1;
        continue;
      }
      const start = c;
      while (c < modules.size && modules.data[r * modules.size + c]) c += 1;
      // A hair of overlap so neighbouring rows do not show seams in viewers.
      doc.rect(QR_X + start * cell, QR_Y + r * cell, (c - start) * cell, cell + 0.02, "F");
    }
  }
}

function drawCertificate(doc: Doc, row: CofpForPrinting, logo: string | null, printed: string) {
  // ── Sheet: tint, tiled company name, double rule ──
  doc.setFillColor(...PAPER);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  doc.setFont("times", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...WATERMARK);
  const tile = "ST. PETER LIFE PLAN INCORPORATED   ".repeat(9);
  for (let y = 9; y < PAGE_H - 4; y += 3.1) {
    // Each line starts a little further in, so the words do not stack in columns.
    doc.text(tile, 5 - ((y * 7) % 40), y);
  }

  doc.setDrawColor(...INK);
  doc.setLineWidth(0.5);
  doc.rect(3, 3, PAGE_W - 6, PAGE_H - 6);
  doc.setLineWidth(0.2);
  doc.rect(5, 5, PAGE_W - 10, PAGE_H - 10);

  // ── Letterhead ──
  if (logo) doc.addImage(logo, "PNG", 12, 11, 22, 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(27);
  doc.setTextColor(...GREEN);
  doc.text("ST. PETER", 37, 21);
  doc.text("LIFE PLAN", 41, 31);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...INK);
  [
    "St. Peter Corporate Center",
    "999 EDSA, Quezon City 1105 (across SM North Annex)",
    "Tel. No.: (632) 8-271-7757  Customer Support: (02) 8371-9999,",
    "(02) 7946-9999, 0919-056-9999",
    "www.stpeter.com.ph",
  ].forEach((line, i) => doc.text(line, 20, 39 + i * 3.3));

  // ── Certification, centred on the right ──
  const cx = 190;
  const width = 135;
  let y = 22;

  const centred = (
    text: string,
    font: "times" | "helvetica",
    style: "normal" | "bold" | "italic",
    size: number,
    gap: number,
  ) => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    const lines: string[] = doc.splitTextToSize(text, width);
    lines.forEach((line) => {
      doc.text(line, cx, y, { align: "center" });
      y += gap;
    });
  };

  doc.setTextColor(...INK);
  centred("CERTIFICATE OF FULL PAYMENT OF PLAN", "times", "bold", 17, 9);
  centred("This is to certify that", "times", "italic", 11, 7);
  centred(printedName(row), "times", "bold", 13, 9);
  centred(formatAddress(row.address).toUpperCase(), "helvetica", "normal", 8, 4);
  y += 3;
  centred("Has paid in full", "times", "italic", 11, 7.5);
  centred(
    `${row.planName} LIFE PLAN under contract number ${row.lpaNo} with plan value of`,
    "helvetica", "normal", 8, 4.2,
  );
  centred(
    `${amountInWords(row.planValue)} (Php ${peso(row.planValue)})`,
    "helvetica", "normal", 8, 4.2,
  );
  centred(row.coverage, "helvetica", "normal", 8, 6.5);
  centred(
    `Given this ${givenOn(row.fullPaidDate)} at Quezon City, Philippines`,
    "helvetica", "normal", 8, 4,
  );

  // ── Signatory, fixed to the bottom of the body ──
  doc.setFont("times", "bolditalic");
  doc.setFontSize(22);
  doc.text("Vitangcol", cx, 102, { align: "center" });
  doc.setLineWidth(0.25);
  doc.line(cx - 28, 105, cx + 28, 105);
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text("JONATHAN B. VITANGCOL", cx, 109.5, { align: "center" });
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.text("President and CEO", cx, 113.5, { align: "center" });

  // ── Footer ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Branch: ${row.branch}`, 12, 111);
  doc.text(`CFP# ${row.cofpNo}   Date Printed: ${printed}`, 12, 114.5);
  doc.setFontSize(6);
  doc.text(
    "This is a computer generated form and is valid only if there is no alteration.",
    12, 122,
  );
}
