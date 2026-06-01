"use client";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Show,
} from "@chakra-ui/react";
import { Body, H3 } from "st-peter-ui";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export interface PageProps {
  actionComponent?: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Page(props: PageProps) {
  const router = useRouter();
  return (
    <Box
      w={"full"}
      mx="auto"
      px={{ base: 0, lg: 6 }}
      pb={{ base: "50px", lg: 0 }}
      my={{ base: 0, lg: 6 }}
    >
      {props.actionComponent ? (
        <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap="2">
          <GridItem width={"full"} colSpan={2}>
            <Flex align="center" gap={2} py={{ base: 2, lg: 4 }}>
              <IconButton
                display={{ base: "flex", lg: "none" }}
                variant="ghost"
                size="md"
                aria-label="Go back"
                onClick={() => router.back()}
                borderRadius="full"
                bg="whiteAlpha.600"
                backdropFilter="blur(8px)"
                border="1px solid"
                borderColor="whiteAlpha.400"
                boxShadow="0 2px 8px rgba(0,0,0,0.08)"
                _hover={{ bg: "whiteAlpha.800" }}
                flexShrink={0}
              >
                <ChevronLeft />
              </IconButton>
              <Box>
                <H3 color="gray.solid">{props.title}</H3>
                <Show when={props.description}>
                  <Body color={"gray.fg"}>{props.description}</Body>
                </Show>
              </Box>
            </Flex>
          </GridItem>
          <GridItem
            colSpan={1}
            width={"full"}
            justifyItems={"end"}
            alignItems={"center"}
            display={"grid"}
          >
            {props.actionComponent}
          </GridItem>
        </Grid>
      ) : (
        <Flex align="center" gap={2} py={{ base: 2, lg: 4 }}>
          <IconButton
            display={{ base: "flex", lg: "none" }}
            variant="ghost"
            size="md"
            aria-label="Go back"
            onClick={() => router.back()}
            borderRadius="full"
            bg="whiteAlpha.600"
            backdropFilter="blur(8px)"
            border="1px solid"
            borderColor="whiteAlpha.400"
            boxShadow="0 2px 8px rgba(0,0,0,0.08)"
            _hover={{ bg: "whiteAlpha.800" }}
            flexShrink={0}
          >
            <ChevronLeft />
          </IconButton>
          <Box>
            <H3 color="gray.solid">{props.title}</H3>
            <Show when={props.description}>
              <Body color={"gray.fg"} mt={2}>
                {props.description}
              </Body>
            </Show>
          </Box>
        </Flex>
      )}
      {props.children}
    </Box>
  );
}
