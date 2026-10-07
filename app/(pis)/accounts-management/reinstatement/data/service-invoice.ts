// A stand-in scan of the Service Invoice issued for a reinstatement's RI or TF
// payment, drawn as an SVG and filled in from the record it belongs to.
//
// Drawn for the same reason as the RI form (`ri-form.ts`): the invoice number,
// date, amount and pay class are the ones on the matching line of the Payment
// Details ledger, and the name and address are the planholder's, so a
// processor checking the invoice against the ledger finds them agreeing.
//
// The layout follows the printed booklet invoice: letterhead and serial,
// sold-to block, the service lines, form of payment and the VAT breakdown.
// It is stamped SAMPLE and carries no real TIN or BIR permit, so the picture
// cannot pass for a real invoice outside this screen.
//
// It goes when there is a document service to read the real scans from.

import { esc, mockAddress } from "./ri-form";
import type { PayClass } from "./types";

export interface ServiceInvoiceData {
  /** The ledger's SI number, e.g. "SI-100203". */
  siNo: string;
  /** ISO date (yyyy-mm-dd). */
  siDate: string;
  lpaNo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  planType: string;
  payClass: PayClass;
  amount: number;
  branch: string;
  /** The same seed as the record's RI form, so the address matches. */
  seed: number;
}

const W = 960;
const H = 600;
const PAPER = { x: 30, y: 20, w: 900, h: 560 };

const PAPER_FILL = "#fbfaf5";
const PRINT = "#1a1a1a";
const INK = "#1d3a8f";
const SERIAL = "#c62828";

const PRINT_FONT = "Arial, Helvetica, sans-serif";
const HAND_FONT =
  "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', 'Marker Felt', cursive";

const CASHIERS = [
  "R. MANALO",
  "J. REYES",
  "A. DELA CRUZ",
  "M. VILLANUEVA",
  "C. NAVARRO",
];

function money(value: number): string {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function mdy(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y.slice(2)}`;
}

/** Printed text. */
function t(
  x: number,
  y: number,
  text: string,
  size = 10,
  opts: {
    bold?: boolean;
    anchor?: "start" | "middle" | "end";
    font?: string;
    fill?: string;
    extra?: string;
  } = {},
): string {
  return `<text x="${x}" y="${y}" font-family="${opts.font ?? PRINT_FONT}" font-size="${size}"${
    opts.bold ? ' font-weight="700"' : ""
  } text-anchor="${opts.anchor ?? "start"}" fill="${opts.fill ?? PRINT}"${
    opts.extra ? ` ${opts.extra}` : ""
  }>${esc(text)}</text>`;
}

/** Handwritten entry. */
function hw(
  x: number,
  y: number,
  text: string,
  size = 15,
  anchor: "start" | "middle" | "end" = "start",
): string {
  return `<text x="${x}" y="${y}" font-family="${HAND_FONT}" font-size="${size}" text-anchor="${anchor}" fill="${INK}">${esc(
    text,
  )}</text>`;
}

function line(x1: number, y1: number, x2: number, y2: number, w = 0.8): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${PRINT}" stroke-width="${w}"/>`;
}

function rect(x: number, y: number, w: number, h: number, sw = 1): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${PRINT}" stroke-width="${sw}"/>`;
}

function checkbox(x: number, y: number, checked: boolean): string {
  const tick = checked
    ? `<path d="M${x + 2} ${y + 6} L${x + 5} ${y + 10} L${x + 12} ${y - 1}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`
    : "";
  return `${rect(x, y, 10, 10)}${tick}`;
}

function signature(x: number, y: number, seed: number): string {
  const a = 10 + (seed % 5) * 3;
  return `<path d="M${x} ${y} c ${a} -20 ${a + 12} -20 ${a + 8} 0 s -12 14 6 -4 c 10 -12 18 -18 26 -6 s 6 12 18 -6 c 8 -8 16 -2 30 -10" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`;
}

