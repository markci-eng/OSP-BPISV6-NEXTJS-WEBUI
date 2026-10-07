// A stand-in scan of a valid ID — a Philippine National ID (PhilSys), an LTO
// Driver's License, a DFA Passport, a UMID or a Postal ID — drawn as an SVG and
// filled in from the record it belongs to. Reinstatement files one; Return of
// Premium files several.
//
// Drawn for the same reason as the RI form (`ri-form.ts`): the name, birthdate
// and address on the card are this planholder's, and the address is the one
// written on their RI form, so a processor checking one against the other
// finds them agreeing.
//
// A LOOK-ALIKE, NOT A REPLICA. The layout follows the real cards, but the
// seal is a generic emblem, there are no security patterns, and the card is
// stamped SAMPLE, so the picture cannot pass for a real ID outside this
// screen.
//
// It goes when there is a document service to read the real scans from.

import { esc, mockAddress, mockIsFemale } from "./ri-form";

export type IdCardKind =
  | "national-id"
  | "drivers-license"
  | "passport"
  | "umid"
  | "postal-id";

export interface IdCardData {
  kind: IdCardKind;
  firstName: string;
  middleName: string;
  lastName: string;
  /** ISO dates (yyyy-mm-dd). */
  birthdate: string;
  /** When the card was presented — the license's expiry is counted from it. */
  issuedDate: string;
  /** The same seed as the record's RI form, so the address matches. */
  seed: number;
}

const W = 960;
const H = 600;
const CARD = { x: 52, y: 30, w: 856, h: 540 };

const FONT = "Arial, Helvetica, sans-serif";
const INK = "#16213e";
const MUTED = "#4a5568";

const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

function t(
  x: number,
  y: number,
  text: string,
  size: number,
  opts: {
    bold?: boolean;
    italic?: boolean;
    fill?: string;
    anchor?: "start" | "middle" | "end";
  } = {},
): string {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}"${
    opts.bold ? ' font-weight="700"' : ""
  }${opts.italic ? ' font-style="italic"' : ""} fill="${
    opts.fill ?? INK
  }" text-anchor="${opts.anchor ?? "start"}">${esc(text)}</text>`;
}

/** A label over its value — the way both cards print every field. */
function field(
  x: number,
  y: number,
  label: string,
  value: string,
  valueSize = 19,
): string {
  return `${t(x, y, label, 11, { fill: MUTED })}${t(x, y + valueSize + 3, value, valueSize, {
    bold: true,
  })}`;
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

/** Deterministic digits for record `seed`, so one record has one number. */
function digits(seed: number, salt: number, width: number): string {
  const mod = 10 ** width;
  return pad(((seed + 1) * 7919 * salt + salt * 104729) % mod, width);
}

/** A generic round emblem — deliberately not any agency's seal. */
function emblem(cx: number, cy: number, r: number, color: string): string {
  let rays = "";
  for (let n = 0; n < 8; n++) {
    const a = (Math.PI / 4) * n;
    const x1 = cx + Math.cos(a) * r * 0.42;
    const y1 = cy + Math.sin(a) * r * 0.42;
    const x2 = cx + Math.cos(a) * r * 0.72;
    const y2 = cy + Math.sin(a) * r * 0.72;
    rays += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(
      1,
    )}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;
  }
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="${
    r * 0.84
  }" fill="none" stroke="${color}" stroke-width="1"/><circle cx="${cx}" cy="${cy}" r="${
    r * 0.3
  }" fill="${color}"/>${rays}`;
}

