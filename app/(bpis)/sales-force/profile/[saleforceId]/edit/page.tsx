"use client";
import AgentEditForm from "@/components/saleforce/forms/agent-edit-form";
import Page from "@/claude components/layout/page/Page";
import { Box } from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";

export default function EditPage() {
  const router = useRouter();
  const params = useParams<{ saleforceId: string }>();

  return (
    <Page.Root
      title="Edit Salesforce Information"
      description="Keep salesforce information on track."
    >
      <Page.MainContent>
        <Box my={2}>
          <AgentEditForm
            onCancel={() => router.back()}
            successLink={`/sales-force/profile/${params.saleforceId}/edit/success`}
          />
        </Box>
      </Page.MainContent>
    </Page.Root>
  );
}
