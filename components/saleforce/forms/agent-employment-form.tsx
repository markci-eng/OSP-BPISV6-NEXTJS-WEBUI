import { Grid, Separator, Flex } from "@chakra-ui/react";
import { InputFloatingLabel } from "st-peter-ui";
import FormTitle from "@/components/texts/FormTitle";
import Caption from "@/components/texts/Caption";
import ProfileSectionCard from "@/components/saleforce/components/profile-section-card";
import { FORM_LAYOUT } from "@/lib/theme/layout-tokens";

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
  } = props;

  return (
    <ProfileSectionCard>
      <Flex flexDir="column" gap={{ base: 4, md: 5 }}>
        <Flex flexDir="column" gap={1}>
          <FormTitle label="Employment Information" />
          <Caption value="Please fill out the following employment details." />
        </Flex>
        <Separator />
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
          }}
          gap={{ base: FORM_LAYOUT.fieldGap, md: FORM_LAYOUT.fieldGap }}
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
      </Flex>
    </ProfileSectionCard>
  );
};

export default AgentEmploymentForm;
