import { Box, Breadcrumb } from "st-peter-ui";
import { TransferOfRightsPage } from "./transfer-of-rights-page";

export default function Page() {
  const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Plan Management",
      href: "#",
    },
    {
      label: "Transfer of Rights",
      href: "/plan-management/transfer-of-rights",
    },
  ];

  return (
    <>
      <Box pt={4} px={6} mx="auto">
        <Breadcrumb items={breadcrumbItems} />
      </Box>
      <TransferOfRightsPage />
    </>
  );
}
