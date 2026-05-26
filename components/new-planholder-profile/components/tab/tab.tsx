"use client";
import { Box, ScrollArea, Tabs, useBreakpointValue } from "@chakra-ui/react";
import { ReactNode, useState } from "react";
import { IconType } from "react-icons";

export interface TabItem {
  icon: IconType;
  label: string;
  value: string;
  page: ReactNode;
}

export function Tab({ tabItems }: { tabItems: TabItem[] }) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [selectedTab, setSelectedTab] = useState(tabItems[0].value);

  return (
    <Tabs.Root
      value={selectedTab}
      onValueChange={(e) => setSelectedTab(e.value)}
      variant="enclosed"
      defaultValue={"plan-details"}
      maxW={"full"}
    >
      <ScrollArea.Root width={"full"} size={"sm"}>
        <ScrollArea.Viewport
          css={{
            "--scroll-shadow-size": "2rem",

            maskImage: "linear-gradient(to right, #000, #000)",

            "&[data-overflow-x]": {
              maskImage: `
        linear-gradient(
          to right,
          transparent,
          #000 var(--scroll-shadow-size),
          #000 calc(100% - var(--scroll-shadow-size)),
          transparent
        )
      `,
            },

            "&[data-overflow-x][data-at-left]": {
              maskImage: `
        linear-gradient(
          to right,
          #000 calc(100% - var(--scroll-shadow-size)),
          transparent
        )
      `,
            },

            "&[data-overflow-x][data-at-right]": {
              maskImage: `
        linear-gradient(
          to right,
          transparent,
          #000 var(--scroll-shadow-size)
        )
      `,
            },
          }}
        >
          <ScrollArea.Content py={"8px"}>
            <Tabs.List maxW={"full"} overflowX={"auto"}>
              {tabItems.map((tab) => {
                const TabIcon = tab.icon;

                return (
                  <Tabs.Trigger
                    key={tab.value}
                    value={tab.value}
                    textWrap={"nowrap"}
                    minW={isMobile && tabItems.length === 2 ? "50%" : "100px"}
                    maxW={"500px"}
                    _selected={{
                      fontWeight: "semibold",
                      color: "var(--chakra-colors-primary)",
                    }}
                  >
                    <Box minW={"10px"}>
                      <TabIcon size={15} />
                    </Box>{" "}
                    {tab.label}
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="horizontal" />
        <ScrollArea.Corner />
      </ScrollArea.Root>
      {tabItems.map((tab) => (
        <Tabs.Content key={tab.value} value={tab.value} px={2}>
          {tab.page}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
