import {
  Flex,
  Grid,
  Separator,
  Show,
  Strong,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import React from "react";
import { Box } from "st-peter-ui";
import SummaryHeader from "./SummaryHeader";
import InfoItem from "../info-item/info-item";
import Card from "@/components/cards/Card";
import LabelText from "@/components/texts/LabelText";

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
    <Card.Root>
      <Card.MainContent>
        <SummaryHeader>{title}</SummaryHeader>
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
          }}
          gap={{
            base: 2,
            md: 4,
          }}
          pt={{ base: 3, md: 5 }}
        >
          {data.map((item, idx) => (
            <>
              <LabelText label={item.label} value={item.value} key={idx} />
              <Show when={useBreakpointValue({ base: true, md: false })}>
                <Separator />
              </Show>
            </>
          ))}
        </Grid>
      </Card.MainContent>
    </Card.Root>
  );
};

export default SummaryBox;
