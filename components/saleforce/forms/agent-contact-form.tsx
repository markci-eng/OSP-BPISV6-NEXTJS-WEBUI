import { Grid, Box } from "@chakra-ui/react";
import { FloatingLabelInput, SectionTitle } from "osp-ui-kit";

interface AgentContactFormProps {
  email: string;
  mobileNumber: string;
  landlineNumber: string;
}

const AgentContactForm = (props: AgentContactFormProps) => {
  const { email, mobileNumber, landlineNumber, ...rest } = props;
  return (
    <Box>
      <SectionTitle>Contact</SectionTitle>
      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
        }}
        gap={{
          base: 0,
          md: 2,
        }}
      >
        <FloatingLabelInput label="Email" value={email} />
        <FloatingLabelInput label="Mobile Number" value={mobileNumber} />
        <FloatingLabelInput label="Landline Number" value={landlineNumber} />
      </Grid>
    </Box>
  );
};

export default AgentContactForm;
