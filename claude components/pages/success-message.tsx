"use client";

import {
  VStack,
  Stack,
  Text,
  Heading,
  Flex,
  Button,
  Icon,
} from "@chakra-ui/react";
import { FiCheck } from "react-icons/fi";
import type { ReactNode } from "react";

interface SuccessMessageProps {
  /** Main heading shown below the check icon. */
  title: string;
  /** Supporting copy shown below the title. */
  description: string;
  /** Label for the outline (secondary) button. Hidden when omitted. */
  primaryActionLabel?: string;
  /** Handler for the outline (secondary) button. */
  onPrimaryAction?: () => void;
  /** Label for the solid (primary) button. Hidden when omitted. */
  secondaryActionLabel?: string;
  /** Handler for the solid (primary) button. */
  onSecondaryAction?: () => void;
  /** Optional extra content rendered between the description and the actions. */
  children?: ReactNode;
}

const SuccessMessage = ({
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  children,
}: SuccessMessageProps) => {
  const hasActions = Boolean(primaryActionLabel || secondaryActionLabel);

  return (
    <Flex
      minH="calc(100vh - 120px)"
      align="center"
      justify="center"
      px={{ base: 4, md: 6 }}
      py={{ base: 12, md: 16 }}
    >
      <VStack w="full" maxW={{ base: "md", md: "lg" }} gap={8} textAlign="center">
        <Flex
          boxSize={{ base: 20, md: 24 }}
          borderWidth={4}
          borderColor="green.500"
          rounded="full"
          align="center"
          justify="center"
          bg="white"
          shadow="sm"
        >
          <Icon as={FiCheck} boxSize={{ base: 10, md: 12 }} color="green.500" />
        </Flex>

        <Heading
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="bold"
          color="gray.900"
        >
          {title}
        </Heading>

        <Text fontSize={{ base: "sm", md: "md" }} color="gray.600">
          {description}
        </Text>

        {children}

        {hasActions && (
          <Stack
            direction={{ base: "column", sm: "row" }}
            gap={4}
            w="full"
            justify="center"
          >
            {primaryActionLabel && (
              <Button
                variant="outline"
                colorPalette="green"
                w={{ base: "full", sm: "auto" }}
                onClick={onPrimaryAction}
              >
                {primaryActionLabel}
              </Button>
            )}
            {secondaryActionLabel && (
              <Button
                colorPalette="green"
                w={{ base: "full", sm: "auto" }}
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel}
              </Button>
            )}
          </Stack>
        )}
      </VStack>
    </Flex>
  );
};

export default SuccessMessage;
