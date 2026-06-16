"use client";

import {
  Field,
  Grid,
  Input,
  Select,
  createListCollection,
} from "@chakra-ui/react";
import { STANDARD_SPACING } from "@/lib/theme/standard-design-tokens";
import { useEffect, useState } from "react";
import { IPersonalInfo } from "../planholder";
import FloatingLabelInput from "../floating-label-input";

interface LifePlanApplication1Props {
  initialData?: IPersonalInfo;
  onUpdate?: (personalInfo: IPersonalInfo, address?: any) => void;
}

const idCollection = createListCollection({
  items: [
    { label: "Passport", value: "passport" },
    { label: "Driver's License", value: "driver_license" },
    { label: "Philippine Identification Card", value: "national_id" },
  ],
});

const genderCollection = createListCollection({
  items: [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ],
});

const civilStatusCollection = createListCollection({
  items: [
    { label: "Single", value: "single" },
    { label: "Married", value: "married" },
    { label: "Widowed", value: "widowed" },
    { label: "Divorced", value: "divorced" },
    { label: "Separated", value: "separated" },
    { label: "Annulled", value: "annulled" },
  ],
});

const LifePlanApplication1 = ({
  initialData,
  onUpdate,
}: LifePlanApplication1Props) => {
  const [formData, setFormData] = useState<IPersonalInfo>({
    firstName: initialData?.firstName ?? "Juan",
    middleName: initialData?.middleName ?? "Santos",
    lastName: initialData?.lastName ?? "Dela Cruz",
    suffix: initialData?.suffix ?? "",
    birthDate: initialData?.birthDate ?? "1990-05-15",
    idType: initialData?.idType ?? "national_id",
    idNumber: initialData?.idNumber ?? "1234-5678-9012",
    height: initialData?.height ?? 5.7,
    weight: initialData?.weight ?? 154,
    gender: initialData?.gender ?? "male",
    civilStatus: initialData?.civilStatus ?? "married",
    nationality: initialData?.nationality ?? "Filipino",
    mobileNumber: initialData?.mobileNumber ?? "0917-123-4567",
    emailAddress: initialData?.emailAddress ?? "juan.delacruz@example.com",
    mailingAddress:
      initialData?.mailingAddress ??
      "123 Mabini Street, Barangay San Antonio, Makati City",
    landLineNumber: initialData?.landLineNumber ?? "02-8123-4567",
  });

  const updateFormData = (nextData: IPersonalInfo) => {
    setFormData(nextData);
    onUpdate?.(nextData);
  };

  useEffect(() => {
    const OCRValue =
      typeof window === "undefined" ? null : localStorage.getItem("ocrResult");

    if (OCRValue != null) {
      try {
        const ocrData = JSON.parse(OCRValue);

        const [month, day, year] = ocrData.birthDate
          .split("/")
          .map((part: string) => part.trim());
        const formattedBirthDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

        let mappedIdType = "";
        if (ocrData?.idType) {
          const normalizedIdType = ocrData.idType
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/'/g, "");
          if (normalizedIdType.includes("passport")) {
            mappedIdType = "passport";
          } else if (normalizedIdType.includes("driver")) {
            mappedIdType = "driver_license";
          } else if (
            normalizedIdType.includes("national") ||
            normalizedIdType.includes("id")
          ) {
            mappedIdType = "national_id";
          }
        }

        const updatedData = {
          ...formData,
          firstName: ocrData?.firstName || "",
          lastName: ocrData?.lastName || "",
          middleName: ocrData?.middleName || "",
          birthDate: formattedBirthDate || "",
          idType: mappedIdType || "",
        };
        updateFormData(updatedData);
      } catch (e) {
        console.error("Failed to parse OCR value:", e);
        localStorage.removeItem("ocrResult");
      }
    }
  }, []);

  return (
    <Grid
      templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
      gap={STANDARD_SPACING.sm}
      w="full"
    >
      <Field.Root>
        <Select.Root
          collection={idCollection}
          value={formData.idType ? [formData.idType] : []}
          onValueChange={(details) =>
            updateFormData({ ...formData, idType: details.value[0] })
          }
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Select ID Type" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {idCollection.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Field.Root>

      <Field.Root>
        <FloatingLabelInput
          id="idNumber"
          type="text"
          label="ID Number"
          value={formData.idNumber || ""}
          onChange={(e) =>
            updateFormData({ ...formData, idNumber: e.target.value })
          }
        />
      </Field.Root>

      <Field.Root>
        <FloatingLabelInput
          id="lastName"
          type="text"
          label="Last Name"
          value={formData.lastName || ""}
          onChange={(e) =>
            updateFormData({ ...formData, lastName: e.target.value })
          }
        />
      </Field.Root>
      <Field.Root>
        <FloatingLabelInput
          id="firstName"
          type="text"
          label="First Name"
          value={formData.firstName || ""}
          onChange={(e) =>
            updateFormData({ ...formData, firstName: e.target.value })
          }
        />
      </Field.Root>
      <Field.Root>
        <FloatingLabelInput
          id="middleName"
          type="text"
          label="Middle Name"
          value={formData.middleName || ""}
          onChange={(e) =>
            updateFormData({ ...formData, middleName: e.target.value })
          }
        />
      </Field.Root>
      <Field.Root>
        <FloatingLabelInput
          id="suffix"
          type="text"
          label="Suffix (Optional)"
          value={formData.suffix || ""}
          onChange={(e) =>
            updateFormData({ ...formData, suffix: e.target.value })
          }
        />
      </Field.Root>

      <Field.Root>
        <Field.Label>Date of Birth</Field.Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.birthDate || ""}
          onChange={(e) =>
            updateFormData({ ...formData, birthDate: e.target.value })
          }
        />
      </Field.Root>

      <Field.Root>
        <Field.Label>Date of Naturalization</Field.Label>
        <Input id="dateOfNeutralization" type="date" />
      </Field.Root>

      <Field.Root>
        <FloatingLabelInput
          id="height"
          label="Height (ft)"
          value={formData.height ? String(formData.height) : ""}
          onChange={(e) =>
            updateFormData({
              ...formData,
              height: parseFloat(e.target.value),
            })
          }
        />
      </Field.Root>
      <Field.Root>
        <FloatingLabelInput
          id="weight"
          label="Weight (lbs)"
          value={formData.weight ? String(formData.weight) : ""}
          onChange={(e) =>
            updateFormData({
              ...formData,
              weight: parseFloat(e.target.value),
            })
          }
        />
      </Field.Root>

      <Field.Root>
        <Select.Root
          collection={genderCollection}
          value={formData.gender ? [formData.gender] : []}
          onValueChange={(details) =>
            updateFormData({ ...formData, gender: details.value[0] })
          }
        >
          <Select.HiddenSelect id="gender" />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Gender" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {genderCollection.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Field.Root>

      <Field.Root>
        <Select.Root
          collection={civilStatusCollection}
          value={formData.civilStatus ? [formData.civilStatus] : []}
          onValueChange={(details) =>
            updateFormData({ ...formData, civilStatus: details.value[0] })
          }
        >
          <Select.HiddenSelect id="civilStatus" />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Civil Status" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {civilStatusCollection.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Field.Root>

      <Field.Root>
        <FloatingLabelInput
          id="nationality"
          type="text"
          label="Nationality"
          value={formData.nationality || ""}
          onChange={(e) =>
            updateFormData({ ...formData, nationality: e.target.value })
          }
        />
      </Field.Root>

      <Field.Root>
        <FloatingLabelInput
          id="mobileNumber"
          type="text"
          label="Mobile Number"
          value={formData.mobileNumber || ""}
          onChange={(e) =>
            updateFormData({ ...formData, mobileNumber: e.target.value })
          }
        />
      </Field.Root>
      <Field.Root>
        <FloatingLabelInput
          id="landlineNumber"
          type="text"
          label="Landline Number"
          value={formData.landLineNumber || ""}
          onChange={(e) =>
            updateFormData({
              ...formData,
              landLineNumber: e.target.value,
            })
          }
        />
      </Field.Root>
      <Field.Root>
        <FloatingLabelInput
          id="email"
          type="email"
          label="Email Address"
          value={formData.emailAddress || ""}
          onChange={(e) =>
            updateFormData({ ...formData, emailAddress: e.target.value })
          }
        />
      </Field.Root>
      <Field.Root>
        <FloatingLabelInput
          id="mailingAddress"
          type="text"
          label="Mailing Address"
          value={formData.mailingAddress || ""}
          onChange={(e) =>
            updateFormData({ ...formData, mailingAddress: e.target.value })
          }
        />
      </Field.Root>

      <Field.Root>
        <FloatingLabelInput
          id="insurability"
          type="text"
          label="Insurability"
          value="Insurable"
          readOnly
        />
      </Field.Root>
    </Grid>
  );
};

export default LifePlanApplication1;
