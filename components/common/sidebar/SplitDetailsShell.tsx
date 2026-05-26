// SplitDetailsShell.tsx
"use client";

import * as React from "react";
import {
  Box,
  Flex,
  Drawer,
  useBreakpointValue,
  type BoxProps,
} from "@chakra-ui/react";

type RenderListArgs<T> = {
  onSelect: (item: T) => void;
  selected: T | null;
};

type RenderDetailsArgs<T> = {
  selected: T | null;
  close: () => void;
};

export type SplitDetailsShellProps<T> = {
  sidebarWidth?: string | number;
  gap?: number;

  selected: T | null;
  setSelected: (value: T | null) => void;

  renderList: (args: RenderListArgs<T>) => React.ReactNode;
  renderDetails: (args: RenderDetailsArgs<T>) => React.ReactNode;

  containerProps?: BoxProps;
  sidebarProps?: BoxProps;
  contentProps?: BoxProps;
};

export function SplitDetailsShell<T>({
  sidebarWidth = 360,
  gap = 4,
  selected,
  setSelected,
  renderList,
  renderDetails,
  containerProps,
  sidebarProps,
  contentProps,
}: SplitDetailsShellProps<T>) {
  const useSplit = useBreakpointValue({ base: false, md: true });
  const [open, setOpen] = React.useState(false);

  const onSelect = (item: T) => {
    setSelected(item);
    setOpen(true);
  };

  const close = () => setOpen(false);
  const { direction: _dir, ...safeContainerProps } = containerProps ?? {};

  return (
    <>
      <Flex
        flex="1"
        minH="0"
        gap={gap}
        mx={"auto"}
        flexDir={{ base: "column", md: "row" }} // ✅ IMPORTANT
        {...safeContainerProps}
      >
        {/* MAIN */}
        <Box
          flex="1"
          minW="0"
          minH="0"
          display="flex"
          flexDir="column"
          {...contentProps}
        >
          {renderList({ onSelect, selected })}
        </Box>

        {/* RIGHT sidebar on md+ */}
        {useSplit && open ? (
          <Box
            w={
              typeof sidebarWidth === "number"
                ? `${sidebarWidth}px`
                : sidebarWidth
            }
            flexShrink={0}
            borderWidth="1px"
            borderRadius="xl"
            bg="white"
            overflow="hidden"
            minH="0"
            {...sidebarProps}
          >
            {renderDetails({ selected, close })}
          </Box>
        ) : null}
      </Flex>

      {/* Mobile drawer */}
      {!useSplit ? (
        <Drawer.Root
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
          placement="end"
          size="full"
        >
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Body p={0}>
                {renderDetails({ selected, close })}
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>
      ) : null}
    </>
  );
}
