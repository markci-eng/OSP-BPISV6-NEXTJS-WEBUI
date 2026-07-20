import React from "react";
import { Grid, Separator, Strong } from "@chakra-ui/react";
import { Box, H4, Small } from "st-peter-ui";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";
import { Text, Flex } from "@chakra-ui/react";
import Card from "@/components/cards/Card";
import FormTitle from "@/components/texts/FormTitle";
import Caption from "@/components/texts/Caption";

interface AgentEmploymentFormProps {
  employer: string;
  position: string;
  hiredate: string;
  employmentStatus: string;
  nbiNumber: string;
  tinNumber: string;
  sssNumber: string;
}

const AgentEmploymentForm = (props: AgentEmploymentFormProps) => {
  const {
    employer,
    position,
    hiredate,
    employmentStatus,
    nbiNumber,
    tinNumber,
    sssNumber,
    ...rest
  } = props;

  return (
    <Card.Root>
      <Card.MainContent>
        <Flex flexDir={"column"} gap={1}>
          <FormTitle label="Employment Information" />
          <Caption>Please fill out the following employment details.</Caption>
        </Flex>
        <Separator my={2} />
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
          }}
          gap={{
            base: 0,
            md: 2,
          }}
          paddingX={{
            base: 1,
            md: 2,
          }}
        >
          <FloatingLabelInput label="Employer" value={employer} />
          <FloatingLabelInput label="Position" value={position} />
          <FloatingLabelInput label="Hire Date" value={hiredate} type="date" />
          <FloatingLabelInput
            label="Employment Status"
            value={employmentStatus}
          />
          <FloatingLabelInput label="NBI Number" value={nbiNumber} />
          <FloatingLabelInput label="TIN Number" value={tinNumber} />
          <FloatingLabelInput label="SSS Number" value={sssNumber} />
        </Grid>
      </Card.MainContent>
    </Card.Root>
  );
};

export default AgentEmploymentForm;
