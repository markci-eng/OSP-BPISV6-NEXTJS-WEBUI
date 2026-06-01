import React from "react";
import { Grid, Separator, Strong } from "@chakra-ui/react";
import { Box, H4, InputFloatingLabel, Small } from "st-peter-ui";
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
          <InputFloatingLabel label="Employer" value={employer} />
          <InputFloatingLabel label="Position" value={position} />
          <InputFloatingLabel label="Hire Date" value={hiredate} type="date" />
          <InputFloatingLabel
            label="Employment Status"
            value={employmentStatus}
          />
          <InputFloatingLabel label="NBI Number" value={nbiNumber} />
          <InputFloatingLabel label="TIN Number" value={tinNumber} />
          <InputFloatingLabel label="SSS Number" value={sssNumber} />
        </Grid>
      </Card.MainContent>
    </Card.Root>
  );
};

export default AgentEmploymentForm;
