"use client";
import React, { useState } from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { LuUserPen } from "react-icons/lu";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import {
  FEET_OPTIONS,
  INCH_OPTIONS,
  formatHeight,
  parseHeight,
} from "./person-edit-fields";
import {
  FloatingLabelInput,
  FloatingLabelSelect,
  InputCardAccordion,
} from "osp-ui-kit";

export function PersonalInfoSection({
  selectedPerson,
  entityLabel,
}: {
  selectedPerson?: SalesAgent;
  entityLabel: string;
}) {
  const [personalInfo, setPersonalInfo] = useState<{
    lastName: string;
    firstName: string;
    middleName: string;
    suffix: string;
    gender: string;
    birthDate: string;
    placeOfBirth: string;
    civilStatus: string;
    nationality: string;
    naturalizationDate: string;
    height: string;
    weight: string;
  }>({
    lastName: selectedPerson?.lastName ?? "",
    firstName: selectedPerson?.firstName ?? "",
    middleName: selectedPerson?.middleName ?? "",
    suffix: selectedPerson?.suffix ?? "",
    gender: selectedPerson?.gender ?? "",
    birthDate: selectedPerson?.birthDate ?? "",
    placeOfBirth: selectedPerson?.placeOfBirth ?? "",
    civilStatus: selectedPerson?.civilStatus ?? "",
    nationality: selectedPerson?.nationality ?? "",
    naturalizationDate: selectedPerson?.naturalizationDate ?? "",
    height: selectedPerson?.height ?? "",
    weight: selectedPerson?.weight ?? "",
  });

  const [heightFeet, setHeightFeet] = useState(
    () => parseHeight(selectedPerson?.height).feet,
  );
  const [heightInches, setHeightInches] = useState(
    () => parseHeight(selectedPerson?.height).inches,
  );

  const updatePersonalInfo = (patch: Partial<typeof personalInfo>) =>
    setPersonalInfo((prev) => ({ ...prev, ...patch }));

  const updateHeightFeet = (feet: string) => {
    setHeightFeet(feet);
    updatePersonalInfo({ height: formatHeight(feet, heightInches) });
  };

  const updateHeightInches = (inches: string) => {
    setHeightInches(inches);
    updatePersonalInfo({ height: formatHeight(heightFeet, inches) });
  };

  const isPersonalInfoComplete = Object.values(personalInfo).every(
    (v) => v.trim() !== "",
  );

  return (
    <InputCardAccordion
      defaultOpen
      icon={<LuUserPen />}
      title="Personal Information"
      subtitle={`Update ${entityLabel} personal information`}
      isComplete={isPersonalInfoComplete}
    >
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
        gapX={2}
        gapY={3}
        mb={3}
      >
        <FloatingLabelInput
          required
          label="Last Name"
          value={personalInfo.lastName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updatePersonalInfo({ lastName: e.target.value })
          }
        />
        <FloatingLabelInput
          required
          label="First Name"
          value={personalInfo.firstName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updatePersonalInfo({ firstName: e.target.value })
          }
        />
        <FloatingLabelInput
          label="Middle Name"
          value={personalInfo.middleName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updatePersonalInfo({ middleName: e.target.value })
          }
        />
        <FloatingLabelInput
          label="Suffix"
          value={personalInfo.suffix}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updatePersonalInfo({ suffix: e.target.value })
          }
        />
        <FloatingLabelSelect
          required
          label="Gender"
          value={personalInfo.gender}
          onValueChange={(value) => updatePersonalInfo({ gender: value })}
        >
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </FloatingLabelSelect>
        <FloatingLabelInput
          required
          label="Date of Birth"
          type="date"
          value={personalInfo.birthDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updatePersonalInfo({ birthDate: e.target.value })
          }
        />
        <FloatingLabelInput
          required
          label="Place of Birth"
          value={personalInfo.placeOfBirth}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updatePersonalInfo({ placeOfBirth: e.target.value })
          }
        />
        <FloatingLabelSelect
          required
          label="Civil Status"
          value={personalInfo.civilStatus}
          onValueChange={(value) => updatePersonalInfo({ civilStatus: value })}
        >
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Widowed">Widowed</option>
          <option value="Separated">Separated</option>
        </FloatingLabelSelect>
        <FloatingLabelInput
          required
          label="Nationality"
          value={personalInfo.nationality}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updatePersonalInfo({ nationality: e.target.value })
          }
        />
        <FloatingLabelInput
          type="date"
          label="Naturalization Date"
          value={personalInfo.naturalizationDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updatePersonalInfo({ naturalizationDate: e.target.value })
          }
        />
        <Flex gap={2}>
          <FloatingLabelSelect
            required
            label="Height (ft)"
            value={heightFeet}
            onValueChange={updateHeightFeet}
          >
            {FEET_OPTIONS.map((ft) => (
              <option key={ft} value={ft}>
                {ft} ft
              </option>
            ))}
          </FloatingLabelSelect>
          <FloatingLabelSelect
            required
            label="Height (in)"
            value={heightInches}
            onValueChange={updateHeightInches}
          >
            {INCH_OPTIONS.map((inch) => (
              <option key={inch} value={inch}>
                {inch} in
              </option>
            ))}
          </FloatingLabelSelect>
        </Flex>
        <Box pos="relative">
          <FloatingLabelInput
            required
            type="number"
            inputMode="decimal"
            min={0}
            step="0.1"
            pe="10"
            label="Weight"
            value={personalInfo.weight}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePersonalInfo({ weight: e.target.value })
            }
          />
          <Text
            pos="absolute"
            insetEnd="3"
            top="50%"
            transform="translateY(-50%)"
            fontSize="sm"
            fontWeight="medium"
            color="gray.400"
            pointerEvents="none"
          >
            lbs
          </Text>
        </Box>
      </Grid>
    </InputCardAccordion>
  );
}