/** The ID photo: a plain silhouette, with longer hair for a woman. */
function photo(x: number, y: number, w: number, h: number, female: boolean): string {
  const cx = x + w / 2;
  const headY = y + h * 0.4;
  const hair = female
    ? `<path d="M${cx - w * 0.26} ${headY + h * 0.2} Q${cx - w * 0.3} ${headY - h * 0.24} ${cx} ${
        headY - h * 0.22
      } Q${cx + w * 0.3} ${headY - h * 0.24} ${cx + w * 0.26} ${headY + h * 0.2} Z" fill="#5b6475"/>`
    : `<ellipse cx="${cx}" cy="${headY - h * 0.035}" rx="${w * 0.19}" ry="${
        h * 0.14
      }" fill="#5b6475"/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#dfe6ee" stroke="#9aa6b5" stroke-width="1"/>${hair}<ellipse cx="${cx}" cy="${headY}" rx="${
    w * 0.18
  }" ry="${h * 0.15}" fill="#8b95a5"/><path d="M${x + w * 0.1} ${y + h} Q${x + w * 0.12} ${
    headY + h * 0.2
  } ${cx} ${headY + h * 0.2} Q${x + w * 0.88} ${headY + h * 0.2} ${x + w * 0.9} ${
    y + h
  } Z" fill="#8b95a5"/>`;
}

function signature(x: number, y: number, seed: number): string {
  const a = 10 + (seed % 5) * 3;
  return `<path d="M${x} ${y} c ${a} -22 ${a + 12} -22 ${a + 8} 0 s -12 16 6 -4 c 10 -12 18 -20 26 -6 s 6 12 18 -6 c 8 -8 16 -2 30 -10" fill="none" stroke="#1d3a8f" stroke-width="2" stroke-linecap="round"/>`;
}

function watermark(): string {
  return `<text x="${W / 2}" y="${H / 2 + 40}" font-family="${FONT}" font-size="130" font-weight="700" fill="#c62828" fill-opacity="0.16" text-anchor="middle" transform="rotate(-18 ${
    W / 2
  } ${H / 2})" letter-spacing="12">SAMPLE</text>`;
}

/** Splits an address over two lines at a word near the middle. */
function twoLines(text: string, max: number): [string, string] {
  if (text.length <= max) return [text, ""];
  const cut = text.lastIndexOf(" ", max);
  const at = cut > 0 ? cut : max;
  return [text.slice(0, at), text.slice(at).trim()];
}

function nationalId(data: IdCardData): string {
  const [y, m, d] = data.birthdate.split("-");
  const home = mockAddress(data.seed);
  const address = `${home.houseNo} ${home.street}, BRGY. ${home.barangay}, ${home.city}, ${home.province} ${home.zip}`;
  const [line1, line2] = twoLines(address, 44);
  const pcn = [1, 2, 3, 4].map((salt) => digits(data.seed, salt, 4)).join("-");
  const { x, y: top, w, h } = CARD;

  // Faint guilloche-like waves: texture only, not a security pattern.
  let waves = "";
  for (let n = 0; n < 9; n++) {
    const wy = top + 60 + n * 55;
    waves += `<path d="M${x} ${wy} q 107 -26 214 0 t 214 0 t 214 0 t 214 0" fill="none" stroke="#9cc3e4" stroke-width="1" stroke-opacity="0.45"/>`;
  }

  return [
    `<defs><linearGradient id="nid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f9fd"/><stop offset="1" stop-color="#d6e6f4"/></linearGradient></defs>`,
    `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="26" fill="url(#nid)" stroke="#aac3d9" stroke-width="1.5"/>`,
    waves,
    emblem(x + 70, top + 68, 40, "#1f4e8c"),
    t(x + 128, top + 52, "REPUBLIKA NG PILIPINAS", 24, { bold: true }),
    t(x + 128, top + 72, "Republic of the Philippines", 14, { italic: true, fill: MUTED }),
    t(x + 128, top + 100, "PAMBANSANG PAGKAKAKILANLAN", 21, { bold: true, fill: "#1f4e8c" }),
    t(x + 128, top + 119, "Philippine Identification Card", 14, { italic: true, fill: MUTED }),
    t(x + 40, top + 172, pcn, 30, { bold: true }),
    photo(x + 40, top + 190, 200, 250, mockIsFemale(data.seed)),
    signature(x + 70, top + 490, data.seed),
    field(x + 270, top + 196, "Apelyido / Last Name", data.lastName.toUpperCase()),
    field(x + 270, top + 256, "Mga Pangalan / Given Names", data.firstName.toUpperCase()),
    field(x + 270, top + 316, "Gitnang Apelyido / Middle Name", data.middleName.toUpperCase()),
    field(
      x + 270,
      top + 376,
      "Petsa ng Kapanganakan / Date of Birth",
      `${MONTHS[Number(m) - 1]} ${d}, ${y}`,
    ),
    t(x + 270, top + 436, "Tirahan / Address", 11, { fill: MUTED }),
    t(x + 270, top + 456, line1, 15, { bold: true }),
    line2 ? t(x + 270, top + 476, line2, 15, { bold: true }) : "",
  ].join("");
}

