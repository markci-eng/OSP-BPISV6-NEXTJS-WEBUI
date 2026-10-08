// Stand-in scans of the papers filed with a transfer of rights — the two-page
// Transfer of Life Plan Agreement form and the transferor's Waiver of Rights —
// drawn as SVGs and filled in from the record they belong to.
//
// DRAWN FOR THE SAME REASON AS THE RI FORM (`reinstatement/data/ri-form.ts`):
// the names, dates, LPA number and beneficiaries on the page are the ones on
// the screen, which is what a processor checks the form against. Entries are
// in a handwriting face and ink blue, on white stock.
//
// It goes when there is a document service to read the real scans from.

import { esc } from "../../reinstatement/data/ri-form";

export interface TransferFormParty {
  lastName: string;
  firstName: string;
  middleName: string;
  /** ISO (yyyy-mm-dd). */
  dateOfBirth: string;
}

export interface TransferFormData {
  /** The form's pre-printed serial. */
  formNo: string;
  lpaNo: string;
  planType: string;
  /** ISO — the day both parties signed. */
  signedDate: string;
  originatingBranch: string;
  requestingBranch: string;
  salesAgent: string;
  reason: string;
  transferor: TransferFormParty & { accountStatus: string };
  transferee: TransferFormParty & {
    insurable: boolean;
    contactNumber: string;
    registeredAddress: string;
    beneficiaries: { name: string; relationship: string }[];
  };
  /** Whether the waiver was filed — ticks its box in the requirements list. */
  waiverFiled: boolean;
  /** Varies the signatures. */
  seed: number;
}

const W = 850;
const H = 1100;

const PAPER = "#fdfdfa";
const PRINT = "#1a1a1a";
const MUTED = "#555555";
const SHADE = "#eef1ee";
const BRAND = "#006838";
const INK = "#1d3a8f";
const SERIAL = "#c62828";

const PRINT_FONT = "Arial, Helvetica, sans-serif";
const HAND_FONT =
  "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', 'Marker Felt', cursive";

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

/** "MAY 02, 1990", as the form is filled in by hand. */
function handDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${MONTHS[Number(m) - 1]} ${d}, ${y}`;
}

function age(birthIso: string, onIso: string): number {
  const [by, bm, bd] = birthIso.split("-").map(Number);
  const [oy, om, od] = onIso.split("-").map(Number);
  let years = oy - by;
  if (om < bm || (om === bm && od < bd)) years -= 1;
  return years;
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
    fill?: string;
  } = {},
): string {
  return `<text x="${x}" y="${y}" font-family="${PRINT_FONT}" font-size="${size}"${
    opts.bold ? ' font-weight="700"' : ""
  } text-anchor="${opts.anchor ?? "start"}" fill="${opts.fill ?? PRINT}">${esc(
    text,
  )}</text>`;
}

/** Handwritten entry. */
function hw(
  x: number,
  y: number,
  text: string,
  size = 14,
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

/**
 * One blank of the form: the handwritten entry sitting on a rule, the printed
 * caption under it. Long entries are shrunk to stay on their rule.
 */
function field(
  x: number,
  y: number,
  w: number,
  caption: string,
  value: string,
): string {
  const fit = Math.min(14, Math.max(9, (w - 8) / Math.max(value.length, 1) / 0.55));
  return `${hw(x + 4, y - 5, value, fit)}${line(x, y, x + w, y)}${t(
    x,
    y + 13,
    caption,
    8.5,
    { fill: MUTED },
  )}`;
}

/** A printed checkbox with its label, ticked in ink when `checked`. */
function checkbox(x: number, y: number, label: string, checked: boolean): string {
  const tick = checked
    ? `<path d="M${x + 2} ${y + 6} L${x + 5} ${y + 10} L${x + 12} ${y - 1}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`
    : "";
  return `${rect(x, y, 10, 10)}${tick}${t(x + 16, y + 9, label, 10)}`;
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

/** A printed paragraph from `y` down; returns the markup and the next y. */
function paragraph(
  x: number,
  y: number,
  text: string,
  width = 112,
  size = 11,
): { svg: string; y: number } {
  const lines = wrap(text, width);
  return {
    svg: lines.map((l, n) => t(x, y + n * (size + 6), l, size)).join(""),
    y: y + lines.length * (size + 6),
  };
}

