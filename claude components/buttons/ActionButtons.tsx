"use client";

import { Button, Flex } from "@chakra-ui/react";
import { BiCaretDown } from "react-icons/bi";
import React, { useState } from "react";
import BottomQuickActions, {
  type QuickAction,
} from "../drawer/bottom-quick-actions";

export type ActionButtonItem =
  | {
      type?: "action";
      label: string;
      href?: string;
      onClick?: () => void;
      icon: React.ElementType;
      description?: string;
      iconBg?: string;
      iconColor?: string;
      colorScheme?: string;
      variant?: "outline" | "solid" | "ghost";
    }
  | {
      type: "separator";
    };

type ActionButtonsProps = {
  buttons: ActionButtonItem[];
  /** Sheet heading — defaults to "Quick actions" */
  title?: string;
  /** Muted subtext below the sheet title */
  subtitle?: string;
};

export default function ActionButtons({
  buttons,
  title = "Quick actions",
  subtitle,
}: ActionButtonsProps) {
  const [open, setOpen] = useState(false);

  const actions: QuickAction[] = buttons
    .filter((btn): btn is Extract<ActionButtonItem, { type?: "action" }> =>
      btn.type !== "separator",
    )
    .map((btn) => ({
      icon: btn.icon as QuickAction["icon"],
      label: btn.label,
      description: btn.description,
      href: btn.href,
      onClick: btn.onClick,
      iconBg: btn.iconBg,
      iconColor: btn.iconColor,
    }));

  return (
    <Flex>
      <Button
        size="sm"
        variant="solid"
        borderRadius="15px"
        px="15px"
        onClick={() => setOpen(true)}
      >
        Actions <BiCaretDown />
      </Button>

      <BottomQuickActions
        open={open}
        onOpenChange={setOpen}
        title={title}
        subtitle={subtitle}
        actions={actions}
      />
    </Flex>
  );
}
