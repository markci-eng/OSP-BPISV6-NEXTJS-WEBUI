// Stand-in scans of the papers filed with a Cash Surrender Value request — the
// CSV form, the LPA contract and the Certificate of Full Payment — drawn as SVGs
// and filled in from the record they belong to.
//
// Drawn rather than stock photos for the same reason as Reinstatement's RI form
// (`ri-form.ts`): the name, LPA number and amounts on the page are the ones on
// the screen, which is what a processor checks the papers against. The entries
// are printed for the contract and certificate, handwritten for the form.
//
// It goes when there is a document service to read the real scans from.

import QRCode from "qrcode";

import { amountInWords } from "../../cofp/components/cofp-certificate";
import { esc, mockAddress } from "../../reinstatement/data/ri-form";

export interface CsvDocumentData {
  lpaNo: string;
  csvNo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  planDescription: string;
  planCode: string;
  contractPrice: number;
  /** ISO dates (yyyy-mm-dd). */
  birthdate: string;
  effectivityDate: string;
  dateApplied: string;
  branch: string;
  /** Unset when the plan has no Certificate of Full Payment. */
  cofpNo?: string;
  /**
   * The address on one line, when the caller has the plan holder's own — the
   * COFP Replacement panel does. Unset, one is made up from `seed`.
   */
  address?: string;
  /** Varies the made-up details — address, signature, reason. */
  seed: number;
}

const W = 850;
const H = 1100;

const PAPER = "#fdfcf7";
const PRINT = "#1a1a1a";
const MUTED = "#555555";
const INK = "#1d3a8f";
const GREEN = "#1f6b3a";

const PRINT_FONT = "Arial, Helvetica, sans-serif";
const SERIF_FONT = "Georgia, 'Times New Roman', serif";
const HAND_FONT =
  "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', 'Marker Felt', cursive";

const REASONS = [
  "FINANCIAL DIFFICULTY",
  "NO LONGER NEEDED",
  "MIGRATING ABROAD",
  "MEDICAL EXPENSES",
  "TRANSFER TO OTHER PLAN",
];