/** The shaded bar a section of the form opens with. */
function sectionBar(y: number, title: string): string {
  return `${rect(50, y, W - 100, 24, 1, SHADE)}${t(62, y + 16, title, 11, {
    bold: true,
  })}`;
}

/** The letterhead, title and form line every page carries. */
function letterhead(data: TransferFormData, title: string, formCode: string): string {
  return [
    `<circle cx="96" cy="66" r="26" fill="${BRAND}"/>`,
    t(96, 72, "SP", 16, { bold: true, anchor: "middle", fill: "#ffffff" }),
    t(136, 62, "ST. PETER LIFE PLAN, INC.", 22, { bold: true, fill: BRAND }),
    t(136, 80, "Pre-Need Company · Head Office, Quezon City", 10, { fill: MUTED }),
    t(W - 50, 52, "No.", 10, { anchor: "end", fill: MUTED }),
    t(W - 50, 72, data.formNo, 18, { bold: true, anchor: "end", fill: SERIAL }),
    t(W / 2, 128, title, 17, { bold: true, anchor: "middle" }),
    t(50, 158, `FORM ${formCode}`, 9.5, { fill: MUTED }),
    t(W / 2 - 40, 158, "DATE:", 9.5, { fill: MUTED }),
    hw(W / 2, 158, handDate(data.signedDate), 13),
    t(W - 210, 158, "LPA NO.:", 9.5, { fill: MUTED }),
    hw(W - 160, 158, data.lpaNo, 13),
    line(50, 168, W - 50, 168, 2),
  ].join("");
}

function footer(page: number, of: number, code: string): string {
  return [
    line(50, H - 48, W - 50, H - 48, 0.6),
    t(50, H - 32, `ST. PETER LIFE PLAN, INC. · ${code}`, 9, { fill: MUTED }),
    t(W - 50, H - 32, `PAGE ${page} OF ${of}`, 9, { anchor: "end", fill: MUTED }),
  ].join("");
}

function svgPage(body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${PAPER}"/>${body}</svg>`;
}

function toUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Page 1: the two parties and the transferee's beneficiaries. */
function transferFormPage1(data: TransferFormData): string {
  const a = data.transferor;
  const b = data.transferee;
  const body: string[] = [letterhead(data, "TRANSFER OF LIFE PLAN AGREEMENT (LPA)", "SPF-TR-01")];

  // I. TRANSFEROR
  let y = 188;
  body.push(sectionBar(y, "SECTION I · TRANSFEROR INFORMATION (PRESENT PLANHOLDER)"));
  body.push(rect(50, y + 24, W - 100, 170));
  body.push(
    field(66, y + 68, 230, "LAST NAME", a.lastName),
    field(312, y + 68, 230, "FIRST NAME", a.firstName),
    field(558, y + 68, 226, "MIDDLE NAME", a.middleName),
    field(66, y + 118, 230, "DATE OF BIRTH", handDate(a.dateOfBirth)),
    field(312, y + 118, 230, "PLAN TYPE", data.planType),
    field(558, y + 118, 226, "ACCOUNT STATUS", a.accountStatus),
    field(66, y + 168, 230, "ORIGINATING BRANCH", data.originatingBranch),
    field(312, y + 168, 230, "REQUESTING BRANCH", data.requestingBranch),
    field(558, y + 168, 226, "SALES AGENT", data.salesAgent),
  );

  // II. TRANSFEREE
  y = 402;
  body.push(sectionBar(y, "SECTION II · DESIGNATED TRANSFEREE"));
  body.push(rect(50, y + 24, W - 100, 176));
  body.push(
    field(66, y + 68, 230, "LAST NAME", b.lastName),
    field(312, y + 68, 230, "FIRST NAME", b.firstName),
    field(558, y + 68, 226, "MIDDLE NAME", b.middleName),
    field(66, y + 118, 230, "DATE OF BIRTH", handDate(b.dateOfBirth)),
    field(312, y + 118, 100, "AGE", String(age(b.dateOfBirth, data.signedDate))),
    t(430, y + 98, "INSURABILITY", 8.5, { fill: MUTED }),
    checkbox(430, y + 106, "INSURABLE", b.insurable),
    checkbox(560, y + 106, "NON-INSURABLE", !b.insurable),
    field(66, y + 168, 230, "CONTACT NUMBER", b.contactNumber),
    field(312, y + 168, 472, "REGISTERED ADDRESS", b.registeredAddress),
  );

  // III. BENEFICIARIES — always five ruled rows, filled from the top.
  y = 622;
  body.push(sectionBar(y, "SECTION III · DESIGNATED BENEFICIARIES OF THE TRANSFEREE"));
  const top = y + 24;
  const rowH = 28;
  body.push(rect(50, top, W - 100, rowH * 6));
  body.push(
    t(66, top + 18, "NO.", 9.5, { bold: true }),
    t(120, top + 18, "FULL NAME", 9.5, { bold: true }),
    t(560, top + 18, "RELATIONSHIP", 9.5, { bold: true }),
    line(108, top, 108, top + rowH * 6),
    line(548, top, 548, top + rowH * 6),
  );
  for (let n = 0; n < 5; n++) {
    const ry = top + rowH * (n + 1);
    body.push(line(50, ry, W - 50, ry, 0.6), t(78, ry + 19, String(n + 1), 10));
    const ben = b.beneficiaries[n];
    if (ben) {
      body.push(hw(120, ry + 20, ben.name, 13), hw(560, ry + 20, ben.relationship, 13));
    }
  }

  // Signatures
  const sy = 960;
  body.push(
    signature(120, sy - 14, data.seed),
    hw(110, sy - 2, `${a.firstName} ${a.lastName}`, 11),
    line(80, sy + 4, 360, sy + 4),
    t(220, sy + 20, "SIGNATURE OF TRANSFEROR OVER PRINTED NAME", 8.5, {
      anchor: "middle",
      fill: MUTED,
    }),
    signature(520, sy - 14, data.seed + 3),
    hw(510, sy - 2, `${b.firstName} ${b.lastName}`, 11),
    line(490, sy + 4, 770, sy + 4),
    t(630, sy + 20, "SIGNATURE OF TRANSFEREE OVER PRINTED NAME", 8.5, {
      anchor: "middle",
      fill: MUTED,
    }),
  );
  body.push(footer(1, 2, "TRANSFER OF LPA"));
  return svgPage(body.join(""));
}

/** Page 2: the undertaking, the reason, the requirements and office use. */
function transferFormPage2(data: TransferFormData): string {
  const body: string[] = [letterhead(data, "TRANSFER OF LIFE PLAN AGREEMENT (LPA)", "SPF-TR-01")];

  let y = 188;
  body.push(sectionBar(y, "SECTION IV · UNDERTAKING"));
  const p1 = paragraph(
    62,
    y + 46,
    "The TRANSFEREE accepts all the terms and conditions of the Life Plan Agreement as originally contracted, and binds himself or herself to pay all remaining installments as they fall due. All benefits accrued under the plan before this transfer remain with the plan and pass to the TRANSFEREE upon approval by the Company.",
  );
  const p2 = paragraph(
    62,
    p1.y + 8,
    "The TRANSFEROR certifies that the plan is free from any pending claim, loan, lien or prior assignment, and that the information given in Sections I to III is true and correct. Both parties understand that this transfer takes effect only upon written approval of the Head Office.",
  );
  body.push(p1.svg, p2.svg);

  y = p2.y + 22;
  body.push(sectionBar(y, "SECTION V · REASON FOR TRANSFER"));
  const reasonLines = wrap(data.reason, 78);
  for (let n = 0; n < 3; n++) {
    const ly = y + 56 + n * 30;
    body.push(line(62, ly, W - 62, ly, 0.6));
    if (reasonLines[n]) body.push(hw(70, ly - 6, reasonLines[n], 14));
  }

  y = y + 160;
  body.push(sectionBar(y, "SECTION VI · REQUIREMENTS SUBMITTED"));
  body.push(
    checkbox(66, y + 44, "Original Life Plan Agreement (LPA)", true),
    checkbox(66, y + 70, "Valid ID of Transferor with signature", true),
    checkbox(440, y + 44, "Valid ID of Transferee with signature", true),
    checkbox(440, y + 70, "Notarized Waiver of Rights", data.waiverFiled),
  );

  y = y + 110;
  body.push(sectionBar(y, "FOR OFFICE USE ONLY"));
  const boxW = (W - 100) / 4;
  const labels = ["RECEIVED BY", "DATE RECEIVED", "VERIFIED BY", "APPROVED BY"];
  labels.forEach((label, n) => {
    const x = 50 + n * boxW;
    body.push(rect(x, y + 24, boxW, 70), t(x + 10, y + 42, label, 8.5, { fill: MUTED }));
  });
  body.push(
    hw(60, y + 76, `${data.requestingBranch} BRANCH`, 12),
    hw(50 + boxW + 10, y + 76, handDate(data.signedDate), 12),
  );

  const sy = 1000;
  body.push(
    line(80, sy, 360, sy),
    t(220, sy + 16, "BRANCH MANAGER", 8.5, { anchor: "middle", fill: MUTED }),
    line(490, sy, 770, sy),
    t(630, sy + 16, "HEAD OFFICE APPROVER", 8.5, { anchor: "middle", fill: MUTED }),
  );
  body.push(footer(2, 2, "TRANSFER OF LPA"));
  return svgPage(body.join(""));
}

