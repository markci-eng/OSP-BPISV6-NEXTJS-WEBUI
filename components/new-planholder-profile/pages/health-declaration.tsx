import { Strong, VStack } from "@chakra-ui/react";
import React from "react";
import { Body, Box, Small } from "st-peter-ui";

export function HealthDeclaration() {
  return (
    <React.Fragment>
      <Strong>Health Declaration</Strong>

      <Body mt={3}>
        I hereby represent and declare to the best of my knowledge that at the
        time of purchase of my Life Plan:
      </Body>
      <VStack mt={3} align={"start"} gap={2}>
        <Box as="ul" listStyleType="circle" px={5}>
          <li>
            <Small>
              I am between 18 years and 60 years old (not beyond my 60th
              birthday)
            </Small>
          </li>
          <li>
            <Small>
              I possess sound health and am able to perform the normal
              activities in pursuit of my livelihood.
            </Small>
          </li>
          <li>
            <Small>
              I have not consulted any physician for heart condition,
              hypertension, cancer, diabetes, lungs, kidneys or intestinal
              disorder, tuberculosis, or any other physical impairment nor have
              I been confined in a hospital/clinic and received any medical or
              surgical attention.
            </Small>
          </li>
          <li>
            <Small>
              I understand and agree that I am INSURABLE based on the
              above-stated representations.
            </Small>
          </li>
        </Box>
      </VStack>
    </React.Fragment>
  );
}
