import { Flex, Grid, Strong, Text } from "@chakra-ui/react";
import React from "react";
import { Box } from "st-peter-ui";
import SummaryHeader from "./SummaryHeader";
import InfoItem from "../info-item/info-item";

interface DataObject {
  label: string;
  value: any;
}

interface SummaryBoxParams {
  title: string;
  data: DataObject[];
}

const SummaryBox = (params: SummaryBoxParams) => {
  const { title, data } = params;
  return (
    <Box>
      <SummaryHeader>{title}</SummaryHeader>
      <Grid
        templateColumns={{
          base: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        }}
        gap={{
          base: 2,
          md: 4,
        }}
        pt={{ base: 3, md: 5 }}
      >
        {data.map((item, idx) => (
          <InfoItem label={item.label} value={item.value} key={idx} /> // <Box key={idx}>
          //   <Text
          //     fontSize={{
          //       base: "12px",
          //       md: "14px",
          //     }}
          //     color={"gray.500"}
          //   >
          //     {item.label}
          //   </Text>
          //   <Strong
          //     fontSize={{
          //       base: "14px",
          //       md: "16px",
          //     }}
          //     color="gray.700"
          //   >
          //     {item.value}
          //   </Strong>
          // </Box>
        ))}
      </Grid>
    </Box>
  );
};

export default SummaryBox;
