import { Box } from "@chakra-ui/react";
import { SectionTitle, Small } from "osp-ui-kit";

/* ─── Section label ─── */
export const SectionLabel = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <Box>
    <SectionTitle fontWeight="semibold" color="gray.700">
      {title}
    </SectionTitle>
    {subtitle && (
      <Small color="gray.400" mt="1px">
        {subtitle}
      </Small>
    )}
  </Box>
);
