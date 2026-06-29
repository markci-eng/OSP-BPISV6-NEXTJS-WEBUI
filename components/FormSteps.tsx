"use client";

import {
  Box,
  ButtonGroup,
  Flex,
  IconButton,
  Separator,
  Steps,
  Text,
} from "@chakra-ui/react";
import { NextButton, PrimaryMdButton, SecondaryMdButton } from "st-peter-ui";
import { LuCheck, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useRef } from "react";

export interface StepItem {
  title: string;
  icon: any;
  content: React.ReactNode;
  validateBeforeNext?: () => boolean;
}

interface FormStepsProps {
  stepsData: StepItem[];
  title: string;
  description: string;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  onStepsComplete?: () => void;
  submitButtonText?: string;
}

const FormSteps: React.FC<FormStepsProps> = ({
  stepsData,
  title,
  description,
  currentStep,
  setCurrentStep,
  onStepsComplete,
  submitButtonText = "Submit",
}) => {
  const formTopRef = useRef<HTMLDivElement | null>(null);

  const scrollToTop = () => {
    requestAnimationFrame(() => {
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const canGoNext = (): boolean => {
    const validate = stepsData[currentStep]?.validateBeforeNext;
    return validate ? validate() : true;
  };

  const handleNext = () => {
    if (!canGoNext()) return;

    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, stepsData.length - 1);
      return next;
    });

    scrollToTop();
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    scrollToTop();
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
      {/* Header */}
      <Box mb={4} ref={formTopRef}>
        <Box
          as="h1"
          m="0"
          fontFamily="var(--font-dm-sans), system-ui, sans-serif"
          fontWeight={description ? 600 : 500}
          color="gray.900"
          lineHeight="1"
          letterSpacing={description ? "-0.025em" : "-0.015em"}
          fontSize={{
            base: description ? "22px" : "24px",
            lg: description ? "28px" : "32px",
          }}
        >
          {title}
        </Box>

        <Text fontSize="sm" color="gray.600" mt={1}>
          {description}
        </Text>
      </Box>

      {/* Steps */}
      <Box w="full" colorPalette="green" rounded="2xl" p={1}>
        <Steps.Root
          colorPalette="green"
          count={stepsData.length}
          step={currentStep}
          onStepChange={(e) => handleStepChange(e.step)}
        >
          <Steps.List flexDirection="row" w="full" py={2} alignItems="center">
            {stepsData.map((stepItem, index) => (
              <Flex justify={"space-between"}>
                <Steps.Item
                  key={index}
                  index={index}
                  title={stepItem.title}
                  minW={{ base: "0px", md: "auto" }}
                  flexDirection="column"
                  alignItems="center"
                  gap={1}
                >
                  <Flex align="center" w="full" justify={"center"}>
                    <Steps.Trigger
                      onClick={() => handleStepChange(index)}
                      flexShrink={0}
                    >
                      <Steps.Indicator>
                        <Box as={stepItem.icon} w={4} h={4} />
                      </Steps.Indicator>
                    </Steps.Trigger>

                    <Steps.Separator display={{ base: "none", md: "block" }} />
                  </Flex>

                  <Steps.Title
                    truncate
                    fontSize={{ base: "xs", md: "sm" }}
                    textAlign="center"
                    whiteSpace="normal"
                    wordBreak="break-word"
                  >
                    {stepItem.title}
                  </Steps.Title>
                </Steps.Item>
              </Flex>
            ))}
          </Steps.List>

          <Separator variant="solid" mb={3} />

          {stepsData.map((stepItem, index) => (
            <Steps.Content key={index} index={index}>
              {stepItem.content}
            </Steps.Content>
          ))}

          {/* Mobile */}
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

            {currentStep !== stepsData.length - 1 ? (
              <IconButton
                aria-label="Next step"
                size="sm"
                variant="outline"
                onClick={handleNext}
              >
                <LuChevronRight />
              </IconButton>
            ) : onStepsComplete ? (
              <IconButton
                aria-label="Submit"
                size="sm"
                variant="outline"
                onClick={onStepsComplete}
              >
                <LuCheck />
              </IconButton>
            ) : null}
          </Flex>

          {/* Desktop */}
          <ButtonGroup
            size="sm"
            variant="outline"
            display={{ base: "none", md: "flex" }}
          >
            <Flex mt={4} w="full" align="center" justify="space-between">
              <Steps.PrevTrigger asChild>
                <SecondaryMdButton>Previous</SecondaryMdButton>
              </Steps.PrevTrigger>

              {currentStep !== stepsData.length - 1 ? (
                <NextButton onClick={handleNext} />
              ) : onStepsComplete ? (
                <PrimaryMdButton onClick={onStepsComplete}>
                  {submitButtonText}
                </PrimaryMdButton>
              ) : null}
            </Flex>
          </ButtonGroup>
        </Steps.Root>
      </Box>
    </Flex>
  );
};

export default FormSteps;
