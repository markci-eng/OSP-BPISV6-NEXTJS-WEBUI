"use client";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { ChangeModePage } from "@/components/plan-management/planholder-profile/components/change-of-mode/change-mode-page";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const { messageBox } = useMessageDialog();

  return (
    <>
      <ChangeModePage
        onSuccess={async function (
          transactionId: string,
          transactionAmount: number,
        ): Promise<void> {
          const confirm = await messageBox({
            title: "Proceed Application",
            message: "Are you sure you want to proceed?",
            confirmText: "Proceed",
            cancelText: "No",
            variant: "warning",
          });

          if (confirm) {
            router.push("/plan-management/change-of-mode/success");
          }
        }}
        successLink="/plan-management/change-of-mode/success"
      />
    </>
  );
}
