import { BadgeProps } from "@chakra-ui/react";

export interface OSPBadgeProps extends BadgeProps {
  type?: "success" | "info" | "warning" | "danger" | undefined;
}

interface OSPBadgeColorProps {
  type?: "success" | "info" | "warning" | "danger" | undefined;
  background: string;
  foreground: string;
  border: string;
  color: string;
}

export const OSPBadgeTypes: OSPBadgeColorProps[] = [
  {
    type: undefined,
    background: "#F8F9FA",
    foreground: "#52525B",
    border: "#E4E4E7",
    color: "gray",
  },
  {
    type: "success",
    background: "#F0FDF4",
    foreground: "#16A34A",
    border: "#BBF7D0",
    color: "green",
  },
  {
    type: "info",
    background: "#EFF6FF",
    foreground: "#2563EB",
    border: "#BFDBFE",
    color: "blue",
  },
  {
    type: "warning",
    background: "#FFFBEB",
    foreground: "#D97706",
    border: "#FDE68A",
    color: "yellow",
  },
  {
    type: "danger",
    background: "#FFF1F2",
    foreground: "#E11D48",
    border: "#FECDD3",
    color: "red",
  },
];
