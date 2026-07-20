import SectionTitle from "@/components/texts/SectionTitle";
import { Grid, Box, Separator, Text, Strong } from "@chakra-ui/react";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";

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
