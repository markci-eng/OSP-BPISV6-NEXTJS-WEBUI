"use client";

import { useMessageDialog } from "osp-ui-kit";
import PlanholderProfilePage, {
  PlanholderPageProps,
} from "@/components/plan-management/planholder-profile/planholder-page";

export function PlanholderPage({
  props,
  selectedLpaNumber,
}: {
  props: PlanholderPageProps;
  selectedLpaNumber?: string;
}) {
  const { messageBox } = useMessageDialog();

  props.actionFunctions = {
    deletePlanFunction: (lpaNumber) => {
      messageBox({
        title: "Delete Successful",
        message: lpaNumber + " plan has been deleted successfully!",
        confirmText: "Okay",
        showCancel: false,
        variant: "information",
      });
    },
  };

  return (
    <PlanholderProfilePage props={props} selectedLpaNumber={selectedLpaNumber} />
  );
}
