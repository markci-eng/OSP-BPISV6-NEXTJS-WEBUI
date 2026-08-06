"use client";

import { Box } from "@chakra-ui/react";
import { ProfileHeaderCard } from "osp-ui-kit";
import { mockAvatarUrl } from "@/lib/mock-avatar";
import { toSurnameFirst, type Planholder } from "../../claims-data";

/**
 * Width below which the card's STACKED layout is the right one.
 *
 * Measured, not chosen: the wide layout gives the contact pane whatever is left
 * after the avatar block's fixed 210px, and this plan holder's address needs
 * about 590 of it. Under ~800px of card, values start truncating — three of
 * them by 420px, which is what the create form's rail was showing.
 */
const STACK_BELOW = "800px";

/**
 * Plan holder header built on the shared {@link ProfileHeaderCard} — the same
 * profile treatment used by the Sales Agent and Plan Management profiles. Maps
 * the claims {@link Planholder} view-model onto the card's props: name is
 * rendered surname-first, and the address / contact channels are pulled off the
 * owning Person record.
 *
 * It also decides WHICH of the card's two layouts to use, because the card
 * itself decides on the window's width — right when a card is the width of the
 * page, wrong everywhere this area puts one in a column. A 360px rail on a
 * 1512px screen would get the wide layout and squeeze the contact rows into a
 * strip a letter wide.
 *
 * Both layouts are always rendered and switched with `display`, so a container
 * query flips that decision on the CARD's own width instead: stacked under
 * {@link STACK_BELOW}, the card's own choice above it. Nothing is restyled, and
 * every caller gets a card that fits wherever it is put — the page, a column,
 * a rail or a drawer — with no prop to remember to pass.
 */
export function PlanholderProfileHeader({
  planholder,
}: {
  planholder: Planholder;
}) {
  const person = planholder.person;

  // The mock data only files "Home" addresses, so anything not explicitly an
  // office address falls back to the home slot.
  const isOffice = (type: string) => /office|work|business/i.test(type);
  const homeAddress = person?.addresses.find(
    (a) => !isOffice(a.addressType),
  )?.formatted;
  const officeAddress = person?.addresses.find((a) =>
    isOffice(a.addressType),
  )?.formatted;

  const activeContact = (type: "mobile" | "phone" | "email") =>
    person?.contacts.find((c) => c.isActive && c.contactType === type)
      ?.contactDetails;

  return (
    <Box
      css={{
        // The card becomes its own measuring stick; the query below reads this
        // box's width rather than the window's.
        containerType: "inline-size",
        [`@container (max-width: ${STACK_BELOW})`]: {
          // First child is the stacked layout, second is the wide one. Under the
          // threshold the window's own answer is overruled; above it, neither
          // rule applies and the card decides for itself.
          "& > div > div:first-of-type": { display: "block" },
          "& > div > div:nth-of-type(2)": { display: "none" },
        },
      }}
    >
      <ProfileHeaderCard
        name={planholder.name ? toSurnameFirst(planholder.name) : undefined}
        personId={planholder.lpaNo}
        avatarUrl={mockAvatarUrl(planholder.personId)}
        isInsured={planholder.insurability}
        homeAddress={homeAddress}
        officeAddress={officeAddress}
        contactNo={activeContact("mobile")}
        landlineNo={activeContact("phone")}
        email={activeContact("email")}
      />
    </Box>
  );
}

export default PlanholderProfileHeader;