function driversLicense(data: IdCardData): string {
  const [y, m, d] = data.birthdate.split("-");
  const issuedYear = Number(data.issuedDate.slice(0, 4));
  const home = mockAddress(data.seed);
  const address = `${home.houseNo} ${home.street}, ${home.barangay}, ${home.city}, ${home.province}`;
  const [line1, line2] = twoLines(address, 48);
  const female = mockIsFemale(data.seed);
  const licenseNo = `N${pad((data.seed % 20) + 1, 2)}-${String(issuedYear).slice(
    2,
  )}-${digits(data.seed, 5, 6)}`;
  const { x, y: top, w, h } = CARD;

  return [
    `<defs><linearGradient id="dl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf8ec"/><stop offset="1" stop-color="#dcebd6"/></linearGradient></defs>`,
    `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="26" fill="url(#dl)" stroke="#b9c9a8" stroke-width="1.5"/>`,
    emblem(x + 70, top + 62, 38, "#2f5d2a"),
    t(x + w / 2 + 30, top + 38, "REPUBLIC OF THE PHILIPPINES", 15, { anchor: "middle" }),
    t(x + w / 2 + 30, top + 58, "DEPARTMENT OF TRANSPORTATION", 15, {
      bold: true,
      anchor: "middle",
    }),
    t(x + w / 2 + 30, top + 82, "LAND TRANSPORTATION OFFICE", 20, {
      bold: true,
      anchor: "middle",
    }),
    t(x + w / 2 + 30, top + 118, "DRIVER'S LICENSE", 28, {
      bold: true,
      fill: "#1f4e8c",
      anchor: "middle",
    }),
    photo(x + 40, top + 145, 180, 225, female),
    signature(x + 60, top + 420, data.seed),
    `<line x1="${x + 40}" y1="${top + 432}" x2="${x + 220}" y2="${top + 432}" stroke="${MUTED}" stroke-width="1"/>`,
    t(x + 130, top + 448, "Signature of Licensee", 11, { fill: MUTED, anchor: "middle" }),
    field(
      x + 250,
      top + 152,
      "Last Name, First Name, Middle Name",
      `${data.lastName}, ${data.firstName} ${data.middleName}`.toUpperCase(),
      20,
    ),
    field(x + 250, top + 208, "Nationality", "PHL", 17),
    field(x + 360, top + 208, "Sex", female ? "F" : "M", 17),
    field(x + 420, top + 208, "Date of Birth", `${y}/${m}/${d}`, 17),
    field(x + 560, top + 208, "Weight (kg)", String(52 + (data.seed % 30)), 17),
    field(x + 670, top + 208, "Height (m)", (1.52 + (data.seed % 25) / 100).toFixed(2), 17),
    t(x + 250, top + 264, "Address", 11, { fill: MUTED }),
    t(x + 250, top + 284, line1, 16, { bold: true }),
    line2 ? t(x + 250, top + 304, line2, 16, { bold: true }) : "",
    field(x + 250, top + 324, "License No.", licenseNo, 19),
    // Expires on the holder's birthday, five years on.
    field(x + 470, top + 324, "Expiration Date", `${issuedYear + 5}/${m}/${d}`, 19),
    field(x + 670, top + 324, "Agency Code", `N${pad((data.seed % 40) + 10, 2)}`, 19),
    field(x + 250, top + 380, "Blood Type", ["O+", "A+", "B+", "AB+"][data.seed % 4], 17),
    field(x + 360, top + 380, "Eyes Color", "BLACK", 17),
    field(x + 470, top + 380, "Restrictions", ["1,2", "2", "1", "2,3"][data.seed % 4], 17),
    field(x + 670, top + 380, "Conditions", "NONE", 17),
  ].join("");
}

