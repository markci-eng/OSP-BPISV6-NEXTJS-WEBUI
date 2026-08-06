import {
  Box,
  CheckboxCard,
  createListCollection,
  Grid,
  Span,
  Text,
} from "@chakra-ui/react";
import { PrimaryMdFlexButton } from "st-peter-ui";
import { useRouter } from "next/navigation";
import {
  StaticCard,
  FloatingLabelInput,
  FloatingLabelSelect,
  SingleFileUpload,
  useMessageDialog,
} from "osp-ui-kit";
import { Page } from "osp-ui-kit";
import { LuFileText, LuInfo, LuUpload } from "react-icons/lu";
import { PlanDetailsData } from "@/app/(bpis)/plan-management/data/plan-details.data";

const steps = ["Select Lapsed Plan", "Review Reinstatement", "Payment"];

const peso = (amount: number) =>
  "₱ " + amount.toLocaleString(undefined, { minimumFractionDigits: 2 });

export function ReinstatementPage({
  successLink,
}: {
  onSuccess: (transactionId: string, transactionAmount: number) => void;
  successLink: string;
  withPayment?: boolean;
}) {
  const requestId = "";

  const router = useRouter();
  const { messageBox } = useMessageDialog();

  // The lapsed plan being reinstated.
  const plan = PlanDetailsData[0];

  const planTiles = [
    { label: "LPA Number", value: plan.lpaNumber },
    { label: "Plan", value: plan.planDescription },
    { label: "Plan Code", value: plan.planCode },
    {
      label: "Effectivity Date",
      value: plan.effectivityDate.toLocaleDateString(),
    },
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

  return (
    <Page.Root
      title={"Reinstatement Application"}
      description="Quickly bring your plan back on track by reactivating a lapsed plan."
    >
      <Page.MainContent>
        <StaticCard
          activeIcon={<LuFileText />}
          title="Plan Details"
          subtitle="Details of the lapsed plan being reinstated."
        >
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(auto-fit, minmax(200px, 1fr))",
            }}
            gap={3}
          >
            {planTiles.map((tile) => (
              <Box
                key={tile.label}
                p={4}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="lg"
                bg="gray.50"
              >
                <Text fontSize="xs" color="gray.500" mb={1}>
                  {tile.label}
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                  {tile.value}
                </Text>
              </Box>
            ))}
          </Grid>
        </StaticCard>
        <StaticCard
          activeIcon={<LuInfo />}
          title="Basic Information"
          subtitle="Provide the reinstatement type and contact details."
        >
          <Grid
            templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
            gapX={5}
          >
            <FloatingLabelSelect label={"RI Types"}>
              {riTypes.items.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </FloatingLabelSelect>
            <FloatingLabelInput label="Contact Number" type="mobile" required />
          </Grid>
        </StaticCard>
        <StaticCard
          activeIcon={<LuUpload />}
          title="Upload Required Documents"
          subtitle="Attach the required supporting documents."
        >
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
        </StaticCard>
        <CheckboxCard.Root
          bg={"white"}
          my={1}
          variant={"surface"}
          colorPalette="green"
        >
          <CheckboxCard.HiddenInput />
          <CheckboxCard.Control>
            <CheckboxCard.Indicator />
            <CheckboxCard.Label>
              <Span>
                I certify that all information provided is true and correct. I
                understand that my application is subject to review and
                approval, and that submission does not guarantee reinstatement.{" "}
                <Span color="red.500">*</Span>
              </Span>
            </CheckboxCard.Label>
          </CheckboxCard.Control>
        </CheckboxCard.Root>
        <PrimaryMdFlexButton
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
        </PrimaryMdFlexButton>
      </Page.MainContent>
    </Page.Root>
  );
}
