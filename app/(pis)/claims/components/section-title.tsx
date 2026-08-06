"use client";

// The claims area's section title — one heading for every section on a claims
// dashboard, so they cannot drift apart as each section evolves.
//
// The type itself comes from `components/dashboard/SectionLabel` — the shared
// section label, and the same thing the claims dashboard (`app/(pis)/claims`)
// renders. This wraps it rather than restyling it, so the two cannot drift: the
// title/subtitle typography lives in one place and is inherited here.
//
// What this adds is placement — an optional leading icon and an optional control
// at the far right — which is all the sections here needed beyond the label.
//
// `icon` is optional because most sections do not have one; "For Verification"
// does, and that is the only reason the prop exists.

import type { ReactNode } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { SectionLabel } from "@/components/dashboard/SectionLabel";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

interface SectionTitleProps {
  title: string;
  /** Line under the title. A string, matching the shared label's own API. */
  subtitle?: string;
  /** Optional leading icon, e.g. `<LuShieldCheck size={18} />`. */
  icon?: ReactNode;
  /** Colour applied to `icon`. Defaults to the brand's dark green. */
  iconColor?: string;
  /**
   * Optional control pinned to the far right of the heading row — a "view all"
   * chevron, a button, a menu.
   *
   * A slot rather than a `label`/`onClick` pair, following the `Page` component's
   * action slot: sections want different controls, and the heading's job is only
   * to place one consistently.
   */
  action?: ReactNode;
}

/**
 * A section heading: optional icon, title, a subtitle underneath, and an optional
 * action at the right. Owns its bottom margin, so sections drop it straight above
 * their content.
 */
export function SectionTitle({
  title,
  subtitle,
  icon,
  iconColor = BRAND_COLORS.darkGreen,
  action,
}: SectionTitleProps) {
  return (
    <Flex align="center" gap={2} mb={3}>
      {icon && (
        <Box color={iconColor} flexShrink={0}>
          {icon}
        </Box>
      )}

      <Box minW={0}>
        <SectionLabel title={title} subtitle={subtitle} />
      </Box>

      {/* `ml="auto"` rather than `justify="space-between"` on the row: the title
          block must stay next to the icon, not spread away from it. */}
      {action && (
        <Box ml="auto" flexShrink={0}>
          {action}
        </Box>
      )}
    </Flex>
  );
}

export default SectionTitle;
