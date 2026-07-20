"use client";

import {
  Box,
  CloseButton,
  Dialog,
  Field,
  Flex,
  Grid,
  GridItem,
  Input,
  Portal,
  Separator,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { IconType } from "react-icons";
import { FaFileAlt } from "react-icons/fa";
import { FaFileShield } from "react-icons/fa6";
import {
  LuBanknote,
  LuCirclePlus,
  LuFileText,
  LuMapPin,
  LuMinus,
  LuPencil,
  LuPhone,
} from "react-icons/lu";
import { PrimaryMdButton, SecondaryMdButton } from "st-peter-ui";
import { z } from "zod";

import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import DocumentUploader from "@/components/document-uploader/DragAndDrop";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";
import { FloatingLabelSelect } from "@/components/inputs/floating-label-select";
import Page from "@/claude components/layout/page/Page";
import {
  Tab,
  type TabItem,
} from "@/components/new-planholder-profile/components/tab/tab";
import { Card } from "@/claude components/card-accordion/card";
import FormSteps from "@/claude components/FormSteps";
import InfoCard from "@/claude components/info-card/info-card";
import SuccessMessage from "@/claude components/pages/success-message";

// ---- Types ----
interface RopRecord {
  lpaNo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: string;
  planType: string;
  ropSched: string;
  ropDate: string;
  totalAmt: string;
}

interface AddressFields {
  lot: string;
  street: string;
  barangay: string;
  district: string;
  city: string;
  province: string;
  zipCode: string;
}

// ---- Mock data ----
const MOCK_CONTACT = {
  email: "planholder@example.com",
  mobile: "09123456789",
};

const INITIAL_ADDRESS: AddressFields = {
  lot: "1234",
  street: "Mabini Street",
  barangay: "San Agustin",
  district: "District 1",
  city: "Dasmariñas",
  province: "Cavite",
  zipCode: "4114",
};

const EXISTING_PAYOUT = {
  channel: "GCash",
  account: "09171234567",
  type: "E-Wallet",
};

// ---- Address edit schema ----
const AddressSchema = z.object({
  lot: z.string(),
  street: z.string().min(1, "Street is required"),
  barangay: z.string().min(1, "Barangay is required"),
  district: z.string(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  zipCode: z.string().min(1, "Zip code is required"),
});

type AddressFormValues = z.infer<typeof AddressSchema>;

function getFullName(r: RopRecord) {
  return [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" ");
}

// ---- Payout info item: dashed row on mobile, card on desktop ----
function PayoutInfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <Box
      borderWidth={{ base: "0", md: "1px" }}
      borderColor="gray.200"
      borderRadius={{ md: "lg" }}
      bg={{ md: "gray.50" }}
      px={{ base: 0, md: 4 }}
      py={{ base: 1.5, md: 3 }}
    >
      <Flex
        align={{ base: "center", md: "flex-start" }}
        direction={{ base: "row", md: "column" }}
        gap={{ base: 0, md: 1 }}
        fontSize="sm"
      >
        <Text
          color="gray.500"
          whiteSpace="nowrap"
          fontSize={{ base: "sm", md: "xs" }}
          fontWeight={{ md: "medium" }}
        >
          {label}
        </Text>

        <Box
          display={{ base: "block", md: "none" }}
          flex="1"
          mx={3}
          borderBottom="1px dashed"
          borderColor="gray.300"
          transform="translateY(2px)"
        />

        <Text
          fontWeight={{ base: "medium", md: "semibold" }}
          textAlign={{ base: "right", md: "left" }}
          whiteSpace="nowrap"
          color="gray.900"
        >
          {value ?? "-"}
        </Text>
      </Flex>
    </Box>
  );
}

// ---- Placeholder document box ----
function DocumentBox({ label }: { label: string }) {
  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="md"
      bg="gray.50"
    >
      <Flex
        align="center"
        justify="center"
        direction="column"
        h="130px"
        gap={2}
      >
        <Box as={LuFileText} boxSize={7} color="gray.400" />
        <Text fontSize="xs" textAlign="center" px={3} color="gray.400">
          {label}
        </Text>
      </Flex>
    </Box>
  );
}

