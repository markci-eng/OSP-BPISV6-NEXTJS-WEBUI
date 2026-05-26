import React from "react";
import { DrsTotals } from "../data/payment.types";
import { Box, Grid, Text } from "@chakra-ui/react";
import Card from "@/components/cards/Card";
import LabelText from "@/components/texts/LabelText";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

interface TotalSummaryCardProps {
  totals: DrsTotals;
  title?: string;
  format?: (value: number | undefined) => string;
  receivedKey?: keyof DrsTotals;
  expectedKey?: keyof DrsTotals;
  displayProp?: boolean;
}
export default function DrsPaymentSummary({
  totals,
  title = "Total Summary",
  format = (v) =>
    (v ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  receivedKey = "net",
  expectedKey = "net",
  displayProp = false,
}: TotalSummaryCardProps) {
  if (!totals) return null;
  const received = totals[receivedKey] ?? 0;
  const expected = totals[expectedKey] ?? 0;
  const excessShort = received - expected;
  return (
    <Box mt={{ base: 3, md: 4 }}>
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
            {Object.entries(totals)
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
            borderColor={BRAND_COLORS.neutralBorder}
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
