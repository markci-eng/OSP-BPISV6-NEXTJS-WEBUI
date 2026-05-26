"use client";
import { useState } from "react";
import { TransferDocumentsPage } from "./tf-documents-page";
import { NewPlanHolderInfoForm } from "./new-ph-form";
import { LuFileText, LuUserRound } from "react-icons/lu";
import TFReviewApplicationPage from "./tf-review-application-page";
import { FaFileShield } from "react-icons/fa6";
import { Page } from "@/components/page/page";
import { BreadcrumbItemType } from "st-peter-ui";
import { FormStepper } from "@/components/form-stepper/form-stepper";
import { UploadedFile } from "@/components/document-uploader/DragAndDrop";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { Box } from "@chakra-ui/react";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

export function TransferOfRightsPage({
  breadcrumbItems,
}: {
  breadcrumbItems: BreadcrumbItemType[];
}) {
  const [selectedDocuments, setSelectedDocuments] = useState<UploadedFile[]>(
    [],
  );

  const { messageBox } = useMessageDialog();

  const stepsData = [
    // {
    //   title: "Select Plan",
    //   content: (
    //     <PlanSelectionPage
    //       plans={planholderLookup.filter(
    //         (plan) =>
    //           plan.accountStatus != "LAPSED" &&
    //           plan.terminationStatus == "NOT YET TERMINATED",
    //       )}
    //     />
    //   ),
    //   icon: LuListCheck,
    // },
    {
      title: "Documents",
      content: (
        <TransferDocumentsPage
          onFilesChange={(files) => setSelectedDocuments(files)}
        />
      ),
      icon: LuFileText,
      validateBeforeNext: () => {
        if (selectedDocuments.length === 0) {
          messageBox({
            title: "Unable to proceed",
            message: "Please upload at least one document.",
            confirmText: "Okay",
            variant: "warning",
          });
          return false;
        }
        return true;
      },
    },
    {
      title: "New PH Information",
      content: <NewPlanHolderInfoForm />,
      icon: LuUserRound,
    },
    {
      title: "Review Application",
      description: "Review your application before submission.",
      content: <TFReviewApplicationPage />,
      icon: FaFileShield,
    },
  ];

  return (
    // <FormSteps
    //   stepsData={stepsData}
    //   title={"Transfer of Rights"}
    //   description={"Transfer your plan to your loved ones - simple and seamless."}
    // />
    <Page
      breadcrumbItems={breadcrumbItems}
      title={"Transfer of Rights Application"}
      description="Transfer your plan to your loved ones - simple and seamless."
    >
      <Box
        bg={BRAND_COLORS.white}
        border="1px solid"
        borderColor={BRAND_COLORS.neutralBorder}
        borderRadius={STANDARD_RADIUS.md}
        boxShadow={STANDARD_SHADOWS.level1}
        p={{ base: 4, md: 5 }}
      >
        <FormStepper
          steps={stepsData}
          onSubmit={async () => {
            const confirm = await messageBox({
              title: "Proceed Application",
              message: "Are you sure you want to proceed?",
              confirmText: "Proceed",
              cancelText: "Cancel",
              variant: "warning",
            });

            if (confirm) {
              window.location.href += "/success";
            }
          }}
        />
      </Box>
    </Page>
  );
}
