import { Flex, Separator, Strong, Text } from "@chakra-ui/react";
import React from "react";
import { IconBase } from "react-icons";
import { LuText } from "react-icons/lu";
import { Box } from "st-peter-ui";

interface SummaryTitleParams {
  title: string;
  subtitle?: string | null;
  bg?: string | null;
  color?: string | null;
}

const SummaryTitle = (params: SummaryTitleParams) => {
  const { title, subtitle, bg, color } = params;
  return (
    <Box
      borderTopRightRadius="xl"
      borderTopLeftRadius="xl"
      // bg={bg ?? "var(--chakra-colors-primary)"}
      p={{
        base: 3,
        md: 5,
      }}
      // borderBottom={"1px solid"}
      // borderColor={"gray.200"}
    >
      <Flex>
        <Flex flexDir="column">
          <Strong
            fontSize={{
              base: "18px",
              md: "20px",
            }}
            // color={color ?? "whiteAlpha.900"}
          >
            {title}
          </Strong>
          <Text
            // color={color ?? "whiteAlpha.800"}
            fontSize={{
              base: "12px",
              md: "13px",
            }}
          >
            {subtitle}
          </Text>
        </Flex>
      </Flex>
      <Separator />
    </Box>
  );
};

export default SummaryTitle;
