// A stand-in scan of the paper Application Form for Payment of Return of
// Premium (the "ROP form"), drawn as an SVG and filled in from the record it
// belongs to.
//
// DRAWN FOR THE SAME REASON AS THE RI FORM (`reinstatement/data/ri-form.ts`):
// the name, LPA number, plan, payout account and dates on the page are the
// ones on the screen, which is what a processor checks the form against.
//
// THE ID IS PART OF THE PAGE. The branch photocopies the planholder's ID onto
// the form beside the signature, so the scan carries both — the ID is the
// same card `id-card.ts` draws for the record, nested into the page rather
// than shown as a separate document.
//
// It goes when there is a document service to read the real scans from.

import {
  buildIdCardSvg,
  type IdCardData,
} from "../../reinstatement/data/id-card";
import { esc, mockAddress } from "../../reinstatement/data/ri-form";

export interface RopFormData {
  /** The form's pre-printed serial, top right. */
  formNo: string;
  ropNo: string;
  lpaNo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  planType: string;
  contractPrice: number;
  /** ISO dates (yyyy-mm-dd). */
  inceptionDate: string;
  applicationDate: string;
  /** Which of the five releases is applied for, e.g. "5th". */
  itemNo: string;
  bank: string;
  accountName: string;
  accountNo: string;
  contactNo: string;
  /** The ID photocopied onto the page. */
  id: IdCardData;
  /** Varies the address and signature; the same seed as the record's ID. */
  seed: number;
}

const W = 850;
const H = 1100;

const PAPER = "#ffffff";
const PRINT = "#1a1a1a";
const SHADE = "#f0f0f0";
const INK = "#1d3a8f";

const PRINT_FONT = "Arial, Helvetica, sans-serif";
const HAND_FONT =
  "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', 'Marker Felt', cursive";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** The five releases Article XIV schedules, as the form prints them. */
const ROP_ITEMS = [
  "End of 11th year from effectivity date - 20% of the pre-need price (annual mode)",
  "End of 12th year from effectivity date - 20% of the pre-need price (annual mode)",
  "End of 13th year from effectivity date - 20% of the pre-need price (annual mode)",
  "End of 14th year from effectivity date - 20% of the pre-need price (annual mode)",
  "End of 15th year from effectivity date - 20% of the pre-need price (annual mode)",
];

const CONDITIONS = [
  "(1) The planholder must be alive at the time he/she starts receiving the return of premium and must continue to be living until such premiums are fully returned and paid. In case the planholder dies after he/she has started to receive the return of premiums, he/she shall be entitled to the memorial services of the plan but such return of premiums shall automatically cease effective the time of his/her death.",
  "(2) If the plan is assigned to any deceased person in accordance with the provision under Art VIII A at any time before the planholder starts receiving the return of premiums, this provision shall no longer be applicable. However, if the planholder assigns the plan to any deceased person while the planholder is receiving the return of premiums, such return of premiums shall automatically cease effective the time of the assignment and the return of future premiums are considered waived by the planholder.",
  "(3) If the planholder transfers the plan to any living person in accordance with the provision under Art VIII B at any time before the planholder starts receiving the return of premiums, the transferee may still be entitled to the return of the pre-need price. But if the planholder transfers the plan to any living person during the time that the planholder is receiving the return of premiums, such return of premiums shall automatically cease effective the time of the transfer and the return of future premiums are considered waived by the planholder.",
  "(4) After personally receiving the full return of the pre-need price paid, the memorial services of the plan is exclusive for the planholder who can no longer assign nor transfer the plan.",
];

/** "October 08, 2026". */
function longDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${MONTHS[Number(m) - 1]} ${d}, ${y}`;
}

function money(value: number): string {
  return `P${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
    italic?: boolean;
    underline?: boolean;
  } = {},
): string {
  return `<text x="${x}" y="${y}" font-family="${PRINT_FONT}" font-size="${size}"${
    opts.bold ? ' font-weight="700"' : ""
  }${opts.italic ? ' font-style="italic"' : ""}${
    opts.underline ? ' text-decoration="underline"' : ""
  } text-anchor="${opts.anchor ?? "start"}" fill="${PRINT}">${esc(text)}</text>`;
}

