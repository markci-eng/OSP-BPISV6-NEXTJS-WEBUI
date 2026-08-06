"use client";
import { SuccessPage } from "osp-ui-kit";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();

  const dateTime = new Date().toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <SuccessPage
      title="Agent Created"
      description="The new sales agent has been registered successfully. A confirmation email has also been sent, and you can view or track this anytime in your account."
      transactionId="SA-0000000"
      dateTime={dateTime}
      primaryActionLabel="Go back to Home"
      onPrimaryAction={() => router.push("/")}
      secondaryActionLabel="Add New Sales Agent"
      onSecondaryAction={() => router.push("/sales-force/new")}
    />
  );
};

export default page;
