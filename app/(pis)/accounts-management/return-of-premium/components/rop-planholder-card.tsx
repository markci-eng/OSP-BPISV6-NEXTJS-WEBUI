"use client";

// Who the return is FOR — the identity card at the top of the ROP panel.
//
// NOT THE KIT'S `ProfileHeaderCard` ANY MORE (user, 2026-09-24). That card was
// right while the panel showed a whole profile, and the panel no longer does:
// its contact column, its plan list, its personal and employment blocks have
// all been turned off one by one, leaving an identity header. The last three
// asks — the LPA number under the name, no vertical rule, content centred —
// are all things that card draws internally and takes no prop for, and the
// only way to get them from it was CSS reaching into its markup.
//
// So it is built here instead, out of the same kit pieces it used: the kit's
// `BrandedAvatar` with the same ring, and `OSPBadge` for the states. The edge
// and the lift are the constants measured off that card, so it still sits in a
// column with the ROP details card as one family.

import type { ReactNode } from "react";
import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { BrandedAvatar, OSPBadge } from "osp-ui-kit";
import { IdCard, Pencil } from "lucide-react";

import { mockAvatarUrl } from "@/lib/mock-avatar";
import { formatAge, formatFiledDate } from "@/app/(pis)/data";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  KIT_BORDER,
  KIT_SHADOW,
} from "../../components/section-card";

/** One of the two facts under the name — label over value, centred. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Box minW={0} flex="1">
      <Text
        fontSize="10px"
        fontWeight="700"
        letterSpacing="0.04em"
        textTransform="uppercase"
        color="gray.500"
      >
        {label}
      </Text>
      {/* Wraps rather than truncating: the age runs to "52 yrs, 2 mos 2 days",
          which in half a narrow card is two lines and is meant to be. */}
      <Text fontSize="xs" fontWeight="600" color="gray.800" lineHeight="1.3">
        {value}
      </Text>
    </Box>
  );
}

export interface RopPlanholderCardProps {
  /** Surname-first, as the list and the certificates print it. */
  name: string;
  lpaNo: string;
  /** Keys the mock avatar, so one planholder keeps one face. */
  personId: string;
  /** ISO. The age shown beside it is derived from this. */
  birthdate?: string;
  /** The request's own state, kept from the card this replaces. */
  status?: { label: string; type: "success" | "info" | "warning" | "danger" };
  /** Drawn beside the LPA number when set. Reinstatement shows it; ROP does not. */
  insurability?: "Insurable" | "Not Insurable";
  /** Opens Edit PH Info. The pencil beside the name is drawn only when set. */
  onEdit?: () => void;
  /**
   * `vertical` (default) is the centred stack for ROP's narrow column.
   * `horizontal` lays the facts out in one row across a full-width card —
   * Reinstatement uses it (user, 2026-09-28).
   */
  orientation?: "vertical" | "horizontal";
  /**
   * Horizontal only: drop the card's own edge, lift and padding, for when the
   * row sits inside another card (Transfer's Transferor Details). The card
   * holding it is narrower than the page, so the name takes a line of its own
   * and the facts share the line under it.
   */
  embedded?: boolean;
}

/** A labelled column in the horizontal layout — caption over value. */
function RowFact({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Box minW={0}>
      <Text
        fontSize="10px"
        fontWeight="700"
        letterSpacing="0.04em"
        textTransform="uppercase"
        color="gray.500"
        mb={0.5}
      >
        {label}
      </Text>
      {children}
    </Box>
  );
}

