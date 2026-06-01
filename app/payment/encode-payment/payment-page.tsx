"use client";

import { useState } from "react";

import { toast } from "sonner";
import { PaymentRecord } from "../data/payment.types";
import Page from "@/components/layout/page/Page";
import { FormStepper } from "@/components/form-stepper/form-stepper";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import { useRouter } from "next/navigation";

import { MdOutlinePayment } from "react-icons/md";
import { EncodePaymentPage } from "./encode-payment-page";
import { IoDocumentAttachOutline } from "react-icons/io5";

import PrepareDRS from "./prepare-drs";

export default function PaymentPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  const steps = [
    {
      title: "Encode Payment",
      icon: MdOutlinePayment,
      content: (
        <EncodePaymentPage payments={payments} setPayments={setPayments} />
      ),
      validateBeforeNext: () => {
        if (payments.length === 0) {
          toast.error("Please add at least one payment before proceeding.");
          return false;
        }
        return true;
      },
    },
    {
      title: "Prepare DRS",
      icon: IoDocumentAttachOutline,
      content: <PrepareDRS payments={payments} />,
    },
  ];
  const { messageBox } = useMessageDialog();
  const router = useRouter();
  const handleConfirm = async () => {
    const confirmed = await messageBox({
      title: "CONFIRMATION",
      message: "Do you want to Save DRS?",
      confirmText: "Ok",
      variant: "confirmation",
    });

    if (confirmed) {
      const isSuccess = await messageBox({
        title: "SUCCESS",
        message: "DRS Successfully Saved.",
        confirmText: "Ok",
        variant: "success",
      });
      if (isSuccess) {
        router.push("/payment/view-drs");
        toast.success("DRS Successfully Saved.");
      }
    }
  };

  return (
    <Page.Root
      title={"Encode Payment"}
      description={"Encode Payment"}
    >
      <Page.MainContent>
        <FormStepper steps={steps} onSubmit={handleConfirm} />
      </Page.MainContent>
    </Page.Root>
  );
}