// ---- Edit Address Dialog ----
function EditAddressDialog({
  open,
  address,
  onSave,
  onClose,
}: {
  open: boolean;
  address: AddressFields;
  onSave: (values: AddressFormValues) => void;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(AddressSchema),
    defaultValues: address,
  });

  useEffect(() => {
    if (open) reset(address);
  }, [open]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
      placement="center"
      size="lg"
    >
      <Portal>
        <Dialog.Backdrop zIndex={1000} />
        <Dialog.Positioner zIndex={1001}>
          <Dialog.Content zIndex={1001}>
            <Dialog.Header borderBottomWidth="1px" pb={3}>
              <Dialog.Title fontSize="lg" fontWeight="semibold">
                Edit Planholder Address
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body py={5}>
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                gap={4}
              >
                <Field.Root>
                  <Field.Label fontSize="sm">Lot #</Field.Label>
                  <Input size="sm" {...register("lot")} />
                </Field.Root>

                <Field.Root invalid={!!errors.street}>
                  <Field.Label fontSize="sm">Street</Field.Label>
                  <Input size="sm" {...register("street")} />
                  {errors.street && (
                    <Field.ErrorText>{errors.street.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.barangay}>
                  <Field.Label fontSize="sm">Barangay</Field.Label>
                  <Input size="sm" {...register("barangay")} />
                  {errors.barangay && (
                    <Field.ErrorText>{errors.barangay.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root>
                  <Field.Label fontSize="sm">District</Field.Label>
                  <Input size="sm" {...register("district")} />
                </Field.Root>

                <Field.Root invalid={!!errors.city}>
                  <Field.Label fontSize="sm">City</Field.Label>
                  <Input size="sm" {...register("city")} />
                  {errors.city && (
                    <Field.ErrorText>{errors.city.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.province}>
                  <Field.Label fontSize="sm">Province</Field.Label>
                  <Input size="sm" {...register("province")} />
                  {errors.province && (
                    <Field.ErrorText>{errors.province.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.zipCode}>
                  <Field.Label fontSize="sm">Zip Code</Field.Label>
                  <Input size="sm" {...register("zipCode")} />
                  {errors.zipCode && (
                    <Field.ErrorText>{errors.zipCode.message}</Field.ErrorText>
                  )}
                </Field.Root>
              </Grid>
            </Dialog.Body>

            <Dialog.Footer borderTopWidth="1px" pt={3} gap={2}>
              <SecondaryMdButton onClick={onClose}>Cancel</SecondaryMdButton>
              <PrimaryMdButton onClick={handleSubmit(onSave)}>
                Save Changes
              </PrimaryMdButton>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" onClick={onClose} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

// ---- Step 1: Payout Channel (tab-based) ----
function PayoutChannelStep({
  payoutChannel,
  setPayoutChannel,
  payoutAccount,
  setPayoutAccount,
}: {
  payoutChannel: string;
  setPayoutChannel: (v: string) => void;
  payoutAccount: string;
  setPayoutAccount: (v: string) => void;
}) {
  const existingPage = (
    <Box py={3}>
      <Card
        activeIcon={<LuBanknote />}
        title={`${EXISTING_PAYOUT.channel} Payout`}
        subtitle="Active Registered Channel"
      >
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
          gap={{ base: 0, md: 3 }}
        >
          <PayoutInfoItem
            label="Payout Account"
            value={EXISTING_PAYOUT.account}
          />
          <PayoutInfoItem label="Channel Type" value={EXISTING_PAYOUT.type} />
        </Grid>

        <Separator my={4} />

        <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={3}>
          Registered Documents
        </Text>
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={3}>
          <DocumentBox label="Deposit Slip / E-Wallet Screenshot" />
          <DocumentBox label="Government-issued ID" />
          <DocumentBox label="Specimen Signature" />
        </Grid>
      </Card>
    </Box>
  );

  const newPage = (
    <Box py={3}>
      <InfoCard>
        Kindly upload the required documents and register your preferred payout
        channel.
      </InfoCard>

      <Grid
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
        gap={4}
        mt={4}
      >
        <FloatingLabelSelect
          label="Payout Channel"
          value={payoutChannel}
          onValueChange={setPayoutChannel}
        >
          <option value="GCash">GCash</option>
          <option value="Bank">Bank</option>
          <option value="Maya">Maya</option>
        </FloatingLabelSelect>

        <FloatingLabelInput
          label="Payout Account"
          value={payoutAccount}
          onValueChange={setPayoutAccount}
        />

        <GridItem colSpan={{ base: 1, md: 2 }}>
          <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
            Upload Documents
          </Text>
          <DocumentUploader
            accept=".pdf,.png,.jpg,.jpeg"
            maxFiles={5}
            maxSizeMB={10}
          />
        </GridItem>
      </Grid>
    </Box>
  );

  const tabItems: TabItem[] = [
    {
      icon: LuBanknote,
      label: "Use Existing Payout Channel",
      value: "existing",
      page: existingPage,
    },
    {
      icon: LuCirclePlus,
      label: "Register New Payout Channel",
      value: "new",
      page: newPage,
    },
  ];

  return <Tab tabItems={tabItems} />;
}

// ---- Summary building blocks (agent-summary styling) ----
interface SummaryField {
  label: string;
  value?: string | null;
}

const isEmpty = (value?: string | null) => {
  if (value == null) return true;
  const trimmed = value.trim();
  return trimmed === "" || trimmed.toUpperCase() === "N/A";
};

const EditButton = ({
  onClick,
  label = "Edit",
}: {
  onClick: () => void;
  label?: string;
}) => (
  <Flex
    as="button"
    align="center"
    gap={1.5}
    px={3}
    py={1.5}
    borderRadius="lg"
    borderWidth="1px"
    borderColor="gray.200"
    bg="white"
    color="gray.700"
    fontSize="sm"
    fontWeight="medium"
    cursor="pointer"
    transition="all 0.15s ease"
    _hover={{ bg: "gray.50", borderColor: "gray.300", color: "gray.900" }}
    flexShrink={0}
    onClick={onClick}
  >
    <Box as={LuPencil} boxSize="13px" />
    {label}
  </Flex>
);

const FieldCell = ({ field }: { field: SummaryField }) => {
  const empty = isEmpty(field.value);
  return (
    <Flex
      fontSize="sm"
      py={{ base: 1.5, md: 0 }}
      // Mobile: RowItem-style row (label · dashed leader · value).
      // Desktop: stacked label above value.
      direction={{ base: "row", md: "column" }}
      align={{ base: "center", md: "stretch" }}
      gap={{ base: 0, md: 0.5 }}
      minW={0}
    >
      {/* LABEL */}
      <Text
        color="gray.500"
        whiteSpace="nowrap"
        fontSize={{ base: "sm", md: "xs" }}
        fontWeight={{ base: "normal", md: "medium" }}
        letterSpacing={{ md: "0.01em" }}
      >
        {field.label}
      </Text>

      {/* DASHED LEADER — mobile only */}
      <Box
        display={{ base: "block", md: "none" }}
        flex="1"
        mx={3}
        borderBottom="1px dashed"
        borderColor="gray.300"
        transform="translateY(2px)"
      />

      {/* VALUE */}
      {empty ? (
        <Flex align="center" gap={1} color="gray.400" flexShrink={0}>
          <Box as={LuMinus} boxSize="13px" />
          <Text fontStyle="italic" whiteSpace="nowrap">
            Not provided
          </Text>
        </Flex>
      ) : (
        <Text
          fontWeight="semibold"
          color="gray.900"
          textAlign={{ base: "right", md: "left" }}
          whiteSpace={{ base: "nowrap", md: "normal" }}
          lineHeight={{ md: "1.35" }}
          flexShrink={0}
        >
          {field.value}
        </Text>
      )}
    </Flex>
  );
};

const SectionCard = ({
  icon,
  title,
  description,
  fields,
  onEdit,
  editLabel,
}: {
  icon: IconType;
  title: string;
  description?: string;
  fields: SummaryField[];
  onEdit?: () => void;
  editLabel?: string;
}) => (
  <Box
    bg="white"
    borderWidth="1px"
    borderColor="gray.200"
    borderRadius="2xl"
    shadow="xs"
    overflow="hidden"
  >
    {/* Header */}
    <Flex
      align="flex-start"
      justify="space-between"
      gap={3}
      flexWrap="wrap"
      px={{ base: 4, md: 5 }}
      py={4}
    >
      <Flex align="center" gap={3} minW={0} flex="1 1 auto">
        <Flex
          align="center"
          justify="center"
          boxSize={9}
          borderRadius="lg"
          bg="gray.100"
          color="gray.700"
          flexShrink={0}
        >
          <Box as={icon} boxSize="18px" />
        </Flex>
        <Box minW={0}>
          <Text
            fontSize="md"
            fontWeight="semibold"
            color="gray.900"
            lineHeight="1.2"
          >
            {title}
          </Text>
          {description && (
            <Text fontSize="xs" color="gray.500">
              {description}
            </Text>
          )}
        </Box>
      </Flex>

      {onEdit && (
        <Flex align="center" gap={2} flexShrink={0}>
          <EditButton onClick={onEdit} label={editLabel} />
        </Flex>
      )}
    </Flex>

    {/* Definition grid */}
    <Box
      px={{ base: 4, md: 5 }}
      py={4}
      borderTopWidth="1px"
      borderColor="gray.100"
      bg="white"
    >
      <SimpleGrid
        columns={{ base: 1, md: 4 }}
        columnGap={6}
        rowGap={{ base: 0.5, md: 4 }}
      >
        {fields.map((field) => (
          <FieldCell key={field.label} field={field} />
        ))}
      </SimpleGrid>
    </Box>
  </Box>
);

// ---- Step 2: Review Details ----
function ReviewDetailsStep({
  records,
  address,
  onEditAddress,
  onEditPayout,
  payoutChannel,
  payoutAccount,
}: {
  records: RopRecord[];
  address: AddressFields;
  onEditAddress: () => void;
  onEditPayout?: () => void;
  payoutChannel: string;
  payoutAccount: string;
}) {
  const resolvedChannel = payoutChannel || EXISTING_PAYOUT.channel;
  const resolvedAccount = payoutAccount || EXISTING_PAYOUT.account;

  return (
    <Box py={3}>
      <InfoCard>
        Please review the information below before submitting. You may edit the
        address if needed.
      </InfoCard>

      <Flex direction="column" gap={4} mt={5}>
        {records.map((record) => (
          <SectionCard
            key={record.lpaNo}
            icon={LuFileText}
            title="Plan Details"
            description={record.lpaNo}
            fields={[
              { label: "Contract No.", value: record.lpaNo },
              { label: "Full Name", value: getFullName(record) },
              { label: "Plan Type", value: record.planType },
              { label: "ROP Amount", value: record.totalAmt },
              { label: "Schedule Date", value: record.ropDate },
              { label: "Inst. Schedule", value: record.ropSched },
            ]}
          />
        ))}

        <SectionCard
          icon={LuPhone}
          title="Contact Information"
          description="Phone and email"
          fields={[
            { label: "Email Address", value: MOCK_CONTACT.email },
            { label: "Mobile Number", value: MOCK_CONTACT.mobile },
          ]}
        />

        <SectionCard
          icon={LuMapPin}
          title="Planholder Address"
          description="Residential details"
          onEdit={onEditAddress}
          editLabel="Edit Address"
          fields={[
            { label: "Lot #", value: address.lot },
            { label: "Street", value: address.street },
            { label: "Barangay", value: address.barangay },
            { label: "District", value: address.district },
            { label: "City", value: address.city },
            { label: "Province", value: address.province },
            { label: "Zip Code", value: address.zipCode },
          ]}
        />

        <SectionCard
          icon={LuBanknote}
          title="Payout Details"
          description="Registered payout channel"
          onEdit={onEditPayout}
          fields={[
            { label: "Payout Channel", value: resolvedChannel },
            { label: "Account Number", value: resolvedAccount },
          ]}
        />
      </Flex>
    </Box>
  );
}

// ---- Main exported component ----
export function RopPayoutPage({
  onClickHome,
  onClickTrack,
}: {
  onClickHome: () => void;
  onClickTrack: () => void;
}) {
  const [records, setRecords] = useState<RopRecord[]>([]);
  const [payoutChannel, setPayoutChannel] = useState("");
  const [payoutAccount, setPayoutAccount] = useState("");
  const [address, setAddress] = useState<AddressFields>(INITIAL_ADDRESS);
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [transactionId] = useState(
    `ROP${Math.floor(Math.random() * 1_000_000_000)}`,
  );
  const [submittedAt] = useState(() => new Date().toLocaleString());
  const [currentStep, setCurrentStep] = useState(0);
  const { messageBox } = useMessageDialog();

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedRows");
    if (stored) {
      try {
        setRecords(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const handleSubmit = async () => {
    const confirmed = await messageBox({
      title: "Confirm Submission",
      message: "Would you like to submit your ROP application?",
      variant: "warning",
      confirmText: "Yes, Submit",
      showCancel: true,
      cancelText: "Cancel",
    });
    if (confirmed) {
      setSubmitted(true);
    }
  };

  const stepsData = [
    {
      title: "Payout Channel",
      icon: FaFileAlt,
      content: (
        <PayoutChannelStep
          payoutChannel={payoutChannel}
          setPayoutChannel={setPayoutChannel}
          payoutAccount={payoutAccount}
          setPayoutAccount={setPayoutAccount}
        />
      ),
    },
    {
      title: "Review Details",
      icon: FaFileShield,
      content: (
        <ReviewDetailsStep
          records={records}
          address={address}
          onEditAddress={() => setEditAddressOpen(true)}
          onEditPayout={() => setCurrentStep(0)}
          payoutChannel={payoutChannel}
          payoutAccount={payoutAccount}
        />
      ),
    },
  ];

  if (submitted) {
    return (
      <Page.Root title="Return of Premium" description="Application submitted.">
        <Page.MainContent>
          <SuccessMessage
            title="ROP Successfully Submitted"
            description="Your application has been completed successfully. We will notify you via email or SMS when there is an update."
            primaryActionLabel="Go to Home"
            onPrimaryAction={onClickHome}
            secondaryActionLabel="Track Request"
            onSecondaryAction={onClickTrack}
          >
            <Box
              w="full"
              bg="white"
              borderWidth="1px"
              rounded="md"
              shadow="sm"
              p={{ base: 4, md: 6 }}
            >
              <Text
                fontWeight="semibold"
                mb={2}
                color="gray.700"
                fontSize={{ base: "sm", md: "md" }}
              >
                Reference Details
              </Text>
              <Box h="1px" bg="gray.200" mb={4} />
              <VStack
                gap={3}
                align="stretch"
                fontSize={{ base: "sm", md: "md" }}
              >
                <Flex justify="space-between" wrap="wrap" gap={2}>
                  <Text color="gray.600">Transaction ID:</Text>
                  <Text fontWeight="medium" color="gray.800">
                    {transactionId}
                  </Text>
                </Flex>
                <Flex justify="space-between" wrap="wrap" gap={2}>
                  <Text color="gray.600">Date & Time:</Text>
                  <Text fontWeight="medium" color="gray.800">
                    {submittedAt}
                  </Text>
                </Flex>
              </VStack>
            </Box>
          </SuccessMessage>
        </Page.MainContent>
      </Page.Root>
    );
  }

  return (
    <>
      <Page.Root
        title="Return of Premium"
        description="Register payout & review application."
      >
        <Page.MainContent>
          <FormSteps
            stepsData={stepsData}
            title=""
            description=""
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            onStepsComplete={handleSubmit}
            submitButtonText="Submit Application"
          />
        </Page.MainContent>
      </Page.Root>

      <EditAddressDialog
        open={editAddressOpen}
        address={address}
        onSave={(values) => {
          setAddress(values);
          setEditAddressOpen(false);
        }}
        onClose={() => setEditAddressOpen(false)}
      />
    </>
  );
}
