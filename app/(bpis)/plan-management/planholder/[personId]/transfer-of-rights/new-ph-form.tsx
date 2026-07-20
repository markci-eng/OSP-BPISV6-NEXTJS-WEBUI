"use client";

import Card from "@/components/cards/Card";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";
import { Beneficiaries } from "@/components/new-planholder-profile/pages/beneficiaries";
import { Box, createListCollection, Grid, Separator } from "@chakra-ui/react";
import { Checkbox } from "st-peter-ui";
import { FloatingLabelSelect } from "@/components/inputs/floating-label-select";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";

const GenderCollection = createListCollection({
  items: [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ],
});

const CivilStatusCollection = createListCollection({
  items: [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
  ],
});

export function NewPlanHolderInfoForm() {
  const { messageBox } = useMessageDialog();

  return (
    <Box>
      <Card.Root title={"New Plan Holder Information"}>
        <Card.MainContent>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gapX={4}
          >
            <FloatingLabelInput label={"Last Name"} name={""} />
            <FloatingLabelInput label={"First Name"} name={""} />
            <FloatingLabelInput label={"Middle Name"} name={""} />
            <FloatingLabelInput label={"Date of Birth"} type="date" name={""} />
            <FloatingLabelSelect label={"Gender"}>
              {GenderCollection.items.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </FloatingLabelSelect>
            <FloatingLabelSelect label={"Civil Status"}>
              {CivilStatusCollection.items.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </FloatingLabelSelect>
            <FloatingLabelInput
              label={"Contact Number"}
              type="number"
              name={""}
            />
            <Checkbox
              label="Insurable"
              onCheckedChange={(details) => {
                messageBox({
                  title: "Insurable",
                  message: details.checked ? "Checked" : "Unchecked",
                  confirmText: "Okay",
                  variant: "information",
                });
              }}
            />
          </Grid>
        </Card.MainContent>
      </Card.Root>
      <Box mb={5} />
      <Card.Root title={"Address Information"}>
        <Card.MainContent>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gapX={4}
          >
            <FloatingLabelSelect label={"Province"}>
              {GenderCollection.items.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </FloatingLabelSelect>
            <FloatingLabelSelect label={"City / Municipality"}>
              {GenderCollection.items.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </FloatingLabelSelect>
            <FloatingLabelSelect label={"District"}>
              {GenderCollection.items.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </FloatingLabelSelect>
            <FloatingLabelSelect label={"Barangay"}>
              {GenderCollection.items.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </FloatingLabelSelect>
            <FloatingLabelInput label={"Lot/Bldg/Unit No."} name={""} />
            <FloatingLabelInput label={"Street"} name={""} />
          </Grid>
        </Card.MainContent>
      </Card.Root>
      <Box mb={5} />

      <Beneficiaries beneficiaries={[]} columns={2} />
    </Box>
  );
}
