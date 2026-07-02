"use client";

import {
  Box,
  ButtonGroup,
  Flex,
  Separator,
  Steps,
  Text,
  Badge,
} from "@chakra-ui/react";
import { PrimaryMdButton, SecondaryMdButton } from "st-peter-ui";
import { LuChevronLeft, LuChevronRight, LuCheck } from "react-icons/lu";
import { useRef } from "react";

const PRIMARY = "var(--chakra-colors-primary)";
const PRIMARY_HOVER = "var(--chakra-colors-primary-hover)";
const PRIMARY_DISABLED = "var(--chakra-colors-primary-disabled)";
const SOFT_SHADOW =
  "0 1px 2px rgba(16,24,40,0.05), 0 1px 3px rgba(16,24,40,0.05)";

interface StepItem {
  title: string;
  icon: any;
  content: React.ReactNode;
  validateBeforeNext?: () => boolean;
}

interface FormStepsProps {
  stepsData: StepItem[];
  title: string;
  description: string;
  onStepsComplete: () => void;
  submitButtonText: string;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

const FormSteps: React.FC<FormStepsProps> = ({
  stepsData,
  title,
  description,
  currentStep,
  setCurrentStep,
  onStepsComplete,
  submitButtonText,
}) => {
  const formTopRef = useRef<HTMLDivElement | null>(null);
  const isCompact = stepsData.length < 3;
  const isLastStep = currentStep === stepsData.length - 1;
  const nextStepTitle = stepsData[currentStep + 1]?.title;

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
    setCurrentStep((prev) => Math.min(prev + 1, stepsData.length - 1));
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
    >
      {/* Header */}
      {/* <Box ref={formTopRef}>
        <Flex align="center" gap={2} mb={1}>
          <Box
            as="h1"
            m="0"
            fontFamily="var(--font-dm-sans), system-ui, sans-serif"
            fontWeight={600}
            color="gray.900"
            lineHeight="1.1"
            letterSpacing="-0.025em"
            fontSize={{ base: "22px", lg: "28px" }}
          >
            {title}
          </Box>
          <Badge
            variant="subtle"
            borderRadius="full"
            px={2.5}
            py={0.5}
            fontSize="xs"
            fontWeight={600}
            style={{
              background: PRIMARY_DISABLED,
              color: PRIMARY,
            }}
          >
            Step {currentStep + 1} of {stepsData.length}
          </Badge>
        </Flex>
        {description && (
          <Text fontSize="sm" color="gray.500" mt={1}>
            {description}
          </Text>
        )}
      </Box> */}

      {/* Steps */}
      <Box w="full" rounded="2xl">
        <Steps.Root
          size={"sm"}
          colorPalette="green"
          count={stepsData.length}
          step={currentStep}
          onStepChange={(e) => handleStepChange(e.step)}
        >
          {/* Sticky step header */}
          <Box
            position="sticky"
            top={0}
            zIndex={10}
            bg="white"
            pt={2}
            pb={3}
            mx={-1}
            px={1}
            borderBottomWidth="1px"
            borderColor="gray.100"
            boxShadow="0 2px 8px -2px rgba(0,0,0,0.06)"
          >
            <Box w="full" style={{ display: "flex" }}>
              <Steps.List
                py={0}
                flexDirection="row"
                alignItems="flex-start"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                {stepsData.map((stepItem, index) => {
                  const isCompleted = index < currentStep;
                  const isActive = index === currentStep;

                  return (
                    <Steps.Item
                      key={index}
                      index={index}
                      title={stepItem.title}
                      flex={isCompact ? "0 0 auto" : "1"}
                      justifyContent={"center"}
                    >
                      <Steps.Trigger
                        flexDirection={isCompact ? "row" : "column"}
                        alignItems="center"
                        gap={isCompact ? 2 : 1}
                        onClick={() => handleStepChange(index)}
                        px={isCompact ? 3 : 2}
                        py={isCompact ? 2 : 1}
                        borderRadius="lg"
                        transition="background 0.2s"
                        _hover={{ bg: "gray.50" }}
                      >
                        <Steps.Indicator
                          borderWidth="2px"
                          style={{
                            borderColor:
                              isCompleted || isActive ? PRIMARY : undefined,
                            background: isCompleted ? PRIMARY : undefined,
                            color: isCompleted
                              ? "white"
                              : isActive
                                ? PRIMARY
                                : undefined,
                            boxShadow: isActive
                              ? `0 0 0 3px ${PRIMARY_DISABLED}`
                              : "none",
                          }}
                          transition="all 0.25s"
                        >
                          {isCompleted ? (
                            <LuCheck size={14} />
                          ) : (
                            <Box as={stepItem.icon} w={4} h={4} />
                          )}
                        </Steps.Indicator>

                        <Steps.Title
                          fontSize={{ base: "xs", md: "sm" }}
                          textAlign={isCompact ? "left" : "center"}
                          whiteSpace="normal"
                          wordBreak="break-word"
                          fontWeight={isActive ? 600 : 400}
                          color={
                            isActive
                              ? "gray.900"
                              : isCompleted
                                ? "gray.600"
                                : "gray.400"
                          }
                          transition="color 0.2s"
                        >
                          {stepItem.title}
                        </Steps.Title>
                      </Steps.Trigger>

                      {!isCompact && (
                        <Steps.Separator
                          display={{ base: "none", md: "block" }}
                        />
                      )}
                    </Steps.Item>
                  );
                })}
              </Steps.List>
            </Box>

            {/* Progress bar */}
            <Box
              w="full"
              h="3px"
              bg="gray.100"
              borderRadius="full"
              overflow="hidden"
              mt={1}
            >
              <Box
                h="full"
                style={{ background: PRIMARY }}
                borderRadius="full"
                transition="width 0.4s ease"
                w={`${((currentStep + 1) / stepsData.length) * 100}%`}
              />
            </Box>
          </Box>

          {/* Step content */}
          {stepsData.map((stepItem, index) => (
            <Steps.Content key={index} index={index}>
              {stepItem.content}
            </Steps.Content>
          ))}

          {/* Sticky action bar */}
          <Box
            position="sticky"
            bottom={0}
            zIndex={9}
            mx={{ base: -4, md: 0 }}
            mt={4}
          >
            <Box
              px={{ base: 4, md: 5 }}
              py={3}
              borderTopWidth="1px"
              borderColor="gray.100"
              borderWidth={{ md: "1px" }}
              borderRadius={{ md: "2xl" }}
              bg="rgba(255,255,255,0.9)"
              backdropFilter="blur(10px)"
              boxShadow={{
                base: "0 -2px 8px -2px rgba(0,0,0,0.06)",
                md: SOFT_SHADOW,
              }}
            >
              {/* Mobile nav */}
              <Flex
                w="full"
                justify="space-between"
                align="center"
                gap={2}
                display={{ base: "flex", md: "none" }}
              >
                <Steps.PrevTrigger asChild>
                  <Box
                    as="button"
                    display="flex"
                    alignItems="center"
                    gap={1}
                    px={3}
                    py={2}
                    borderRadius="lg"
                    border="1.5px solid"
                    borderColor="gray.200"
                    bg="white"
                    color="gray.700"
                    fontSize="sm"
                    fontWeight={500}
                    cursor="pointer"
                    _hover={{ bg: "gray.50" }}
                    _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
                    transition="all 0.15s"
                  >
                    <LuChevronLeft size={14} />
                    Back
                  </Box>
                </Steps.PrevTrigger>

                {!isLastStep ? (
                  <Box
                    as="button"
                    display="flex"
                    alignItems="center"
                    gap={1}
                    px={3}
                    py={2}
                    borderRadius="lg"
                    color="white"
                    fontSize="sm"
                    fontWeight={500}
                    cursor="pointer"
                    transition="all 0.15s"
                    onClick={handleNext}
                    style={{ background: PRIMARY }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = PRIMARY_HOVER)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = PRIMARY)
                    }
                  >
                    {nextStepTitle ? `Next: ${nextStepTitle}` : "Next"}
                    <LuChevronRight size={14} />
                  </Box>
                ) : (
                  <Box
                    as="button"
                    display="flex"
                    alignItems="center"
                    gap={1}
                    px={3}
                    py={2}
                    borderRadius="lg"
                    color="white"
                    fontSize="sm"
                    fontWeight={500}
                    cursor="pointer"
                    transition="all 0.15s"
                    onClick={onStepsComplete}
                    style={{ background: PRIMARY }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = PRIMARY_HOVER)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = PRIMARY)
                    }
                  >
                    {submitButtonText}
                    <LuCheck size={14} />
                  </Box>
                )}
              </Flex>

              {/* Desktop nav */}
              <ButtonGroup
                size="sm"
                variant="outline"
                display={{ base: "none", md: "flex" }}
              >
                <Flex w="full" align="center" justify="space-between">
                  <Steps.PrevTrigger asChild>
                    <SecondaryMdButton>
                      <LuChevronLeft />
                      Previous
                    </SecondaryMdButton>
                  </Steps.PrevTrigger>

                  {!isLastStep ? (
                    <Box
                      as="button"
                      display="flex"
                      alignItems="center"
                      gap={1.5}
                      px={4}
                      py={2}
                      borderRadius="lg"
                      color="white"
                      fontSize="sm"
                      fontWeight={600}
                      cursor="pointer"
                      transition="all 0.15s"
                      onClick={handleNext}
                      boxShadow="0 1px 3px 0 rgba(0,0,0,0.12)"
                      style={{ background: PRIMARY }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = PRIMARY_HOVER)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = PRIMARY)
                      }
                    >
                      {nextStepTitle ? `Next: ${nextStepTitle}` : "Next"}
                      <LuChevronRight size={15} />
                    </Box>
                  ) : (
                    <PrimaryMdButton onClick={onStepsComplete}>
                      {submitButtonText}
                    </PrimaryMdButton>
                  )}
                </Flex>
              </ButtonGroup>
            </Box>
          </Box>
        </Steps.Root>
      </Box>
    </Flex>
  );
};

export default FormSteps;
