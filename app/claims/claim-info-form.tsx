"use client";

import React from "react";
import { Box, createListCollection, Flex, Grid, Text } from "@chakra-ui/react";
import { InputFloatingLabel, SelectFloatingLabel } from "st-peter-ui";
import SingleFileUpload from "@/components/inputs/single-file-upload";
import { PlanholderInfoType } from "@/components/plan-management/planholders/planholders.types";
import { ClaimInfoState } from "./claims.types";
import Caption from "@/components/texts/Caption";
import Card from "@/components/cards/Card";

interface DocReqLabel {
  label: string;
  description: string;
  required?: boolean;
}

const requiredDocs: DocReqLabel[] = [
  {
    label: "Registered Death Certificate",
    description:
      "With seal and issued by the Local Civil Registrar or Philippine Statistics Authority (PSA)",
    required: true,
  },
  {
    label: "Planholder Valid ID",
    description: "Government-issued ID of the planholder",
    required: true,
  },
  {
    label: "Statement of Claimant Form",
    description: "Notarized statement signed by the claimant",
    required: true,
  },
  {
    label: "Claimant/Beneficiary Valid ID",
    description: "Government-issued ID of the claimant",
    required: true,
  },
  {
    label: "Marriage Contract",
    description:
      "If the claimant is the spouse or if the planholder's daughter is already married",
  },
  {
    label: "Medical History",
    description:
      "If plan is less than 1 year or if the cause of death is accident",
  },
  {
    label: "Attending Physician's Statement",
    description: "Signed by the attending physician",
  },
];

const incidentTypes = createListCollection({
  items: [
    { value: "Accident", label: "Accident" },
    { value: "Natural Death", label: "Natural Death" },
    { value: "Homicide", label: "Homicide" },
    { value: "Suicide", label: "Suicide" },
    { value: "Undetermined", label: "Undetermined" },
    { value: "Old Age", label: "Old Age" },
  ],
});

const composePlanholderName = (p?: PlanholderInfoType): string => {
  if (!p) return "";
  return [p.firstName, p.middleName, p.lastName, p.suffix]
    .filter(Boolean)
    .join(" ")
    .trim();
};

// Wraps SingleFileUpload so a tap anywhere on the card opens the file picker
// (one click). Clicks on the component's own buttons (Upload/Replace/Remove)
// are left alone so they keep their existing behavior.
const ClickableUpload = ({ doc }: { doc: DocReqLabel }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const uploaded = Boolean(file);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    ref.current?.querySelector<HTMLInputElement>('input[type="file"]')?.click();
  };

  return (
    <Box
      ref={ref}
      onClick={handleClick}
      cursor="pointer"
      h="100%"
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="none"
      borderColor={uploaded ? "green.500" : "border"}
      transition="border-color 0.15s"
      css={{
        // make the inner card fill the wrapper so cards align in height;
        // drop its own border/bg so the wrapper is the single visible frame
        "& > div": {
          height: "100%",
          width: "100%",
          borderColor: "transparent",
          boxShadow: "none",
          background: uploaded ? "var(--chakra-colors-green-50)" : undefined,
        },
        // remove the leading document icon, keep button icons
        "& svg": { display: "none" },
        "& button svg": { display: "inline-block" },
        // on mobile, let the action button take the full width
        "@media (max-width: 48em)": {
          "& button": { width: "100%" },
        },
      }}
    >
      <SingleFileUpload
        label={doc.label}
        description={doc.description}
        required={doc.required}
        value={file}
        onFileChange={setFile}
      />
    </Box>
  );
};

interface ClaimInfoFormProps {
  planholder?: PlanholderInfoType;
  claimInfo: ClaimInfoState;
  onClaimInfoChange: (next: ClaimInfoState) => void;
}

const ClaimInfoForm = ({
  planholder,
  claimInfo,
  onClaimInfoChange,
}: ClaimInfoFormProps) => {
  const planholderName = composePlanholderName(planholder);

  return (
    <Flex flexDir="column" gap={4}>
      {/* Planholder Detail */}
      <Card.Root title="Planholder Detail">
        <Card.MainContent>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gapX={{
              base: 2,
            }}
          >
            <InputFloatingLabel
              label="LPA Number"
              value={planholder?.lpaNumber ?? ""}
              readOnly
            />
            <InputFloatingLabel
              label="Planholder Name"
              value={planholderName}
              readOnly
            />
            <InputFloatingLabel
              label="Date of Birth"
              type="date"
              value={
                planholder?.dateOfBirth
                  ? new Date(planholder.dateOfBirth).toISOString().split("T")[0]
                  : ""
              }
              readOnly
            />
            <InputFloatingLabel
              label="Gender"
              value={planholder?.gender ?? ""}
              readOnly
            />
            <InputFloatingLabel
              label="Civil Status"
              value={planholder?.civilStatus ?? ""}
              readOnly
            />
            <InputFloatingLabel
              label="Nationality"
              value={planholder?.nationality ?? ""}
              readOnly
            />
          </Grid>
        </Card.MainContent>
      </Card.Root>

      {/* Claim Info */}
      <Card.Root title="Incident Details">
        <Card.MainContent>
          <Caption>Provide the incident details for this claim.</Caption>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gapX={{
              base: 2,
            }}
          >
            <InputFloatingLabel
              label="Incident Date"
              type="date"
              value={claimInfo.incidentDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onClaimInfoChange({
                  ...claimInfo,
                  incidentDate: e.target.value,
                })
              }
            />
            <SelectFloatingLabel
              label="Incident Type"
              collection={incidentTypes}
              value={claimInfo.incidentType ? [claimInfo.incidentType] : []}
              onValueChange={(e: { value: string[] }) =>
                onClaimInfoChange({
                  ...claimInfo,
                  incidentType: e.value[0] ?? "",
                })
              }
            />
          </Grid>
        </Card.MainContent>
      </Card.Root>

      {/* Required Documents */}
      <Card.Root title="Required Documents">
        <Card.MainContent>
          <Box mb={2}>
            <Caption>
              Upload one document per item. PDF, PNG or JPG up to 20MB.
            </Caption>
          </Box>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={2}>
            {requiredDocs.map((doc, index) => (
              <ClickableUpload key={index} doc={doc} />
            ))}
          </Grid>

          <Text fontSize="xs" color="gray.400" mt={2} px={2}>
            Items marked with{" "}
            <Text as="span" color="red.500">
              *
            </Text>{" "}
            are required.
          </Text>
        </Card.MainContent>
      </Card.Root>
    </Flex>
  );
};

export default ClaimInfoForm;
