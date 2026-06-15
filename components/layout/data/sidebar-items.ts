import { NavItem } from "../app-layout.type";
import {
  HiCurrencyDollar,
  HiOutlineCurrencyDollar,
  HiOutlineUsers,
  HiUsers,
} from "react-icons/hi2";
import { HiOutlineDocumentReport } from "react-icons/hi";
import {
  MdManageAccounts,
  MdOutlineManageAccounts,
  MdOutlinePayment,
  MdOutlinePayments,
} from "react-icons/md";
import { LiaHandHoldingUsdSolid } from "react-icons/lia";
import {
  BsFileEarmarkExcel,
  BsFileEarmarkExcelFill,
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
import { LuClipboardCheck } from "react-icons/lu";

export const SideBarItemsBranch: NavItem[] = [
  {
    icon: RiHome4Line,
    activeIcon: RiHome4Fill,
    label: "Home",
    href: "/",
  },
  {
    icon: RiFileCheckLine,
    activeIcon: RiFileCheckFill,
    label: "Approvals",
    href: "/approvals",
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
      { label: "Account Summary", href: "/plan-management/planholder" },
      { label: "Change of Mode", href: "/plan-management/change-of-mode" },
    ],
  },
  {
    icon: HiOutlineCurrencyDollar,
    activeIcon: HiCurrencyDollar,
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

  {
    icon: LiaHandHoldingUsdSolid,
    activeIcon: FaHandHoldingUsd,
    label: "Loan",
    href: "/loan",
  },

  {
    icon: MdOutlineManageAccounts,
    activeIcon: MdManageAccounts,
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
    icon: RiDashboardLine,
    activeIcon: RiDashboardFill,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: HiOutlineCurrencyDollar,
    activeIcon: HiCurrencyDollar,
    label: "View MCPR",
    href: "/accounts-maintenance/mcpr",
  },
  {
    icon: HiOutlineCurrencyDollar,
    activeIcon: HiCurrencyDollar,
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
  },
  {
    icon: RiDashboardLine,
    label: "Disbursement",
    href: "/disbursement/comte",
  },
  {
    label: "Plan Management",
    icon: HiOutlineUsers,
    activeIcon: HiUsers,
    subItems: [
      { label: "Add New Sale", href: "/plan-management/new" },
      { label: "Account Summary", href: "/plan-management/planholder" },
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

export const SideBarItemsBMSTL: NavItem[] = [
  {
    icon: RiDashboardLine,
    activeIcon: RiDashboardFill,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: LuClipboardCheck,
    activeIcon: LuClipboardCheck,
    label: "Approvals",
    href: "/approvals",
  },
];