function HorizontalPlanholderCard({
  name,
  lpaNo,
  personId,
  birthdate,
  status,
  insurability,
  onEdit,
  embedded = false,
}: Omit<RopPlanholderCardProps, "orientation">) {
  // Embedded, the name fills its own line and the facts split the next one
  // evenly; otherwise all of it runs in one row from `lg`.
  const nameFlex = embedded ? "1 1 100%" : "2 1 280px";
  const factFlex = (basis: string) => (embedded ? "1 1 0" : `1 1 ${basis}`);

  return (
    <Box
      {...(embedded
        ? {}
        : {
            bg: "white",
            borderWidth: "1px",
            borderColor: KIT_BORDER,
            boxShadow: KIT_SHADOW,
            borderRadius: "lg",
            px: 5,
            py: 3,
          })}
    >
      {/* One row: identity, then each fact in its own column. The name column
          takes the slack; the rest size to their content. Wraps on narrow
          screens rather than squeezing. */}
      <Flex
        align="center"
        wrap={embedded ? "wrap" : { base: "wrap", lg: "nowrap" }}
        columnGap={embedded ? 4 : 8}
        rowGap={3}
      >
        {/* Avatar kept beside the name. */}
        <Flex align="center" gap={3} flex={nameFlex} minW={0}>
          <BrandedAvatar
            name={name}
            imageUrl={mockAvatarUrl(personId)}
            size="md"
            ringed
            ringPadding="2px"
          />
          <Box minW={0}>
            <Flex align="center" gap={1} minW={0}>
              <Text
                fontWeight="bold"
                fontSize="md"
                lineHeight="1.2"
                color="gray.800"
                textTransform="uppercase"
                truncate
              >
                {name}
              </Text>
              {onEdit && (
                <IconButton
                  aria-label="Edit PH Info"
                  title="Edit PH Info"
                  size="2xs"
                  variant="ghost"
                  color="gray.500"
                  _hover={{ color: BRAND_COLORS.primaryGreen, bg: "green.50" }}
                  flexShrink={0}
                  onClick={onEdit}
                >
                  <Pencil size={14} />
                </IconButton>
              )}
            </Flex>
            <Flex
              align="center"
              gap={1}
              mt={0.5}
              color={BRAND_COLORS.darkGreen}
              minW={0}
            >
              <Box display="flex" flexShrink={0}>
                <IdCard size={12} />
              </Box>
              <Text
                fontFamily="mono"
                fontSize="xs"
                fontWeight="700"
                letterSpacing="0.02em"
                truncate
              >
                {lpaNo}
              </Text>
            </Flex>
          </Box>
        </Flex>

        {birthdate && (
          <>
            <Box flex={factFlex("120px")} minW={0}>
              <RowFact label="Date of Birth">
                <Text fontSize="sm" fontWeight="600" color="gray.800">
                  {formatFiledDate(birthdate)}
                </Text>
              </RowFact>
            </Box>
            <Box flex={factFlex("140px")} minW={0}>
              <RowFact label="Current Age">
                <Text fontSize="sm" fontWeight="600" color="gray.800">
                  {formatAge(new Date(birthdate))}
                </Text>
              </RowFact>
            </Box>
          </>
        )}

        {insurability && (
          <Box flex={factFlex("140px")} minW={0}>
            <RowFact label="Insurability">
              <OSPBadge
                type={insurability === "Insurable" ? "success" : "danger"}
              >
                {insurability}
              </OSPBadge>
            </RowFact>
          </Box>
        )}

        {/* A hairline between the person's facts and the request's state.
            Only in the single row — once the row wraps it would dangle. */}
        {insurability && status && (
          <Box
            display={{ base: "none", lg: "block" }}
            alignSelf="stretch"
            flexShrink={0}
            borderLeftWidth="1px"
            borderColor="gray.200"
          />
        )}

        {status && (
          <Box flex="0 0 auto">
            <RowFact label="Status">
              <OSPBadge type={status.type}>{status.label}</OSPBadge>
            </RowFact>
          </Box>
        )}
      </Flex>
    </Box>
  );
}

export function RopPlanholderCard({
  orientation = "vertical",
  ...props
}: RopPlanholderCardProps) {
  if (orientation === "horizontal") {
    return <HorizontalPlanholderCard {...props} />;
  }
  return <VerticalPlanholderCard {...props} />;
}

