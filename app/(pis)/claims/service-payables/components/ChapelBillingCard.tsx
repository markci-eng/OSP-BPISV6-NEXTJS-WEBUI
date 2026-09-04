"use client";

// The chapel whose billing is open, as a card — what is owed to it, what that
// amount is made of, and the one action available on it.
//
// `TerritoryCard`'s construction, one level down. That card answers "which
// territory is worth opening"; this one answers "what am I looking at, and can
// I bill it". Same frame, same code-over-name heading, same figure opposite,
// same ruled foot of counts — because they are the same kind of object seen at
// two altitudes, and a reader who has just clicked through from one to the
// other should not have to learn a second layout.
//
// WHY A CARD AGAIN. The billing's line was a bare `SectionTitle` row for a
// while, and the note that replaced the card with it was right at the time: the
// card then held the billing number and a button, and gave two facts a border,
// a heading and a repeat of what the rail already showed.
//
// It holds more than two facts now. The money is here, which is the number the
// whole screen is about and which previously appeared nowhere in the main
// column — a processor had to add up a table to find it. So are the counts that
// say what the money is made of, including the discrepancies that are excluded
// from it. That is a card's worth of content, and the border earns itself.
//
// THE TWO IDENTIFIERS keep the rule the row used. Before it is created the
// billing code is all there is. Creating it mints the billing NUMBER, and from
// then on that is what the billing is quoted by outside this system, so it
// takes the top-right corner — opposite the chapel, above the total — and the
// code stays on the chapel's own line, because the code is the thing that says
// which chapel and which period this is.
//
// NO BUTTON. Create/Edit briefly sat in this card's foot and now lives in the
// rail, under the territory picker — see `BillingAction`. What is left here is
// purely a READING of the billing, which is what a card in the reading column
// should be: the action is pinned beside the list being worked instead of
// scrolling away with the table.

import { Box, Flex, Text } from "@chakra-ui/react";
import {
  LuCircleAlert,
  LuCircleCheck,
  LuFileClock,
  LuFileStack,
  LuStore,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  deficiencyLabel,
  discrepancyLabel,
  formatCSP,
  type ServiceBilling,
} from "../service-payables-data";

/** The same red every discrepancy in this module is drawn in. */
const DEFICIENCY_ACCENT = "#e11d48";

/**
 * One count with its icon, along the card's foot.
 *
 * Takes the finished text rather than a count and a noun — `TerritoryCard`'s
 * `Stat`, for the reason given there: "discrepancy" does not pluralise the way
 * "service" does.
 */
function Stat({
  Icon,
  text,
  color = "gray.500",
}: {
  Icon: IconType;
  text: string;
  color?: string;
}) {
  return (
    <Flex align="center" gap={1.5} minW={0} color={color}>
      <Box flexShrink={0} display="flex" alignItems="center">
        <Icon size={13} />
      </Box>
      <Text fontSize="11px" fontWeight="600" truncate>
        {text}
      </Text>
    </Flex>
  );
}

/** "1 service" / "4 services". */
const plural = (count: number, noun: string) =>
  `${count} ${count === 1 ? noun : `${noun}s`}`;

export interface ChapelBillingCardProps {
  billing: ServiceBilling;
}

