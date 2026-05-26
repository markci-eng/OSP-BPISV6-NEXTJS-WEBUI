"use client";
import { useState } from "react";
import { PlanSelectionPage } from "./plan-selection-page";
import { CheckedPlan } from "./transfer-of-rights.types";
import { TransferDocumentsPage } from "./tf-documents-page";
import { NewPlanHolderInfoForm } from "./new-ph-form";
import { FormSteps } from "osp.cis.nextjs.components";
import {
  LuAArrowDown,
  LuFileText,
  LuListCheck,
  LuUserRound,
} from "react-icons/lu";
import { planholderLookup } from "../../../data/planholder-lookup";
import TFReviewApplicationPage from "./tf-review-application-page";
import { FaFileShield } from "react-icons/fa6";

export function TransferOfRightsPage() {
  const [checkedPlans, setCheckedPlans] = useState<CheckedPlan[]>([]);

  const stepsData = [
    {
      title: "Select Plan",
      content: (
        <PlanSelectionPage
          plans={planholderLookup.filter(
            (plan) =>
              plan.accountStatus != "LAPSED" &&
              plan.terminationStatus == "NOT YET TERMINATED",
          )}
        />
      ),
      icon: LuListCheck,
    },
    {
      title: "Documents",
      content: <TransferDocumentsPage />,
      icon: LuFileText,
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
    <FormSteps
      stepsData={stepsData}
      title={"Transfer of Rights"}
      description={"Transfer your plan to your loved ones—simple and seamless."}
    />
  );
}
