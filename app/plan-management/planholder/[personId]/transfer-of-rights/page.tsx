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
      <TransferOfRightsPage breadcrumbItems={breadcrumbItems} />
    </>
  );
}
