"use client";

import { Box, Heading, Text } from "@chakra-ui/react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    // <Box mb={1}>
    //   <Text fontSize="2xl" fontWeight={600}>
    //     {title}
    //   </Text>

    //   {subtitle && (
    //     <Text fontSize="sm" color="gray.600" mt={1}>
    //       {subtitle}
    //     </Text>
    //   )}
    // </Box>

    <Box mb={4}>
      <Heading size="2xl" fontWeight="semibold">
        {title}
      </Heading>
      <Text fontSize="sm" color="gray.600" mt={1}>
        {subtitle}
      </Text>
    </Box>
  );
}
