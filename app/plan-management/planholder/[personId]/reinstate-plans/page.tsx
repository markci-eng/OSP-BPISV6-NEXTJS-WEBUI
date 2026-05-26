"use client";
import { useRouter } from "next/navigation";
import { ReinstatementPage } from "./reinstatement-page";
import { Page } from "@/components/page/page";

export default function Reinstatement() {
  const router = useRouter();

  const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
    },

    {
      label: "Planholder",
      href: "/plan-management/planholder",
    },

    {
      label: "PI123453I",
      href: "/plan-management/planholder/PI123453I",
    },
    {
      label: "Reinstatement",
      href: "#",
    },
  ];

  return (
    <Page
      breadcrumbItems={breadcrumbItems}
      title="Reinstatement Application"
      description="Quickly bring your plan back on track by reactivating a lapsed plan."
    >
      <ReinstatementPage
        onSuccess={(transactionId, transactionAmt) => {
          alert(
            "Reinstatement Application Submitted Successfully! \n Transaction No: " +
              transactionId +
              "\n Transaction Amount: ₱ " +
              transactionAmt.toLocaleString(),
          );
          router.push("/plan-management/reinstatement/success");
        }}
        successLink={"/plan-management/reinstatement/success"}
      />
    </Page>
  );
}