/** "12 JAN 1970" — the way the passport prints its dates. */
function dmy(year: number, month: number, day: number): string {
  return `${pad(day, 2)} ${MONTHS[month - 1].slice(0, 3)} ${year}`;
}

/** The ICAO 7-3-1 check digit, so the MRZ lines are at least well formed. */
function mrzCheck(value: string): string {
  const weights = [7, 3, 1];
  let sum = 0;
  for (let n = 0; n < value.length; n++) {
    const c = value[n];
    const v = c === "<" ? 0 : /\d/.test(c) ? Number(c) : c.charCodeAt(0) - 55;
    sum += v * weights[n % 3];
  }
  return String(sum % 10);
}

function mrzName(value: string): string {
  return value.toUpperCase().replace(/[^A-Z]+/g, "<");
}

function mrzLine(x: number, y: number, text: string, width: number): string {
  return `<text x="${x}" y="${y}" font-family="'Courier New', Courier, monospace" font-size="27" font-weight="700" fill="${INK}" textLength="${width}" lengthAdjust="spacing">${esc(
    text,
  )}</text>`;
}

/** The DFA passport's data page — the one page of a passport that gets copied. */
function passport(data: IdCardData): string {
  const [by, bm, bd] = data.birthdate.split("-").map(Number);
  const presented = Number(data.issuedDate.slice(0, 4));
  // Issued one to four years before it was presented, valid for ten.
  const issuedYear = presented - 1 - (data.seed % 4);
  const issuedMonth = (data.seed % 12) + 1;
  const issuedDay = (data.seed % 27) + 1;
  const female = mockIsFemale(data.seed);
  const home = mockAddress(data.seed);
  const passportNo = `P${digits(data.seed, 3, 7)}${"ABCDEFGH"[data.seed % 8]}`;
  const { x, y: top, w, h } = CARD;
  const maroon = "#7a1f2b";

  const yymmdd = (year: number, month: number, day: number) =>
    `${String(year).slice(2)}${pad(month, 2)}${pad(day, 2)}`;
  const birth = yymmdd(by, bm, bd);
  const expiry = yymmdd(issuedYear + 10, issuedMonth, issuedDay);
  const mrz1 = `P<PHL${mrzName(data.lastName)}<<${mrzName(
    `${data.firstName} ${data.middleName}`,
  )}`
    .padEnd(44, "<")
    .slice(0, 44);
  const mrz2 = `${passportNo}${mrzCheck(passportNo)}PHL${birth}${mrzCheck(
    birth,
  )}${female ? "F" : "M"}${expiry}${mrzCheck(expiry)}`.padEnd(44, "<");

  let waves = "";
  for (let n = 0; n < 7; n++) {
    const wy = top + 130 + n * 48;
    waves += `<path d="M${x} ${wy} q 107 -20 214 0 t 214 0 t 214 0 t 214 0" fill="none" stroke="#d9a7ae" stroke-width="1" stroke-opacity="0.45"/>`;
  }

  return [
    `<defs><linearGradient id="pp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fcf5f3"/><stop offset="1" stop-color="#f0dcdc"/></linearGradient></defs>`,
    `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="12" fill="url(#pp)" stroke="#d2b3b3" stroke-width="1.5"/>`,
    waves,
    emblem(x + 62, top + 56, 34, maroon),
    t(x + 112, top + 50, "REPUBLIKA NG PILIPINAS", 21, { bold: true }),
    t(x + 112, top + 70, "Republic of the Philippines", 13, { italic: true, fill: MUTED }),
    t(x + w - 36, top + 50, "PASAPORTE", 24, { bold: true, fill: maroon, anchor: "end" }),
    t(x + w - 36, top + 70, "Passport", 13, { italic: true, fill: MUTED, anchor: "end" }),
    photo(x + 36, top + 104, 190, 240, female),
    signature(x + 62, top + 392, data.seed),
    `<line x1="${x + 36}" y1="${top + 402}" x2="${x + 226}" y2="${top + 402}" stroke="${MUTED}" stroke-width="1"/>`,
    t(x + 131, top + 418, "Lagda / Signature", 11, { fill: MUTED, anchor: "middle" }),
    field(x + 250, top + 104, "Uri / Type", "P", 17),
    field(x + 360, top + 104, "Kodigo / Code", "PHL", 17),
    field(x + 500, top + 104, "Pasaporte Blg. / Passport No.", passportNo, 19),
    field(x + 250, top + 158, "Apelyido / Surname", data.lastName.toUpperCase()),
    field(x + 250, top + 212, "Mga Pangalan / Given Names", data.firstName.toUpperCase()),
    field(
      x + 250,
      top + 266,
      "Panggitnang Apelyido / Middle Name",
      data.middleName.toUpperCase(),
    ),
    field(x + 250, top + 320, "Petsa ng Kapanganakan / Date of Birth", dmy(by, bm, bd), 17),
    field(x + 520, top + 320, "Kasarian / Sex", female ? "F" : "M", 17),
    field(x + 640, top + 320, "Nasyonalidad / Nationality", "FILIPINO", 17),
    field(x + 250, top + 374, "Lugar ng Kapanganakan / Place of Birth", home.city, 17),
    field(
      x + 520,
      top + 374,
      "Petsa ng Pagkakaloob / Date of Issue",
      dmy(issuedYear, issuedMonth, issuedDay),
      17,
    ),
    field(
      x + 250,
      top + 418,
      "Awtoridad / Authority",
      "DFA MANILA",
      15,
    ),
    field(
      x + 520,
      top + 418,
      "Valid Until / Petsa ng Pagkawalang-bisa",
      dmy(issuedYear + 10, issuedMonth, issuedDay),
      15,
    ),
    // The machine-readable zone.
    `<rect x="${x}" y="${top + 456}" width="${w}" height="${h - 456}" fill="#fbf8f6" fill-opacity="0.85"/>`,
    mrzLine(x + 36, top + 492, mrz1, w - 72),
    mrzLine(x + 36, top + 526, mrz2, w - 72),
  ].join("");
}

