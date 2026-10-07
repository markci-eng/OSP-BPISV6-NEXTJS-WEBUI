// The For Printing run as a PDF — one Confirmation of Cover per page, laid out
// after the insurer's printed form (user, 2026-10-06): the insurer's letterhead
// top left, its address and the certificate number top right, then the
// policyholder, group policies, individual, effective date, covers and riders
// in tinted boxes, two columns, and the notices and signatory along the foot.
//
// GROUPED BY BRANCH, as the COFP run is: the pages run branch by branch (and by
// LPA number inside a branch), and each branch is a bookmark.
//
// THE INSURER'S ARTWORK IS OPTIONAL. If `public/images/coic/pioneer-logo.png`
// is there it is printed as the letterhead; otherwise a drawn mark and the
// wordmark stand in. The signatory's signature is printed only from
// `public/images/coic/signature.png` — it is never drawn, so with no scan
// on file the space above the name is left blank to be signed.
//
// Browser-only, and `jspdf` is loaded on the first print rather than with the
// page.

import { COIC_POLICY } from "./data";
import type { CoicForPrinting } from "./types";

// 8.5in × 6in landscape — the COIC's paper (user, 2026-10-06).
const PAGE_W = 215.9;
const PAGE_H = 152.4;

const BRAND: [number, number, number] = [35, 98, 170];
const TEXT: [number, number, number] = [52, 84, 128];
const LABEL: [number, number, number] = [72, 92, 120];
const INK: [number, number, number] = [20, 20, 20];
const BOX: [number, number, number] = [233, 242, 251];

const LOGO_SRC = "/images/coic/pioneer-logo.png";
const SIGNATURE_SRC = "/images/coic/signature.png";

const INSURER_ADDRESS = [
  "Pioneer House BGC, 5th Avenue, cor. 26th Street",
  "Bonifacio Global City, Taguig City 1635, Philippines",
  "Tel. +63 2 8812 7777 or +63 2 7750 9999",
  "www.pioneer.com.ph",
];

const SIGNATORY = {
  name: "Maria Consuelo A. Bañes",
  titles: ["First Vice President", "Affinity"],
};

const DISCLAIMER =
  "This Confirmation of Cover merely summarizes the benefits of the Group Policy principally affecting the named individual and does not in any way constitute a contract. The Benefits described are all subject to the provisions, terms and conditions of the Group Policy.";

const NOTICES: { lead: string; body: string }[] = [
  {
    lead: "Availability of Master Group Policy.",
    body: "The Group Policy shall be kept in the main premise of, and in the custody of, an officer of the Policyholder and must be available to the Insured Individuals for inspection at any reasonable time.",
  },
  {
    lead: "Important Notice.",
    body: "The Insurance Commission, with offices in Manila, Cebu and Davao, is the government office in charge of the enforcement of all laws relating to insurance and has supervision over insurance companies. It is ready at all times to render assistance in settling any controversy between an Insurer and a Policyholder/Insured Individual relating to insurance matters. Any representative of the Insurer will readily render assistance without charge in the settling of claims or securing of benefits under the Group Policy. There is no need to employ any external assistance.",
  },
];

type Doc = InstanceType<typeof import("jspdf").jsPDF>;

interface LoadedImage {
  data: string;
  /** Width over height. */
  ratio: number;
}

/** An image from `public/`, as a PNG data URL; null if it is not there. */
async function loadImage(src: string): Promise<LoadedImage | null> {
  try {
    const image = new Image();
    image.src = src;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext("2d")?.drawImage(image, 0, 0);
    return {
      data: canvas.toDataURL("image/png"),
      ratio: image.naturalWidth / image.naturalHeight,
    };
  } catch {
    return null;
  }
}

/** "FEDERICO JR S. MACAPAGAL" — first name, middle initial, surname. */
function printedName(row: CoicForPrinting): string {
  const initial = row.middleName ? ` ${row.middleName.charAt(0)}.` : "";
  return `${row.firstName}${initial} ${row.lastName}`.toUpperCase();
}

/** "February 12, 2026" — the calendar date, never shifted by the time zone. */
const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

