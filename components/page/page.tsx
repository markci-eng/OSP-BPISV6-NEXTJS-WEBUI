"use client";
import {
  Box,
  Grid,
  GridItem,
  Separator,
  Show,
  Span,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  BaseHeading,
  Body,
  Breadcrumb,
  BreadcrumbItemType,
  H3,
  H4,
  Small,
} from "st-peter-ui";
import {
  PAGE_PADDING,
  RESPONSIVE_LAYOUT_TOKENS,
} from "@/lib/theme/layout-tokens";

export interface PageProps {
  breadcrumbItems: BreadcrumbItemType[];
  actionComponent?: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Page(props: PageProps) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <Box
      w={"full"}
      mx="auto"
      px={{ base: PAGE_PADDING.base, md: PAGE_PADDING.md, lg: PAGE_PADDING.lg }}
      my={{
        base: RESPONSIVE_LAYOUT_TOKENS.navigationOffset.base,
        md: RESPONSIVE_LAYOUT_TOKENS.navigationOffset.md,
      }}
    >
      <Breadcrumb items={props.breadcrumbItems} />
      {props.actionComponent && (
        <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap="2">
          <GridItem width={"full"} colSpan={2}>
            <Span
              py={isMobile ? PAGE_PADDING.base : PAGE_PADDING.md}
              display={"block"}
            >
              <H3 color="gray.solid">{props.title}</H3>
              <Show when={props.description}>
                <Body color={"gray.fg"} mt={2}>
                  {props.description}
                </Body>
              </Show>
            </Span>
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
      )}
      {!props.actionComponent && (
        <Span
          py={isMobile ? PAGE_PADDING.base : PAGE_PADDING.md}
          display={"block"}
        >
          <H3 color="gray.solid">{props.title}</H3>
          <Show when={props.description}>
            <Body color={"gray.fg"} mt={2}>
              {props.description}
            </Body>
          </Show>
        </Span>
      )}
      {props.children}
    </Box>
  );
}