/** The address as two lines broken at the city, so the ZIP is never orphaned. */
function streetAndCity(seed: number): [string, string] {
  const home = mockAddress(seed);
  return [
    `${home.houseNo} ${home.street}, BRGY. ${home.barangay}`,
    `${home.city}, ${home.province} ${home.zip}`,
  ];
}

/** The SSS / GSIS Unified Multi-Purpose ID. */
function umid(data: IdCardData): string {
  const [y, m, d] = data.birthdate.split("-");
  const [line1, line2] = streetAndCity(data.seed);
  const female = mockIsFemale(data.seed);
  const crn = `CRN-0111-${digits(data.seed, 6, 7)}-${data.seed % 10}`;
  const { x, y: top, w, h } = CARD;
  const navy = "#123f7a";

  return [
    `<defs><linearGradient id="umid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7f9fc"/><stop offset="1" stop-color="#d9e5f2"/></linearGradient></defs>`,
    `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="26" fill="url(#umid)" stroke="#a9bdd3" stroke-width="1.5"/>`,
    emblem(x + 66, top + 62, 38, navy),
    t(x + 122, top + 48, "REPUBLIC OF THE PHILIPPINES", 15, { fill: MUTED }),
    t(x + 122, top + 82, "UNIFIED MULTI-PURPOSE ID", 28, { bold: true, fill: navy }),
    `<rect x="${x}" y="${top + 110}" width="${w}" height="6" fill="#c62828"/>`,
    `<rect x="${x}" y="${top + 116}" width="${w}" height="4" fill="#f2c230"/>`,
    t(x + 40, top + 162, crn, 26, { bold: true }),
    photo(x + 40, top + 180, 190, 240, female),
    signature(x + 66, top + 478, data.seed),
    `<line x1="${x + 40}" y1="${top + 488}" x2="${x + 230}" y2="${top + 488}" stroke="${MUTED}" stroke-width="1"/>`,
    t(x + 135, top + 504, "Signature", 11, { fill: MUTED, anchor: "middle" }),
    field(x + 260, top + 186, "SURNAME", data.lastName.toUpperCase()),
    field(x + 260, top + 244, "GIVEN NAME", data.firstName.toUpperCase()),
    field(x + 260, top + 302, "MIDDLE NAME", data.middleName.toUpperCase()),
    field(x + 260, top + 360, "SEX", female ? "F" : "M", 17),
    field(x + 360, top + 360, "DATE OF BIRTH", `${y}/${m}/${d}`, 17),
    t(x + 260, top + 418, "ADDRESS", 11, { fill: MUTED }),
    t(x + 260, top + 438, line1, 15, { bold: true }),
    line2 ? t(x + 260, top + 458, line2, 15, { bold: true }) : "",
  ].join("");
}

