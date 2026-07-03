import { NotificationDataProps } from "@/claude components/layout/app-layout.type";

export const Notifications: NotificationDataProps[] = [
  {
    id: 1,
    title: "New Request",
    description: "John Dela Cruz submitted a reinstatement request.",
    type: "request",
    timestamp: "2m ago",
    read: false,
  },
  {
    id: 2,
    title: "Pending Approval",
    description: "DRS batch #00123 is awaiting your approval.",
    type: "approval",
    timestamp: "15m ago",
    read: false,
  },
  {
    id: 3,
    title: "System Update",
    description: "OSP was updated to version 6.2.1 successfully.",
    type: "system",
    timestamp: "1h ago",
    read: false,
  },
  {
    id: 4,
    title: "Payment Validated",
    description: "Payment for LPA-2026-00456 has been validated.",
    type: "payment",
    timestamp: "Yesterday",
    read: true,
  },
];