/** Handwritten entry. */
function hw(
  x: number,
  y: number,
  text: string,
  size = 12,
  anchor: "start" | "middle" | "end" = "start",
): string {
  return `<text x="${x}" y="${y}" font-family="${HAND_FONT}" font-size="${size}" text-anchor="${anchor}" fill="${INK}">${esc(
    text,
  )}</text>`;
}

function line(x1: number, y1: number, x2: number, y2: number, w = 0.8): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${PRINT}" stroke-width="${w}"/>`;
}

function rect(
  x: number,
  y: number,
  w: number,
  h: number,
  sw = 1,
  fill = "none",
): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${PRINT}" stroke-width="${sw}"/>`;
}

/** A printed checkbox with its label, ticked in ink when `checked`. */
function checkbox(x: number, y: number, label: string, checked: boolean): string {
  const tick = checked
    ? `<path d="M${x + 2} ${y + 6} L${x + 5} ${y + 10} L${x + 12} ${y - 1}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`
    : "";
  return `${rect(x, y, 10, 10)}${tick}${t(x + 15, y + 9, label, 10)}`;
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

/** An entry on a rule with its caption in brackets under it. */
function captioned(
  cx: number,
  y: number,
  w: number,
  value: string,
  caption: string,
): string {
  return [
    hw(cx, y - 5, value, 11, "middle"),
    line(cx - w / 2, y, cx + w / 2, y),
    t(cx, y + 13, caption, 8.5, { anchor: "middle", italic: true }),
  ].join("");
}

/**
 * The ID card's SVG, re-seated as a nested `<svg>` at (x, y) and `w` wide.
 * Inline rather than an `<image>` of its data URL, so the page has no
 * resource of its own to load when it is drawn as an `<img>`.
 */
function embeddedId(data: IdCardData, x: number, y: number, w: number): string {
  const h = (w * 600) / 960;
  return buildIdCardSvg(data).replace(
    /^<svg ([^>]*?)width="\d+" height="\d+"/,
    `<svg $1x="${x}" y="${y}" width="${w}" height="${h}"`,
  );
}

export function buildRopFormSvg(data: RopFormData): string {
  const fullName = [data.firstName, data.middleName, data.lastName]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();
  const home = mockAddress(data.seed);
  const address = `${home.houseNo} ${home.street} ${home.barangay} ${home.city}`;
  const email = `${data.firstName.split(" ")[0]}_${data.lastName}`
    .toLowerCase()
    .replace(/[^a-z_]/g, "")
    .concat("@yahoo.com");

  const body: string[] = [];

  // ── Serial and letterhead ──
  body.push(
    t(W - 40, 36, `ROP Form No:  ${data.formNo}`, 10, { anchor: "end" }),
    t(W / 2, 78, "St. Peter Life Plan Inc.", 11, { bold: true, anchor: "middle" }),
    t(W / 2, 92, "St. Peter Corporate Center", 10, { bold: true, anchor: "middle" }),
    t(W / 2, 106, "999 EDSA, Quezon City 1105", 10, { bold: true, anchor: "middle" }),
    t(W / 2, 138, "APPLICATION FORM FOR PAYMENT OF RETURN OF PREMIUM", 12, {
      bold: true,
      anchor: "middle",
      underline: true,
    }),
    t(W / 2, 153, "(ST. ANDREW, ST. CHRISTOPHER, ST. DOROTHY)", 10.5, {
      bold: true,
      anchor: "middle",
    }),
  );

  // ── ROP no. and date ──
  body.push(
    t(50, 186, "ROP NO.", 10, { bold: true }),
    t(120, 186, data.ropNo, 9),
    line(115, 189, 300, 189),
    t(520, 186, "Date of Application:", 10),
    hw(790, 184, longDate(data.applicationDate), 12, "end"),
    line(630, 189, 800, 189),
  );

  // ── Plan table ──
  const top = 200;
  const rowH = 20;
  body.push(
    // Shading first, so the rules are drawn over it.
    rect(50, top, 150, rowH * 3, 0, SHADE),
    rect(470, top + rowH, 120, rowH * 2, 0, SHADE),
    rect(50, top, 750, rowH * 3, 1.2),
    line(50, top + rowH, 800, top + rowH),
    line(50, top + rowH * 2, 800, top + rowH * 2),
    line(200, top, 200, top + rowH * 3),
    line(470, top + rowH, 470, top + rowH * 3),
    line(590, top + rowH, 590, top + rowH * 3),
    t(56, top + 14, "NAME OF PLANHOLDER", 9.5, { bold: true }),
    t(56, top + rowH + 14, "LPA NO.", 9.5, { bold: true }),
    t(56, top + rowH * 2 + 14, "CONTRACT PRICE", 9.5, { bold: true }),
    t(476, top + rowH + 14, "PLAN TYPE", 9.5, { bold: true }),
    t(476, top + rowH * 2 + 14, "INCEPTION DATE", 9.5, { bold: true }),
    t(208, top + 14, fullName, 10),
    t(208, top + rowH + 14, data.lpaNo, 10),
    t(208, top + rowH * 2 + 14, money(data.contractPrice), 10),
    t(598, top + rowH + 14, data.planType.toUpperCase(), 10),
    t(598, top + rowH * 2 + 14, longDate(data.inceptionDate), 10),
  );

  // ── Item applied for ──
  body.push(
    t(
      50,
      292,
      "I am applying for the payment of the RETURN OF PREMIUM (per Article XIV of the Life Plan Contract) under ITEM",
      10,
    ),
    t(50, 306, "NO/s:", 10),
    line(82, 309, 140, 309),
    hw(88, 306, data.itemNo, 12),
  );

  const itemTop = 320;
  const itemH = 18;
  body.push(rect(60, itemTop, 520, itemH * ROP_ITEMS.length, 1));
  body.push(line(80, itemTop, 80, itemTop + itemH * ROP_ITEMS.length));
  ROP_ITEMS.forEach((item, n) => {
    const y = itemTop + n * itemH;
    if (n > 0) body.push(line(60, y, 580, y, 0.6));
    body.push(t(66, y + 13, String(n + 1), 9.5), t(86, y + 13, item, 9.5));
  });

  // ── Payment option ──
  const payTop = 428;
  body.push(
    t(50, payTop + 9, "Payment Option :", 10, { bold: true }),
    checkbox(150, payTop, "Fund Transfer", true),
    checkbox(270, payTop, "Check Payment", false),
    t(50, payTop + 30, "Bank :", 10, { bold: true }),
    hw(160, payTop + 29, data.bank, 11),
    t(50, payTop + 48, "Account name :", 10, { bold: true }),
    hw(160, payTop + 47, data.accountName.toUpperCase(), 11),
    t(50, payTop + 66, "Number :", 10, { bold: true }),
    hw(160, payTop + 65, data.accountNo, 11),
  );

  // ── Conditions ──
  let y = 530;
  body.push(
    t(
      50,
      y,
      "I understand and confirm per Article XIV of the Life Plan Contract that:",
      10.5,
      { bold: true },
    ),
  );
  y += 22;
  for (const condition of CONDITIONS) {
    for (const text of wrap(condition, 172)) {
      body.push(t(50, y, text, 9.5));
      y += 13;
    }
    y += 9;
  }

  // ── Signature block, with the ID photocopied beside it ──
  const idTop = Math.max(y + 6, 770);
  body.push(embeddedId(data.id, 470, idTop, 330));

  const sigY = idTop + 190;
  body.push(
    signature(110, sigY - 40, data.seed),
    signature(140, sigY - 16, data.seed + 2),
    captioned(180, sigY, 260, fullName, "(Signature over Printed Name of Planholder)"),
    captioned(180, sigY + 52, 260, data.contactNo, "(Planholder's Contact No.)"),
    captioned(635, sigY + 40, 300, address, "(Updated Home Address)"),
    captioned(635, sigY + 82, 300, email, "(Email Address)"),
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${PAPER}"/>${body.join(
    "",
  )}</svg>`;
}

/** The form as a URL an `<img>` can load. */
export function ropFormImageUrl(data: RopFormData): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    buildRopFormSvg(data),
  )}`;
}
