// The icon each billing stage is drawn with.
//
// Its own module, small as it is, because two unrelated places need it and
// neither should have to import the other to get it: the dashboard's stage tabs
// and the stage pages' own headings. Putting it in `service-payables-data` would
// pull `react-icons` into a module that is otherwise pure model, and putting it
// in `BillingQueueSection` would make a placeholder page depend on the whole
// queue — a router, two tables and a card grid — to draw one glyph.

import {
  LuCircleCheckBig,
  LuFileClock,
  LuInbox,
  LuShieldCheck,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import type { BillingStage } from "./service-payables-data";

export const STAGE_ICONS: Record<BillingStage, IconType> = {
  "for-process": LuInbox,
  processed: LuFileClock,
  verified: LuShieldCheck,
  approved: LuCircleCheckBig,
};
