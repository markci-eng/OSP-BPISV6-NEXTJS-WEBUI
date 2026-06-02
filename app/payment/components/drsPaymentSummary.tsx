import React from "react";
import { DrsTotals } from "../data/payment.types";
import { Box, Flex, Grid, Separator, Text } from "@chakra-ui/react";
import { InfoItem } from "@splpi/summary";
import { H3, H4 } from "st-peter-ui";
import Card from "@/components/cards/Card";
import LabelText from "@/components/texts/LabelText";

interface TotalSummaryCardProps {
  totals: DrsTotals;
  title?: string;
  format?: (value: number | undefined) => string;
  receivedKey?: keyof DrsTotals;
  expectedKey?: keyof DrsTotals;
  displayProp?: boolean;
  /**
   * Optional override for the displayed summary rows. When provided these
   * label/value pairs are rendered instead of iterating over `totals`
   * (e.g. showing "AR Total Amount" for LOAN/LAF entries).
   */
  items?: { label: string; value: number }[];
}
export default function DrsPaymentSummary({
  totals,
  title = "Summary",
  format = (v) =>
    (v ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  receivedKey = "net",
  expectedKey = "net",
  displayProp = false,
  items,
}: TotalSummaryCardProps) {
  if (!totals) return null;
  const received = totals[receivedKey] ?? 0;
  const expected = totals[expectedKey] ?? 0;
  const excessShort = received - expected;
  return (
    <Box mt={{ base: 4, md: 6 }}>
      <Card.Root title={title}>
        <Card.MainContent>
          <Grid
            templateColumns={{
              base: " 1fr", // 2 columns on mobile
              sm: "repeat(2, 1fr)", // 2 columns on small screens
              md: "repeat(3, 1fr)", // 3 columns on tablets
              lg: "repeat(4, 1fr)", // 4 columns on desktop
            }}
            gap={{ base: 2, md: 3 }}
          >
            {items
              ? items.map((item) => (
                  <>
                    <LabelText
                      key={item.label}
                      label={item.label}
                      value={format(item.value)}
                    />
                    <Separator display={{ base: "block", md: "none" }} />
                  </>
                ))
              : Object.entries(totals)
                  .filter(([_, val]) => typeof val === "number")
                  .map(([key, val]) => (
                    <LabelText
                      key={key}
                      label={key.toUpperCase()}
                      value={format(val as number)}
                    />
                  ))}
          </Grid>

          {/* Excess / Short */}
          <Grid
            templateColumns={{
              base: "repeat(2, 1fr)", // 2 columns on mobile
              sm: "repeat(2, 1fr)", // 2 columns on small screens
              md: "repeat(3, 1fr)", // 3 columns on tablets
              lg: "repeat(4, 1fr)", // 4 columns on desktop
            }}
            mt={{ base: 3, md: 4 }}
            pt={{ base: 2, md: 3 }}
            borderTop="1px solid"
            borderColor="gray.200"
          >
            <Text
              color="gray.700"
              fontWeight="medium"
              fontSize={{ base: "sm", md: "md" }}
              display={displayProp ? "block" : "none"}
            >
              Excess / Short
            </Text>
            <Text
              fontWeight="bold"
              fontSize={{ base: "sm", md: "lg" }}
              display={displayProp ? "block" : "none"}
              textAlign={"right"}
            >
              {format(excessShort)}
            </Text>
          </Grid>
        </Card.MainContent>
      </Card.Root>
    </Box>
  );
}
