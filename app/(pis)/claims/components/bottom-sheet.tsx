"use client";

// THE PHONE'S BOTTOM SHEET — the History sheet's drawer, as one component.
//
// It pulls up from the bottom edge, where a thumb already is: rounded top, the
// subtle ground, the title on the left and the close on the right (user,
// 2026-10-01: "the history close button place it at the right side"). The
// Documents sheet on Service Payables asked to be "the same by the history"
// (user, same day), and a drawer drawn twice is a drawer that drifts — so the
// quick access's History / Actions sheet and the documents sheet both use this.
//
// FITTED, under the shared cap — see `sheet-height`. A sheet whose rows change
// with a filter is a different kind and holds its height; this one does not.

import type { ReactNode } from "react";
import { Box, CloseButton, Drawer, Portal } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import { SHEET_HEIGHT } from "./sheet-height";

export interface BottomSheetProps {
  /** The sheet's heading, at the left of its header. */
  title: ReactNode;
  open: boolean;
  onClose: () => void;
  /**
   * What stays at the bottom while the body scrolls — an Add on a list. Outside
   * the body so it does not scroll away with the rows it acts on.
   */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * ALWAYS IN THE TREE, with `open` driving it — never `{open && <BottomSheet/>}`,
 * which is what strands the page unclickable. See `SectionPopup`.
 */
export function BottomSheet({
  title,
  open,
  onClose,
  footer,
  children,
}: BottomSheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      placement="bottom"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            borderTopRadius="2xl"
            bg={BRAND_COLORS.subtleBg}
            maxH={SHEET_HEIGHT}
            pb="env(safe-area-inset-bottom, 0px)"
          >
            <Drawer.Header
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              px={4}
              pt={3}
              pb={2}
            >
              <Drawer.Title fontSize="md" fontWeight="700" color="gray.800">
                {title}
              </Drawer.Title>
              <Drawer.CloseTrigger asChild position="static">
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Drawer.Body px={4} pt={1} pb={footer ? 3 : 5} overflowY="auto">
              {children}
            </Drawer.Body>
            {footer && (
              <Box
                flexShrink={0}
                px={4}
                pt={3}
                pb={4}
                borderTopWidth="1px"
                borderColor="gray.100"
              >
                {footer}
              </Box>
            )}
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

export default BottomSheet;
