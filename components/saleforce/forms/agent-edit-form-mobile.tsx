import { Flex, Separator, Strong, Tabs } from "@chakra-ui/react";
import { LuHouse, LuNotebook, LuUser } from "react-icons/lu";
import { InputFloatingLabel } from "st-peter-ui";

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
              <InputFloatingLabel marginBottom={0} label="Last Name" />
              <InputFloatingLabel marginBottom={0} label="First Name" />
              <InputFloatingLabel marginBottom={0} label="Midlle Name" />
              <InputFloatingLabel marginBottom={0} label="Suffix" />
            </Flex>
          </Flex>

          <Flex flexDir="column" gap="2">
            <Strong fontSize="14px" color="gray.600" letterSpacing="-0.4">
              Geographic
            </Strong>

            <Separator />

            <Flex flexDir="column" px={1}>
              <InputFloatingLabel marginBottom={0} label="Gender" />
              <InputFloatingLabel marginBottom={0} label="Date Of Birth" />
              <InputFloatingLabel marginBottom={0} label="Place of Birth" />
              <InputFloatingLabel marginBottom={0} label="Civil Status" />
              <InputFloatingLabel marginBottom={0} label="Nationality" />
              <InputFloatingLabel
                marginBottom={0}
                label="Naturalization Date"
              />
              <InputFloatingLabel marginBottom={0} label="Height" />
              <InputFloatingLabel marginBottom={0} label="Weight" />
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
              <InputFloatingLabel label="Lot/Bldg/Unit No." />
              <InputFloatingLabel label="Street" />
              <InputFloatingLabel label="Barangay" />
              <InputFloatingLabel label="District" />
              <InputFloatingLabel label="City" />
              <InputFloatingLabel label="Province" />
              <InputFloatingLabel label="Zip Code" />
            </Flex>
          </Flex>

          <Flex flexDir="column" gap="2">
            <Strong fontSize="14px" color="gray.600" letterSpacing="-0.4">
              Office
            </Strong>

            <Separator />

            <Flex flexDir="column" px={1}>
              <InputFloatingLabel label="Lot/Bldg/Unit No." />
              <InputFloatingLabel label="Street" />
              <InputFloatingLabel label="Barangay" />
              <InputFloatingLabel label="District" />
              <InputFloatingLabel label="City" />
              <InputFloatingLabel label="Province" />
              <InputFloatingLabel label="Zip Code" />
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
              <InputFloatingLabel label="Mobile" />
              <InputFloatingLabel label="Landline" />
              <InputFloatingLabel label="Email" />
            </Flex>
          </Flex>
        </Flex>
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default AgentEditFormMobile;
