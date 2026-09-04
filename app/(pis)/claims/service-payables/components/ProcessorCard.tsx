"use client";

// One processor, as the dashboard offers them: what they put through at this
// stage, and what it comes to.
//
// The counterpart to {@link TerritoryCard}, and built to the same recipe on
// purpose — same border, same radius, same foot of icon stats — because the two
// occupy the same slot on the same page and the user switches between them with
// a tab. What changes between the tabs is WHAT is being listed, and that should
// be the only thing that changes.
//
// IT LEADS SOMEWHERE ON THE STAGES THAT HAVE A SCREEN, and nowhere on the ones
// that do not — the optional `onClick` `TerritoryCard` carries, for the same
// reason. It genuinely led nowhere until the Processed workspace existed: a
// territory card was a door into the work and this was a reading of work already
// done. That workspace is now cut by processor, so on Processed a card is the
// way into it; on Verified and Approved it is still only a reading, and it drops
// the pointer, the lift and its place in the tab order to say so.
//
// IT CARRIES TWO FIGURES NOW, NOT FIVE (user, 2026-08-27). The card used to
// report billings, chapels, accounts, territories and the total CSP — everything
// the summary knows. What a card in this slot is actually FOR is picking a name
// off a grid of names, and only two of those figures separate one name from
// another at that moment: how many billings are waiting under them, and how far
// those billings reach. Chapels and accounts are the billings' own contents, and
// they are read on the billing, one press later. The total CSP came off for a
// blunter reason: nobody chooses whose queue to verify by the size of the
// cheque, and a peso figure set in the card's boldest type said they should.
// `ProcessorSummary` still carries all five — `ProcessorDataTable` is the view
// that wants the full set, and the table is where a reader goes to compare.

import { Box, Flex, Text } from "@chakra-ui/react";
import { LuCircleAlert, LuMapPin } from "react-icons/lu";
import type { IconType } from "react-icons";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { discrepancyLabel, type ProcessorSummary } from "../service-payables-data";

/** The same red the territory cards and the overview tile use. */
const DEFICIENCY_ACCENT = "#e11d48";

/**
 * A person's initials, for the chip that stands in for a photograph.
 *
 * First and last name only. The middle initial these names carry — "ROLANDO A.
 * SANTOS" — is dropped rather than included, because "RAS" and "MB" side by side
 * read as two different kinds of thing.
 */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

/** One count with its icon, along the card's foot. Same as the territory card's. */
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

/** "1 chapel" / "4 chapels". */
const plural = (count: number, noun: string) =>
  `${count} ${count === 1 ? noun : `${noun}s`}`;

/** "1 territory" / "3 territories" — the one noun on this card that -ies. */
export const territoryLabel = (count: number) =>
  `${count} ${count === 1 ? "territory" : "territories"}`;

export interface ProcessorCardProps {
  summary: ProcessorSummary;
  /**
   * Where the card leads. Omit it and the card is a READING — it still reports
   * what the person put through, it just stops offering to be pressed. See the
   * note at the top of this file, and the identical prop on `TerritoryCard`.
   */
  onClick?: () => void;
}

export function ProcessorCard({ summary, onClick }: ProcessorCardProps) {
  const { processor, billingCount, territoryCount, discrepantCount } = summary;

  return (
    <Box
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      p={3.5}
      boxShadow="xs"
      // The territory card's column, for the reason given there: the card fills
      // its grid cell so the foot can sit on the bottom edge of it rather than
      // wherever the content happened to end. These two are one construction and
      // a card whose feet lined up on one tab but not the next would read as a
      // bug on whichever tab the user saw second.
      display="flex"
      flexDirection="column"
      h="100%"
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.18s ease"
      // The territory card's lift, unchanged — the two sit in the same slot on
      // the same page and press the same way.
      _hover={
        onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: "md",
              borderColor: BRAND_COLORS.primaryGreen,
            }
          : undefined
      }
    >
      {/* The head takes the slack, not the foot — see the note on the same line
          of `TerritoryCard`. It is all name now that the CSP has come off the
          right of it, which is the one thing the removal gives back: a long name
          runs the width of the card before it has to truncate. */}
      <Flex align="flex-start" gap={3} flex="1 1 auto">
        <Flex minW={0} flex="1" align="center" gap={2.5}>
          {/* The initials chip does the job the territory code does one tab
              over: a short, constant handle the eye can find a row by without
              reading the whole name. */}
          <Flex
            flexShrink={0}
            align="center"
            justify="center"
            boxSize="34px"
            borderRadius="full"
            bg={`${BRAND_COLORS.primaryGreen}18`}
            color={BRAND_COLORS.darkGreen}
            fontSize="11px"
            fontWeight="800"
            letterSpacing="0.02em"
          >
            {initialsOf(processor)}
          </Flex>

          <Box minW={0}>
            <Text
              fontSize="sm"
              fontWeight="700"
              color="gray.800"
              lineHeight="short"
              truncate
            >
              {processor}
            </Text>
            <Text fontSize="10px" fontWeight="600" color="gray.400" mt="1px">
              {plural(billingCount, "billing")}
            </Text>
          </Box>
        </Flex>
      </Flex>

      {/* The foot: how far those billings reach. The territory count is here
          rather than in the heading because it is the lesser of the two — a
          processor is picked by how much is waiting under them first, and on
          this tab the territory has stopped being the thing the list is cut by.
          It stays on its own line, under its own rule, rather than being folded
          into the billings line: the rule is what makes this card the same
          construction as `TerritoryCard` beside it, and a card that lost its
          foot would stop lining up with the other tab. */}
      <Flex
        align="center"
        gap={3}
        mt={2.5}
        pt={2}
        flexShrink={0}
        borderTop="1px solid"
        borderColor="gray.100"
        wrap="wrap"
      >
        <Stat Icon={LuMapPin} text={territoryLabel(territoryCount)} />
        {/* One mark and only when there is one — the territory card's rule,
            including what it leaves out: deficiencies are not reported at this
            altitude. */}
        {discrepantCount > 0 && (
          <Stat
            Icon={LuCircleAlert}
            text={discrepancyLabel(discrepantCount)}
            color={DEFICIENCY_ACCENT}
          />
        )}
      </Flex>
    </Box>
  );
}

export default ProcessorCard;
