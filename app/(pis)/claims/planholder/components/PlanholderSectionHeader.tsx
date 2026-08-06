"use client";

import type { ReactNode } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { SectionTitle } from "../../components/section-title";

/**
 * Section heading shared by the stacked records sections on the plan holder
 * profile (Claim Requests, Documents, …).
 *
 * The heading itself is the claims area's own {@link SectionTitle}, so these
 * sections read the same as every other section in claims. What this adds is
 * the running count — a pill dropped into `SectionTitle`'s action slot, which
 * is the only thing these sections needed beyond the shared label.
 *
 * Like `SectionTitle`, this owns its bottom margin: sections drop it straight
 * above their content.
 */
export function PlanholderSectionHeader({
  title,
  subtitle,
  count,
  action,
}: {
  title: string;
  subtitle?: string;
  count?: number;
  /**
   * Control pinned to the far right, after the count — "Add Document" and the
   * like. Sections pass it here rather than laying out their own heading row,
   * so the control lines up with the title the same way in every section.
   */
  action?: ReactNode;
}) {
  const showCount = count !== undefined && count > 0;

  return (
    <SectionTitle
      title={title}
      subtitle={subtitle}
      action={
        showCount || action ? (
          <Flex align="center" gap={3}>
            {showCount && (
              <Box
                px={2}
                py="2px"
                borderRadius="full"
                bg="gray.100"
                color="gray.600"
                fontSize="xs"
                fontWeight="semibold"
              >
                {count}
              </Box>
            )}
            {action}
          </Flex>
        ) : undefined
      }
    />
  );
}

export default PlanholderSectionHeader;
