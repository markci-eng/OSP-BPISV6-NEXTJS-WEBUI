import { BadgeProps } from "@chakra-ui/react";

export interface OSPBadgeProps extends BadgeProps {
    type?: "success" | "info" | "warning" | "danger" | undefined;
}

interface OSPBadgeColorProps {
    type?: "success" | "info" | "warning" | "danger" | undefined;
    background: string;
    foreground: string;
    border: string;
} 

export const OSPBadgeTypes: OSPBadgeColorProps[] = [
    {
        type: undefined,
        background: "gray.100",
        foreground: "gray.500",
        border: "gray.100"
    },
    {
        type: "success",
        background: "green.50",
        foreground: "green.600",
        border: "green.300"
    },
    {
        type: "info",
        background: "teal.50",
        foreground: "teal.600",
        border: "teal.100"
    },
    {
        type: "warning",
        background: "yellow.100",
        foreground: "orange.400",
        border: "orange.400"
    },
    {
        type: "danger",
        background: "red.50",
        foreground: "red.600",
        border: "red.100"
    },
]