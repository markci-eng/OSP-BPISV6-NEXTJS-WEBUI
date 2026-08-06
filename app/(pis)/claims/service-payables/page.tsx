"use client";

import { Text } from "@chakra-ui/react";
import { Page } from "osp-ui-kit";

export default function ServicePayablesPage() {
  return (
    <Page.Root
      subtitle="Claims"
      title="Service Payables"
      description="Service payables module."
      headerButton="menu"
    >
      <Page.MainContent>
        <Page.Row>
          <Text color="gray.500">Service payables module — coming soon.</Text>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
