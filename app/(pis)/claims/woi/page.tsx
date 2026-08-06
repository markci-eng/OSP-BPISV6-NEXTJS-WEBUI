"use client";

import { Text } from "@chakra-ui/react";
import { Page } from "osp-ui-kit";

export default function WOIPage() {
  return (
    <Page.Root
      subtitle="Claims"
      title="WOI Claims"
      description="WOI claims module."
      headerButton="menu"
    >
      <Page.MainContent>
        <Page.Row>
          <Text color="gray.500">WOI claims module — coming soon.</Text>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
