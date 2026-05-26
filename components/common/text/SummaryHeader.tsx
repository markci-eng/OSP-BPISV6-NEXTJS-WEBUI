import { Box, Strong } from "@chakra-ui/react";
import React from "react";

interface TextParams {
  children: string;
  color?: string | null;
}

const SummaryHeader = (params: TextParams) => {
  const { children, color } = params;
  return (
    <Box
      paddingBottom={{
        base: 2,
      }}
      borderBottomStyle={"dashed"}
      borderBottomWidth={"thin"}
      w="full"
    >
      <Box
        w="full"
        px={{
          base: 2,
        }}
        borderLeftColor={color ?? "var(--chakra-colors-primary)"}
        borderLeftWidth={{
          base: "medium",
        }}
      >
        <Strong
          fontSize={{
            base: "14px",
            md: "16px",
          }}
          color={color ?? "var(--chakra-colors-primary)"}
          letterSpacing={-1}
          lineHeight={0}
        >
          {children}
        </Strong>
      </Box>
    </Box>
  );
};

export default SummaryHeader;
