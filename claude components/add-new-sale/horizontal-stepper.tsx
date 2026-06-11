import React, { useState } from "react";
import {
  Box,
  ButtonGroup,
  Flex,
  IconButton,
  Separator,
  Steps,
} from "@chakra-ui/react";
import { NextButton, PrimaryMdButton, SecondaryMdButton } from "st-peter-ui";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface HorizontalStepperProps {
  steps: {
    title: string;
    description: React.ReactNode;
    component?: React.ReactNode;
    icon?: React.ElementType;
  }[];
  onStepChange?: (index: number) => void;
  onSubmit?: () => void;
  submitDisabled?: boolean;
  activeStep?: number;
  nextDisabled?: boolean;
}

const HorizontalStepper = ({
  steps,
  onStepChange,
  onSubmit,
  submitDisabled,
  activeStep: controlledActiveStep,
  nextDisabled,
}: HorizontalStepperProps) => {
  const [localActiveStep, setLocalActiveStep] = useState(0);
  const activeStep =
    controlledActiveStep !== undefined ? controlledActiveStep : localActiveStep;

  const handleStepChange = (index: number) => {
    if (controlledActiveStep === undefined) {
      setLocalActiveStep(index);
    }
    onStepChange?.(index);
  };

  const handleNext = () => {
    if (nextDisabled) return;
    handleStepChange(Math.min(activeStep + 1, steps.length - 1));
  };

  return (
    <Flex
      direction="column"
      align="start"
      minH={{ base: "100dvh", md: "100vh" }}
      w="full"
      overflow="visible"
      pb={{ base: "12px", md: "0px" }}
    >
      <Box w="full" colorPalette="green" rounded="2xl" p={1}>
        <Steps.Root
          step={activeStep}
          onStepChange={(index) => {
            handleStepChange(index.step);
          }}
          defaultStep={0}
          count={steps.length}
          colorPalette="green"
        >
          <Steps.List
            flexDirection="row"
            w="full"
            py={2}
            alignItems="flex-start"
          >
            {steps.map((step, index) => (
              <Steps.Item
                key={index}
                index={index}
                title={step.title}
                minW={{ base: "0px", md: "auto" }}
              >
                <Steps.Trigger
                  flexDirection="column"
                  alignItems="center"
                  gap={1}
                >
                  <Steps.Indicator>
                    {step.icon ? <Box as={step.icon} w={4} h={4} /> : null}
                  </Steps.Indicator>
                  <Steps.Title
                    fontSize={{ base: "xs", md: "sm" }}
                    textAlign="center"
                    whiteSpace="normal"
                    wordBreak="break-word"
                  >
                    {step.title}
                  </Steps.Title>
                </Steps.Trigger>
                <Steps.Separator display={{ base: "none", md: "block" }} />
              </Steps.Item>
            ))}
          </Steps.List>

          <Separator variant="solid" mb={3} />

          {steps.map((step, index) => (
            <Steps.Content key={index} index={index}>
              {step.component ?? step.description}
            </Steps.Content>
          ))}

          <Flex
            w="full"
            justify="space-between"
            align="center"
            mb={1}
            display={{ base: "flex", md: "none" }}
          >
            <Steps.PrevTrigger asChild>
              <IconButton
                aria-label="Previous step"
                size="sm"
                variant="outline"
              >
                <LuChevronLeft />
              </IconButton>
            </Steps.PrevTrigger>
            {activeStep < steps.length - 1 ? (
              <IconButton
                aria-label="Next step"
                size="sm"
                variant="outline"
                disabled={!!nextDisabled}
                onClick={handleNext}
              >
                <LuChevronRight />
              </IconButton>
            ) : (
              <PrimaryMdButton disabled={!!submitDisabled} onClick={onSubmit}>
                Proceed To Payment
              </PrimaryMdButton>
            )}
          </Flex>

          <ButtonGroup
            size="sm"
            variant="outline"
            display={{ base: "none", md: "flex" }}
          >
            <Flex mt={4} w="full" align="center" justify="space-between">
              <Steps.PrevTrigger asChild>
                <SecondaryMdButton>Previous</SecondaryMdButton>
              </Steps.PrevTrigger>
              {activeStep < steps.length - 1 ? (
                <NextButton disabled={!!nextDisabled} onClick={handleNext} />
              ) : (
                <PrimaryMdButton disabled={!!submitDisabled} onClick={onSubmit}>
                  Proceed To Payment
                </PrimaryMdButton>
              )}
            </Flex>
          </ButtonGroup>
        </Steps.Root>
      </Box>
    </Flex>
  );
};

export default HorizontalStepper;
