import { IconType } from "react-icons";

export type NotificationType = "request" | "system" | "approval" | "payment" | "document" | "alert";

export interface NotificationDataProps {
  id: number;
  title: string;
  description: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
}

export type SidebarProps = {
  isOpen: boolean;
  onClose?: () => void;
};

export type NavItem = {
  label: string;
  icon: IconType;
  activeIcon?: IconType;
  href?: string;
  onClick?: () => void;
  subItems?: {
    label: string;
    href: string;
    onClick?: () => void;
  }[];
};
