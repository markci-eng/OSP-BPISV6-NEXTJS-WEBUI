import { PrimaryMdButton } from "st-peter-ui";
import { Flex } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Summary from "@/components/forms/Summary";

const AgentSummary = () => {
  const router = useRouter();

  return (
    <Flex flexDir={"column"} boxShadow={"sm"} borderRadius={"md"}>
      <Summary
        title="Summary"
        subtitle="Verify the information below before creating the agent profile."
        data={[
          {
            title: "Personal",
            data: [
              {
                label: "Last Name",
                value: "Doe",
              },
              {
                label: "First Name",
                value: "John",
              },
              {
                label: "Middle Name",
                value: "N/A",
              },
              {
                label: "Suffix",
                value: "N/A",
              },
              {
                label: "Date of Birth",
                value: "Sept. 11, 1998",
              },
              {
                label: "Place of Birth",
                value: "Lopez, Quezon",
              },
              {
                label: "Civil Status",
                value: "Single",
              },
              {
                label: "Gender",
                value: "Male",
              },
              {
                label: "Nationality",
                value: "Filipino",
              },
              {
                label: "Naturalization Date",
                value: "N/A",
              },
            ],
          },
          {
            title: "Contact",
            data: [
              {
                label: "Mobile",
                value: "09123456789",
              },
              {
                label: "Landline",
                value: "021234567",
              },
              {
                label: "Email",
                value: "john.doe@example.com",
              },
            ],
          },
          {
            title: "Address",
            data: [
              {
                label: "Lot Number",
                value: "123",
              },
              {
                label: "Street",
                value: "Main Street",
              },
              {
                label: "District",
                value: "District 1",
              },
              {
                label: "City",
                value: "Antipolo",
              },
              {
                label: "Province",
                value: "Rizal",
              },
              {
                label: "Zip Code",
                value: "1870",
              },
            ],
          },
          {
            title: "Employment",
            data: [
              {
                label: "Employer",
                value: "St. Peter Life Plan Inc.",
              },
              {
                label: "Position",
                value: "Sales Agent 1",
              },
              {
                label: "Hired Date",
                value: "Feb. 20, 2025",
              },
              {
                label: "NBI",
                value: "N/A",
              },
              {
                label: "TIN",
                value: "N/A",
              },
              {
                label: "SSS",
                value: "N/A",
              },
            ],
          },
        ]}
      />
    </Flex>
  );
};

export default AgentSummary;
