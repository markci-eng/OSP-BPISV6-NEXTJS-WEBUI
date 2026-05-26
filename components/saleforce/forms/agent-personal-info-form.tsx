import Caption from "@/components/texts/Caption";
import FormTitle from "@/components/texts/FormTitle";
import SectionTitle from "@/components/texts/SectionTitle";
import ProfileSectionCard from "@/components/saleforce/components/profile-section-card";
import { FORM_LAYOUT } from "@/lib/theme/layout-tokens";
import { Grid, Separator, Flex } from "@chakra-ui/react";
import { InputFloatingLabel } from "st-peter-ui";

interface AgentPersonalInfoFormProps {
  lastName: string;
  firstName: string;
  middleName?: string;
  suffix?: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: string;
  civilStatus: string;
  nationality: string;
  naturalizationDate: string;
}

const AgentPersonalInfoForm = (props: AgentPersonalInfoFormProps) => {
  const {
    lastName,
    firstName,
    middleName,
    suffix,
    dateOfBirth,
    placeOfBirth,
    nationality,
    naturalizationDate,
    gender,
    civilStatus,
  } = props;

  return (
    <ProfileSectionCard>
      <Flex flexDir="column" gap={{ base: 4, md: 5 }}>
        <FormTitle label="Personal Information" />
        <Caption value="Please fill out the following details." />
        <Separator
          my={{
            base: 3,
            md: 4,
          }}
        />

        <Flex flexDir="column" gap={{ base: 4, md: 5 }}>
          <Flex flexDir="column" gap={2}>
            <SectionTitle>Full Name</SectionTitle>
            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
              }}
              gap={{ base: FORM_LAYOUT.fieldGap, md: FORM_LAYOUT.fieldGap }}
              w="full"
            >
              <InputFloatingLabel label="Last Name" value={lastName} />
              <InputFloatingLabel label="First Name" value={firstName} />
              <InputFloatingLabel label="Middle Name" value={middleName} />
              <InputFloatingLabel label="Suffix" value={suffix} />
            </Grid>
          </Flex>

          <Flex flexDir="column" gap={2}>
            <SectionTitle>Birth Information</SectionTitle>
            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
              }}
              gap={{ base: FORM_LAYOUT.fieldGap, md: FORM_LAYOUT.fieldGap }}
            >
              <InputFloatingLabel label="Date of Birth" value={dateOfBirth} />
              <InputFloatingLabel label="Place of Birth" value={placeOfBirth} />
            </Grid>
          </Flex>

          <Flex flexDir="column" gap={2}>
            <SectionTitle>Demographic Information</SectionTitle>

            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
              }}
              gap={{ base: FORM_LAYOUT.fieldGap, md: FORM_LAYOUT.fieldGap }}
            >
              <InputFloatingLabel label="Gender" value={gender} />
              <InputFloatingLabel label="Civil Status" value={civilStatus} />
            </Grid>

            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
              }}
              gap={{ base: FORM_LAYOUT.fieldGap, md: FORM_LAYOUT.fieldGap }}
            >
              <InputFloatingLabel label="Nationality" value={nationality} />
              <InputFloatingLabel
                label="Naturalization Date"
                value={naturalizationDate}
              />
            </Grid>
          </Flex>
        </Flex>
      </Flex>
    </ProfileSectionCard>
  );
};

export default AgentPersonalInfoForm;
