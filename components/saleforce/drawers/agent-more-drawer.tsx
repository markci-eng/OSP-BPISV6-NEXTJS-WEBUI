// Change or Add by: JLO 2026-05-16
"use client";

import { useState } from "react";
import {
  Button,
  Drawer,
  DrawerContent,
  Flex,
  Portal,
  Text,
} from "@chakra-ui/react";
import {
  LuArrowLeft,
  LuChevronRight,
  LuMenu,
  LuPrinter,
  LuShare2,
} from "react-icons/lu";
import ReferralPage from "../pages/referral-page";

type View = "menu" | "print" | "referral";

const menuItems: {
  key: Exclude<View, "menu">;
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "print", label: "Print", icon: <LuPrinter /> },
  { key: "referral", label: "Referral", icon: <LuShare2 /> },
];

const AgentMoreDrawer = () => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");

  const title =
    view === "menu" ? "More" : view === "print" ? "Print" : "Referral";

  return (
    <Drawer.Root
      size="full"
      open={open}
      onOpenChange={(e) => {
        setOpen(e.open);
        if (!e.open) setView("menu");
      }}
    >
      <Drawer.Trigger asChild>
        <Button
          bg="none"
          color="gray.500"
          fontWeight="600"
          letterSpacing={-0.5}
          fontSize="11px"
          flex="1"
          py={6}
          _open={{ bg: "gray.50" }}
          transition="backgrounds 100ms ease"
          borderRadius="none"
        >
          <LuMenu />
        </Button>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Positioner>
          <DrawerContent>
            <Drawer.Header
              paddingBottom={0}
              paddingTop={2}
              transform="translateX(-15px)"
            >
              {view === "menu" ? (
                <Drawer.CloseTrigger asChild>
                  <Button
                    paddingX={1}
                    bg="none"
                    color="gray.500"
                    position="initial"
                  >
                    <LuArrowLeft />
                  </Button>
                </Drawer.CloseTrigger>
              ) : (
                <Button
                  paddingX={1}
                  bg="none"
                  color="gray.500"
                  position="initial"
                  onClick={() => setView("menu")}
                >
                  <LuArrowLeft />
                </Button>
              )}
              <Text
                fontSize="16px"
                fontWeight="bold"
                letterSpacing={-0.2}
                color="gray.500"
              >
                {title}
              </Text>
            </Drawer.Header>
            <Drawer.Body borderTopWidth={1} borderTopColor="gray.200">
              {view === "menu" && (
                <Flex flexDir="column" pt={2}>
                  {menuItems.map((item) => (
                    <Flex
                      key={item.key}
                      as="button"
                      align="center"
                      justify="space-between"
                      py={4}
                      borderBottomWidth={1}
                      borderColor="gray.100"
                      color="gray.600"
                      cursor="pointer"
                      onClick={() => setView(item.key)}
                    >
                      <Flex align="center" gap={3}>
                        {item.icon}
                        <Text fontSize="14px" fontWeight="600">
                          {item.label}
                        </Text>
                      </Flex>
                      <LuChevronRight />
                    </Flex>
                  ))}
                </Flex>
              )}

              {view === "print" && (
                <Flex
                  py={10}
                  justify="center"
                  align="center"
                  color="gray.400"
                  flexDir="column"
                  gap={2}
                >
                  <LuPrinter size={32} />
                  <Text fontSize="14px">Reprint SFID</Text>
                </Flex>
              )}

              {view === "referral" && <ReferralPage />}
            </Drawer.Body>
          </DrawerContent>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default AgentMoreDrawer;
