"use client";

import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import PlanholderProfilePage, {
  PlanholderPageProps,
} from "@/components/new-planholder-profile/planholder-page";

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
