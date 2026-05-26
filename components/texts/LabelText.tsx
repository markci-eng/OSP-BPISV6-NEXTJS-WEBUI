import { Box, Flex, Grid } from "@chakra-ui/react";
import { Body } from "st-peter-ui";

export interface LabelTextProps {
  label: string;
  value: string;
}

const WebViewLabelText = ({ label, value }: LabelTextProps) => {
  return (
    <Grid
      templateColumns="max-content minmax(0, 1fr)"
      columnGap={4}
      rowGap={1}
      h="fit-content"
      alignItems="start"
      minW={0}
    >
      <Body color="gray.700">{label}</Body>

      <Body
        fontWeight="semibold"
        wordBreak="break-word"
        overflowWrap="anywhere"
        textAlign="left"
      >
        {value}
      </Body>
    </Grid>
  );
};

const MobileLabelText = ({ label, value }: LabelTextProps) => {
  return (
    <Grid
      templateColumns="minmax(96px, 40%) minmax(0, 1fr)"
      gap={2}
      h="fit-content"
      alignItems="start"
      minW={0}
    >
      <Body color="gray.700">{label}</Body>

      <Flex justify="flex-end" minW={0}>
        <Body
          fontWeight="semibold"
          wordBreak="break-word"
          overflowWrap="anywhere"
          textAlign="right"
        >
          {value}
        </Body>
      </Flex>
    </Grid>
  );
};

const LabelText = ({ label, value }: LabelTextProps) => {
  return (
    <>
      <Box display={{ base: "none", md: "block" }}>
        <WebViewLabelText label={label} value={value} />
      </Box>

      <Box display={{ base: "block", md: "none" }}>
        <MobileLabelText label={label} value={value} />
      </Box>
    </>
  );
};

export default LabelText;
