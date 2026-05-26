"use client";

import { Box, Flex, Image } from "@chakra-ui/react";
import { Body, Small } from "st-peter-ui";
import logoIcon from "@/public/images/logo/icon.png";

export function HeaderLogo() {
  return (
    <Flex align="center" gap={2}>
      <Box
        w="24px"
        h="24px"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Image
          src={logoIcon.src}
          width={24}
          height={24}
          style={{ objectFit: "contain" }}
        />
      </Box>
      <Box overflow="hidden" transition="width 0.2s">
        <Body
          fontWeight="bold"
          whiteSpace="nowrap"
          transition="opacity 0.2s"
          color="primary"
        >
          {"One St. Peter"}
        </Body>
        <Small mt={"-5px"} color={"primary"} fontStyle={"italic"}>
          Life Plan Operations
        </Small>
      </Box>
    </Flex>
  );
}
