"use client";

import { Box, Flex, Image, Text } from "@chakra-ui/react";

import type { CofpRequest } from "../data/types";

const ONES = [
  "",
  "ONE",
  "TWO",
  "THREE",
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "EIGHT",
  "NINE",
  "TEN",
  "ELEVEN",
  "TWELVE",
  "THIRTEEN",
  "FOURTEEN",
  "FIFTEEN",
  "SIXTEEN",
  "SEVENTEEN",
  "EIGHTEEN",
  "NINETEEN",
];

const TENS = [
  "",
  "",
  "TWENTY",
  "THIRTY",
  "FORTY",
  "FIFTY",
  "SIXTY",
  "SEVENTY",
  "EIGHTY",
  "NINETY",
];

// Certificates spell the plan value out, e.g. "FIFTY-THREE THOUSAND PESOS ONLY".
function spell(value: number): string {
  if (value < 20) return ONES[value];
  if (value < 100) {
    const tens = TENS[Math.floor(value / 10)];
    const ones = ONES[value % 10];
    return ones ? `${tens}-${ones}` : tens;
  }
  if (value < 1000) {
    const rest = value % 100;
    return `${ONES[Math.floor(value / 100)]} HUNDRED${rest ? ` ${spell(rest)}` : ""}`;
  }
  if (value < 1_000_000) {
    const rest = value % 1000;
    return `${spell(Math.floor(value / 1000))} THOUSAND${rest ? ` ${spell(rest)}` : ""}`;
  }
  const rest = value % 1_000_000;
  return `${spell(Math.floor(value / 1_000_000))} MILLION${rest ? ` ${spell(rest)}` : ""}`;
}

export function amountInWords(amount: number) {
  const pesos = Math.floor(amount);
  const centavos = Math.round((amount - pesos) * 100);
  const words = pesos === 0 ? "ZERO" : spell(pesos);
  return centavos > 0
    ? `${words} PESOS AND ${spell(centavos)} CENTAVOS ONLY`
    : `${words} PESOS ONLY`;
}

