import {
  HiOutlineShieldCheck,
  HiOutlineUsers,
  HiShieldCheck,
  HiUsers,
} from "react-icons/hi2";
import { PesoOutlineIcon, PesoSolidIcon } from "../icons/peso-icons";
import { McprOutlineIcon, McprSolidIcon } from "../icons/mcpr-icons";

import { LiaHandHoldingUsdSolid } from "react-icons/lia";
import {
  BsFileEarmarkExcel,
  BsFileEarmarkExcelFill,
  BsFileEarmarkMinus,
  BsFileEarmarkMinusFill,
  BsFileEarmarkPlus,
  BsFileEarmarkPlusFill,
  BsFileEarmarkSpreadsheet,
  BsFileEarmarkSpreadsheetFill,
} from "react-icons/bs";
import {
  RiBookShelfFill,
  RiBookShelfLine,
  RiClipboardFill,
  RiClipboardLine,
  RiDashboardFill,
  RiDashboardLine,
  RiFileCheckFill,
  RiFileCheckLine,
  RiHome4Fill,
  RiHome4Line,
  RiToolsFill,
  RiToolsLine,
  RiUser2Fill,
  RiUser2Line,
} from "react-icons/ri";
import { FaHandHoldingUsd } from "react-icons/fa";
import { BiCoin, BiSolidCoin } from "react-icons/bi";
import { TbReceiptDollar, TbReceiptDollarFilled } from "react-icons/tb";
import { MdOutlineSyncLock } from "react-icons/md";
import { NavItem } from "osp-ui-kit";

export const SideBarItemsBranch: NavItem[] = [
  {
    icon: RiHome4Line,
    activeIcon: RiHome4Fill,
    label: "Home",
    href: "/",
    bottomNav: true,
  },
  {
    icon: RiFileCheckLine,
    activeIcon: RiFileCheckFill,
    label: "Approvals",
    href: "/approvals",
    bottomNav: true,
  },
  {
    icon: RiUser2Line,
    activeIcon: RiUser2Fill,
    label: "Sales Agent Management",
    displayName: "Agents",
    subItems: [
      {
        label: "Sales Agent Profile",
        href: "/sales-force/profile",
        displayName: "Agents",
      },
      {
        label: "Re-Organization",
        href: "/sales-force/re-assign",
      },
      {
        label: "Add New Sales Agent",
        href: "/sales-force/new",
      },
      {
        label: "Contract and SFID Renewal",
        href: "/sales-force/sale-force-printing",
      },
    ],
  },
  {
    label: "Document Management",
    icon: RiBookShelfLine,
    activeIcon: RiBookShelfFill,
    href: "/document-management",
    displayName: "Docs",
    // subItems: [
    //   // {1
    //   //   label: "Assign Documents",
    //   //   href: "/document-management/assign-documents",
    //   // },
    //   // {
    //   //   label: "Document Management",
    //   //   href: "/document-management",
    //   // },
    //   // {
    //   //   label: "Document Reassignment",
    //   //   href: "/document-management/document-reassignment",
    //   // },
    // ],
  },
  {
    label: "Plan Management",
    icon: HiOutlineUsers,
    activeIcon: HiUsers,
    subItems: [
      { label: "Add New Sale", href: "/plan-management/new" },
      {
        label: "Planholder Profile",
        href: "/plan-management/planholder",
        displayName: "Planholder",
        bottomNav: true,
      },
      { label: "Change of Mode", href: "/plan-management/change-of-mode" },
    ],
  },
  {
    icon: PesoOutlineIcon,
    activeIcon: PesoSolidIcon,
    label: "Payment",
    subItems: [
      { label: "Encode Payment", href: "/payment/encode-payment" },
      { label: "View DRS", href: "/payment/view-drs" },
      {
        label: "Encode Validated Deposit Slip",
        href: "/payment/encodevalidated-deposit",
      },
      {
        label: "View Encoded Deposit Slip",
        href: "/payment/viewvalidated-deposit",
      },
      { label: "Request Credit Memo", href: "/payment/credit-memo" },
    ],
    bottomNav: true,
  },

  {
    icon: BsFileEarmarkSpreadsheet,
    activeIcon: BsFileEarmarkSpreadsheetFill,
    label: "Disbursement",
    subItems: [
      { label: "COM/TE", href: "/disbursement/comte" },
      { label: "Revolving Fund Expense", href: "/disbursement/rfexpense" },
    ],
  },

  // {
  //   icon: LiaHandHoldingUsdSolid,
  //   activeIcon: FaHandHoldingUsd,
  //   label: "Loan",
  //   href: "/loan",
  // },

  {
    icon: McprOutlineIcon,
    activeIcon: McprSolidIcon,
    label: "Accounts Maintenance",
    subItems: [
      { label: "MCPR", href: "/accounts-maintenance/mcpr" },
      {
        label: "Next Month Loading",
        href: "/accounts-maintenance/next-month-loading",
      },
      {
        label: "Floating Accounts",
        href: "/accounts-maintenance/floating-accounts",
      },
      {
        label: "Transfer of Accounts",
        href: "/accounts-maintenance/accounts-transfer",
      },
    ],
  },
  {
    icon: HiOutlineShieldCheck,
    activeIcon: HiShieldCheck,
    label: "Access Group Management",
    displayName: "Access",
    subItems: [
      {
        label: "Access Groups",
        href: "/role-access-management/access-groups",
        displayName: "Groups",
      },
      {
        label: "User Assignment",
        href: "/role-access-management/user-assignment",
        displayName: "Assign",
      },
    ],
  },

  // {
  //   icon: MdOutlineAppRegistration,
  //   label: "STL Approval",
  //   href: "/stl-approval",
  // },

  // {
  //   icon: HiOutlineDocumentReport,
  //   label: "Reports",
  //   href: "/reports",
  // },

  // {
  //   icon: LuSettings2,
  //   label: "Utilities",
  //   href: "/utilities",
  // },
];

