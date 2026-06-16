"use client";

import { Box } from "@chakra-ui/react";

type PageHeaderProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  description,
}: PageHeaderProps) {
  if (!title && !subtitle && !description) return null;

  return (
    <Box mb="24px">
      {subtitle && (
        <Box
          fontFamily="var(--font-dm-sans), system-ui, sans-serif"
          color="#7B8079"
          fontSize="10px"
          fontWeight={700}
          lineHeight="1"
          letterSpacing="0.06em"
          textTransform="uppercase"
          mb="2px">
          {subtitle}
        </Box>
      )}

      {title && (
        <Box
          as="h1"
          m="0"
          fontFamily="var(--font-dm-sans), system-ui, sans-serif"
          fontWeight={subtitle ? 600 : 500}
          color="gray.900">
          {title}
        </Box>
      )}

      {description && (
        <Box
          fontFamily="var(--font-dm-sans), system-ui, sans-serif"
          mt="6px"
          color="gray.600"
          fontSize="sm">
          {description}
        </Box>
      )}
    </Box>
  );
}
