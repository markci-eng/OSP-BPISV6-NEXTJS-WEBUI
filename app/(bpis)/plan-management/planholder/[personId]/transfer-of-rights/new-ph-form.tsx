"use client";

import Card from "@/components/cards/Card";
import { Beneficiaries } from "@/components/new-planholder-profile/pages/beneficiaries";
import {
  Box,
  createListCollection,
  Grid,
  Separator,
} from "@chakra-ui/react";
import {
  Checkbox,
  InputFloatingLabel,
  SelectFloatingLabel,
} from "st-peter-ui";

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
  return (
    <Box>
      <Card.Root title={"New Plan Holder Information"}>
        <Card.MainContent>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gapX={4}
          >
            <InputFloatingLabel label={"Last Name"} name={""} />
            <InputFloatingLabel label={"First Name"} name={""} />
            <InputFloatingLabel label={"Middle Name"} name={""} />
            <InputFloatingLabel label={"Date of Birth"} type="date" name={""} />
            <SelectFloatingLabel
              label={"Gender"}
              collection={GenderCollection}
            />
            <SelectFloatingLabel
              label={"Civil Status"}
              collection={CivilStatusCollection}
            />
            <InputFloatingLabel
              label={"Contact Number"}
              type="number"
              name={""}
            />
            <Checkbox
              label="Insurable"
              onCheckedChange={(details) => {
                alert(details.checked ? "Checked" : "Unchecked");
              }}
            />
          </Grid>
        </Card.MainContent>
      </Card.Root>
      <Separator mb={5} />
      <Card.Root title={"Address Information"}>
        <Card.MainContent>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gapX={4}
          >
            <SelectFloatingLabel
              label={"Province"}
              collection={GenderCollection}
            />
            <SelectFloatingLabel
              label={"City / Municipality"}
              collection={GenderCollection}
            />
            <SelectFloatingLabel
              label={"District"}
              collection={GenderCollection}
            />
            <SelectFloatingLabel
              label={"Barangay"}
              collection={GenderCollection}
            />
            <InputFloatingLabel label={"Lot/Bldg/Unit No."} name={""} />
            <InputFloatingLabel label={"Street"} name={""} />
          </Grid>
        </Card.MainContent>
      </Card.Root>
      <Separator mb={5} />

      <Beneficiaries beneficiaries={[]} columns={2} />
    </Box>
  );
}
