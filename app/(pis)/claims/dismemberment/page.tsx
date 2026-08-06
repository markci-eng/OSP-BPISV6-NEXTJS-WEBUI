"use client";

import { Text } from "@chakra-ui/react";
import { Page } from "osp-ui-kit";

export default function DismembermentPage() {
  return (
    <Page.Root
      subtitle="Claims"
      title="Dismemberment Claims"
      description="Dismemberment claims module."
      headerButton="menu"
    >
      <Page.MainContent>
        <Page.Row>
          <Text color="gray.500">
            Dismemberment claims module — coming soon.
          </Text>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
