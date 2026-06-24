import React from "react";

export type NotificationType =
  | "request"
  | "system"
  | "approval"
  | "payment"
  | "document"
  | "alert";

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

/** Compatible with both react-icons (IconType) and lucide-react (LucideIcon). */
export type AppIcon = React.ComponentType<{
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}>;

export type NavItem = {
  label: string;
  /** Short label shown only in the mobile bottom navbar. Falls back to label if omitted. */
  displayName?: string;
  icon: AppIcon;
  activeIcon?: AppIcon;
  href?: string;
  bottomNav?: boolean;
  onClick?: () => void;
  subItems?: {
    label: string;
    displayName?: string;
    href: string;
    onClick?: () => void;
    bottomNav?: boolean;
  }[];
};