function formatPeso(amount: number) {
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

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

function ordinal(day: number) {
  if (day > 3 && day < 21) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

/** "2026-02-02" -> "2nd day of February  2026" */
function givenOn(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return "____ day of ____________";
  return `${ordinal(d)} day of ${MONTHS[m - 1]}  ${y}`;
}

function printedOn(date: string) {
  const [y, m, d] = date.split("-");
  return `${m}/${d}/${y}`;
}

// Repeating security wording behind the certificate body, tiled as a
// background so it prints without adding hundreds of DOM nodes.
const WATERMARK = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="470" height="26">
    <text x="0" y="18" font-family="Georgia, serif" font-size="13"
      fill="#1c4d2b" fill-opacity="0.13" letter-spacing="0.4">ST. PETER LIFE PLAN INCORPORATED</text>
  </svg>`,
);

/** Corner bracket on the outer frame. */
function Corner({
  top,
  left,
}: {
  top?: boolean;
  left?: boolean;
}) {
  return (
    <Box
      position="absolute"
      top={top ? "6px" : undefined}
      bottom={top ? undefined : "6px"}
      left={left ? "6px" : undefined}
      right={left ? undefined : "6px"}
      w="18px"
      h="18px"
      borderTopWidth={top ? "3px" : 0}
      borderBottomWidth={top ? 0 : "3px"}
      borderLeftWidth={left ? "3px" : 0}
      borderRightWidth={left ? 0 : "3px"}
      borderColor="black"
      pointerEvents="none"
    />
  );
}

/**
 * Certificate of Full Payment, laid out to match the printed form: framed
 * page, tiled watermark, company letterhead on the left and the certification
 * body on the right, with the branch/CFP footer along the bottom.
 *
 * On phones the landscape sheet would shrink the wording past reading size, so
 * the layout stacks — letterhead above the certification, height driven by the
 * content — and returns to the printed proportions from `md` up. Print media
 * resolves at page width, so a printed sheet always uses the landscape form.
 */
export function CofpCertificate({ request }: { request: CofpRequest }) {
  return (
    <Box
      className="cofp-page"
      bg="white"
      position="relative"
      w="full"
      maxW="1000px"
      mx="auto"
      borderWidth="2px"
      borderColor="black"
      p="10px"
      aspectRatio={{ base: "auto", md: "1400 / 655" }}
    >
      {/* Inner rule + corner brackets */}
      <Box
        position="absolute"
        inset="10px"
        borderWidth="1px"
        borderColor="black"
        pointerEvents="none"
      />
      <Corner top left />
      <Corner top />
      <Corner left />
      <Corner />

      {/* Security watermark */}
      <Box
        position="absolute"
        inset="12px"
        backgroundImage={`url("data:image/svg+xml,${WATERMARK}")`}
        backgroundRepeat="repeat"
        pointerEvents="none"
      />

      <Flex
        position="relative"
        direction={{ base: "column", md: "row" }}
        h={{ base: "auto", md: "full" }}
        px={{ base: 3, md: 6 }}
        py={4}
        gap={{ base: 3, md: 4 }}
      >
        {/* ── Letterhead ── */}
        <Box w={{ base: "full", md: "38%" }} flexShrink={0}>
          <Flex align="flex-start" justify={{ base: "center", md: "flex-start" }} gap={2}>
            <Image
              src="/images/logo/St. Peter Miter Logo.png"
              alt=""
              w={{ base: "44px", md: "48px" }}
              flexShrink={0}
            />
            <Box lineHeight="0.95">
              <Text
                fontFamily="Georgia, 'Times New Roman', serif"
                fontWeight="bold"
                fontSize={{ base: "23px", md: "30px" }}
                color="#0f7a3d"
                letterSpacing="-0.5px"
              >
                ST. PETER
              </Text>
              <Text
                fontFamily="Georgia, 'Times New Roman', serif"
                fontWeight="bold"
                fontSize={{ base: "23px", md: "30px" }}
                color="#0f7a3d"
                letterSpacing="-0.5px"
              >
                LIFE PLAN
              </Text>
            </Box>
          </Flex>

          <Box
            mt={2}
            textAlign="center"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize={{ base: "10px", md: "11px" }}
            color="gray.800"
            lineHeight="1.5"
          >
            <Text>St. Peter Corporate Center</Text>
            <Text>999 EDSA, Quezon City 1105 (across SM North Annex)</Text>
            <Text>☎ 8371-SPLP (8371-7757) • Fax No.: 8372-3387</Text>
            <Text>www.stpeter.com.ph</Text>
          </Box>
        </Box>

        {/* ── Certification body ── */}
        <Box flex="1" minW={0}>
          <Text
            textAlign="center"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontWeight="bold"
            fontSize={{ base: "17px", md: "24px" }}
            letterSpacing="0.2px"
          >
            CERTIFICATE OF FULL PAYMENT OF PLAN
          </Text>

          <Text
            mt={2}
            textAlign="center"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontStyle="italic"
            fontSize={{ base: "13px", md: "15px" }}
          >
            This is to certify that
          </Text>

          <Text
            mt={1}
            textAlign="center"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontWeight="bold"
            fontSize={{ base: "15px", md: "17px" }}
            textTransform="uppercase"
          >
            {request.planholderName}
          </Text>

          <Text
            mt={2}
            textAlign="center"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize={{ base: "12px", md: "13px" }}
          >
            {request.planholderAddress}
          </Text>

          <Text
            mt={3}
            textAlign="center"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontStyle="italic"
            fontSize={{ base: "13px", md: "15px" }}
          >
            Has paid in full
          </Text>

          <Text
            mt={1}
            textAlign="center"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize={{ base: "12px", md: "13px" }}
          >
            {request.planName} LIFE PLAN under contract number {request.lpaNo}{" "}
            with plan value of
          </Text>

          <Text
            textAlign="center"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize={{ base: "12px", md: "13px" }}
          >
            {amountInWords(request.totalAmountPaid)} (Php{" "}
            {formatPeso(request.totalAmountPaid)})
          </Text>

          <Text
            textAlign="center"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize={{ base: "12px", md: "13px" }}
          >
            {request.coverage}
          </Text>

          <Text
            mt={3}
            textAlign="center"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize={{ base: "12px", md: "13px" }}
          >
            Given this {givenOn(request.cfpDate)} at Quezon City, Philippines
          </Text>

          {/* ── Signatory ── */}
          <Box mt={{ base: 4, md: 8 }} textAlign="center">
            <Text
              fontFamily="'Segoe Script', 'Brush Script MT', cursive"
              fontSize={{ base: "26px", md: "30px" }}
              lineHeight="1"
              color="gray.900"
            >
              Vitangcol
            </Text>
            <Text
              mt={1}
              fontFamily="Georgia, 'Times New Roman', serif"
              fontWeight="bold"
              fontSize={{ base: "13px", md: "15px" }}
            >
              JONATHAN B. VITANGCOL
            </Text>
            <Text
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize={{ base: "12px", md: "13px" }}
            >
              President and CEO
            </Text>
          </Box>
        </Box>
      </Flex>

      {/* ── Footer ── */}
      <Box
        position={{ base: "static", md: "absolute" }}
        mt={{ base: 4, md: 0 }}
        px={{ base: 3, md: 0 }}
        left={{ md: "34px" }}
        bottom={{ md: "44px" }}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={{ base: "10px", md: "11px" }}
        lineHeight="1.6"
      >
        <Text>Branch: {request.branchCode}</Text>
        <Text>
          CFP# {request.cfpNumber} &nbsp;Date Printed:{" "}
          {printedOn(request.cfpDate)}
        </Text>
      </Box>

      <Text
        position={{ base: "static", md: "absolute" }}
        mt={{ base: 2, md: 0 }}
        px={{ base: 3, md: 0 }}
        pb={{ base: 1, md: 0 }}
        left={{ md: "34px" }}
        bottom={{ md: "16px" }}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={{ base: "9px", md: "10px" }}
        color="gray.700"
      >
        This is a computer generated form and is valid only if there is no
        alteration.
      </Text>
    </Box>
  );
}

export default CofpCertificate;
