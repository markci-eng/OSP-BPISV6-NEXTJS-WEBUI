// A stand-in proof of payout account, drawn as an SVG and filled in from the
// payout it belongs to: a verified-account screenshot for an e-wallet, a bank
// statement for a bank.
//
// Drawn for the same reason as the Reinstatement scans (`id-card.ts`): the
// Proof of Payout card sits beside the Payout Details rows so a processor can
// check the name and number on the proof against them, and a random photo
// gives them nothing to check. Here the two agree.
//
// A LOOK-ALIKE, NOT A REPLICA. The layouts follow the real screens, but the
// marks are generic, there are no logos, and every proof is stamped SAMPLE, so
// the picture cannot pass for a real account outside this screen.
//
// It goes when there is a document service to read the real proofs from.

import { esc, mockAddress } from "../../reinstatement/data/ri-form";

export interface PayoutProofData {
  channel: string;
  accountNo: string;
  accountName: string;
  /** Deterministic per payout, so one submission always draws one proof. */
  seed: number;
}

const FONT = "Arial, Helvetica, sans-serif";
const INK = "#16213e";
const MUTED = "#5a6475";
const LINE = "#e2e6ee";
const VERIFIED = "#1e9e5a";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Wallet brand colours and names, as the app header shows them. */
const WALLETS: Record<string, { name: string; color: string; tint: string }> = {
  GCASH: { name: "GCash", color: "#0b5fe0", tint: "#dce8fc" },
  MAYA: { name: "Maya", color: "#0f3d2e", tint: "#d5f3e4" },
};

/** Bank header colours and the short name printed in the mark. */
const BANKS: Record<string, { short: string; color: string }> = {
  "BANCO DE ORO UNIBANK, INC.": { short: "BDO", color: "#0a3a8c" },
  "BANK OF THE PHILIPPINE ISLANDS": { short: "BPI", color: "#a3161b" },
  "LANDBANK OF THE PHILIPPINES": { short: "LBP", color: "#16713a" },
  "METROPOLITAN BANK & TRUST CO.": { short: "MB", color: "#123a7a" },
  "PHILIPPINE NATIONAL BANK": { short: "PNB", color: "#0d2b5c" },
};

export function isWalletChannel(channel: string): boolean {
  return channel in WALLETS;
}

function t(
  x: number,
  y: number,
  text: string,
  size: number,
  opts: {
    bold?: boolean;
    fill?: string;
    anchor?: "start" | "middle" | "end";
  } = {},
): string {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}"${
    opts.bold ? ' font-weight="700"' : ""
  } fill="${opts.fill ?? INK}" text-anchor="${opts.anchor ?? "start"}">${esc(
    text,
  )}</text>`;
}

function money(value: number): string {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

function watermark(w: number, h: number, size: number): string {
  return `<text x="${w / 2}" y="${h / 2 + size / 3}" font-family="${FONT}" font-size="${size}" font-weight="700" fill="#c62828" fill-opacity="0.16" text-anchor="middle" transform="rotate(-24 ${
    w / 2
  } ${h / 2})" letter-spacing="10">SAMPLE</text>`;
}

/** A tick in a filled circle — the "verified" mark on the wallet screen. */
function check(cx: number, cy: number, r: number, color: string): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/><path d="M${
    cx - r * 0.45
  } ${cy + r * 0.02} l ${r * 0.32} ${r * 0.32} l ${r * 0.6} -${
    r * 0.62
  }" fill="none" stroke="#fff" stroke-width="${
    r * 0.26
  }" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// ---------------------------------------------------------------------------
// E-wallet: the account profile screen, showing the account fully verified.
// ---------------------------------------------------------------------------

