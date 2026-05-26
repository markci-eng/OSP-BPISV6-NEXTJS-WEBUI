import {
  Box,
  CheckboxCard,
  createListCollection,
  Flex,
  Grid,
  Separator,
  Span,
  Strong,
  Button,
} from "@chakra-ui/react";
import type { CheckedPlan } from "./reinstatement.types";
import {
  Body,
  InputFloatingLabel,
  PrimaryLgFlexButton,
  PrimaryMdFlexButton,
  SelectFloatingLabel,
} from "st-peter-ui";
import { useState } from "react";
import { ReinstatementForm } from "./reinstatement-form";
import { lapsedPlans } from "./data";
import { ReinstatementSummaryPage } from "./ri-summary";
import PaymentPage from "./payment";
import { FaCcMastercard, FaFileShield, FaLock } from "react-icons/fa6";
import { FaFileAlt, FaFileUpload } from "react-icons/fa";
import DocumentUploader from "@/components/document-uploader/DragAndDrop";
import { useRouter } from "next/navigation";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import SingleFileUpload from "@/components/inputs/single-file-upload";
import { Page } from "@/components/page/page";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_BUTTON_STYLES,
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

const steps = ["Select Lapsed Plan", "Review Reinstatement", "Payment"];

export function ReinstatementPage({
  onSuccess,
  successLink,
  withPayment = true,
}: {
  onSuccess: (transactionId: string, transactionAmount: number) => void;
  successLink: string;
  withPayment?: boolean;
}) {
  const [checkedPlans, setCheckedPlans] = useState<CheckedPlan[]>([]);
  const requestId = "";

  const router = useRouter();

  const stepsData = [
    {
      title: "Select Lapsed Plan",
      icon: FaFileAlt,
      content: (
        <ReinstatementForm
          lapsedPlans={lapsedPlans}
          onCheckedPlansChange={(selected) => setCheckedPlans(selected)}
        />
      ),
      validateBeforeNext: () => {
        if (checkedPlans.length === 0) {
          alert("Please select at least one plan to reinstate.");
          return false;
        }
        return true;
      },
    },
    {
      title: "Upload Documents",
      icon: FaFileUpload,
      content: (
        <Box mt={5}>
          <DocumentUploader />
        </Box>
      ),
    },

    ...(withPayment
      ? [
          {
            title: "Review Reinstatement",
            icon: FaFileShield,
            content: (
              <ReinstatementSummaryPage
                selectedPlans={checkedPlans}
                onSubmit={() => {}}
                onBack={() => {}}
              />
            ),
          },
          {
            title: "Payment",
            icon: FaCcMastercard,
            content: <PaymentPage successLink={successLink + requestId} />,
          },
        ]
      : []),
  ];

  const riTypes = createListCollection({
    items: [
      { label: "RI - NEW", value: "new" },
      { label: "RI - OLD", value: "old" },
      { label: "RI - UPDATE", value: "update" },
      { label: "RI - NEW SAME LPA", value: "same" },
      { label: "RI / TRANSFER", value: "ritf" },
    ],
  });

  const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
    },

    {
      label: "Planholder",
      href: "/plan-management/planholder",
    },

    {
      label: "PI123453I",
      href: "/plan-management/planholder/PI123453I",
    },
    {
      label: "Reinstatement",
      href: "#",
    },
  ];

  const { messageBox } = useMessageDialog();

  return (
    // <FormSteps
    //   stepsData={stepsData}
    //   title={"Reinstatement Application"}
    //   description={
    //     "Quickly bring your plan back on track by reactivating a lapsed plan."
    //   }
    // />
    <Page
      breadcrumbItems={breadcrumbItems}
      title={"Reinstatement Application"}
      description="Quickly bring your plan back on track by reactivating a lapsed plan."
    >
      <Box
        my={{ base: 4, md: 5 }}
        p={{ base: 4, md: 5 }}
        bg={BRAND_COLORS.white}
        borderWidth="1px"
        borderColor="gray.200"
        boxShadow={STANDARD_SHADOWS.level1}
        borderRadius={STANDARD_RADIUS.md}
      >
        <Strong color={BRAND_COLORS.primaryGreen}>Basic Information</Strong>
        <Separator my={3} />
        <Grid
          templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
          gap={{ base: 0, md: 5 }}
        >
          <SelectFloatingLabel
            label={"RI Types"}
            collection={riTypes}
            required
          />
          <InputFloatingLabel label="Contact Number" type="number" required />
        </Grid>
      </Box>
      <Box
        my={{ base: 4, md: 5 }}
        p={{ base: 4, md: 5 }}
        bg={BRAND_COLORS.white}
        borderWidth="1px"
        borderColor="gray.200"
        boxShadow={STANDARD_SHADOWS.level1}
        borderRadius={STANDARD_RADIUS.md}
      >
        <Strong color={BRAND_COLORS.primaryGreen}>
          Upload Required Documents
        </Strong>
        <Separator my={3} />
        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={5}>
          <SingleFileUpload
            label={"Reinstatement Form"}
            description={"Upload the Reinstatement Form"}
            required={true}
          />
          <SingleFileUpload
            label={"Life Plan Agreement Form"}
            description={"Upload the Life Plan Agreement Form"}
            required={true}
          />
          <SingleFileUpload
            label={"Valid Government-Issued ID"}
            description={"Upload a valid government-issued ID"}
            required={true}
          />
          <SingleFileUpload
            label={"Proof of Payment/Official Receipt"}
            description={"Upload the Proof of Payment/Official Receipt"}
            required={true}
          />
        </Grid>
      </Box>
      <CheckboxCard.Root
        my={{ base: 4, md: 5 }}
        variant={"surface"}
        colorPalette="green"
        borderRadius={STANDARD_RADIUS.md}
      >
        <CheckboxCard.HiddenInput />
        <CheckboxCard.Control>
          <CheckboxCard.Indicator />
          <CheckboxCard.Label>
            <Span>
              I certify that all information provided is true and correct. I
              understand that my application is subject to review and approval,
              and that submission does not guarantee reinstatement.{" "}
              <Span color="red.500">*</Span>
            </Span>
          </CheckboxCard.Label>
        </CheckboxCard.Control>
      </CheckboxCard.Root>
      <Flex
        justify={{ base: "stretch", sm: "flex-end" }}
        direction={{ base: "column", sm: "row" }}
        gap={2}
      >
        <Button
          variant="outline"
          w={{ base: "full", sm: "auto" }}
          {...STANDARD_BUTTON_STYLES.md}
          onClick={() => router.push("/plan-management/planholder")}
        >
          Cancel
        </Button>
        <Button
          w={{ base: "full", sm: "auto" }}
          {...STANDARD_BUTTON_STYLES.md}
          bg={BRAND_COLORS.primaryGreen}
          color="white"
          _hover={{ bg: BRAND_COLORS.darkGreen }}
          onClick={async () => {
            const confirm = await messageBox({
              title: "CONFIRMATION",
              message: "Are you sure you want to submit the application?",
              confirmText: "Submit",
              cancelText: "No",
              variant: "confirmation",
            });

            if (confirm) {
              router.push(successLink + requestId);
            }
          }}
        >
          Submit Reinstatement Application
        </Button>
      </Flex>
    </Page>
  );
}
