"use client";

import { Box, Flex, Menu, Portal, Text } from "@chakra-ui/react";
import {
  LuChevronRight,
  LuEllipsisVertical,
  LuPencil,
  LuTrash2,
  LuUser,
} from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import type { PlanholderBeneficiary } from "../../claims-data";
import { SwipeToRemoveRow } from "./SwipeToRemoveRow";

/**
 * Edit and Remove, as the row's own menu.
 *
 * From `lg` only, and it is the desktop's answer to the swipe: dragging a row
 * left is how a thumb removes one, and a pointer has no such gesture — it had to
 * open the detail first to find Delete. The swipe stays where it works; this
 * appears where it does not.
 *
 * Every event it raises is stopped here. The row around it opens the detail on
 * click and tracks pointers for the swipe, and a menu that let either through
 * would open a drawer behind itself or drag the row while being read.
 */
function BeneficiaryRowMenu({
  beneficiary,
  onEdit,
  onRemove,
}: {
  beneficiary: PlanholderBeneficiary;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const swallow = (e: { stopPropagation: () => void }) => e.stopPropagation();

  return (
    <Box
      display={{ base: "none", lg: "block" }}
      flexShrink={0}
      onClick={swallow}
      onPointerDown={swallow}
      onKeyDown={swallow}
    >
      <Menu.Root>
        <Menu.Trigger asChild>
          <Box
            as="button"
            aria-label={`Actions for ${beneficiary.name}`}
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxSize="24px"
            borderRadius="md"
            color="gray.400"
            cursor="pointer"
            _hover={{ bg: "gray.100", color: "gray.600" }}
          >
            <LuEllipsisVertical size={16} />
          </Box>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content minW="160px">
              <Menu.Item value="edit" onClick={onEdit}>
                <LuPencil size={14} />
                Edit
              </Menu.Item>
              <Menu.Item
                value="remove"
                color="red.600"
                _hover={{ bg: "red.50" }}
                onClick={onRemove}
              >
                <LuTrash2 size={14} />
                Remove
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  );
}

/**
 * A single beneficiary — the same compact row as a document or payment, with a
 * leading person icon. The name sits on the left over its relationship; the age
 * sits on the right.
 *
 * Behaves like `DocumentRow`: tapping opens the beneficiary's detail — hence
 * the chevron — and swiping left reveals the remove action, which asks
 * `onRequestRemove` to confirm before anything is dropped. On a desktop it also
 * carries a menu — see {@link BeneficiaryRowMenu}.
 */
export function BeneficiaryRow({
  beneficiary,
  onClick,
  onRequestRemove,
  onEdit,
}: {
  beneficiary: PlanholderBeneficiary;
  onClick?: () => void;
  /** Resolves true once the beneficiary has actually been removed. */
  onRequestRemove: () => Promise<boolean>;
  /** Opens the edit form for this beneficiary — the menu's other item. */
  onEdit?: () => void;
}) {
  return (
    <SwipeToRemoveRow onClick={onClick} onRequestRemove={onRequestRemove}>
      <Flex align="center" justify="space-between" gap={3}>
        <Flex align="center" gap={3} minW={0}>
          <Box
            p={2}
            borderRadius="lg"
            bg="#eaf5ee"
            color={BRAND_COLORS.darkGreen}
            flexShrink={0}
          >
            <LuUser size={16} />
          </Box>
          <Box minW={0}>
            <Text fontSize="sm" fontWeight="600" color="gray.800" truncate>
              {beneficiary.name}
            </Text>
            <Text fontSize="11px" color="gray.500" truncate>
              {beneficiary.relation}
            </Text>
          </Box>
        </Flex>

        <Flex align="center" gap={2} flexShrink={0}>
          <Box textAlign="right">
            <Text
              fontSize="sm"
              fontWeight="700"
              color="gray.800"
              whiteSpace="nowrap"
            >
              {beneficiary.age}
            </Text>
            <Text fontSize="11px" color="gray.500" whiteSpace="nowrap">
              years old
            </Text>
          </Box>
          {/* The chevron and the menu are the same 16px of row, and they trade
              places: the arrow says "there is more behind this" to a thumb that
              has nothing else to go on, and the menu says it better to a pointer
              — it names what is behind the row instead of hinting at it. Two of
              them at the end of one row would be two answers to one question. */}
          <Box display={{ base: "flex", lg: "none" }}>
            <LuChevronRight
              size={16}
              color="var(--chakra-colors-gray-400, #9ca3af)"
            />
          </Box>
          {onEdit && (
            <BeneficiaryRowMenu
              beneficiary={beneficiary}
              onEdit={onEdit}
              onRemove={() => void onRequestRemove()}
            />
          )}
        </Flex>
      </Flex>
    </SwipeToRemoveRow>
  );
}

export default BeneficiaryRow;
