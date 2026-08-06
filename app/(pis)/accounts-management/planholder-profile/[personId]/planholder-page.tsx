"use client";




import { PlanholderPageProps } from "@/components/plan-management/planholder-profile/planholder-page";
import PlanholderProfilePage from "./pis-planholder-profile-page";
import { useMessageDialog } from "osp-ui-kit";

export function PlanholderPage({ props }: { props: PlanholderPageProps }) {
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

  return <PlanholderProfilePage props={props} />;
}
