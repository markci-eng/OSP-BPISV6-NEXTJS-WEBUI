import SectionTitle from "@/components/texts/SectionTitle";
import { FORM_LAYOUT } from "@/lib/theme/layout-tokens";
import { Grid, Box } from "@chakra-ui/react";
import { InputFloatingLabel } from "st-peter-ui";

interface AgentContactFormProps {
  email: string;
  mobileNumber: string;
  landlineNumber: string;
}

const AgentContactForm = (props: AgentContactFormProps) => {
  const { email, mobileNumber, landlineNumber } = props;
  return (
    <Box>
      <SectionTitle>Contact</SectionTitle>
      <Grid
        mt={2}
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
        }}
        gap={{ base: FORM_LAYOUT.fieldGap, md: FORM_LAYOUT.fieldGap }}
      >
        <InputFloatingLabel label="Email" value={email} />
        <InputFloatingLabel label="Mobile Number" value={mobileNumber} />
        <InputFloatingLabel label="Landline Number" value={landlineNumber} />
      </Grid>
    </Box>
  );
};

export default AgentContactForm;
