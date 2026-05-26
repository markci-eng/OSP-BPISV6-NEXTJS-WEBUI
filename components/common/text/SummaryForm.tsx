import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import SummaryTitle from "./SummaryTitle";
import SummaryBox from "./SummaryBox";

interface SummaryData {
  label: string;
  value: string;
}

interface SummarySection {
  title: string;
  data: SummaryData[];
  color?: string | null;
}

interface SummaryFormParams {
  title: string;
  subtitle?: string | null;
  titleColor?: string | null;
  bgColor?: string | null;
  data: SummarySection[];
}

const SummaryForm = (params: SummaryFormParams) => {
  const { title, subtitle, titleColor, bgColor, data } = params;

  return (
    <Box>
      <SummaryTitle
        title={title}
        subtitle={subtitle}
        color={titleColor}
        bg={bgColor}
      />
      <Flex
        p={{
          base: 4,
          md: 6,
        }}
        gap={{
          base: 5,
          md: 6,
        }}
        w="full"
        flexDir="column"
      >
        {data.map((section) => (
          <SummaryBox
            key={section.title}
            title={section.title}
            data={section.data}
          />
        ))}
      </Flex>
    </Box>
  );
};

export default SummaryForm;
