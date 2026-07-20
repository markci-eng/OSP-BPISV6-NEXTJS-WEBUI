"use client";

import React from "react";
import { Box, createListCollection, Flex, Grid, Text } from "@chakra-ui/react";
import { LuCalendar, LuUpload, LuUser } from "react-icons/lu";

import SingleFileUpload from "@/components/inputs/single-file-upload";
import { PlanholderInfoType } from "@/components/plan-management/planholders/planholders.types";
import { Card } from "@/claude components/card-accordion/card";
import InfoCard from "@/claude components/info-card/info-card";
import { RowItem } from "@/claude components/info-card/row-item";
import InfoItem from "@/components/common/info-item/info-item";

import { ClaimInfoState } from "./claims.types";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";
import { FloatingLabelSelect } from "@/components/inputs/floating-label-select";

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
  if (!p) return "—";
  return (
    [p.firstName, p.middleName, p.lastName, p.suffix]
      .filter(Boolean)
      .join(" ")
      .trim() || "—"
  );
};

// Wraps SingleFileUpload so a tap anywhere on the card opens the file picker.
// Clicks on the component's own buttons (Upload/Replace/Remove) are left alone.
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
        "& > div": {
          height: "100%",
          width: "100%",
          borderColor: "transparent",
          boxShadow: "none",
          background: uploaded ? "var(--chakra-colors-green-50)" : undefined,
        },
        "& svg": { display: "none" },
        "& button svg": { display: "inline-block" },
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
    <Box py={3}>
      <InfoCard>
        Please ensure all required documents are ready and the incident details
        are accurate before proceeding to the next step.
      </InfoCard>

      <Flex flexDir="column" gap={4} mt={5}>
        {/* Planholder Detail */}
        <Card
          activeIcon={<LuUser />}
          title="Planholder Detail"
          subtitle={planholder?.lpaNumber ?? ""}
        >
          {(() => {
            const details: { label: string; value?: string | null }[] = [
              { label: "LPA Number", value: planholder?.lpaNumber },
              { label: "Full Name", value: planholderName },
              {
                label: "Date of Birth",
                value: planholder?.dateOfBirth
                  ? new Date(planholder.dateOfBirth).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "—",
              },
              { label: "Gender", value: planholder?.gender },
              { label: "Civil Status", value: planholder?.civilStatus },
              { label: "Nationality", value: planholder?.nationality },
            ];

            return (
              <>
                {/* Mobile: keep the RowItem layout */}
                <Box display={{ base: "block", md: "none" }}>
                  {details.map((d) => (
                    <RowItem key={d.label} label={d.label} value={d.value} />
                  ))}
                </Box>

                {/* Desktop: 3-column InfoItem grid */}
                <Grid
                  display={{ base: "none", md: "grid" }}
                  templateColumns="repeat(3, 1fr)"
                  gap={3}
                  mt={2}
                >
                  {details.map((d) => (
                    <InfoItem key={d.label} label={d.label} value={d.value} />
                  ))}
                </Grid>
              </>
            );
          })()}
        </Card>

        {/* Incident Details */}
        <Card
          activeIcon={<LuCalendar />}
          title="Incident Details"
          subtitle="Provide the details of the incident for this claim"
        >
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap={3}
            mt={2}
          >
            <FloatingLabelInput
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
            <FloatingLabelSelect
              label="Incident Type"
              value={claimInfo.incidentType ? claimInfo.incidentType : ""}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onClaimInfoChange({
                  ...claimInfo,
                  incidentType: e.target.value ?? "",
                })
              }
            >
              {incidentTypes.items.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </FloatingLabelSelect>
          </Grid>
        </Card>

        {/* Required Documents */}
        <Card
          activeIcon={<LuUpload />}
          title="Required Documents"
          subtitle="Upload one document per item — PDF, PNG or JPG up to 20 MB"
        >
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap={2}
            mt={2}
          >
            {requiredDocs.map((doc, index) => (
              <ClickableUpload key={index} doc={doc} />
            ))}
          </Grid>
          <Text fontSize="xs" color="gray.400" mt={3}>
            Items marked with{" "}
            <Text as="span" color="red.500">
              *
            </Text>{" "}
            are required.
          </Text>
        </Card>
      </Flex>
    </Box>
  );
};

export default ClaimInfoForm;