export const SideBarItemsEKolekta: NavItem[] = [
  {
    icon: RiHome4Line,
    activeIcon: RiHome4Fill,
    label: "Home",
    href: "/",
    displayName: "Home",
    bottomNav: true,
  },
  {
    icon: McprOutlineIcon,
    activeIcon: McprSolidIcon,
    label: "View MCPR",
    href: "/accounts-maintenance/mcpr",
    displayName: "MCPR",
    bottomNav: true,
  },
  {
    icon: PesoOutlineIcon,
    activeIcon: PesoSolidIcon,
    label: "Payment",
    subItems: [
      {
        label: "Encode Payment",
        href: "/payment/encode-payment",
        displayName: "Payment",
        bottomNav: true,
      },
      { label: "View DRS", href: "/payment/view-drs" },
      {
        label: "Encode Validated Deposit Slip",
        href: "/payment/encodevalidated-deposit",
      },
      {
        label: "View Encoded Deposit Slip",
        href: "/payment/viewvalidated-deposit",
      },
      { label: "Request Credit Memo", href: "/payment/credit-memo" },
    ],
  },
  {
    icon: BiCoin,
    activeIcon: BiSolidCoin,
    label: "Disbursement",
    href: "/disbursement/comte",
    displayName: "Com/TE",
  },
  {
    label: "Plan Management",
    icon: HiOutlineUsers,
    activeIcon: HiUsers,
    subItems: [
      { label: "Add New Sale", href: "/plan-management/new" },
      {
        label: "Planholder Profile",
        href: "/plan-management/planholder",
        displayName: "Planholder",
        bottomNav: true,
      },
      { label: "Pre-filled LPA", href: "/plan-management/new" },
      { label: "Change of Mode", href: "/plan-management/change-of-mode" },
    ],
  },
  {
    icon: BsFileEarmarkExcel,
    activeIcon: BsFileEarmarkExcelFill,
    label: "Document Cancellation",
    href: "/dc",
  },
];