/** The PHLPost Postal Identity Card. */
function postalId(data: IdCardData): string {
  const [y, m, d] = data.birthdate.split("-").map(Number);
  const presented = Number(data.issuedDate.slice(0, 4));
  const issuedYear = presented - (data.seed % 2);
  const home = mockAddress(data.seed);
  const [line1, line2] = streetAndCity(data.seed);
  const female = mockIsFemale(data.seed);
  const prn = `100${digits(data.seed, 7, 9)}`;
  const { x, y: top, w, h } = CARD;
  const blue = "#0d3b8c";

  return [
    `<defs><linearGradient id="postal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fdfbef"/><stop offset="1" stop-color="#dfeaf8"/></linearGradient></defs>`,
    `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="26" fill="url(#postal)" stroke="#b3c2d8" stroke-width="1.5"/>`,
    emblem(x + 66, top + 62, 38, blue),
    t(x + 122, top + 44, "REPUBLIC OF THE PHILIPPINES", 14, { fill: MUTED }),
    t(x + 122, top + 72, "PHILIPPINE POSTAL CORPORATION", 22, { bold: true, fill: blue }),
    t(x + 122, top + 104, "POSTAL IDENTITY CARD", 26, { bold: true, fill: "#b23a2b" }),
    `<rect x="${x}" y="${top + 120}" width="${w}" height="8" fill="#f2c230"/>`,
    photo(x + 40, top + 150, 180, 225, female),
    signature(x + 60, top + 440, data.seed),
    `<line x1="${x + 40}" y1="${top + 450}" x2="${x + 220}" y2="${top + 450}" stroke="${MUTED}" stroke-width="1"/>`,
    t(x + 130, top + 466, "Signature of Holder", 11, { fill: MUTED, anchor: "middle" }),
    field(
      x + 250,
      top + 156,
      "Name",
      `${data.firstName} ${data.middleName} ${data.lastName}`.toUpperCase(),
    ),
    t(x + 250, top + 212, "Address", 11, { fill: MUTED }),
    t(x + 250, top + 232, line1, 15, { bold: true }),
    line2 ? t(x + 250, top + 252, line2, 15, { bold: true }) : "",
    field(x + 250, top + 286, "Date of Birth", dmy(y, m, d), 17),
    field(x + 450, top + 286, "Nationality", "FILIPINO", 17),
    field(x + 610, top + 286, "Sex", female ? "F" : "M", 17),
    field(x + 250, top + 342, "PRN", prn, 19),
    field(x + 500, top + 342, "Valid Until", dmy(issuedYear + 3, m, d), 19),
    field(x + 250, top + 398, "Issuing Post Office", `${home.city} P.O.`, 17),
  ].join("");
}

const CARDS: Record<IdCardKind, (data: IdCardData) => string> = {
  "national-id": nationalId,
  "drivers-license": driversLicense,
  passport,
  umid,
  "postal-id": postalId,
};

export function buildIdCardSvg(data: IdCardData): string {
  const card = CARDS[data.kind](data);
  // A grey scanner bed around the card, the way a photocopy comes back.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#e7e7e3"/>${card}${watermark()}</svg>`;
}

/** The card as a URL an `<img>` can load. */
export function idCardImageUrl(data: IdCardData): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    buildIdCardSvg(data),
  )}`;
}