/** Branch first, then LPA number — the order the pages print in. */
export function byBranch<R extends CoicForPrinting>(rows: R[]): R[] {
  return [...rows].sort(
    (a, b) => a.branch.localeCompare(b.branch) || a.lpaNo.localeCompare(b.lpaNo),
  );
}

/**
 * Build the run's PDF and hand back a blob URL for it, for the caller to open.
 */
export async function buildCoicPdf(rows: CoicForPrinting[]): Promise<string> {
  const [{ jsPDF }, { default: QRCode }, logo, signature] = await Promise.all([
    import("jspdf"),
    import("qrcode"),
    loadImage(LOGO_SRC),
    loadImage(SIGNATURE_SRC),
  ]);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [PAGE_W, PAGE_H] });
  doc.setDocumentProperties({ title: "Confirmations of Cover" });

  let branch = "";
  byBranch(rows).forEach((row, index) => {
    if (index > 0) doc.addPage([PAGE_W, PAGE_H], "landscape");
    if (row.branch !== branch) {
      branch = row.branch;
      doc.outline.add(null, branch, { pageNumber: index + 1 });
    }
    drawCertificate(doc, row, logo, signature);
    drawQr(doc, QRCode.create(qrText(row), { errorCorrectionLevel: "M" }).modules);
  });

  return String(doc.output("bloburl"));
}

/**
 * What the QR code reads back when scanned (user, 2026-10-06): the
 * certificate's details as plain labelled lines, as on the COFP.
 */
function qrText(row: CoicForPrinting): string {
  return [
    `Name: ${printedName(row)}`,
    `COIC No: ${row.coicNo}`,
    `LPA No: ${row.lpaNo}`,
    `Effective Date: ${longDate(row.effectiveDate)}`,
  ].join("\n");
}

/**
 * How far the disclaimer and the notices sit below where the form's 5.5in
 * sheet had them — the 6in paper's extra half inch, spread so the foot is not
 * left with a gap under it. The signatory drops less, to leave the QR code
 * room under it (user, 2026-10-06).
 */
const DISCLAIMER_DROP = 4;
const FOOT_DROP = 8;
const SIGNATORY_DROP = 6;

// Pushed into the bottom right corner, under the signatory block, so it covers
// no text — full size, the corner's margins given up for it (user, 2026-10-06).
const QR_SIZE = 16;
const QR_X = PAGE_W - 1 - QR_SIZE;
const QR_Y = PAGE_H - 1 - QR_SIZE;

/** Vector squares, one per run of dark modules, as on the COFP. */
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

/** The stand-in letterhead: a square mark split round a ring, and the wordmark. */
function drawLetterhead(doc: Doc) {
  const x = 17.5;
  const y = 10;
  const size = 13;
  const cx = x + size / 2;
  const cy = y + size / 2;

  doc.setFillColor(...BRAND);
  doc.roundedRect(x, y, size, size, 1.6, 1.6, "F");
  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy, 4.6, "F");
  doc.setFillColor(...BRAND);
  doc.circle(cx, cy, 3.6, "F");
  // The white cuts that quarter the mark.
  doc.setFillColor(255, 255, 255);
  doc.rect(cx - 0.35, y, 0.7, size, "F");
  doc.rect(x, cy - 0.35, size, 0.7, "F");

  doc.setTextColor(...BRAND);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(25);
  doc.text("PIONEER", 34, 18.5);
  doc.setFontSize(5);
  doc.text("®", 75.5, 13.5);
  doc.setFontSize(13.5);
  doc.text("YOUR INSURANCE", 34.5, 24);
}

/** A tinted box with a small label at its top left. */
function drawBox(doc: Doc, x: number, y: number, w: number, h: number, label: string) {
  doc.setFillColor(...BOX);
  doc.rect(x, y, w, h, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...LABEL);
  doc.text(label, x + 2, y + 3.6);
}

/**
 * A paragraph that opens with a bold lead and runs on in regular type, wrapped
 * word by word to `width`. Returns the baseline under its last line.
 */
