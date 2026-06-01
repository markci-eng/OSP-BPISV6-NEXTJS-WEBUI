import { Box, Flex, Grid, Strong } from "@chakra-ui/react";
import { Body } from "st-peter-ui";

export interface LabelTextProps {
  label: string;
  value: string;
}

const WebViewLabelText = ({ label, value }: LabelTextProps) => {
  return (
    <Grid templateColumns="1fr 1fr" gap={1} h="fit-content">
      <Body truncate>{label}</Body>

      <Body fontWeight="semibold" wordBreak="break-word" textAlign="left">
        {value}
      </Body>
    </Grid>
  );
};

const MobileLabelText = ({ label, value }: LabelTextProps) => {
  return (
    <Flex gap={1} justify={"space-between"} h="fit-content">
      <Body>{label}</Body>

        <Body fontWeight="semibold" wordBreak="break-word" textAlign="right">
          {value}
        </Body>
    </Flex>
  );
};

const LabelText = ({ label, value }: LabelTextProps) => {
  return (
    <>
      <Box display={{ base: "none", lg: "block" }} py={1}>
        <WebViewLabelText label={label} value={value} />
      </Box>

      <Box display={{ base: "block", lg: "none" }} py={0}>
        <MobileLabelText label={label} value={value} />
      </Box>
    </>
  );
};

export default LabelText;
