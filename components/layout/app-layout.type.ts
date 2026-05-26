import { IconType } from "react-icons";

export interface NotificationDataProps {
  id: number;
  title: string;
  description: string;
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
