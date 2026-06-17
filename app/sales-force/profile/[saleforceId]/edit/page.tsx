"use client";
import AgentEditForm from "@/components/saleforce/forms/agent-edit-form";
import Page from "@/claude components/layout/page/Page";
import { Box } from "@chakra-ui/react";

export default function EditPage() {
  return (
    <Page.Root
      title="Edit Salesforce Information"
      description="Keep salesforce information on track."
    >
      <Page.MainContent>
        <Box my={2}>
          <AgentEditForm />
        </Box>
      </Page.MainContent>
    </Page.Root>
  );
}
