// A stand-in scan of the paper Application for Reinstatement (the "RI form"),
// drawn as an SVG and filled in from the record it belongs to.
//
// DRAWN RATHER THAN A STOCK PHOTO so every request carries its OWN form — the
// name, LPA number, plan and dates on the page are the ones on the screen,
// which is what a processor checks the form against. The layout follows the
// printed form: plan data, the planholder's personal information in letter
// boxes, the health declaration, the authorization and the signatures. The
// entries are in a handwriting face and ink blue, on the form's yellow stock.
//
// It goes when there is a document service to read the real scans from.

export interface RiFormData {
  /** The form's pre-printed serial. */
  formNo: string;
  lpaNo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  planType: string;
  contractPrice: number;
  installment: number;
  /** ISO dates (yyyy-mm-dd). */
  dueDate: string;
  birthdate: string;
  signedDate: string;
  mode: string;
  insurable: boolean;
  branch: string;
  /** Varies the made-up personal details — address, beneficiaries, counselor. */
  seed: number;
}

const W = 850;
const H = 1160;

const PAPER = "#f6e27a";
const PRINT = "#1a1a1a";
const INK = "#1d3a8f";
const SERIAL = "#c62828";

const PRINT_FONT = "Arial, Helvetica, sans-serif";
const HAND_FONT =
  "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', 'Marker Felt', cursive";

// Made-up details for the parts of the form the record does not hold.
const STREETS = [
  "GRANT ST",
  "MABINI ST",
  "RIZAL AVE",
  "BONIFACIO ST",
  "LUNA ST",
  "DEL PILAR ST",
];
const BARANGAYS = [
  "SAN ROQUE",
  "POBLACION",
  "STA CRUZ",
  "SAN ISIDRO",
  "BAGUMBAYAN",
  "MALANDAY",
];
const CITIES: [string, string, string][] = [
  ["QUEZON CITY", "METRO MANILA", "1116"],
  ["CEBU CITY", "CEBU", "6000"],
  ["DAVAO CITY", "DAVAO DEL SUR", "8000"],
  ["ILOILO CITY", "ILOILO", "5000"],
  ["ZAMBOANGA", "ZAMBOANGA DS", "7000"],
  ["MAKATI CITY", "METRO MANILA", "1200"],
];
const EMPLOYERS = [
  "SUNRISE TRADING",
  "PACIFIC FOODS INC",
  "GOLDEN BUILDERS",
  "METRO LOGISTICS",
  "SELF EMPLOYED",
];
const BENEFICIARY_FIRST = ["MARIA", "JOSE", "ANA", "PEDRO", "LUZ", "CARLO"];
const RELATIONS = ["SPOUSE", "DAUGHTER", "SON", "MOTHER", "FATHER", "SISTER"];
const COUNSELORS = [
  "MARIBEL SANTOS",
  "ROLANDO CRUZ",
  "JENNILYN REYES",
  "ARNEL BAUTISTA",
  "CRISTINA LIM",
];
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

function pick<T>(list: T[], n: number): T {
  return list[Math.abs(n) % list.length];
}

/**
 * The made-up home address for record `seed` — shared with the ID card
 * (`id-card.ts`) so the two documents on one request agree.
 */
export function mockAddress(seed: number): {
  houseNo: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  zip: string;
} {
  const [city, province, zip] = pick(CITIES, seed);
  return {
    houseNo: String(10 + (seed % 90)),
    street: pick(STREETS, seed),
    barangay: pick(BARANGAYS, seed),
    city,
    province,
    zip,
  };
}

/** The made-up sex for record `seed`, shared with the ID card. */
export function mockIsFemale(seed: number): boolean {
  return seed % 2 === 0;
}