function VerticalPlanholderCard({
  name,
  lpaNo,
  personId,
  birthdate,
  status,
  insurability,
  onEdit,
}: Omit<RopPlanholderCardProps, "orientation">) {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor={KIT_BORDER}
      boxShadow={KIT_SHADOW}
      borderRadius="lg"
      p={5}
      // The ground the status badge is pinned to.
      position="relative"
    >
      {/* THE REQUEST'S STATE, top right (user, 2026-09-24). Taken out of the
          centred stack and pinned to the corner: it is not part of the
          identity below it, and a card's corner is where a status is looked
          for. Absolute so it costs the stack no height and leaves the avatar
          centred on the card rather than on the space left beside it. */}
      {status && (
        <Box position="absolute" top={3} right={3} zIndex={1}>
          <OSPBadge type={status.type}>{status.label}</OSPBadge>
        </Box>
      )}

      {/* CENTRED, and centred rather than left-aligned because the column is
          narrow: at 30% width a left-aligned avatar with its text beside it
          leaves a ragged right edge and a name that truncates early. Stacked
          and centred, the name gets the card's full width.

          `pt` clears the pinned badge, so a long name cannot run under it. */}
      <Flex
        direction="column"
        align="center"
        textAlign="center"
        gap={2.5}
        pt={status ? 4 : 0}
      >
        <BrandedAvatar
          name={name}
          imageUrl={mockAvatarUrl(personId)}
          size="lg"
          ringed
          ringPadding="3px"
        />

        <Box minW={0} w="full">
          {/* THE NAME, with its edit pencil beside it. The pencil sits in the
              row rather than the card's corner, so it reads as editing THIS
              line — the corner already holds the request's status. */}
          <Flex align="center" justify="center" gap={1} minW={0}>
            <Text
              fontWeight="bold"
              fontSize="md"
              lineHeight="1.2"
              color="gray.800"
              truncate
            >
              {name}
            </Text>
            {onEdit && (
              <IconButton
                aria-label="Edit PH Info"
                title="Edit PH Info"
                size="2xs"
                variant="ghost"
                color="gray.500"
                _hover={{ color: BRAND_COLORS.primaryGreen, bg: "green.50" }}
                flexShrink={0}
                onClick={onEdit}
              >
                <Pencil size={14} />
              </IconButton>
            )}
          </Flex>

          {/* THE LPA NUMBER, directly under the name (user, 2026-09-24). It
              stands where the kit card put the person id, which is the line a
              reader already looks to for "which record is this" — and on this
              screen the answer is the plan, not the person.

              DRAWN TO BE FOUND (user, 2026-09-24), because it is now the only
              place on the panel that says it: the ROP details card used to
              repeat it and no longer does. A tinted pill in the brand green,
              at the body size rather than the caption one — muted grey at 12px
              is what a supporting detail looks like, and this is the key the
              whole screen is filed under. */}
          {/* The insurability badge, when given, sits beside the pill and
              wraps under it if the column is too narrow for both. */}
          <Flex
            justify="center"
            align="center"
            wrap="wrap"
            gap={1.5}
            mt={2}
            minW={0}
          >
            <Flex
              align="center"
              gap={1.5}
              minW={0}
              maxW="full"
              px={2.5}
              py={1}
              borderWidth="1px"
              borderColor="green.200"
              borderRadius="full"
              bg="green.50"
              color={BRAND_COLORS.darkGreen}
            >
              <Box display="flex" flexShrink={0}>
                <IdCard size={14} />
              </Box>
              <Text
                fontFamily="mono"
                fontSize="sm"
                fontWeight="700"
                letterSpacing="0.02em"
                truncate
              >
                {lpaNo}
              </Text>
            </Flex>
            {insurability && (
              <OSPBadge
                type={insurability === "Insurable" ? "success" : "danger"}
              >
                {insurability}
              </OSPBadge>
            )}
          </Flex>
        </Box>

        {/* BIRTHDATE AND AGE in place of the insurability badge (user,
            2026-09-24). Both are facts about the PERSON, so they belong under
            their name where the request's status, pinned to the corner, does
            not. Two cells side by side with a hairline between them, which at
            this width is as much structure as two short facts need.

            THE AGE IS DERIVED, never stored: a stored age is wrong the day
            after it is written. */}
        {birthdate && (
          <Flex
            align="stretch"
            justify="center"
            gap={3}
            w="full"
            borderTopWidth="1px"
            borderColor="gray.100"
            pt={2.5}
          >
            <Fact label="Birthdate" value={formatFiledDate(birthdate)} />
            <Box borderLeftWidth="1px" borderColor="gray.100" />
            <Fact label="Age" value={formatAge(new Date(birthdate))} />
          </Flex>
        )}
      </Flex>
    </Box>
  );
}

export default RopPlanholderCard;
