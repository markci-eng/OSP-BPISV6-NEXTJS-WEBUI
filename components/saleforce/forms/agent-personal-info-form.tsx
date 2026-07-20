import Card from "@/components/cards/Card";
import Caption from "@/components/texts/Caption";
import FormTitle from "@/components/texts/FormTitle";
import SectionTitle from "@/components/texts/SectionTitle";
import {
  Grid,
  Box,
  Separator,
  Strong,
  GridItem,
  Flex,
  VStack,
} from "@chakra-ui/react";
import { H4 } from "st-peter-ui";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";

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
    ...rest
  } = props;

  return (
    <Card.Root>
      <Card.MainContent>
        <FormTitle label="Personal Information" />
        <Caption>Please fill out the following details.</Caption>
        <Separator
          my={{
            base: 3,
            md: 4,
          }}
        />

        <Flex flexDir={"column"} gap={4} paddingX={{ base: 1, md: 2 }}>
          <Flex flexDir={"column"} gap={2}>
            <SectionTitle>Full Name</SectionTitle>
            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
              }}
              gap={{
                base: 0,
                md: 2,
              }}
              w={{
                base: "full",
              }}
            >
              <FloatingLabelInput label="Last Name" value={lastName} />
              <FloatingLabelInput label="First Name" value={firstName} />
              <FloatingLabelInput label="Middle Name" value={middleName} />
              <FloatingLabelInput label="Suffix" value={suffix} />
            </Grid>
          </Flex>

          <Flex flexDir={"column"} gap={2}>
            <SectionTitle>Birth Information</SectionTitle>
            <Flex
              flexDir={{
                base: "column",
                md: "row",
              }}
              gap={{
                base: 0,
                md: 2,
              }}
            >
              <FloatingLabelInput label="Date of Birth" value={dateOfBirth} />
              <FloatingLabelInput label="Place of Birth" value={placeOfBirth} />
            </Flex>
          </Flex>

          <Flex flexDir={"column"} gap={2}>
            <SectionTitle>Demographic Information</SectionTitle>

            <Flex
              flexDir={{
                base: "column",
                md: "row",
              }}
              gap={{
                base: 0,
                md: 2,
              }}
            >
              <FloatingLabelInput label="Gender" value={gender} />
              <FloatingLabelInput label="Civil Status" value={civilStatus} />
            </Flex>

            <Flex
              flexDir={{
                base: "column",
                md: "row",
              }}
              gap={{
                base: 0,
                md: 2,
              }}
            >
              <FloatingLabelInput label="Nationality" value={nationality} />
              <FloatingLabelInput
                label="Naturalization Date"
                value={naturalizationDate}
              />
            </Flex>
          </Flex>
        </Flex>
      </Card.MainContent>
    </Card.Root>
  );
};

export default AgentPersonalInfoForm;