function watermark(): string {
  return `<text x="${W / 2}" y="${H / 2 + 40}" font-family="${PRINT_FONT}" font-size="130" font-weight="700" fill="#c62828" fill-opacity="0.14" text-anchor="middle" transform="rotate(-14 ${
    W / 2
  } ${H / 2})" letter-spacing="12">SAMPLE</text>`;
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|[\s.])([a-z])/g, (_, lead: string, ch: string) => lead + ch.toUpperCase());
}

export function buildServiceInvoiceSvg(data: ServiceInvoiceData): string {
  const s = data.seed;
  const home = mockAddress(s);
  const address = `${home.houseNo} ${home.street}, ${home.barangay}, ${home.city}`;
  const name = `${data.firstName} ${data.middleName.charAt(0)}. ${data.lastName}`.toUpperCase();
  const serial = data.siNo.replace(/\D/g, "").padStart(7, "0");
  const amount = money(data.amount);
  const cashier = CASHIERS[s % CASHIERS.length];
  const { x: px, y: py, w: pw, h: ph } = PAPER;
  const right = px + pw - 15;

  const body: string[] = [];

  // ── Letterhead ──
  body.push(
    `<path d="M48 62 L70 40 L92 62 L70 84 Z" fill="${PRINT}"/>`,
    `<path d="M60 62 L70 52 L80 62 L70 72 Z" fill="${PAPER_FILL}"/>`,
    t(102, 70, "ST. PETER", 34, {
      bold: true,
      font: "Georgia, 'Times New Roman', serif",
    }),
    t(106, 88, "LIFE PLAN", 12, { bold: true, extra: 'letter-spacing="6"' }),
    t(48, 108, "ST. PETER LIFE PLAN, INC.", 10, { bold: true }),
    t(48, 121, `${data.branch} BRANCH OFFICE`, 9),
    t(48, 133, "VAT Reg. TIN: 000-000-000-00000", 9),
    t(right, 70, "SERVICE INVOICE", 24, { bold: true, anchor: "end" }),
    t(right, 104, `№ ${serial}`, 26, { anchor: "end", fill: SERIAL }),
    t(640, 134, "DATE", 10, { bold: true }),
    line(680, 136, right, 136),
    hw(700, 132, mdy(data.siDate)),
    t(640, 156, "LPA/LPC NO.", 10, { bold: true }),
    line(718, 158, right, 158),
    hw(730, 154, data.lpaNo),
  );

  // ── Sold to ──
  body.push(
    t(45, 184, "Sold to", 10),
    line(90, 186, right, 186),
    hw(110, 182, name, 16),
    t(45, 206, "Address:", 10),
    line(95, 208, right, 208),
    hw(110, 204, address, 13),
    t(45, 228, "SC/PWD/NAAC/Solo Parent/MOV Awardee ID No.:", 10),
    line(300, 230, 600, 230),
    t(620, 228, "TIN:", 10),
    line(648, 230, right, 230),
    t(620, 248, "Signature:", 10),
    line(680, 250, right, 250),
    signature(720, 246, s),
  );

  // ── Service lines ──
  const cols = [45, 110, 380, 560, 730, right];
  const tableTop = 258;
  const headerBottom = tableTop + 22;
  const tableBottom = headerBottom + 3 * 32;
  body.push(rect(45, tableTop, right - 45, tableBottom - tableTop, 1.2));
  cols.slice(1, -1).forEach((cx) => body.push(line(cx, tableTop, cx, tableBottom)));
  body.push(line(45, headerBottom, right, headerBottom));
  for (let n = 1; n < 3; n++) {
    const ry = headerBottom + n * 32;
    body.push(line(45, ry, right, ry, 0.5));
  }
  ["QTY.", "DESCRIPTION", "NATURE OF SERVICE", "UNIT COST", "TOTAL AMOUNT"].forEach(
    (label, n) => {
      body.push(
        t((cols[n] + cols[n + 1]) / 2, tableTop + 15, label, 9.5, {
          bold: true,
          anchor: "middle",
        }),
      );
    },
  );
  const rowY = headerBottom + 23;
  body.push(
    hw(77, rowY, "1", 16, "middle"),
    hw(125, rowY, titleCase(data.planType), 15),
    hw(470, rowY, data.payClass, 16, "middle"),
    hw(715, rowY, amount, 15, "end"),
    hw(right - 15, rowY, amount, 15, "end"),
  );

  // ── Form of payment and VAT breakdown ──
  const blockTop = tableBottom + 6;
  const row = 18;
  body.push(
    rect(45, blockTop, 385, row * 4, 1),
    line(190, blockTop, 190, blockTop + row * 4),
    line(330, blockTop, 330, blockTop + row * 4),
  );
  for (let n = 1; n < 4; n++) {
    body.push(line(45, blockTop + n * row, 430, blockTop + n * row, 0.5));
  }
  body.push(
    t(52, blockTop + 13, "Form of Payment", 9.5, { bold: true }),
    t(52, blockTop + row + 13, "CASH", 9.5),
    checkbox(160, blockTop + row + 4, true),
    t(52, blockTop + row * 2 + 13, "CHECK (Bank)", 9.5),
    checkbox(160, blockTop + row * 2 + 4, false),
    t(52, blockTop + row * 3 + 13, "Check No.:", 9.5),
    t(196, blockTop + 13, "Vatable Sales", 9.5),
    t(196, blockTop + row + 13, "VAT - Exempt Sales", 9.5),
    hw(422, blockTop + row + 14, amount, 13, "end"),
    t(196, blockTop + row * 2 + 13, "Zero Rated Sales", 9.5),
    t(196, blockTop + row * 3 + 13, "VAT Amount", 9.5),
  );

  const sigY = blockTop + row * 4 + 44;
  body.push(
    t(52, blockTop + row * 4 + 18, "Payment Received by:", 9.5, { bold: true }),
    signature(170, sigY - 8, s + 2),
    hw(245, sigY - 2, cashier, 12, "middle"),
    line(110, sigY + 2, 380, sigY + 2),
    t(245, sigY + 14, "SIGNATURE OVER PRINTED NAME", 9, {
      bold: true,
      anchor: "middle",
    }),
    t(245, sigY + 25, "(Cashier / Collector / Authorized Representative)", 8, {
      anchor: "middle",
    }),
  );

  const summary: [string, string, boolean][] = [
    ["Total Sales (VAT Inclusive)", amount, false],
    ["Less: VAT", "", false],
    ["Amount Net of VAT", "", false],
    ["Less: SC/PWD/NAAC/Solo Parent/MOV Discount", "", false],
    ["Amount Due", "", false],
    ["Add: 12% VAT", "", false],
    ["Sub Total", amount, false],
    ["Less: Withholding Tax", "", false],
    ["Total Amount Due", amount, true],
  ];
  const sumLeft = 445;
  body.push(
    rect(sumLeft, blockTop, right - sumLeft, row * summary.length, 1),
    line(730, blockTop, 730, blockTop + row * summary.length),
  );
  summary.forEach(([label, value, bold], n) => {
    const ry = blockTop + n * row;
    if (n > 0) body.push(line(sumLeft, ry, right, ry, 0.5));
    body.push(t(sumLeft + 6, ry + 13, label, 9, { bold }));
    if (value) body.push(hw(right - 15, ry + 14, value, 13, "end"));
  });

  body.push(
    t(sumLeft, blockTop + row * summary.length + 16, "IMPORTANT:", 8.5, { bold: true }),
    t(
      sumLeft + 60,
      blockTop + row * summary.length + 16,
      "Pls. keep this invoice for your reference.",
      8.5,
    ),
  );

  // A grey scanner bed around the page, the way a photocopy comes back.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#e7e7e3"/><rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${PAPER_FILL}" stroke="#c9c7bd" stroke-width="1"/>${body.join(
    "",
  )}${watermark()}</svg>`;
}

/** The invoice as a URL an `<img>` can load. */
export function serviceInvoiceImageUrl(data: ServiceInvoiceData): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    buildServiceInvoiceSvg(data),
  )}`;
}
