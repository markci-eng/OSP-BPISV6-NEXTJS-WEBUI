import { Grid, Separator } from "@chakra-ui/react";
import { Text, Flex } from "@chakra-ui/react";
import { Card, FloatingLabelInput, FormTitle } from "osp-ui-kit";

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
          <Text fontSize="xs" color="gray.500" lineHeight="1.5">
            Please fill out the following employment details.
          </Text>
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
