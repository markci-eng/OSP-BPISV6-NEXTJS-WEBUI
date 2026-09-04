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
    label: "User Access Management",
    displayName: "Access",
    href: "/user-access-management",
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
    icon: RiUser2Line,
    activeIcon: RiUser2Fill,
    label: "Approvals",
    href: "/claims/approvals",
  },
  {
    icon: RiUser2Line,
    activeIcon: RiUser2Fill,
    label: "Planholder Profile",
    href: "/claims/planholder-profile",
    bottomNav: true,
    bottomNavOrder: 3,
    displayName: "Planholder",
  },
  {
    // Death, WOI and Dismemberment are the three natures of a death claim, so
    // they are one group rather than three siblings. The parent has no `href`
    // of its own — the kit treats an item with `subItems` as an accordion and
    // sends the mobile bottom-nav tab to the first sub-item, "Death".
    icon: LiaHandHoldingUsdSolid,
    activeIcon: FaHandHoldingUsd,
    label: "Death Claim",
    displayName: "Death",
    bottomNav: true,
    bottomNavOrder: 2,
    subItems: [
      { label: "Death", href: "/claims/death-claim/death" },
      { label: "WOI", href: "/claims/death-claim/woi" },
      { label: "Dismemberment", href: "/claims/death-claim/dismemberment" },
    ],
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
    bottomNavOrder: 4,
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