function money(value: number): string {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function mdy(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

function fullName(data: CsvDocumentData): string {
  return `${data.firstName} ${data.middleName.charAt(0)}. ${data.lastName}`.toUpperCase();
}

/** Printed text. */
function t(
  x: number,
  y: number,
  text: string,
  size = 11,
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
function hw(x: number, y: number, text: string, size = 14): string {
  return `<text x="${x}" y="${y}" font-family="${HAND_FONT}" font-size="${size}" fill="${INK}">${esc(
    text,
  )}</text>`;
}

function line(x1: number, y1: number, x2: number, y2: number, w = 0.8): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${PRINT}" stroke-width="${w}"/>`;
}

function rect(x: number, y: number, w: number, h: number, sw = 1): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${PRINT}" stroke-width="${sw}"/>`;
}

/** A signature — a loop of ink, varied by seed so no two look the same. */
function signature(x: number, y: number, seed: number): string {
  const a = 8 + (seed % 5) * 2;
  const b = 14 + (seed % 3) * 4;
  return `<path d="M${x} ${y} c ${a} -${b} ${a + 10} -${b} ${a + 6} 0 s -10 ${b - 4} 4 -2 c 8 -10 14 -${b} 20 -6 s 4 10 14 -4 c 6 -6 12 -2 22 -8" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`;
}

/** Wraps a paragraph to lines of at most `width` characters. */
function wrap(text: string, width: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(" ")) {
    if ((current + " " + word).trim().length > width) {
      lines.push(current.trim());
      current = word;
    } else {
      current += " " + word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

function paragraph(x: number, y: number, text: string, width: number, size = 10.5): string {
  return wrap(text, width)
    .map((row, n) => t(x, y + n * (size + 5), row, size))
    .join("");
}

/** The company letterhead, centred at the top of every page. */
function letterhead(color = PRINT): string {
  return [
    `<path d="M300 44 L322 22 L344 44 L322 66 Z" fill="${color}"/>`,
    `<path d="M312 44 L322 34 L332 44 L322 54 Z" fill="${PAPER}"/>`,
    t(356, 62, "ST. PETER", 40, { bold: true, font: SERIF_FONT, fill: color }),
    t(360, 80, "LIFE PLAN", 11, { bold: true, fill: color, extra: 'letter-spacing="7"' }),
    t(425, 100, "St. Peter Corporate Center", 10, { bold: true, anchor: "middle" }),
    t(425, 113, "999 EDSA, Quezon City 1105", 10, { anchor: "middle" }),
  ].join("");
}

/** A labelled box with its entry, for the form's field grid. */
function field(
  x: number,
  y: number,
  w: number,
  label: string,
  value: string,
  hand: boolean,
): string {
  return [
    rect(x, y, w, 44),
    t(x + 6, y + 13, label, 8.5, { bold: true, fill: MUTED }),
    hand ? hw(x + 8, y + 35, value) : t(x + 8, y + 34, value, 12, { bold: true }),
  ].join("");
}

function svg(body: string[], border: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${PAPER}"/>${border}${body.join(
    "",
  )}</svg>`;
}

function toUrl(markup: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

/** The Request for Cash Surrender Value, filled in by hand at the branch. */
export function csvFormImageUrl(data: CsvDocumentData): string {
  const s = data.seed;
  const home = mockAddress(s);
  const address = `${home.houseNo} ${home.street}, ${home.barangay}, ${home.city}`;
  const body: string[] = [letterhead()];

  body.push(
    t(425, 160, "REQUEST FOR CASH SURRENDER VALUE", 21, { bold: true, anchor: "middle" }),
    t(425, 180, "(CSV FORM)", 11, { anchor: "middle", fill: MUTED }),
    t(790, 140, `CSV No. ${data.csvNo}`, 10, { bold: true, anchor: "end" }),
    t(60, 220, "I. PLANHOLDER INFORMATION", 12, { bold: true }),
    field(60, 232, 365, "LAST NAME", data.lastName.toUpperCase(), true),
    field(425, 232, 365, "FIRST NAME / MIDDLE NAME", `${data.firstName} ${data.middleName}`.toUpperCase(), true),
    field(60, 276, 730, "HOME ADDRESS", address, true),
    field(60, 320, 245, "DATE OF BIRTH", mdy(data.birthdate), true),
    field(305, 320, 240, "CONTACT NO.", `0917-${String(4100000 + s * 731).slice(0, 7)}`, true),
    field(545, 320, 245, "BRANCH", data.branch.toUpperCase(), true),

    t(60, 404, "II. PLAN INFORMATION", 12, { bold: true }),
    field(60, 416, 245, "LPA CONTRACT NO.", data.lpaNo, true),
    field(305, 416, 240, "PLAN TYPE", data.planDescription.toUpperCase(), true),
    field(545, 416, 245, "CONTRACT PRICE", `P ${money(data.contractPrice)}`, true),
    field(60, 460, 365, "EFFECTIVITY DATE", mdy(data.effectivityDate), true),
    field(425, 460, 365, "REASON FOR SURRENDER", REASONS[s % REASONS.length], true),

    t(60, 548, "III. UNDERTAKING", 12, { bold: true }),
    paragraph(
      60,
      570,
      "I hereby request the surrender of the above Life Plan Contract and the payment of its Cash Surrender Value in accordance with its terms and conditions. I understand that upon surrender, the contract and all benefits under it are terminated and may no longer be reinstated. I certify that the information stated herein is true and correct, and I surrender the original contract and Certificate of Full Payment, where issued, together with this request.",
      110,
    ),

    signature(110, 760, s),
    line(80, 772, 360, 772),
    t(220, 788, "Signature of Planholder over Printed Name", 9.5, { anchor: "middle" }),
    hw(130, 768, fullName(data), 11),
    hw(560, 766, mdy(data.dateApplied)),
    line(490, 772, 770, 772),
    t(630, 788, "Date Filed", 9.5, { anchor: "middle" }),

    t(60, 850, "FOR BRANCH USE ONLY", 11, { bold: true }),
    rect(60, 860, 730, 120),
    t(76, 885, "Received by:", 10),
    line(160, 887, 400, 887),
    signature(190, 885, s + 2),
    t(430, 885, "Date received:", 10),
    line(520, 887, 770, 887),
    hw(540, 884, mdy(data.dateApplied), 12),
    t(76, 925, "Documents attached:", 10),
    t(
      210,
      925,
      `[x] Valid ID   [x] LPA Contract   [${data.cofpNo ? "x" : " "}] COFP   [ ] Others`,
      10,
    ),
    t(76, 960, "Remarks:", 10),
    line(140, 962, 770, 962),

    t(425, 1060, "SPLP-CSV-001 Rev. 03", 8, { anchor: "middle", fill: MUTED }),
  );

  return toUrl(svg(body, rect(30, 30, W - 60, H - 60, 1.2)));
}

/** The first page of the Life Plan Agreement, as issued with the plan. */
export function lpaContractImageUrl(data: CsvDocumentData): string {
  const s = data.seed;
  const home = mockAddress(s);
  const body: string[] = [letterhead(GREEN)];
  const rows: [string, string][] = [
    ["Contract No.", data.lpaNo],
    ["Planholder", fullName(data)],
    [
      "Address",
      data.address ??
        `${home.houseNo} ${home.street}, ${home.barangay}, ${home.city}, ${home.province}`,
    ],
    ["Date of Birth", mdy(data.birthdate)],
    ["Plan", `${data.planDescription.toUpperCase()} (${data.planCode})`],
    ["Contract Price", `PHP ${money(data.contractPrice)}`],
    ["Effectivity Date", mdy(data.effectivityDate)],
    ["Issuing Branch", data.branch.toUpperCase()],
  ];

  body.push(
    t(425, 165, "LIFE PLAN AGREEMENT", 26, {
      bold: true,
      anchor: "middle",
      font: SERIF_FONT,
      fill: GREEN,
    }),
    t(425, 188, "Pre-Need Memorial Plan Contract", 12, { anchor: "middle", fill: MUTED }),
    line(120, 205, 730, 205, 1.2),
    t(60, 245, "CONTRACT SCHEDULE", 12, { bold: true, fill: GREEN }),
    ...rows.flatMap(([label, value], n) => {
      const y = 275 + n * 30;
      return [
        t(80, y, label, 11, { fill: MUTED }),
        t(260, y, value, 12, { bold: true }),
        line(250, y + 8, 770, y + 8, 0.4),
      ];
    }),
    t(60, 540, "TERMS AND CONDITIONS", 12, { bold: true, fill: GREEN }),
    paragraph(
      60,
      562,
      "1. ST. PETER LIFE PLAN, INC. (the Company) undertakes to provide the memorial services described in this Agreement upon the death of the beneficiary, provided the contract price has been paid in full or the contract is in force at the time of death.",
      112,
    ),
    paragraph(
      60,
      622,
      "2. The Planholder may surrender a fully paid or in-force contract and receive its Cash Surrender Value, computed on the installments paid less the applicable charges, in accordance with the table of values attached to this Agreement.",
      112,
    ),
    paragraph(
      60,
      682,
      "3. A contract that lapses for non-payment may be reinstated within two (2) years from the due date of the first unpaid installment, subject to the Company's reinstatement requirements.",
      112,
    ),
    paragraph(
      60,
      727,
      "4. This Agreement, the application and the Certificate of Full Payment, where issued, constitute the entire contract between the parties.",
      112,
    ),
    signature(110, 880, s),
    line(80, 892, 360, 892),
    t(220, 908, "Planholder", 10, { anchor: "middle" }),
    signature(540, 880, s + 3),
    line(490, 892, 770, 892),
    t(630, 908, "Authorized Signatory", 10, { anchor: "middle" }),
    `<circle cx="425" cy="985" r="42" fill="none" stroke="${GREEN}" stroke-width="2" opacity="0.6"/>`,
    t(425, 982, "ST. PETER", 10, { bold: true, anchor: "middle", fill: GREEN }),
    t(425, 996, "OFFICIAL", 8, { anchor: "middle", fill: GREEN }),
  );

  return toUrl(
    svg(
      body,
      `${rect(26, 26, W - 52, H - 52, 3).replace(PRINT, GREEN)}${rect(36, 36, W - 72, H - 72, 0.8).replace(PRINT, GREEN)}`,
    ),
  );
}

// ── Certificate of Full Payment ──────────────────────────────────────────
//
// THE SAME FORM THE COFP SCREEN PRINTS (user, 2026-10-02) — `cofp-pdf.ts` in
// the certificate-of-full-payment module. A landscape sheet, drawn here in
// that file's own millimetres (the whole body sits in one scale transform), so
// the two read alike line for line: letterhead left, certification centred on
// the right, branch and CFP number along the bottom, a QR code beside the
// signatory, over a tinted sheet tiled with the company's name.
//
// The logo is drawn rather than linked: an SVG shown through an <img> may not
// load anything outside itself.

/** The printed sheet, in millimetres, and the pixels it is drawn at. */
const COFP_W_MM = 279.4;
const COFP_H_MM = 130.5;
const COFP_SCALE = 5;

const COFP_PAPER = "#f8fade";
const COFP_WATERMARK = "#e9eec4";
const COFP_GREEN = "#138a3f";
const COFP_COVERAGES = ["MEMORIAL SERVICE ONLY", "MEMORIAL SERVICE WITH INTERMENT"];
const COFP_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
/** 1pt in millimetres — the PDF's font sizes are in points. */
const PT = 0.3528;

function ordinal(day: number): string {
  if (day > 3 && day < 21) return `${day}th`;
  return `${day}${["th", "st", "nd", "rd"][day % 10] ?? "th"}`;
}

/**
 * When the plan was paid off — five years after effectivity, the usual term,
 * or the day the CSV was filed if that came first.
 */
function fullPaidOn(data: CsvDocumentData): string {
  const [y, m, d] = data.effectivityDate.split("-");
  const term = `${Number(y) + 5}-${m}-${d}`;
  return term < data.dateApplied ? term : data.dateApplied;
}

/** The emblem: the green pentagon with the white S, simplified. */
function cofpEmblem(x: number, y: number, size: number): string {
  const p = (px: number, py: number) => `${x + px * size} ${y + py * size}`;
  return [
    `<path d="M${p(0.5, 0.03)} L${p(0.97, 0.6)} L${p(0.8, 0.97)} L${p(0.2, 0.97)} L${p(0.03, 0.6)} Z" fill="${COFP_GREEN}" stroke="#03673a" stroke-width="${size * 0.02}"/>`,
    `<text x="${x + size * 0.5}" y="${y + size * 0.86}" font-family="${SERIF_FONT}" font-size="${size * 0.78}" font-weight="700" font-style="italic" text-anchor="middle" fill="#ffffff">S</text>`,
  ].join("");
}

/** The QR code as one path of unit squares, `size` mm across. */
function cofpQr(text: string, x: number, y: number, size: number): string {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: "M" });
  const n = modules.size;
  let d = "";
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      if (modules.data[r * n + c]) d += `M${c} ${r}h1v1h-1z`;
    }
  }
  const pad = 2.5;
  return [
    `<rect x="${x - pad}" y="${y - pad}" width="${size + pad * 2}" height="${size + pad * 2}" fill="#ffffff"/>`,
    `<path d="${d}" transform="translate(${x} ${y}) scale(${size / n})" fill="${PRINT}" shape-rendering="crispEdges"/>`,
  ].join("");
}

/** The Certificate of Full Payment, issued once the contract price is paid. */
export function cofpImageUrl(
  data: CsvDocumentData & { cofpNo: string },
): string {
  const s = data.seed;
  const home = mockAddress(s);
  const address = (
    data.address ??
    `${home.houseNo} ${home.street}, BRGY. ${home.barangay}, ${home.city}, ${home.province}`
  ).toUpperCase();
  const paid = fullPaidOn(data);
  const [py, pm, pd] = paid.split("-").map(Number);
  const plan = data.planDescription.toUpperCase();

  const cx = 190;
  let y = 22;
  const body: string[] = [];

  /** Centred lines, wrapped to the body's width, stepping `y` down. */
  const centred = (
    text: string,
    sizePt: number,
    gap: number,
    opts: { bold?: boolean; italic?: boolean; serif?: boolean } = {},
  ) => {
    // About as many characters as fit across 135mm at this size.
    const perLine = Math.floor(135 / (sizePt * PT * 0.52));
    for (const row of wrap(text, perLine)) {
      body.push(
        t(cx, y, row, sizePt * PT, {
          bold: opts.bold,
          anchor: "middle",
          font: opts.serif ? SERIF_FONT : PRINT_FONT,
          extra: opts.italic ? 'font-style="italic"' : undefined,
        }),
      );
      y += gap;
    }
  };

  // Letterhead.
  body.push(
    cofpEmblem(12, 11, 22),
    t(37, 21, "ST. PETER", 27 * PT, { bold: true, fill: COFP_GREEN }),
    t(41, 31, "LIFE PLAN", 27 * PT, { bold: true, fill: COFP_GREEN }),
    ...[
      "St. Peter Corporate Center",
      "999 EDSA, Quezon City 1105 (across SM North Annex)",
      "Tel. No.: (632) 8-271-7757  Customer Support: (02) 8371-9999,",
      "(02) 7946-9999, 0919-056-9999",
      "www.stpeter.com.ph",
    ].map((row, i) => t(20, 39 + i * 3.3, row, 7 * PT)),
  );

  // Certification.
  centred("CERTIFICATE OF FULL PAYMENT OF PLAN", 17, 9, { bold: true, serif: true });
  centred("This is to certify that", 11, 7, { italic: true, serif: true });
  centred(fullName(data), 13, 9, { bold: true, serif: true });
  centred(address, 8, 4);
  y += 3;
  centred("Has paid in full", 11, 7.5, { italic: true, serif: true });
  centred(`${plan} LIFE PLAN under contract number ${data.lpaNo} with plan value of`, 8, 4.2);
  centred(`${amountInWords(data.contractPrice)} (Php ${money(data.contractPrice)})`, 8, 4.2);
  centred(COFP_COVERAGES[s % COFP_COVERAGES.length], 8, 6.5);
  centred(
    `Given this ${ordinal(pd)} day of ${COFP_MONTHS[pm - 1]} ${py} at Quezon City, Philippines`,
    8,
    4,
  );

  // Signatory, QR code beside it, footer.
  body.push(
    t(cx, 102, "Vitangcol", 22 * PT, {
      bold: true,
      anchor: "middle",
      font: SERIF_FONT,
      extra: 'font-style="italic"',
    }),
    `<line x1="${cx - 28}" y1="105" x2="${cx + 28}" y2="105" stroke="${PRINT}" stroke-width="0.25"/>`,
    t(cx, 109.5, "JONATHAN B. VITANGCOL", 10 * PT, { bold: true, anchor: "middle", font: SERIF_FONT }),
    t(cx, 113.5, "President and CEO", 9 * PT, { anchor: "middle", font: SERIF_FONT }),
    cofpQr(
      [
        `Name: ${fullName(data)}`,
        `COFP No: ${data.cofpNo}`,
        `LPA No: ${data.lpaNo}`,
        `Plan Type: ${plan}`,
      ].join("\n"),
      247,
      99,
      20,
    ),
    t(12, 111, `Branch: ${data.branch.toUpperCase()}`, 7 * PT),
    t(12, 114.5, `CFP# ${data.cofpNo}   Date Printed: ${mdy(paid)}`, 7 * PT),
    t(12, 122, "This is a computer generated form and is valid only if there is no alteration.", 6 * PT),
  );

  // Rows of text rather than an SVG <pattern>, as the PDF draws it: patterns
  // are not drawn alike by every renderer, and a row each is only ~40 nodes.
  const tile = "ST. PETER LIFE PLAN INCORPORATED   ".repeat(9);
  const watermark: string[] = [];
  for (let wy = 9; wy < COFP_H_MM - 4; wy += 3.1) {
    watermark.push(
      t(5 - ((wy * 7) % 40), wy, tile, 6.5 * PT, {
        bold: true,
        font: SERIF_FONT,
        fill: COFP_WATERMARK,
        extra: 'xml:space="preserve"',
      }),
    );
  }

  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${COFP_W_MM * COFP_SCALE}" height="${COFP_H_MM * COFP_SCALE}" viewBox="0 0 ${COFP_W_MM} ${COFP_H_MM}">
<defs><clipPath id="sheet"><rect x="5" y="5" width="${COFP_W_MM - 10}" height="${COFP_H_MM - 10}"/></clipPath></defs>
<rect width="${COFP_W_MM}" height="${COFP_H_MM}" fill="${COFP_PAPER}"/>
<g clip-path="url(#sheet)">${watermark.join("")}</g>
<rect x="3" y="3" width="${COFP_W_MM - 6}" height="${COFP_H_MM - 6}" fill="none" stroke="${PRINT}" stroke-width="0.5"/>
<rect x="5" y="5" width="${COFP_W_MM - 10}" height="${COFP_H_MM - 10}" fill="none" stroke="${PRINT}" stroke-width="0.2"/>
${body.join("")}</svg>`;

  return toUrl(markup);
}
