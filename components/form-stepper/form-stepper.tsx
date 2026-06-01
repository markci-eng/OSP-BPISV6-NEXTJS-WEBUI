import {
  Box,
  ButtonGroup,
  Flex,
  Separator,
  Show,
  Steps,
  useBreakpointValue,
  Text,
  Strong,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuCheck } from "react-icons/lu";
import {
  Body,
  NextButton,
  PreviousButton,
  Small,
  SubmitButton,
} from "st-peter-ui";

export interface StepItem {
  title: string;
  icon: any;
  content: React.ReactNode;
  validateBeforeNext?: () => boolean;
}

export function FormStepper({
  steps,
  onSubmit,
  hasSubmitButton = true,
}: {
  steps: StepItem[];
  onSubmit?: () => void;
  hasSubmitButton?: boolean;
}) {
  const [stepIndex, setStep] = useState(0);
  const [stepNumber, setStepNumber] = useState(0);
  const [targetIdx, setTargetIdx] = useState(0);
  const isMobile = useBreakpointValue({ base: true, lg: false });

  useEffect(() => {
    setStepNumber(stepIndex + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex]);

  //For Mobile Progresss
  const percentage = (stepNumber / steps.length) * 100;
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isTargetValid = () => {
    for (let i = stepIndex; i < targetIdx; i++) {
      if (!(steps[i]?.validateBeforeNext?.() ?? true)) {
        setStep(i);
        return false;
      }
    }
    return true;
  };

  return (
    <Steps.Root
      step={stepIndex}
      onStepChange={(e) => setStep(e.step)}
      count={steps.length}
      isStepValid={() => isTargetValid()}
    >
      <Show when={!isMobile}>
        <Steps.List>
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <Steps.Item key={index} index={index} title={step.title}>
                <Steps.Trigger>
                  <Flex direction={"column"} align="center" gap={1}>
                    <Steps.Indicator
                      onClick={() => setTargetIdx(index)}
                      _current={{
                        backgroundColor: "primaryDisabled",
                        borderColor: "primary",
                        color: "primaryHover",
                      }}
                      _complete={{
                        backgroundColor: "primary",
                        borderColor: "primary",
                      }}
                    >
                      <Steps.Status
                        incomplete={<StepIcon />}
                        complete={<LuCheck />}
                      />
                    </Steps.Indicator>
                    <Steps.Title color={"gray.fg"}>{step.title}</Steps.Title>
                  </Flex>
                </Steps.Trigger>
                <Steps.Separator
                  mt={-4}
                  _complete={{
                    backgroundColor: "primary",
                  }}
                />
              </Steps.Item>
            );
          })}
        </Steps.List>
      </Show>
      <Show when={isMobile}>
        <Flex
          align="center"
          gap={2}
          cursor={"pointer"}
          minW={0}
          w={"full"}
          borderRadius={"md"}
          boxShadow={"sm"}
        >
          <Box position="relative" h="80px" w="80px" flexShrink={0}>
            <Box as="svg" h="100%" w="100%" transform="rotate(-90deg)">
              <circle
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                stroke="var(--chakra-colors-primary-disabled)"
                strokeWidth="7"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                stroke="var(--chakra-colors-primary)"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </Box>

            <Flex position="absolute" inset={0} align="center" justify="center">
              <Small fontWeight="semibold">
                {stepIndex + 1} / {steps.length}
              </Small>
            </Flex>
          </Box>

          <Flex direction={"column"} w={"full"} align={"start"} gap={0}>
            <Strong color={"gray.fg"}>{steps[stepIndex].title}</Strong>
            {stepIndex > 0 && (
              <Steps.PrevTrigger>
                <Small
                  color="gray.focusRing"
                  _active={{ color: "primary" }}
                  onClick={() => setTargetIdx(stepIndex - 1)}
                >
                  {steps[stepIndex - 1]?.title ? "Previous Step: " : ""}
                  {steps[stepIndex - 1]?.title ?? ""}
                </Small>
              </Steps.PrevTrigger>
            )}
            <Steps.NextTrigger>
              <Small
                color="gray.focusRing"
                _active={{ color: "primary" }}
                onClick={() => setTargetIdx(stepIndex + 1)}
              >
                {steps[stepIndex + 1]?.title ? "Next Step: " : ""}
                {steps[stepIndex + 1]?.title ?? "Final Step"}
              </Small>
            </Steps.NextTrigger>
          </Flex>
        </Flex>
      </Show>

      <Show when={!isMobile}>
        <Separator my={3} />
      </Show>

      {steps.map((step, index) => (
        <Steps.Content key={index} index={index}>
          {step.content}
        </Steps.Content>
      ))}

      <ButtonGroup
        size="sm"
        variant="outline"
        width={"full"}
        justifyContent={"space-between"}
      >
        <Steps.PrevTrigger asChild>
          <PreviousButton />
        </Steps.PrevTrigger>
        <Show when={stepIndex < steps.length - 1}>
          <Steps.NextTrigger asChild>
            <NextButton onClick={() => setTargetIdx(stepIndex + 1)} />
          </Steps.NextTrigger>
        </Show>
        <Show when={stepIndex === steps.length - 1 && hasSubmitButton}>
          {/* <Steps.NextTrigger asChild> */}
          <SubmitButton onClick={onSubmit} />
          {/* </Steps.NextTrigger> */}
        </Show>
      </ButtonGroup>
    </Steps.Root>
  );
}
