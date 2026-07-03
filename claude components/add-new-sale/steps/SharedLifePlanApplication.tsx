"use client";

import { Box } from "@chakra-ui/react";
import { useState } from "react";
import Page from "@/claude components/layout/page/Page";
import { CartItem } from "../cartItem";
import HorizontalStepper from "../horizontal-stepper";
import { createLifePlanSteps } from "../lifePlanSteps";

type SharedLifePlanApplicationProps = {
  title?: string;
  description?: string;
  onPaymentError?: (error: unknown) => void;
};

const safeParse = <T,>(value: string | null): T | null => {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const SharedLifePlanApplication = ({
  title = "Life Plan Application",
  description = "Please fill out the form below to apply for a life plan.",
  onPaymentError,
}: SharedLifePlanApplicationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [allAgreementsAccepted, setAllAgreementsAccepted] = useState(false);
  const [applicationSection, setApplicationSection] = useState<string>();
  const [applicationSectionKey, setApplicationSectionKey] = useState(0);
  const [applicationValid, setApplicationValid] = useState(false);

  const steps = createLifePlanSteps({
    onAllAcceptedChange: setAllAgreementsAccepted,
    applicationSection,
    applicationSectionKey,
    onApplicationValidChange: setApplicationValid,
    onEdit: (section) => {
      setApplicationSection(section ?? "personal");
      setApplicationSectionKey((key) => key + 1);
      setCurrentStep(0);
    },
  });

  const nextDisabled = currentStep === 0 && !applicationValid;

  const handleCheckout = async () => {
    if (!allAgreementsAccepted) return;
    setLoading(true);

    try {
      const checkoutRaw = sessionStorage.getItem("CheckoutCart");
      const cartRaw = sessionStorage.getItem("Cart");

      const parsed =
        safeParse<CartItem | CartItem[]>(checkoutRaw) ??
        safeParse<CartItem | CartItem[]>(cartRaw);

      const items: CartItem[] = Array.isArray(parsed)
        ? parsed
        : parsed
          ? [parsed]
          : [];

      if (items.length === 0) {
        throw new Error("No items to checkout");
      }

      const checkoutPayload = items.map((item) => ({
        planDesc: item.planDesc,
        ipInstAmt: Number(item.price),
        planTerm: item.planTerm,
        quantity: item.quantity ?? 1,
      }));
    } catch (error) {
      console.error(error);
      onPaymentError?.(error);
      alert("Failed to proceed to payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page.Root title={title} description={description}>
      <Page.MainContent>
        <Page.Row>
          <Box w="full" overflowX="hidden">
            <HorizontalStepper
              steps={steps}
              activeStep={currentStep}
              onStepChange={setCurrentStep}
              onSubmit={handleCheckout}
              submitDisabled={!allAgreementsAccepted || loading}
              nextDisabled={nextDisabled}
            />
          </Box>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
};

export default SharedLifePlanApplication;
