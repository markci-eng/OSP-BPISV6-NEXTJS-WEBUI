"use client";

import { Flex, Menu, Portal } from "@chakra-ui/react";
import { SecondaryMdButton } from "st-peter-ui";
import { BsMenuButtonWide } from "react-icons/bs";
import { ReactNode } from "react";

interface MenuButtonProps {
  children: ReactNode;
}

export default function MenuButton({ children }: MenuButtonProps) {
  return (
    <Menu.Root positioning={{ placement: "bottom-end" }}>
      <Menu.Trigger asChild>
        <SecondaryMdButton>
          <BsMenuButtonWide />
          Menu
        </SecondaryMdButton>
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content>{children}</Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

interface MenuItemButtonProps {
  icon: ReactNode;
  label: string;
  itemKey: string;
  value: string;
  onClick: () => void;
}

export function MenuItemButton({
  icon,
  label,
  itemKey,
  value,
  onClick,
}: MenuItemButtonProps) {
  return (
    <Menu.Item key={itemKey} value={value} asChild onClick={onClick}>
      <Flex>
        {icon}
        {label}
      </Flex>
    </Menu.Item>
  );
}
