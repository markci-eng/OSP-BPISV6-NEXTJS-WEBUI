"use client";

import { Badge, Box, Grid } from "@chakra-ui/react";
import { createListCollection } from "@chakra-ui/react";
import { InputFloatingLabel, SelectFloatingLabel } from "st-peter-ui";
import { BatchInfo, CREDIT_MEMO_TYPES, getDepositStatus } from "./types";
import Card from "@/components/cards/Card";

const SUBTYPES = ["Standard", "Special", "Emergency", "Adjustment"];

const subtypeCollection = createListCollection({
  items: SUBTYPES.map((s) => ({ value: s, label: s })),
});

const memoTypeCollection = createListCollection({
  items: CREDIT_MEMO_TYPES.map((t) => ({ value: t.value, label: t.label })),
});

const depositPaletteMap: Record<string, "blue" | "green" | "gray"> = {
  required: "blue",
  optional: "green",
  none: "gray",
};

interface BatchHeaderFormProps {
  batch: BatchInfo;
  onChange: (batch: BatchInfo) => void;
}

export function BatchHeaderForm({ batch, onChange }: BatchHeaderFormProps) {
  const depositStatus = getDepositStatus(batch.type);
  const typeConfig = CREDIT_MEMO_TYPES.find((t) => t.value === batch.type);

  return (
    <Card.Root title="Batch Header">
      <Card.ButtonSection>
        {batch.type && (
          <Badge
            variant="subtle"
            colorPalette={depositPaletteMap[depositStatus]}
            rounded="full"
            px="3"
            py="1"
            textTransform="none"
          >
            Deposit: {depositStatus}
          </Badge>
        )}
      </Card.ButtonSection>

      <Card.MainContent>
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            xl: "repeat(4, 1fr)",
          }}
          gap={4}
        >
          <InputFloatingLabel
            label="Batch No"
            value={batch.batchNo}
            onChange={(e) => onChange({ ...batch, batchNo: e.target.value })}
          />
          <SelectFloatingLabel
            label="Credit Memo Type"
            collection={memoTypeCollection}
            value={batch.type ? [batch.type] : []}
            onValueChanged={(e) =>
              onChange({ ...batch, type: e[0] as BatchInfo["type"] })
            }
          />
          <SelectFloatingLabel
            label="Subtype"
            collection={subtypeCollection}
            value={batch.subtype ? [batch.subtype] : []}
            onValueChanged={(e) => onChange({ ...batch, subtype: e[0] })}
          />
          <InputFloatingLabel
            label="Description"
            value={batch.description}
            onChange={(e) => onChange({ ...batch, description: e.target.value })}
          />
        </Grid>
        {typeConfig && (
          <Box mt={2} fontSize="xs" color="gray.500">
            {typeConfig.helper}
          </Box>
        )}
      </Card.MainContent>
    </Card.Root>
  );
}
