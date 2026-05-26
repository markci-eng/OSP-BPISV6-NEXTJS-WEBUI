import { PlanholderPage } from "@/components/plan-management/planholders/planholder-page";
import { PlanDetailsData } from "../../data/plan-details.data";
import { PlanholderInfoData } from "../../data/planholder-info.data";
import { PlanholderAddress } from "../../data/planholder-address.data";
import { PlanholderContactData } from "../../data/planholder-contact.data";
import { Box } from "@chakra-ui/react";
import { Breadcrumb } from "st-peter-ui";

export default async function Page({
  params,
}: {
  params: Promise<{ lpaNumber: string }>;
}) {
  const lpaNo = (await params).lpaNumber;
  const planDetails = PlanDetailsData.find((plan) => plan.lpaNumber === lpaNo);
  const planholderInfo = PlanholderInfoData.find(
    (plan) => plan.lpaNumber === lpaNo,
  );
  const planholderAddress = PlanholderAddress.filter(
    (plan) => plan.lpaNumber === lpaNo,
  ).toReversed();
  const planholderContact = PlanholderContactData.filter(
    (plan) => plan.lpaNumber === lpaNo,
  );

    const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Planholder",
      href: "/plan-management/planholder/",
    },
    {
      label: "ROGELIO REDOBLE",
      href: "/plan-management/planholder/" + lpaNo
    },
    {
      label: lpaNo,
      href: "/plan-management/planholder/" + lpaNo,
    }
  ];

  return (
    <Box mx="auto" py={4} px={9}>
      <Breadcrumb items={breadcrumbItems} />
      <PlanholderPage
        props={{
          lpaNumber: lpaNo,
          planDetails: planDetails!,
          planholderInfo: planholderInfo!,
          planholderAddress: planholderAddress,
          planholderContact: planholderContact,
        }}
      />
    </Box>
  );
}
