"use client";

import { Box } from "@chakra-ui/react";
import HorizontalStepper from "@/components/ui/horizontal-stepper";
import { steps } from "@/components/plan-management/lifeplan-application/data/lifePlanSteps";
import { useState } from "react";
import { Body, Breadcrumb, H3 } from "st-peter-ui";

const LifePlanApplication = () => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <Box
      w="full"
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH={{ base: "auto", md: "auto" }}
    >
      <Box
        bg="white"
        w="full"
        // mt={{ base: 4, lg: 8 }}
        mb={{ base: 16, lg: 8 }}
      >
        <Box mb={8} textAlign="start" mt={4}>
          <H3>Life Plan Application</H3>
          <Body mt={2}>
            Please fill out the form below to apply for a life plan.
          </Body>
        </Box>
        <HorizontalStepper steps={steps} onStepChange={setCurrentStep} />
      </Box>
    </Box>
  );
};

export default LifePlanApplication;