function leadParagraph(
  doc: Doc,
  lead: string,
  body: string,
  x: number,
  y: number,
  width: number,
  lineH: number,
): number {
  const words = [
    ...lead.split(" ").map((text) => ({ text, bold: true })),
    ...body.split(" ").map((text) => ({ text, bold: false })),
  ];
  const space = () => doc.getTextWidth(" ");
  let cursor = x;

  words.forEach(({ text, bold }) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...(bold ? BRAND : TEXT));
    const w = doc.getTextWidth(text);
    if (cursor > x && cursor + w > x + width) {
      cursor = x;
      y += lineH;
    }
    doc.text(text, cursor, y);
    cursor += w + space();
  });

  return y + lineH;
}

function drawCertificate(
  doc: Doc,
  row: CoicForPrinting,
  logo: LoadedImage | null,
  signature: LoadedImage | null,
) {
  // ── Letterhead, top left ──
  if (logo) {
    const h = 15;
    doc.addImage(logo.data, "PNG", 17.5, 9, h * logo.ratio, h);
  } else {
    drawLetterhead(doc);
  }

  // ── Certificate number and the insurer's address, top right ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT);
  doc.text("No.", 173, 7.5);
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text(row.coicNo, PAGE_W - 6, 9.5, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT);
  doc.text("PIONEER LIFE INC.", 145.5, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  INSURER_ADDRESS.forEach((line, i) => doc.text(line, 145.5, 17.6 + i * 3.4));

  // ── Title and lead-in ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND);
  doc.text("Confirmation of Cover", 35, 34.5);

  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT);
  const company = "Pioneer Life Inc.";
  doc.text(company, 17.5, 41);
  const leadW = doc.getTextWidth(`${company} `);
  doc.setFont("helvetica", "normal");
  doc.text(
    "confirms that the individual named below is covered under the Group Policy issued to:",
    17.5 + leadW,
    41,
  );

  // ── The boxes, two columns ──
  const lx = 16.7;
  const lw = 88.5;
  const rx = 117.3;
  const rw = 88.3;

  drawBox(doc, lx, 44, lw, 12, "Name of Company:");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(COIC_POLICY.company, lx + 2, 51.5);

  drawBox(doc, rx, 44.5, rw, 13, "Group Policy Number:");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  COIC_POLICY.groupPolicyNumbers.forEach((number, i) =>
    doc.text(number, rx + 2, 52.2 + i * 4.4),
  );

  drawBox(doc, lx, 58, lw, 10.5, "Name of Individual");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  const individual: string[] = doc.splitTextToSize(
    `${row.lpaNo} ${printedName(row)}`,
    lw - 9,
  );
  doc.text(individual[0], lx + 7, 66);

  drawBox(doc, rx, 59, rw, 10.5, "Individual Effective Date");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text(longDate(row.effectiveDate), rx + 6.5, 66.5);

  drawBox(doc, lx, 70, lw, 23, "Type of Cover:");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...LABEL);
  COIC_POLICY.typesOfCover.forEach((cover, i) =>
    doc.text(`${i + 1}. ${cover}`, lx + 1.5, 81 + i * 6),
  );

  drawBox(doc, rx, 71, rw, 23, "Riders:");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  COIC_POLICY.riders.forEach((rider, i) =>
    doc.text(rider, rx + 5, 85 + i * 5),
  );

  // ── Disclaimer, full width ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT);
  const disclaimer: string[] = doc.splitTextToSize(DISCLAIMER, PAGE_W - 17 - 12);
  disclaimer.forEach((line, i) => doc.text(line, 17, 98 + DISCLAIMER_DROP + i * 3.4));

  // ── Notices, bottom left ──
  doc.setFontSize(7.4);
  let y = 110 + FOOT_DROP;
  NOTICES.forEach(({ lead, body }) => {
    y = leadParagraph(doc, lead, body, 17, y, 119, 3.2);
  });

  // ── Signatory, bottom right — across where the form has it, and lowered
  // (user, 2026-10-06); the QR code goes under it ──
  const sx = 178.5;
  if (signature) {
    const h = 9;
    const w = h * signature.ratio;
    doc.addImage(signature.data, "PNG", sx - w / 2, 108 + SIGNATORY_DROP, w, h);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT);
  doc.text(SIGNATORY.name, sx, 119.5 + SIGNATORY_DROP, { align: "center" });
  doc.setFont("helvetica", "normal");
  SIGNATORY.titles.forEach((title, i) =>
    doc.text(title, sx, 123 + SIGNATORY_DROP + i * 3.5, { align: "center" }),
  );
}
