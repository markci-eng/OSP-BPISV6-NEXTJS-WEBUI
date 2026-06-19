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
  NativeSelect,
  Portal,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaFileAlt } from "react-icons/fa";
import { FaFileShield } from "react-icons/fa6";
import {
  LuBanknote,
  LuCirclePlus,
  LuFileText,
  LuMapPin,
  LuPencil,
  LuPhone,
} from "react-icons/lu";
import { PrimaryMdButton, SecondaryMdButton } from "st-peter-ui";
import { z } from "zod";

import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import DocumentUploader from "@/components/document-uploader/DragAndDrop";
import Page from "@/claude components/layout/page/Page";
import {
  Tab,
  type TabItem,
} from "@/components/new-planholder-profile/components/tab/tab";
import { Card } from "@/claude components/card-accordion/card";
import FormSteps from "@/claude components/FormSteps";
import InfoCard from "@/claude components/info-card/info-card";
import { RowItem } from "@/claude components/info-card/row-item";
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
        <RowItem label="Payout Account" value={EXISTING_PAYOUT.account} />
        <RowItem label="Channel Type" value={EXISTING_PAYOUT.type} />

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
        <Field.Root>
          <Field.Label fontSize="sm">Payout Channel</Field.Label>
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              value={payoutChannel}
              onChange={(e) => setPayoutChannel(e.target.value)}
            >
              <option value="">Select Payout Channel</option>
              <option value="GCash">GCash</option>
              <option value="Bank">Bank</option>
              <option value="Maya">Maya</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>

        <Field.Root>
          <Field.Label fontSize="sm">Payout Account</Field.Label>
          <Input
            size="sm"
            placeholder="Enter account number"
            value={payoutAccount}
            onChange={(e) => setPayoutAccount(e.target.value)}
          />
        </Field.Root>

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

// ---- Step 2: Review Details ----
function ReviewDetailsStep({
  records,
  address,
  onEditAddress,
  payoutChannel,
  payoutAccount,
}: {
  records: RopRecord[];
  address: AddressFields;
  onEditAddress: () => void;
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
          <Card
            key={record.lpaNo}
            activeIcon={<LuFileText />}
            title="Plan Details"
            subtitle={record.lpaNo}
          >
            <RowItem label="Contract No." value={record.lpaNo} />
            <RowItem label="Full Name" value={getFullName(record)} />
            <RowItem label="Plan Type" value={record.planType} />
            <RowItem label="ROP Amount" value={record.totalAmt} />
            <RowItem label="Schedule Date" value={record.ropDate} />
            <RowItem label="Inst. Schedule" value={record.ropSched} />
          </Card>
        ))}

        <Card activeIcon={<LuPhone />} title="Contact Information" subtitle="">
          <RowItem label="Email Address" value={MOCK_CONTACT.email} />
          <RowItem label="Mobile Number" value={MOCK_CONTACT.mobile} />
        </Card>

        <Card activeIcon={<LuMapPin />} title="Planholder Address" subtitle="">
          <Flex justify="flex-end" mb={2}>
            <Box
              as="button"
              onClick={onEditAddress}
              display="inline-flex"
              alignItems="center"
              gap={1}
              fontSize="xs"
              color="blue.600"
              cursor="pointer"
              _hover={{ textDecoration: "underline" }}
            >
              <Box as={LuPencil} boxSize="12px" />
              Edit Address
            </Box>
          </Flex>
          <RowItem label="Lot #" value={address.lot} />
          <RowItem label="Street" value={address.street} />
          <RowItem label="Barangay" value={address.barangay} />
          <RowItem label="District" value={address.district} />
          <RowItem label="City" value={address.city} />
          <RowItem label="Province" value={address.province} />
          <RowItem label="Zip Code" value={address.zipCode} />
        </Card>

        <Card activeIcon={<LuBanknote />} title="Payout Details" subtitle="">
          <RowItem label="Payout Channel" value={resolvedChannel} />
          <RowItem label="Account Number" value={resolvedAccount} />
        </Card>
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
            <VStack gap={1} fontSize="sm">
              <Text color="gray.500">
                Transaction ID:{" "}
                <Box as="span" fontWeight="semibold" color="gray.800">
                  {transactionId}
                </Box>
              </Text>
              <Text color="gray.500">
                Date & Time:{" "}
                <Box as="span" fontWeight="semibold" color="gray.800">
                  {submittedAt}
                </Box>
              </Text>
            </VStack>
          </SuccessMessage>
        </Page.MainContent>
      </Page.Root>
    );
  }

  return (
    <>
      <Page.Root
        title="Return of Premium"
        description="Register your payout channel and review your application."
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