export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function money(value: number): string {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parts(iso: string): { y: string; m: string; d: string } {
  const [y, m, d] = iso.split("-");
  return { y, m, d };
}

function mdy(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${m}/${d}/${y}`;
}

function ordinal(n: number): string {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  const suffix = teen ? "th" : (["th", "st", "nd", "rd"][n % 10] ?? "th");
  return `${n}${suffix}`;
}

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
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
    extra?: string;
  } = {},
): string {
  return `<text x="${x}" y="${y}" font-family="${opts.font ?? PRINT_FONT}" font-size="${size}"${
    opts.bold ? ' font-weight="700"' : ""
  } text-anchor="${opts.anchor ?? "start"}" fill="${PRINT}"${
    opts.extra ? ` ${opts.extra}` : ""
  }>${esc(text)}</text>`;
}

/** Handwritten entry. */
function hw(
  x: number,
  y: number,
  text: string,
  size = 13,
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

/** A printed checkbox with its label, ticked in ink when `checked`. */
function checkbox(x: number, y: number, label: string, checked: boolean): string {
  const tick = checked
    ? `<path d="M${x + 2} ${y + 6} L${x + 5} ${y + 10} L${x + 12} ${y - 1}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`
    : "";
  return `${rect(x, y, 10, 10)}${tick}${t(x + 15, y + 9, label, 10)}`;
}

/** A run of letter boxes, one character in each, left to right. */
function boxes(
  x: number,
  y: number,
  count: number,
  value: string,
  size = 17,
): string {
  const chars = value.toUpperCase().slice(0, count).split("");
  let out = "";
  for (let n = 0; n < count; n++) {
    out += rect(x + n * size, y, size, size + 3, 0.8);
    const ch = chars[n];
    if (ch && ch !== " ") {
      out += hw(x + n * size + size / 2, y + size - 1, ch, 13, "middle");
    }
  }
  return out;
}

/** A signature — a loop of ink, varied by seed so no two look the same. */
function signature(x: number, y: number, seed: number): string {
  const a = 8 + (seed % 5) * 2;
  const b = 14 + (seed % 3) * 4;
  return `<path d="M${x} ${y} c ${a} -${b} ${a + 10} -${b} ${a + 6} 0 s -10 ${b - 4} 4 -2 c 8 -10 14 -${b} 20 -6 s 4 10 14 -4 c 6 -6 12 -2 22 -8" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`;
}

/** Wraps a paragraph to lines of at most `width` characters. */
function wrap(text: string, width: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
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

function age(birthIso: string, onIso: string): number {
  const b = parts(birthIso);
  const o = parts(onIso);
  let years = Number(o.y) - Number(b.y);
  if (o.m < b.m || (o.m === b.m && o.d < b.d)) years -= 1;
  return years;
}

export function buildRiFormSvg(data: RiFormData): string {
  const s = data.seed;
  const home = mockAddress(s);
  const { city, province, zip } = home;
  const female = mockIsFemale(s);
  const married = s % 3 !== 1;
  const birth = parts(data.birthdate);
  const signed = parts(data.signedDate);
  const place = titleCase(data.branch);
  const counselor = pick(COUNSELORS, s);
  const beneficiaries = [
    {
      name: `${pick(BENEFICIARY_FIRST, s)} ${data.middleName.charAt(0)}. ${data.lastName}`,
      age: 20 + (s % 25),
      relation: pick(RELATIONS, s),
    },
    {
      name: `${pick(BENEFICIARY_FIRST, s + 2)} ${data.lastName}`,
      age: 12 + (s % 9),
      relation: pick(RELATIONS, s + 1),
    },
  ];
  const contingent = {
    name: `${pick(BENEFICIARY_FIRST, s + 4)} ${pick(["CRUZ", "SANTOS", "REYES"], s)}`,
    age: 55 + (s % 20),
    relation: pick(RELATIONS, s + 3),
  };
  const address = `${home.houseNo} ${home.street} ${home.barangay} ${city}`;

  const body: string[] = [];

  // ── Letterhead ──
  body.push(
    `<path d="M300 40 L322 18 L344 40 L322 62 Z" fill="${PRINT}"/>`,
    `<path d="M312 40 L322 30 L332 40 L322 50 Z" fill="${PAPER}"/>`,
    t(356, 58, "ST. PETER", 40, {
      bold: true,
      font: "Georgia, 'Times New Roman', serif",
    }),
    t(360, 76, "LIFE PLAN", 11, { bold: true, extra: 'letter-spacing="7"' }),
    t(425, 94, "St. Peter Corporate Center", 10, { bold: true, anchor: "middle" }),
    t(425, 107, "999 EDSA, Quezon City 1105", 10, { anchor: "middle" }),
    t(425, 120, "Tel. No. 371-SPLP (371-7757) Fax: 372-3387", 10, {
      anchor: "middle",
    }),
  );

  // ── Title and serial ──
  body.push(
    t(400, 158, "APPLICATION FOR REINSTATEMENT", 21, {
      bold: true,
      anchor: "middle",
    }),
    `<text x="610" y="160" font-family="${PRINT_FONT}" font-size="24" fill="${SERIAL}">№ ${esc(
      data.formNo,
    )}</text>`,
    t(752, 160, "D", 16, { bold: true }),
    t(
      60,
      178,
      "The undersigned hereby applies for reinstatement of the lapsed Life Plan Contract No.",
      9.5,
    ),
    line(478, 180, 580, 180),
    hw(484, 177, data.lpaNo, 12),
    t(584, 178, "and further certifies that the data and", 9.5),
    t(
      40,
      190,
      "other information stated herein are written by him/her or under his/her direction.",
      9.5,
    ),
  );

  // ── Part I — plan data ──
  body.push(
    t(425, 208, "PART I - PLAN DATA", 12, {
      bold: true,
      anchor: "middle",
      extra: 'text-decoration="underline"',
    }),
    rect(40, 214, 770, 118, 1.4),
    line(470, 214, 470, 332),
  );
  const planRows: [string, string, boolean][] = [
    ["CONTRACT PRICE", money(data.contractPrice), true],
    ["PLAN TYPE", data.planType, false],
    ["INSTALLMENT PAYMENT", money(data.installment), true],
    ["DUE DATE", mdy(data.dueDate), false],
  ];
  planRows.forEach(([label, value, peso], n) => {
    const y = 232 + n * 18;
    body.push(t(55, y, label, 10));
    if (peso) body.push(t(200, y, "P", 10, { bold: true }));
    body.push(line(212, y + 2, 390, y + 2), hw(222, y - 1, value, 12));
  });
  const mode = data.mode.toUpperCase();
  body.push(
    t(55, 304, "MODE OF PAYMENTS", 10),
    checkbox(200, 295, "Monthly", mode === "MONTHLY"),
    checkbox(300, 295, "Quarterly", mode === "QUARTERLY"),
    checkbox(200, 313, "Semi-Annual", mode === "SEMI-ANNUAL"),
    checkbox(300, 313, "Annual", mode === "ANNUAL"),
    checkbox(485, 225, "UPDATING", true),
    t(500, 247, "AMOUNT PAID", 10),
    checkbox(650, 225, "REDATING", false),
    t(650, 250, "P", 10, { bold: true }),
    line(662, 252, 795, 252),
    line(572, 249, 640, 249),
    hw(574, 246, money(data.installment), 10),
    t(500, 272, "OFFICIAL RECEIPT NO.:", 10),
    line(640, 274, 795, 274),
    hw(650, 271, `OR-${String(700000 + s * 37)}`, 12),
    t(612, 292, "DATE:", 10),
    line(648, 294, 795, 294),
    hw(658, 291, mdy(data.signedDate), 12),
    checkbox(485, 312, "INSURABLE", data.insurable),
    checkbox(650, 312, "NON-INSURABLE", !data.insurable),
  );

  // ── Part II — personal information ──
  body.push(
    t(425, 352, "PART II - PLANHOLDER'S PERSONAL INFORMATION", 12, {
      bold: true,
      anchor: "middle",
      extra: 'text-decoration="underline"',
    }),
    rect(40, 358, 770, 334, 1.4),
    t(50, 380, "NAME:", 10),
    boxes(88, 366, 14, data.firstName),
    boxes(340, 366, 1, data.middleName.charAt(0)),
    boxes(368, 366, 16, data.lastName),
    t(200, 399, "First Name", 8.5, { anchor: "middle" }),
    t(348, 399, "M.I.", 8.5, { anchor: "middle" }),
    t(500, 399, "Last Name", 8.5, { anchor: "middle" }),
    t(50, 416, "PREFERRED MAILING ADDRESS:", 10),
    checkbox(225, 407, "Home", true),
    checkbox(290, 407, "Office", false),
    t(50, 440, "HOME ADDRESS", 10),
    boxes(138, 426, 3, home.houseNo),
    boxes(200, 426, 14, home.street),
    t(160, 457, "Lot No./ Blk. No.", 8.5, { anchor: "middle" }),
    t(320, 457, "Street", 8.5, { anchor: "middle" }),
    boxes(50, 464, 14, home.barangay),
    boxes(300, 464, 12, ""),
    t(170, 495, "Barangay / Subdivision", 8.5, { anchor: "middle" }),
    t(400, 495, "District / Division", 8.5, { anchor: "middle" }),
    boxes(50, 502, 12, city),
    boxes(270, 502, 12, province),
    boxes(500, 502, 4, zip),
    t(150, 533, "City / Municipality", 8.5, { anchor: "middle" }),
    t(370, 533, "Province", 8.5, { anchor: "middle" }),
    t(534, 533, "Zip Code", 8.5, { anchor: "middle" }),
    t(50, 556, "OFFICE:", 10),
    boxes(98, 542, 18, pick(EMPLOYERS, s)),
    t(250, 573, "Office Name", 8.5, { anchor: "middle" }),
    boxes(50, 580, 12, city),
    t(150, 611, "Office Address", 8.5, { anchor: "middle" }),
    t(360, 596, "Telephone Nos.", 9),
    boxes(440, 582, 7, String(8000000 + s * 1337).slice(0, 7), 15),
    boxes(560, 582, 7, "", 15),
    t(490, 611, "Home", 8.5, { anchor: "middle" }),
    t(612, 611, "Office", 8.5, { anchor: "middle" }),
  );

  // Right-hand panel: sex, birthdate, age, civil status.
  body.push(
    rect(640, 404, 160, 170, 0.8),
    checkbox(650, 411, "Male", !female),
    checkbox(720, 411, "Female", female),
    t(650, 440, "DATE OF BIRTH:", 9),
    boxes(650, 446, 2, birth.m, 16),
    boxes(686, 446, 2, birth.d, 16),
    boxes(722, 446, 4, birth.y, 16),
    t(666, 477, "MM", 8, { anchor: "middle" }),
    t(702, 477, "DD", 8, { anchor: "middle" }),
    t(754, 477, "Year", 8, { anchor: "middle" }),
    t(650, 496, "Age:", 9),
    line(675, 498, 720, 498),
    hw(680, 495, String(age(data.birthdate, data.signedDate)), 13),
    t(650, 520, "Civil Status", 9),
    checkbox(718, 511, "Single", !married),
    checkbox(718, 529, "Married", married),
    checkbox(718, 547, "Widow/er", false),
  );

  // Beneficiaries.
  body.push(
    t(50, 630, "BENEFICIARY/IES:", 9.5),
    t(60, 643, "Principal:", 9),
    t(160, 643, "NAME", 9),
    t(340, 643, "AGE", 9),
    t(460, 643, "ADDRESS", 9),
    t(720, 643, "RELATIONSHIP", 9),
  );
  beneficiaries.forEach((b, n) => {
    const y = 656 + n * 12;
    body.push(
      t(60, y, `${n + 1}.`, 9),
      hw(75, y, b.name, 11),
      hw(345, y, String(b.age), 11),
      hw(380, y, address, 10),
      hw(730, y, b.relation, 10),
    );
  });
  body.push(
    t(60, 684, "Contingent:", 9),
    t(120, 684, "1.", 9),
    hw(135, 684, contingent.name, 11),
    hw(345, 684, String(contingent.age), 11),
    hw(380, 684, `${pick(BARANGAYS, s + 1)} ${city}`, 10),
    hw(730, 684, contingent.relation, 10),
  );

  // ── Part III — health declaration ──
  body.push(
    t(425, 714, "PART III - HEALTH DECLARATION", 12, {
      bold: true,
      anchor: "middle",
    }),
    t(425, 727, "(for insurable person only)", 9, { anchor: "middle" }),
    t(
      70,
      744,
      "The applicant hereby represents and declares to the best of his/her knowledge that he/she:",
      10,
    ),
  );
  const health = [
    "(a) has not yet attained the age of sixty (60) years and six (6) months upon the signing of this instrument;",
    "(b) possesses sound health and is able to perform the normal activities in the pursuit of his/her livelihood; and",
    "(c) has not consulted any physician for heart condition, high blood pressure, cancer, diabetes, lungs, kidneys or intestinal disorder, tuberculosis or any other physical impairment nor has been confined in a hospital/clinic and received any medical or surgical attention. If so, please submit/attach copy of the result/s.",
  ];
  let hy = 758;
  health.forEach((item) => {
    wrap(item, 125).forEach((text, n) => {
      body.push(t(n === 0 ? 90 : 108, hy, text, 9.5));
      hy += 12;
    });
  });
  wrap(
    "It is understood that the approval of reinstatement of this plan is based on the truth of the foregoing representations and the CONTESTABILITY PERIOD shall commence anew on the date of approval of this application for reinstatement.",
    140,
  ).forEach((text) => {
    body.push(t(60, hy + 2, text, 9.5));
    hy += 12;
  });

  // ── Authorization ──
  const authTop = hy + 8;
  body.push(
    rect(40, authTop, 770, 78, 1),
    t(
      425,
      authTop + 13,
      "AUTHORIZATION - TO PHYSICIANS, CLINICS, HOSPITALS, LIFE PLAN, INSURANCE COMPANIES, ETC.",
      9.5,
      { bold: true, anchor: "middle" },
    ),
  );
  wrap(
    "The St. Peter Life Plan, Inc. is considering my application for coverage on my life and I hereby authorize and request a physician surgeon and/or other person in your employ or connected/associated with your company in any way, to give SPLPI's authorized representative, any information which he/she may desire and which have been acquired in attending to me in a professional capacity. A photocopy or similar copy of this authorization shall be valid as the original.",
    150,
  ).forEach((text, n) => {
    body.push(t(50, authTop + 27 + n * 11, text, 8.8));
  });

  // ── Signatures ──
  const sigTop = authTop + 104;
  body.push(
    t(80, sigTop, "Signed this", 10),
    line(140, sigTop + 2, 200, sigTop + 2),
    hw(152, sigTop - 2, ordinal(Number(signed.d)), 13),
    t(205, sigTop, "day of", 10),
    line(240, sigTop + 2, 360, sigTop + 2),
    hw(250, sigTop - 2, MONTHS[Number(signed.m) - 1], 13),
    t(365, sigTop, "20", 10),
    line(378, sigTop + 2, 400, sigTop + 2),
    hw(380, sigTop - 2, signed.y.slice(2), 13),
    t(405, sigTop, "at", 10),
    line(420, sigTop + 2, 580, sigTop + 2),
    hw(435, sigTop - 2, place, 13),
    t(585, sigTop, ", Philippines.", 10),
    t(50, sigTop + 16, "Witnessed by:", 10),
    boxes(50, sigTop + 22, 18, counselor, 15),
    t(190, sigTop + 54, "Family Counselor", 8.5, { anchor: "middle" }),
    signature(110, sigTop + 80, s),
    line(50, sigTop + 86, 250, sigTop + 86),
    t(150, sigTop + 98, "Signature of Family Counselor", 8.5, { anchor: "middle" }),
    hw(370, sigTop + 82, place, 14, "middle"),
    line(300, sigTop + 86, 440, sigTop + 86),
    t(370, sigTop + 98, "Branch", 8.5, { anchor: "middle" }),
    signature(630, sigTop + 60, s + 3),
    line(580, sigTop + 66, 790, sigTop + 66),
    t(685, sigTop + 78, "Signature of Applicant", 8.5, { anchor: "middle" }),
  );

  // ── Footer ──
  body.push(
    `<line x1="40" y1="${H - 50}" x2="${W - 40}" y2="${H - 50}" stroke="${PRINT}" stroke-width="1.2" stroke-dasharray="2 5"/>`,
    rect(60, H - 38, W - 120, 22, 1.2),
    t(W / 2, H - 22, "PLEASE PAY YOUR SUCCEEDING PAYMENTS DIRECT TO OUR CASHIER OR AUTHORIZED COLLECTOR", 10, {
      bold: true,
      anchor: "middle",
    }),
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${PAPER}"/>${body.join(
    "",
  )}</svg>`;
}

/** The form as a URL an `<img>` can load. */
export function riFormImageUrl(data: RiFormData): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    buildRiFormSvg(data),
  )}`;
}
