"use client";
import {
  VStack,
  Box,
  Grid,
  Checkbox,
  Dialog,
  Span,
  Card,
  Icon,
  Flex,
  Separator,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { H4, Small, Body, CancelButton, ConfirmButton, H3 } from "st-peter-ui";
import { FaRegAddressCard } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { useState } from "react";
import { checkboxList } from "./data/checkBoxList";

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <VStack gap={1} align="start" minW={0}>
    <Small color="gray.500">{label}</Small>
    <Body>
      <Span fontWeight="semibold">{value}</Span>
    </Body>
  </VStack>
);

const SectionCardHeader = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <Flex align="center" gap={2}>
    <Icon boxSize={5}>{icon}</Icon>
    <H4>{title}</H4>
  </Flex>
);

const Confirmation = () => {
  const stored = sessionStorage.getItem("selectedPlan");
  const selectedPlan = stored ? JSON.parse(stored) : null;

  const [openDialog, setOpenDialog] = useState(false);
  const [pendingCheck, setPendingCheck] = useState<number | null>(null);

  return (
    <div>
      {/* ORDER SUMMARY */}
      <Card.Root
        mb={8}
        bg="white"
        shadow="sm"
        borderWidth="1px"
        rounded="lg"
        overflow="hidden"
      >
        <Card.Header py={4} px={6} borderBottomWidth="1px">
          <SectionCardHeader
            icon={<FaRegAddressCard />}
            title="Order Summary"
          />
        </Card.Header>
        <Card.Body px={6} py={5}>
          <Grid templateColumns={{ base: "1fr", md: "repeat(4,1fr)" }} gap={6}>
            <InfoItem
              label="Plan"
              value={selectedPlan ? selectedPlan.planDesc : "-"}
            />
            <InfoItem
              label="Mode"
              value={
                selectedPlan
                  ? selectedPlan.mode === "M"
                    ? "Monthly"
                    : selectedPlan.mode === "Q"
                      ? "Quarterly"
                      : selectedPlan.mode === "S"
                        ? "Semi-Annual"
                        : selectedPlan.mode === "A"
                          ? "Annual"
                          : selectedPlan.mode === "C"
                            ? "Cash"
                            : selectedPlan.mode
                  : "-"
              }
            />
            <InfoItem
              label="Contract Price"
              value={selectedPlan ? `₱ ${selectedPlan.contractPrice}` : "-"}
            />
            <InfoItem
              label="Total Amount Payable"
              value={selectedPlan ? `₱ ${selectedPlan.ipInstAmt}` : "-"}
            />
          </Grid>
        </Card.Body>
      </Card.Root>

      {/* LIFE PLAN APPLICATION */}
      <Card.Root
        mb={8}
        bg="white"
        shadow="sm"
        borderWidth="1px"
        rounded="lg"
        overflow="hidden"
      >
        <Card.Header py={4} px={6} borderBottomWidth="1px">
          <SectionCardHeader
            icon={<FaRegUser />}
            title="Life Plan Application"
          />
        </Card.Header>
        <Card.Body px={6} py={5}>
          <Tabs.Root defaultValue="personal" variant="line">
            <Tabs.List>
              <Tabs.Trigger value="personal">
                <Flex align="center" gap={2}>
                  <Icon boxSize={4} color="gray.700">
                    <FaRegUser />
                  </Icon>
                  <Text>Personal Info</Text>
                </Flex>
              </Tabs.Trigger>

              <Tabs.Trigger value="residential">
                <Flex align="center" gap={2}>
                  <Icon boxSize={4} color="gray.700">
                    <FaRegAddressCard />
                  </Icon>
                  <Text>Residential Address</Text>
                </Flex>
              </Tabs.Trigger>

              <Tabs.Trigger value="employment">
                <Flex align="center" gap={2}>
                  <Icon boxSize={4} color="gray.700">
                    <IoIosInformationCircleOutline />
                  </Icon>
                  <Text>Employment</Text>
                </Flex>
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="personal">
              <Box py={6}>
                <Grid
                  templateColumns={{ base: "1fr", md: "repeat(4,1fr)" }}
                  gap={6}
                >
                  <InfoItem label="Selected ID Type" value="Driver's License" />
                  <InfoItem label="Uploaded ID" value="Id.png" />
                  <InfoItem label="Last Name" value="Dela Cruz" />
                  <InfoItem label="First Name" value="Juan" />
                  <InfoItem label="Middle Name" value="Reyes" />
                  <InfoItem label="Suffix" value="N/A" />
                  <InfoItem label="Date of Birth" value="January 1, 1990" />
                  <InfoItem label="Gender" value="Male" />
                  <InfoItem label="Contact Number" value="+63 912 345 6789" />
                  <InfoItem label="Email" value="juan.delacruz@example.com" />
                  <InfoItem label="Landline Number" value="+63 2 123 4567" />
                  <InfoItem
                    label="Mailing Address"
                    value="123 Main St, Manila, Philippines"
                  />
                  <InfoItem label="Insurability" value="Insurable" />
                </Grid>
              </Box>
            </Tabs.Content>

            <Tabs.Content value="residential">
              <Box py={6}>
                <Grid
                  templateColumns={{ base: "1fr", md: "repeat(4,1fr)" }}
                  gap={6}
                >
                  <InfoItem label="Lot #" value="Lot 12-B" />
                  <InfoItem label="Street" value="Maple Street" />
                  <InfoItem label="Province" value="Cavite" />
                  <InfoItem label="City" value="Dasmariñas" />
                  <InfoItem label="District" value="District II" />
                  <InfoItem label="Barangay" value="Barangay Sampaloc" />
                </Grid>
              </Box>
            </Tabs.Content>

            <Tabs.Content value="employment">
              <Box py={6}>
                <Grid
                  templateColumns={{ base: "1fr", md: "repeat(4,1fr)" }}
                  gap={6}
                >
                  <InfoItem label="Occupation" value="Software Engineer" />
                  <InfoItem label="Employer Name" value="Acme Corporation" />
                  <InfoItem label="Employment Status" value="Full-time" />
                  <InfoItem
                    label="Office Address"
                    value="456 Business Rd, Makati, Philippines"
                  />
                  <InfoItem label="TIN" value="123-456-789" />
                  <InfoItem label="SSS/GSIS" value="SSS-01-2345678" />
                  <InfoItem
                    label="Other Source of Fund"
                    value="Freelance consulting"
                  />
                </Grid>
              </Box>
            </Tabs.Content>
          </Tabs.Root>
        </Card.Body>
      </Card.Root>

      {/* BENEFICIARIES */}
      <Card.Root
        mb={8}
        bg="white"
        shadow="sm"
        borderWidth="1px"
        rounded="lg"
        overflow="hidden"
      >
        <Card.Header py={4} px={6} borderBottomWidth="1px">
          <SectionCardHeader
            icon={<FaRegAddressCard />}
            title="Beneficiaries"
          />
        </Card.Header>
        <Card.Body px={6} py={5}>
          <Grid templateColumns={{ base: "1fr", md: "repeat(4,1fr)" }} gap={6}>
            <InfoItem label="Name" value="Liz Ann L. Rivas" />
            <InfoItem label="Relationship" value="Cousin" />
            <InfoItem label="Date of Birth" value="Nov 02 1990" />
            <InfoItem
              label="Address"
              value="B2 L8 CAMERON ST PRICETOWN SUBDIVISION CONGRESSIONAL ROAD EXTENSION BAGUMBONG BARANGAY 171"
            />
          </Grid>
          <Separator my={6} />
          <Grid templateColumns={{ base: "1fr", md: "repeat(4,1fr)" }} gap={6}>
            <InfoItem label="Name" value="Liz Ann L. Rivas" />
            <InfoItem label="Relationship" value="Cousin" />
            <InfoItem label="Date of Birth" value="Nov 02 1990" />
            <InfoItem
              label="Address"
              value="B2 L8 CAMERON ST PRICETOWN SUBDIVISION CONGRESSIONAL ROAD EXTENSION BAGUMBONG BARANGAY 171"
            />
          </Grid>
        </Card.Body>
      </Card.Root>

      {/* CONFIRMATION */}
      <Card.Root
        bg="white"
        shadow="sm"
        borderWidth="1px"
        rounded="lg"
        overflow="hidden"
      >
        <Card.Header py={4} px={6} borderBottomWidth="1px">
          <SectionCardHeader
            icon={<IoIosInformationCircleOutline />}
            title="Confirmation"
          />
        </Card.Header>
        <Card.Body px={6} py={5}>
          <VStack align="stretch" gap={4}>
            {checkboxList.map((item, index) => (
              <Box
                key={index}
                p={4}
                borderWidth="1px"
                rounded="md"
                bg="gray.50"
                _hover={{ bg: "gray.100" }}
                transition="background 0.15s ease"
              >
                <Checkbox.Root display="flex" alignItems="flex-start" gap={3}>
                  <Checkbox.HiddenInput />
                  <Checkbox.Control
                    mt={1}
                    onClick={(e) => {
                      e.preventDefault();
                      setPendingCheck(index);
                      setOpenDialog(true);
                    }}
                  />
                  <Checkbox.Label>{item.checkBoxTitle}.</Checkbox.Label>
                </Checkbox.Root>
              </Box>
            ))}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* DIALOG IMPLEMENTATION */}
      <Box w={"100%"}>
        <Dialog.Root
          open={openDialog}
          onOpenChange={(details) => {
            setOpenDialog(details.open);
          }}
          size={{ mdDown: "full", md: "xl" }}
          scrollBehavior="inside"
        >
          {" "}
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content bg="white" p={6} rounded="md" shadow="lg">
              <Dialog.CloseTrigger />

              <Dialog.Header>
                <H3>
                  {pendingCheck !== null
                    ? checkboxList[pendingCheck]?.title || "Confirmation"
                    : "Confirmation"}
                </H3>
              </Dialog.Header>

              <Dialog.Body>
                {pendingCheck !== null
                  ? checkboxList[pendingCheck]?.description ||
                    "Please review and confirm before proceeding."
                  : "Please review and confirm before proceeding."}
              </Dialog.Body>

              <Dialog.Footer display="flex" justifyContent="flex-end" gap={3}>
                <CancelButton
                  onClick={() => {
                    setOpenDialog(false);
                    setPendingCheck(null);
                  }}
                ></CancelButton>

                <ConfirmButton
                  onClick={() => {
                    const checkboxInputs = document.querySelectorAll(
                      "input[type='checkbox']",
                    );
                    const input = checkboxInputs[
                      pendingCheck ?? 0
                    ] as HTMLInputElement;

                    input.checked = true;

                    setOpenDialog(false);
                    setPendingCheck(null);
                  }}
                ></ConfirmButton>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </Box>
    </div>
  );
};

export default Confirmation;