function walletSvg(data: PayoutProofData): string {
  const W = 540;
  const H = 960;
  const wallet = WALLETS[data.channel];
  const name = data.accountName.toUpperCase();
  const mobile = `+63 ${data.accountNo.replace(/^0/, "")}`;

  const vYear = 2023 + (data.seed % 3);
  const verifiedOn = `${MONTHS[data.seed % 12]} ${String(
    (data.seed % 27) + 1,
  ).padStart(2, "0")}, ${vYear}`;

  const rows: [string, string, boolean?][] = [
    ["Account Level", "Fully Verified", true],
    ["Account Name", name],
    ["Mobile Number", data.accountNo],
    ["Verified On", verifiedOn],
    ["ID Used", data.seed % 2 === 0 ? "PhilSys National ID" : "Driver's License"],
    ["Account Status", "Active"],
  ];

  const listTop = 470;
  const rowH = 62;
  const list = rows
    .map(([label, value, verified], n) => {
      const y = listTop + n * rowH;
      const divider =
        n > 0
          ? `<line x1="48" y1="${y}" x2="${W - 48}" y2="${y}" stroke="${LINE}" stroke-width="1"/>`
          : "";
      const valueX = verified ? W - 78 : W - 48;
      return `${divider}${t(48, y + 38, label, 16, { fill: MUTED })}${t(
        valueX,
        y + 38,
        value,
        16,
        { bold: true, anchor: "end", fill: verified ? VERIFIED : INK },
      )}${verified ? check(W - 60, y + 32, 10, VERIFIED) : ""}`;
    })
    .join("");

  const body = [
    `<rect width="${W}" height="${H}" fill="#eef2f7"/>`,
    // Status bar and app header.
    `<rect width="${W}" height="250" fill="${wallet.color}"/>`,
    t(28, 30, "9:41", 16, { bold: true, fill: "#fff" }),
    `<rect x="${W - 64}" y="17" width="34" height="16" rx="3" fill="none" stroke="#fff" stroke-width="2"/><rect x="${
      W - 61
    }" y="20" width="24" height="10" rx="1" fill="#fff"/><rect x="${W - 28}" y="22" width="3" height="6" fill="#fff"/>`,
    `<path d="M36 92 l -12 12 l 12 12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    t(W / 2, 112, "My Account", 22, { bold: true, fill: "#fff", anchor: "middle" }),
    t(W / 2, 146, wallet.name, 15, { fill: "#fff", anchor: "middle" }),
    // Profile card.
    `<rect x="24" y="176" width="${W - 48}" height="270" rx="18" fill="#000" fill-opacity="0.05" transform="translate(0 4)"/>`,
    `<rect x="24" y="176" width="${W - 48}" height="270" rx="18" fill="#fff"/>`,
    `<circle cx="${W / 2}" cy="236" r="44" fill="${wallet.tint}"/>`,
    t(W / 2, 250, initials(data.accountName), 36, {
      bold: true,
      fill: wallet.color,
      anchor: "middle",
    }),
    check(W / 2 + 32, 268, 13, VERIFIED),
    t(W / 2, 318, name, name.length > 26 ? 20 : 24, { bold: true, anchor: "middle" }),
    t(W / 2, 348, mobile, 18, { fill: MUTED, anchor: "middle" }),
    `<rect x="${W / 2 - 100}" y="372" width="200" height="40" rx="20" fill="#e6f6ec" stroke="${VERIFIED}" stroke-width="1.5"/>`,
    check(W / 2 - 72, 392, 11, VERIFIED),
    t(W / 2 + 12, 398, "Fully Verified", 17, {
      bold: true,
      fill: VERIFIED,
      anchor: "middle",
    }),
    // Details list.
    `<rect x="24" y="${listTop - 10}" width="${W - 48}" height="${
      rows.length * rowH + 20
    }" rx="18" fill="#fff"/>`,
    list,
    t(W / 2, H - 40, "Your account is fully verified and can receive transfers.", 14, {
      fill: MUTED,
      anchor: "middle",
    }),
  ].join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${body}${watermark(
    W,
    H,
    110,
  )}</svg>`;
}

// ---------------------------------------------------------------------------
// Bank: page one of a savings account statement.
// ---------------------------------------------------------------------------

const DEBITS = [
  "ATM WITHDRAWAL",
  "BILLS PAYMENT - MERALCO",
  "POS PURCHASE",
  "INSTAPAY TRANSFER OUT",
  "BILLS PAYMENT - WATER",
];

const CREDITS = ["PAYROLL CREDIT", "INTERBANK FUND TRANSFER", "CASH DEPOSIT"];

function bankSvg(data: PayoutProofData): string {
  const W = 960;
  const H = 720;
  const bank = BANKS[data.channel] ?? { short: "BANK", color: "#1f3b6e" };
  const home = mockAddress(data.seed);
  const name = data.accountName.toUpperCase();

  // The month before the request, in 2026.
  const month = 4 + (data.seed % 4);
  const lastDay = new Date(2026, month + 1, 0).getDate();
  const period = `${MONTHS[month]} 01, 2026 - ${MONTHS[month]} ${lastDay}, 2026`;

  const opening = 8000 + ((data.seed * 1373) % 42000);
  let balance = opening;
  let credits = 0;
  let debits = 0;
  const txns = Array.from({ length: 7 }, (_, n) => {
    const day = 2 + n * 4 + ((data.seed + n) % 3);
    const isCredit = (data.seed + n) % 3 === 0;
    const amount = isCredit
      ? 5000 + ((data.seed * 211 + n * 977) % 15000)
      : 250 + ((data.seed * 97 + n * 331) % Math.max(500, balance * 0.25));
    const rounded = Math.round(amount * 100) / 100;
    if (isCredit) {
      balance += rounded;
      credits += rounded;
    } else {
      balance -= rounded;
      debits += rounded;
    }
    return {
      date: `${MONTHS[month]} ${String(day).padStart(2, "0")}`,
      desc: isCredit
        ? CREDITS[(data.seed + n) % CREDITS.length]
        : DEBITS[(data.seed + n) % DEBITS.length],
      debit: isCredit ? "" : money(rounded),
      credit: isCredit ? money(rounded) : "",
      balance: money(balance),
    };
  });

  const P = { x: 40, y: 24, w: 880, h: 672 };
  const L = P.x + 36;
  const R = P.x + P.w - 36;

  const summary = [
    ["Opening Balance", money(opening)],
    ["Total Credits", money(credits)],
    ["Total Debits", money(debits)],
    ["Closing Balance", money(balance)],
  ]
    .map(([label, value], n) => {
      const bw = (R - L - 30) / 4;
      const bx = L + n * (bw + 10);
      return `<rect x="${bx}" y="286" width="${bw}" height="62" rx="6" fill="#f4f6fa" stroke="${LINE}"/>${t(
        bx + 14,
        310,
        label,
        12,
        { fill: MUTED },
      )}${t(bx + 14, 336, `PHP ${value}`, 17, { bold: true })}`;
    })
    .join("");

  const cols = { date: L + 10, desc: L + 100, debit: R - 250, credit: R - 130, bal: R - 10 };
  const tableTop = 374;
  const rowH = 32;
  const table = [
    `<rect x="${L}" y="${tableTop}" width="${R - L}" height="32" fill="${bank.color}"/>`,
    t(cols.date, tableTop + 21, "DATE", 12, { bold: true, fill: "#fff" }),
    t(cols.desc, tableTop + 21, "DESCRIPTION", 12, { bold: true, fill: "#fff" }),
    t(cols.debit, tableTop + 21, "DEBIT", 12, { bold: true, fill: "#fff", anchor: "end" }),
    t(cols.credit, tableTop + 21, "CREDIT", 12, { bold: true, fill: "#fff", anchor: "end" }),
    t(cols.bal, tableTop + 21, "BALANCE", 12, { bold: true, fill: "#fff", anchor: "end" }),
    ...[
      { date: `${MONTHS[month]} 01`, desc: "BALANCE FORWARD", debit: "", credit: "", balance: money(opening) },
      ...txns,
    ].map((row, n) => {
      const y = tableTop + 32 + n * rowH;
      return `${
        n % 2 === 1 ? `<rect x="${L}" y="${y}" width="${R - L}" height="${rowH}" fill="#f7f8fb"/>` : ""
      }${t(cols.date, y + 21, row.date, 13)}${t(cols.desc, y + 21, row.desc, 13)}${t(
        cols.debit,
        y + 21,
        row.debit,
        13,
        { anchor: "end" },
      )}${t(cols.credit, y + 21, row.credit, 13, { anchor: "end" })}${t(
        cols.bal,
        y + 21,
        row.balance,
        13,
        { bold: true, anchor: "end" },
      )}`;
    }),
    `<line x1="${L}" y1="${tableTop + 32 + 8 * rowH}" x2="${R}" y2="${
      tableTop + 32 + 8 * rowH
    }" stroke="${LINE}" stroke-width="1.5"/>`,
  ].join("");

  const body = [
    // A grey scanner bed around the page, the way a photocopy comes back.
    `<rect width="${W}" height="${H}" fill="#e7e7e3"/>`,
    `<rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" fill="#fff" stroke="#c9c7bd"/>`,
    `<rect x="${P.x}" y="${P.y}" width="${P.w}" height="8" fill="${bank.color}"/>`,
    // Header: a generic mark, not the bank's logo.
    `<rect x="${L}" y="54" width="60" height="60" rx="10" fill="${bank.color}"/>`,
    t(L + 30, 91, bank.short, bank.short.length > 3 ? 15 : 19, {
      bold: true,
      fill: "#fff",
      anchor: "middle",
    }),
    t(L + 76, 80, data.channel, 19, { bold: true, fill: bank.color }),
    t(L + 76, 102, `${home.city} Branch`, 13, { fill: MUTED }),
    t(R, 76, "STATEMENT OF ACCOUNT", 18, { bold: true, anchor: "end" }),
    t(R, 98, `Period: ${period}`, 13, { fill: MUTED, anchor: "end" }),
    t(R, 116, "Page 1 of 1", 12, { fill: MUTED, anchor: "end" }),
    `<line x1="${L}" y1="136" x2="${R}" y2="136" stroke="${LINE}" stroke-width="1.5"/>`,
    // Account holder and account.
    t(L, 164, "ACCOUNT NAME", 11, { fill: MUTED }),
    t(L, 188, name, 19, { bold: true }),
    t(L, 218, "ADDRESS", 11, { fill: MUTED }),
    t(L, 238, `${home.houseNo} ${home.street}, BRGY. ${home.barangay}`, 14),
    t(L, 258, `${home.city}, ${home.province} ${home.zip}`, 14),
    t(560, 164, "ACCOUNT NUMBER", 11, { fill: MUTED }),
    t(560, 188, data.accountNo, 19, { bold: true }),
    t(560, 218, "ACCOUNT TYPE", 11, { fill: MUTED }),
    t(560, 238, "REGULAR SAVINGS - PHP", 14),
    t(760, 218, "CURRENCY", 11, { fill: MUTED }),
    t(760, 238, "PHP", 14),
    summary,
    table,
    t(L, P.y + P.h - 12,"This is a system-generated statement. Please report any discrepancy within 30 days.", 11, {
      fill: MUTED,
    }),
  ].join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${body}${watermark(
    W,
    H,
    150,
  )}</svg>`;
}

export function buildPayoutProofSvg(data: PayoutProofData): string {
  return isWalletChannel(data.channel) ? walletSvg(data) : bankSvg(data);
}

/** The proof as a URL an `<img>` can load. */
export function payoutProofImageUrl(data: PayoutProofData): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    buildPayoutProofSvg(data),
  )}`;
}
