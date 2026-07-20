import { Flex, Separator, Strong, Tabs } from "@chakra-ui/react";
import { LuHouse, LuNotebook, LuUser } from "react-icons/lu";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";

const AgentEditFormMobile = () => {
  return (
    <Tabs.Root defaultValue="personal" variant="subtle">
      <Flex justifyContent="center">
        <Tabs.List>
          <Tabs.Trigger value="personal">
            <LuUser />
            Personal
          </Tabs.Trigger>

          <Tabs.Trigger value="address">
            <LuHouse />
            Address
          </Tabs.Trigger>

          <Tabs.Trigger value="contact">
            <LuNotebook />
            Contact
          </Tabs.Trigger>
        </Tabs.List>
      </Flex>

      <Tabs.Content value="personal">
        <Flex flexDir="column" gap="4">
          <Flex flexDir="column" gap="2">
            <Strong fontSize="14px" color="gray.600" letterSpacing="-0.4">
              Full Name
            </Strong>

            <Separator />

            <Flex flexDir="column" px={1}>
              <FloatingLabelInput marginBottom={0} label="Last Name" />
              <FloatingLabelInput marginBottom={0} label="First Name" />
              <FloatingLabelInput marginBottom={0} label="Midlle Name" />
              <FloatingLabelInput marginBottom={0} label="Suffix" />
            </Flex>
          </Flex>

          <Flex flexDir="column" gap="2">
            <Strong fontSize="14px" color="gray.600" letterSpacing="-0.4">
              Geographic
            </Strong>

            <Separator />

            <Flex flexDir="column" px={1}>
              <FloatingLabelInput marginBottom={0} label="Gender" />
              <FloatingLabelInput marginBottom={0} label="Date Of Birth" />
              <FloatingLabelInput marginBottom={0} label="Place of Birth" />
              <FloatingLabelInput marginBottom={0} label="Civil Status" />
              <FloatingLabelInput marginBottom={0} label="Nationality" />
              <FloatingLabelInput
                marginBottom={0}
                label="Naturalization Date"
              />
              <FloatingLabelInput marginBottom={0} label="Height" />
              <FloatingLabelInput marginBottom={0} label="Weight" />
            </Flex>
          </Flex>
        </Flex>
      </Tabs.Content>

      <Tabs.Content value="address">
        <Flex flexDir="column" gap="4">
          <Flex flexDir="column" gap="2">
            <Strong fontSize="14px" color="gray.600" letterSpacing="-0.4">
              Residential
            </Strong>

            <Separator />

            <Flex flexDir="column" px={1}>
              <FloatingLabelInput label="Lot/Bldg/Unit No." />
              <FloatingLabelInput label="Street" />
              <FloatingLabelInput label="Barangay" />
              <FloatingLabelInput label="District" />
              <FloatingLabelInput label="City" />
              <FloatingLabelInput label="Province" />
              <FloatingLabelInput label="Zip Code" />
            </Flex>
          </Flex>

          <Flex flexDir="column" gap="2">
            <Strong fontSize="14px" color="gray.600" letterSpacing="-0.4">
              Office
            </Strong>

            <Separator />

            <Flex flexDir="column" px={1}>
              <FloatingLabelInput label="Lot/Bldg/Unit No." />
              <FloatingLabelInput label="Street" />
              <FloatingLabelInput label="Barangay" />
              <FloatingLabelInput label="District" />
              <FloatingLabelInput label="City" />
              <FloatingLabelInput label="Province" />
              <FloatingLabelInput label="Zip Code" />
            </Flex>
          </Flex>
        </Flex>
      </Tabs.Content>

      <Tabs.Content value="contact">
        <Flex flexDir="column" gap="4">
          <Flex flexDir="column" gap="2">
            <Strong fontSize="14px" color="gray.600" letterSpacing="-0.4">
              Contact
            </Strong>

            <Separator />

            <Flex flexDir="column" px={1}>
              <FloatingLabelInput label="Mobile" />
              <FloatingLabelInput label="Landline" />
              <FloatingLabelInput label="Email" />
            </Flex>
          </Flex>
        </Flex>
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default AgentEditFormMobile;
