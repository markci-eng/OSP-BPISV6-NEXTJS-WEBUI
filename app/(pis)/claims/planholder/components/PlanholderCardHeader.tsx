"use client";

// WHO A CARD OF PLANHOLDER FACTS IS ABOUT — the top band of that card, not a
// card of its own (user, 2026-10-02: "combine this card since they are in the
// same group"). The photo, the name surname-first, the LPA and Insurable.
//
// THE ADDRESS AND CONTACT ARE BEHIND ONE ICON beside Insurable (user, same day:
// "the address and contact number is not that important … an icon to view it",
// "the icon is for both the address and contact"). The address is too long to
// sit in a header or a row. A tap opens a bottom sheet on a phone; on a desktop a
// hover card shows them, and stays while the pointer moves onto it to copy.
//
// Both triggers are always rendered and switched by CSS at `lg`, not by
// `useBreakpointValue` — see `InfoLabel` for why.

import { useState, type ReactNode } from "react";
import { Box, Flex, HoverCard, IconButton, Portal, Text } from "@chakra-ui/react";
import { LuContactRound, LuMapPin, LuPhone } from "react-icons/lu";
import { BrandedAvatar, OSPBadge } from "osp-ui-kit";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { mockAvatarUrl } from "@/lib/mock-avatar";
import { BottomSheet } from "../../components/bottom-sheet";
import { EDIT_FIELD_ATTR } from "../../components/edit-mark";
import { toSurnameFirst, type Planholder } from "../../claims-data";

/** One line of the address/contact list: icon, label over value, Copy. */
function ContactLine({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Flex align="center" gap={3}>
      <Flex
        boxSize="28px"
        flexShrink={0}
        align="center"
        justify="center"
        borderRadius="full"
        bg="gray.100"
        color="gray.500"
      >
        {icon}
      </Flex>
      <Box flex={1} minW={0}>
        <Text fontSize="xs" color="gray.500">
          {label}
        </Text>
        <Text fontSize="sm" fontWeight="medium" color="gray.800" wordBreak="break-word">
          {value || "—"}
        </Text>
      </Box>
      {value && (
        <Box
          as="button"
          flexShrink={0}
          fontSize="xs"
          fontWeight="semibold"
          color={BRAND_COLORS.primaryGreen}
          px={1}
          py={2}
          onClick={() => {
            navigator.clipboard?.writeText(value).then(
              () => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1400);
              },
              () => undefined,
            );
          }}
        >
          {copied ? "Copied" : "Copy"}
        </Box>
      )}
    </Flex>
  );
}

function ContactList({
  address,
  mobile,
}: {
  address?: string;
  mobile?: string;
}) {
  return (
    <Flex direction="column" gap={3}>
      <ContactLine icon={<LuMapPin size={14} />} label="Home address" value={address} />
      <Box borderTopWidth="1px" borderColor="gray.100" />
      <ContactLine icon={<LuPhone size={14} />} label="Mobile" value={mobile} />
    </Flex>
  );
}

const ICON_BUTTON_PROPS = {
  "aria-label": "View address and contact",
  size: "xs",
  variant: "outline",
  borderRadius: "full",
  color: BRAND_COLORS.primaryGreen,
  borderColor: "gray.200",
  // The outline variant fills with the theme colour on hover, which hides the
  // green glyph; a pale tint keeps it readable.
  _hover: { bg: "green.50", borderColor: "green.100" },
  _expanded: { bg: "green.50", borderColor: "green.100" },
  // Pulled into the line so the 32px target does not make the row taller.
  my: -1.5,
} as const;

export function PlanholderCardHeader({
  planholder,
  edits,
}: {
  planholder: Planholder;
  /**
   * The edited-fields icon (`EditedFieldsButton`), when the screen tracks edits
   * to this planholder. It sits just left of the contact icon, which keeps the
   * far right; it renders nothing while there are no edits.
   */
  edits?: ReactNode;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const person = planholder.person;
  const address = person?.addresses.find(
    (a) => !/office|work|business/i.test(a.addressType),
  )?.formatted;
  const mobile = person?.contacts.find(
    (c) => c.isActive && c.contactType === "mobile",
  )?.contactDetails;

  const insurable = (
    <OSPBadge size="sm" type={planholder.insurability ? "success" : "danger"}>
      {planholder.insurability ? "Insurable" : "Not Insurable"}
    </OSPBadge>
  );

  return (
    <Flex align="center" gap={3} minW={0}>
      <BrandedAvatar
        name={planholder.name ? toSurnameFirst(planholder.name) : undefined}
        imageUrl={mockAvatarUrl(planholder.personId)}
        size="sm"
        ringed
        ringPadding="3px"
        flexShrink={0}
      />

      {/* Takes the free width, so the badges sit at the card's right edge
          (user, 2026-10-02: "make it in the right most"). */}
      <Box minW={0} flex={1}>
        {/* Tagged so an edit to a part of the name can ring it on a phone, where
            the name's parts are in the details sheet, not on the card. */}
        <Text
          fontWeight="bold"
          fontSize="md"
          lineHeight="1.2"
          lineClamp={2}
          {...{ [EDIT_FIELD_ATTR]: "name" }}
        >
          {planholder.name ? toSurnameFirst(planholder.name) : planholder.lpaNo}
        </Text>
        {/* ON A PHONE INSURABLE SITS ON THE LPA LINE. Beside the name with the
            icon, the name had about twelve letters before it clipped. */}
        <Flex align="center" gap={2} mt={1} wrap="wrap">
          <Text fontSize="xs" color="gray.500">
            # {planholder.lpaNo}
          </Text>
          <Box display={{ base: "block", lg: "none" }}>{insurable}</Box>
        </Flex>
      </Box>

      {/* Centred on a phone, where only the icon is here; level with the name
          on a desktop, where Insurable sits beside it. */}
      <Flex
        align="center"
        gap={2}
        flexShrink={0}
        alignSelf={{ base: "center", lg: "flex-start" }}
      >
        <Box display={{ base: "none", lg: "block" }}>{insurable}</Box>

        {edits}

        {/* Phone: tap → sheet. */}
        <IconButton
          {...ICON_BUTTON_PROPS}
          display={{ base: "inline-flex", lg: "none" }}
          onClick={() => setSheetOpen(true)}
        >
          <LuContactRound />
        </IconButton>

        {/* Desktop: hover → card. */}
        <Box display={{ base: "none", lg: "block" }}>
          <HoverCard.Root
            openDelay={150}
            closeDelay={200}
            positioning={{ placement: "bottom-start" }}
          >
            <HoverCard.Trigger asChild>
              <IconButton {...ICON_BUTTON_PROPS}>
                <LuContactRound />
              </IconButton>
            </HoverCard.Trigger>
            <Portal>
              <HoverCard.Positioner>
                <HoverCard.Content w="320px" p={3}>
                  <ContactList address={address} mobile={mobile} />
                </HoverCard.Content>
              </HoverCard.Positioner>
            </Portal>
          </HoverCard.Root>
        </Box>
      </Flex>

      <BottomSheet
        title="Address & Contact"
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      >
        <Box bg="white" borderRadius="xl" borderWidth="1px" borderColor="gray.200" p={4}>
          <ContactList address={address} mobile={mobile} />
        </Box>
      </BottomSheet>
    </Flex>
  );
}

export default PlanholderCardHeader;