export function ChapelBillingCard({ billing }: ChapelBillingCardProps) {
  const created = Boolean(billing.billingNo);
  const billable = billing.services.length;
  const deficient = billing.deficient.length;
  const discrepant = billing.discrepant.length;

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      p={3.5}
      boxShadow="xs"
      mb={5}
    >
      <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
        <Box minW={0} flex="1">
          {/* The chapel's own code, in the slot the territory card gives the
              territory's — it is the handle every billing code here is
              prefixed with.

              DROPPED WHERE IT WOULD ONLY REPEAT THE NAME. A chapel code is the
              name truncated to six characters, so for about half of them —
              ALABAT, APARRI, BULAN — the two strings are identical and the card
              would open by saying the same word twice in two sizes. It earns
              its line only where it differs (ALAMIN over ALAMINOS), which is
              exactly where a reader could not have guessed it. The billing code
              underneath carries it in every case. */}
          {billing.chapelCode !== billing.chapelDesc && (
            <Text
              fontSize="10px"
              fontWeight="700"
              color={BRAND_COLORS.primaryGreen}
              letterSpacing="0.08em"
            >
              {billing.chapelCode}
            </Text>
          )}
          <Text
            fontSize="sm"
            fontWeight="700"
            color="gray.800"
            lineHeight="short"
            mt="1px"
          >
            {billing.chapelDesc}
          </Text>
          {/* Period and billing code together: the two halves of what the code
              MEANS, side by side so the code is never a string to decode. */}
          <Text fontSize="11px" color="gray.500" mt="2px">
            {billing.periodLabel} · {billing.billingCode}
          </Text>
          {/* WHOSE CHAPEL THIS IS, and only when it is not the company's.
              A franchise bills under a different process — its plan holders may
              be keyed in by hand, and its endorsements are the ones whose names
              disagree with the plan — so it changes what this screen DOES, not
              merely how it is labelled. An "Owned" chip on the other hundred and
              thirty chapels would say nothing on any of them. */}
          {billing.isFranchise && (
            <Flex
              display="inline-flex"
              align="center"
              gap={1}
              mt={1.5}
              px={1.5}
              py="1px"
              borderWidth="1px"
              borderColor="#fde68a"
              borderRadius="md"
              bg="#fffbeb"
            >
              <Box color="#b45309" display="flex">
                <LuStore size={11} />
              </Box>
              <Text fontSize="10px" fontWeight="700" color="#b45309">
                {billing.isManualFranchise
                  ? "Franchise · endorsed on paper"
                  : "Franchise"}
              </Text>
            </Flex>
          )}
        </Box>

        <Box textAlign="right" flexShrink={0}>
          {/* Only once it exists. Before that the button below says what is
              missing, and a "not yet created" line here would say it twice. */}
          {created && (
            <Text
              fontSize="10px"
              fontWeight="700"
              color={BRAND_COLORS.primaryGreen}
              letterSpacing="0.08em"
            >
              {billing.billingNo}
            </Text>
          )}
          <Text
            fontSize="sm"
            fontWeight="800"
            color={BRAND_COLORS.darkGreen}
            whiteSpace="nowrap"
            mt={created ? "1px" : 0}
          >
            {formatCSP(billing.totalCSP)}
          </Text>
          {/* The figure needs naming here in a way it does not on the
              dashboard: that card's amount is the only number on it, and this
              one sits on a screen full of per-plan CSPs it is the sum of. */}
          <Text fontSize="10px" color="gray.400">
            Total CSP
          </Text>
        </Box>
      </Flex>

      {/* The foot: what the amount is made of. Ruled off, so the figures above
          read as the headline and these as the breakdown — the territory
          card's rule. */}
      <Flex
        align="center"
        gap={3}
        mt={2.5}
        pt={2}
        borderTop="1px solid"
        borderColor="gray.100"
        wrap="wrap"
      >
        <Stat Icon={LuFileStack} text={plural(billable, "service")} />
        {/* Only once any have been. A "0 terminated" on every fresh billing
            would train the eye past the one place progress is reported. */}
        {billing.terminatedCount > 0 && (
          <Stat
            Icon={LuCircleCheck}
            text={`${billing.terminatedCount} terminated`}
            color={BRAND_COLORS.darkGreen}
          />
        )}
        {/* TWO COUNTS, TWO WEIGHTS, where one combined red figure stood.
            A discrepancy means a plan on this billing cannot be serviced until
            someone corrects a record — that is the alert. A deficiency means a
            document is in the post; it is listed and it is worked, but it is a
            queue, and reading the two in one colour made the smaller of them
            look like the larger. */}
        {discrepant > 0 && (
          <Stat
            Icon={LuCircleAlert}
            text={discrepancyLabel(discrepant)}
            color={DEFICIENCY_ACCENT}
          />
        )}
        {deficient > 0 && (
          <Stat Icon={LuFileClock} text={deficiencyLabel(deficient)} />
        )}
      </Flex>
    </Box>
  );
}

export default ChapelBillingCard;