/** The transferor's waiver, one page. */
function waiverPage(data: TransferFormData): string {
  const a = data.transferor;
  const b = data.transferee;
  const transferor = `${a.firstName} ${a.middleName} ${a.lastName}`.toUpperCase();
  const transferee = `${b.firstName} ${b.middleName} ${b.lastName}`.toUpperCase();
  const body: string[] = [letterhead(data, "WAIVER OF RIGHTS OVER LIFE PLAN AGREEMENT", "SPF-WR-02")];

  let y = 214;
  for (const text of [
    `I, ${transferor}, of legal age, born on ${handDate(a.dateOfBirth)}, holder of Life Plan Agreement No. ${data.lpaNo} (${data.planType}) issued through the ${data.originatingBranch} branch, hereby waive, cede and relinquish all my rights, interests and benefits under the said agreement in favor of ${transferee}.`,
    `I understand that upon approval of this transfer, the transferee assumes all obligations under the agreement, including the payment of the remaining installments, and that I shall have no further claim to any benefit, return of premium or refund arising from it.`,
    `I execute this waiver freely and voluntarily, for the following reason: ${data.reason}`,
    `IN WITNESS WHEREOF, I have signed this waiver on ${handDate(data.signedDate)} at the ${data.requestingBranch} branch.`,
  ]) {
    const p = paragraph(62, y, text, 104, 12);
    body.push(p.svg);
    y = p.y + 16;
  }

  const sy = y + 70;
  body.push(
    signature(330, sy - 14, data.seed),
    hw(320, sy - 2, `${a.firstName} ${a.lastName}`, 11),
    line(285, sy + 4, 565, sy + 4),
    t(425, sy + 20, "SIGNATURE OF TRANSFEROR", 8.5, { anchor: "middle", fill: MUTED }),
    t(62, sy + 80, "SIGNED IN THE PRESENCE OF:", 10, { bold: true }),
    line(80, sy + 140, 360, sy + 140),
    t(220, sy + 156, "WITNESS", 8.5, { anchor: "middle", fill: MUTED }),
    line(490, sy + 140, 770, sy + 140),
    t(630, sy + 156, "WITNESS", 8.5, { anchor: "middle", fill: MUTED }),
  );
  body.push(footer(1, 1, "WAIVER OF RIGHTS"));
  return svgPage(body.join(""));
}

/** The Transfer of LPA form, page by page, as URLs an `<img>` can load. */
export function transferFormPageUrls(data: TransferFormData): string[] {
  return [transferFormPage1(data), transferFormPage2(data)].map(toUrl);
}

/** The Waiver of Rights, as a one-page list of URLs. */
export function waiverPageUrls(data: TransferFormData): string[] {
  return [toUrl(waiverPage(data))];
}