/*
 * THE ORDER ON SCREEN IS `bottomNavOrder`, NOT THE ORDER OF THIS ARRAY, and the
 * two disagreed here for months without showing it.
 *
 * `AppLayout` sorts the items it is given — `(a.bottomNavOrder ?? Infinity) -
 * (b.bottomNavOrder ?? Infinity)` — and it sorts IN PLACE, so the array exported
 * from this module is reordered by the first render and the desktop rail draws
 * that order too. A reader editing this file would move an entry up, see nothing
 * change, and have no way of knowing why.
 *
 * SO EVERY ITEM CARRIES ONE, INCLUDING APPROVALS, which has no bottom nav entry
 * of its own. Without a number it sorted at Infinity, which is the only reason it
 * sat at the foot of the rail — an accident that the moment anything else lost
 * its number would have been two items fighting over last place.
 *
 * The array is written in the order the numbers produce, so the file reads the
 * way the screen does.
 */
export const SideBarItemsClaims: NavItem[] = [
  {
    icon: RiHome4Line,
    activeIcon: RiHome4Fill,
    label: "Home",
    href: "/claims",
    bottomNav: true,
    bottomNavOrder: 1,
  },
  {
    // ONE ENTRY, NOT A GROUP. Death, WOI and Dismemberment are the three
    // natures of a death claim, and they were three sub-items here — an
    // accordion over one built screen and two "coming soon" stubs.
    //
    // THE NATURE IS A FILTER, NOT A DESTINATION, which is what makes the group
    // redundant rather than merely early. The page serves one claim at a time
    // out of a priority queue, and which nature that claim is belongs to the
    // list it was drawn from: `NatureSelect` sits on the toolbar of the claim
    // pop-up, and `isNatureBuilt` is what says a nature has no module yet. A
    // route per nature asked the same question a second time, in a place where
    // two of the three answers were a sentence apologising for themselves.
    icon: LiaHandHoldingUsdSolid,
    activeIcon: FaHandHoldingUsd,
    label: "Death Claim",
    displayName: "Death",
    href: "/claims/death-claim",
    bottomNav: true,
    bottomNavOrder: 2,
  },
  {
    // ONE ENTRY, NOT A GROUP — unlike Death Claim above, and deliberately.
    //
    // The module's four stages have routes of their own, and they were briefly
    // listed here as sub-items. They are not any more: the dashboard is the way
    // in to this module, and every stage is reached from it. A sidebar branch
    // offering a second way past it would let a user arrive at a stage without
    // the figures that say whether it is worth opening.
    icon: PesoOutlineIcon,
    activeIcon: PesoSolidIcon,
    label: "Service Payables",
    href: "/claims/service-payables",
    bottomNav: true,
    displayName: "Service",
    bottomNavOrder: 3,
  },
  {
    // NUMBERED THOUGH IT HAS NO BOTTOM NAV ENTRY — see the note above. The
    // number is what orders the DESKTOP rail; `bottomNav` is what decides
    // whether a phone also gets a tab for it, and these two facts share one
    // field. Without this, Approvals sorts at Infinity and the entry below it
    // could never reach the foot of the list.
    icon: RiUser2Line,
    activeIcon: RiUser2Fill,
    label: "Approvals",
    href: "/claims/approvals",
    bottomNavOrder: 4,
  },
  {
    // LAST IN THE RAIL (user, 2026-09-14: "make the planholder at the bottom").
    //
    // It is the odd one out among these entries and the order now says so: the
    // other four are QUEUES OF WORK — a dashboard over them, then claims,
    // payables and approvals, in the sequence a claim passes through. The plan
    // holder profile is a LOOK-UP: opened when a caller asks about somebody,
    // not worked through, and mostly reached from the record that names them
    // rather than from this rail at all.
    //
    // THE PHONE'S BOTTOM BAR MOVES WITH IT — one field orders both, so it goes
    // from third of the four tabs to last. That is the right answer there for
    // the same reason it is here, and the alternative is worse than either
    // order: a look-up sitting third on the phone and fifth on the desktop is
    // the same rail teaching two different maps to one user.
    icon: RiUser2Line,
    activeIcon: RiUser2Fill,
    label: "Planholder Profile",
    href: "/claims/planholder-profile",
    bottomNav: true,
    bottomNavOrder: 5,
    displayName: "Planholder",
  },
  {
    // BELOW THE PLANHOLDER, AND IT DOES NOT CONTRADICT "MAKE THE PLANHOLDER AT
    // THE BOTTOM" (user, 2026-09-14) — because that instruction was about the
    // rail of WORK, and this entry has no `bottomNav`.
    //
    // The phone is the half that instruction was really about, and the phone
    // never sees this: its tabs are the `bottomNav` items, so Planholder is
    // still the last one there. On the desktop rail it now sits sixth, which is
    // where setup belongs — the five above it are places a claim is worked or
    // looked up, and this is where the rules those five obey are edited.
    //
    // A CATEGORY, NOT A TASK, unlike every other entry here. Territory
    // assignment is the only view in it today; the reference tables that follow
    // it (nature codes, holiday calendars, rate tables) become views inside the
    // same page rather than entries of their own, so this rail stops growing at
    // six.
    icon: RiToolsLine,
    activeIcon: RiToolsFill,
    label: "Utilities",
    href: "/claims/utilities",
    bottomNavOrder: 6,
  },
];

