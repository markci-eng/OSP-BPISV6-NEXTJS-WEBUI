"use client";

import { Box, Flex } from "@chakra-ui/react";
import {
  BaseText,
  Body,
  Small,
  PrimaryMdButton,
  SecondaryMdButton,
} from "st-peter-ui";
import { useRouter } from "next/navigation";
import { LuArrowLeft, LuHouse, LuFileQuestion } from "react-icons/lu";

export default function NotFound() {
  const router = useRouter();

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      minH="70vh"
      w="100%"
      px={4}
      gap={5}
    >
      <Box
        p={5}
        borderRadius="2xl"
        bg="var(--chakra-colors-primary-disabled)/20"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <LuFileQuestion size={40} color="var(--chakra-colors-primary)" />
      </Box>

      <Box>
        <BaseText
          as="div"
          fontSize={{ base: "5xl", md: "6xl" }}
          fontWeight="bold"
          color="var(--chakra-colors-primary)"
          lineHeight="1"
        >
          404
        </BaseText>
        <BaseText
          as="div"
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="semibold"
          color="gray.800"
          mt={3}
        >
          Page not found
        </BaseText>
      </Box>

      <Body color="gray.500" maxW="440px">
        The page you&apos;re looking for doesn&apos;t exist, may have been
        moved, or is no longer available.
      </Body>

      <Flex gap={3} mt={2} wrap="wrap" justify="center">
        <SecondaryMdButton onClick={() => router.back()}>
          <LuArrowLeft /> Go back
        </SecondaryMdButton>
        <PrimaryMdButton onClick={() => router.push("/")}>
          <LuHouse /> Back to home
        </PrimaryMdButton>
      </Flex>

      <Small color="gray.400" mt={2}>
        If you believe this is an error, please contact your administrator.
      </Small>
    </Flex>
  );
}
