"use client";

// "There is nothing here", as the main column of a workspace says it.
//
// One component rather than a local copy per page, because there are now two
// pages saying it — For Process and Processed — with the same dashed panel and
// the same two lines, and a third stage is coming. What differs between them is
// only ever the WORDS, which is exactly what a shared component should leave to
// its caller.
//
// It is deliberately NOT the empty state inside `ChapelBillingList`. That one
// sits in a 340px rail and is drawn a size down to suit it; this fills a main
// column. Two panels that look alike at two altitudes are not the same panel.

import { Flex, Text } from "@chakra-ui/react";

export interface EmptyPanelProps {
  /** What is missing, e.g. "Nothing to process in BICOL TERRITORY". */
  title: string;
  /** What to do about it — a whole sentence, since it is the only guidance. */
  body: string;
}

export function EmptyPanel({ title, body }: EmptyPanelProps) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      borderWidth="1px"
      borderColor="gray.200"
      borderStyle="dashed"
      borderRadius="xl"
      py={12}
      px={4}
      textAlign="center"
    >
      <Text fontSize="sm" fontWeight="600" color="gray.600">
        {title}
      </Text>
      <Text fontSize="xs" color="gray.400" mt={1}>
        {body}
      </Text>
    </Flex>
  );
}

export default EmptyPanel;