export const SideBarItemsAMD: NavItem[] = [
  {
    icon: RiHome4Line,
    activeIcon: RiHome4Fill,
    label: "Home",
    href: "/accounts-management",
    bottomNav: true,
  },
  {
    icon: RiFileCheckLine,
    activeIcon: RiFileCheckFill,
    label: "Approvals",
    href: "/accounts-management/approvals",
    bottomNav: true,
  },
  {
    icon: RiUser2Line,
    activeIcon: RiUser2Fill,
    label: "Planholder Profile",
    href: "/accounts-management/planholder-profile",
    displayName: "Planholder",
    bottomNav: true,
  },
  {
    icon: MdOutlineSyncLock,
    activeIcon: MdOutlineSyncLock,
    label: "RITF",
    href: "/accounts-management/ritf",
    bottomNav: true,
  },
  {
    icon: TbReceiptDollar,
    activeIcon: TbReceiptDollarFilled,
    label: "ROP",
    href: "/accounts-management/rop",
  },
  {
    icon: BsFileEarmarkExcel,
    activeIcon: BsFileEarmarkExcelFill,
    label: "Plan Termination",
    href: "/accounts-management/plan-termination",
  },
  {
    icon: BsFileEarmarkSpreadsheet,
    activeIcon: BsFileEarmarkSpreadsheetFill,
    label: "CSV",
    href: "/accounts-management/csv",
  },
  {
    icon: RiClipboardLine,
    activeIcon: RiClipboardFill,
    label: "COFP",
    href: "/accounts-management/cofp",
  },
  {
    icon: BsFileEarmarkPlus,
    activeIcon: BsFileEarmarkPlusFill,
    label: "Credit Memo",
    href: "/accounts-management/credit-memo",
  },
  {
    icon: BsFileEarmarkMinus,
    activeIcon: BsFileEarmarkMinusFill,
    label: "Debit Memo",
    href: "/accounts-management/debit-memo",
  },
];

export const SideBarItemsBM: NavItem[] = [
  {
    icon: RiHome4Line,
    activeIcon: RiHome4Fill,
    label: "Home",
    href: "/",
    bottomNav: true,
  },
  {
    icon: RiFileCheckLine,
    activeIcon: RiFileCheckFill,
    label: "Approvals",
    href: "/approvals",
    bottomNav: true,
  },
];

export const SideBarItemsSTL: NavItem[] = [
  {
    icon: RiHome4Line,
    activeIcon: RiHome4Fill,
    label: "Home",
    href: "/",
    bottomNav: true,
  },
  {
    icon: RiFileCheckLine,
    activeIcon: RiFileCheckFill,
    label: "Approvals",
    href: "/approvals",
    bottomNav: true,
  },
];
