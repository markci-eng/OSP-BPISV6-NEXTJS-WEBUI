import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonGroup, Steps } from "@chakra-ui/react";
import {
  BackButton,
  NextButton,
  PreviousButton,
  PrimaryMdButton,
  SecondaryMdButton,
} from "st-peter-ui";
// Completed screen removed; navigate to checkout after last step

interface HorizontalStepperProps {
  steps: {
    title: string;
    description: React.ReactNode;
    component?: React.ReactNode;
  }[];
  onStepChange?: (index: number) => void;
}

const HorizontalStepper = ({ steps, onStepChange }: HorizontalStepperProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const router = useRouter();

  return (
    <div>
      <Steps.Root
        step={activeStep}
        onStepChange={(index) => {
          setActiveStep(index.step);
          onStepChange?.(index.step);
        }}
        count={steps.length}
        colorPalette="green"
        m="auto "
      >
        <Steps.List gap={{ base: 2, md: 4 }}>
          {steps.map((step, index) => (
            <Steps.Item key={index} index={index} title={step.title}>
              <Steps.Indicator />
              <Steps.Title
                display={{ base: "none", md: "block" }}
                textWrap="nowrap"
              >
                {step.title}
              </Steps.Title>
              <Steps.Separator />
            </Steps.Item>
          ))}
        </Steps.List>

        {steps.map((step, index) => (
          <Steps.Content key={index} index={index} mt={8}>
            {step.component ?? step.description}
          </Steps.Content>
        ))}

        {/* Removed completed content; we'll navigate on last step */}

        <ButtonGroup
          mt={4}
          justifyContent="space-between"
          w="full"
          flexDirection={{ base: "column", md: "row" }}
          gap={{ base: 3, md: 4 }}
        >
          <Steps.PrevTrigger asChild>
            <PreviousButton />
          </Steps.PrevTrigger>
          {activeStep < steps.length - 1 ? (
            <Steps.NextTrigger asChild>
              <NextButton />
            </Steps.NextTrigger>
          ) : (
            <NextButton onClick={() => router.push("/checkout")} />
          )}
        </ButtonGroup>
      </Steps.Root>
    </div>
  );
};

export default HorizontalStepper;
