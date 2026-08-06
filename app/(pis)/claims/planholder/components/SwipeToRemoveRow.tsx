"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { LuTrash2 } from "react-icons/lu";

/** How far left a row can be dragged. */
const SWIPE_MAX = 96;
/** Past this much drag, releasing asks to remove the row's subject. */
const SWIPE_THRESHOLD = 64;
/** Movement beyond this counts as a swipe, not a tap. */
const TAP_SLOP = 5;

/**
 * The swipe-to-remove row every list on the plan holder page uses — documents,
 * payout channels, beneficiaries.
 *
 * Dragging left past {@link SWIPE_THRESHOLD} reveals the remove action behind
 * the row and asks `onRequestRemove` to confirm it. The row stays held open
 * while the confirmation is up and snaps back if the user declines. Vertical
 * scrolling is untouched (`touchAction: pan-y`), and a swipe never counts as a
 * tap, so a row that was dragged does not also open.
 *
 * The gesture lives here once rather than in each row: the lists differ only in
 * what they render inside, and a row that removed differently from its
 * neighbours would read as a bug.
 */
export function SwipeToRemoveRow({
  onClick,
  onRequestRemove,
  children,
}: {
  onClick?: () => void;
  /** Resolves true once the subject has actually been removed. */
  onRequestRemove: () => Promise<boolean>;
  /** The row's contents, laid out by the list that owns it. */
  children: ReactNode;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const travelled = useRef(0);
  // The gesture is tracked in refs as well as state: pointer events can arrive
  // faster than React flushes, and every handler must see the live values.
  const draggingRef = useRef(false);
  const offsetRef = useRef(0);
  // True while the confirmation is up, so the row ignores further gestures.
  const awaitingConfirm = useRef(false);

  const slideTo = (next: number) => {
    offsetRef.current = next;
    setOffset(next);
  };

  const endDrag = () => {
    draggingRef.current = false;
    setDragging(false);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (awaitingConfirm.current) return;
    startX.current = e.clientX;
    travelled.current = 0;
    draggingRef.current = true;
    setDragging(true);
    // Keep receiving moves if the finger leaves the row. Safe to skip if the
    // pointer is already gone.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* no capture — the row still tracks moves while over it */
    }
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startX.current;
    travelled.current = Math.max(travelled.current, Math.abs(dx));
    // Left only — dragging right just holds the row in place.
    slideTo(Math.max(-SWIPE_MAX, Math.min(0, dx)));
  };

  const handlePointerUp = async () => {
    if (!draggingRef.current) return;
    endDrag();
    if (offsetRef.current > -SWIPE_THRESHOLD) {
      slideTo(0);
      return;
    }
    // Hold the action open while the user answers the confirmation.
    slideTo(-SWIPE_MAX);
    awaitingConfirm.current = true;
    const removed = await onRequestRemove();
    awaitingConfirm.current = false;
    if (!removed) slideTo(0);
  };

  const handlePointerCancel = () => {
    endDrag();
    slideTo(0);
  };

  return (
    <Box position="relative" borderRadius="xl" overflow="hidden">
      {/* The remove action, revealed as the row slides off it. */}
      <Flex
        position="absolute"
        inset={0}
        align="center"
        justify="flex-end"
        gap={1.5}
        px={4}
        bg="gray.100"
        color="gray.600"
        aria-hidden
      >
        <LuTrash2 size={16} />
        <Text fontSize="xs" fontWeight="semibold">
          Remove
        </Text>
      </Flex>

      <Box
        role="button"
        tabIndex={0}
        onClick={() => {
          // A swipe that ends on the row shouldn't also open it.
          if (travelled.current > TAP_SLOP) return;
          onClick?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        position="relative"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="xl"
        bg="white"
        boxShadow="xs"
        px={3}
        py="10px"
        cursor="pointer"
        touchAction="pan-y"
        transform={`translateX(${offset}px)`}
        transition={dragging ? "none" : "transform 0.2s ease"}
        _hover={{ borderColor: "gray.300", boxShadow: "sm" }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default SwipeToRemoveRow;
