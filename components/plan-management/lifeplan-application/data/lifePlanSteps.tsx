import Beneficiary from "@/components/plan-management/lifeplan-application/beneficiary";
import Confirmation from "@/components/plan-management/lifeplan-application/confirmation";
import HealthDeclaration from "@/components/plan-management/lifeplan-application/health-declaration";
import LifePlanApplicationWrapper from "@/components/plan-management/lifeplan-application/lifeplan-application-wrapper";
import Requirements from "@/components/plan-management/lifeplan-application/upload-requirements";
export const steps = [
  {
    id: "1",
    header: "Upload Requirements",
    title: "Requirements",
    description: "Upload Requirements",
    component: <Requirements />,
  },
  {
    id: "2",
    header: "Life Plan Application",
    title: "Application",
    description: "Complete the application form",
    component: <LifePlanApplicationWrapper />,
  },

  {
    id: "3",
    header: "Beneficiary Details",
    title: "Beneficiary",
    description: "Add Beneficiary Details",
    component: <Beneficiary />,
  },
  {
    id: "4",
    header: "Health Declaration & Terms and Conditions",
    title: "Terms",
    description: "Health Declaration & Terms and Conditions",
    component: <HealthDeclaration />,
  },
  {
    id: "5",
    header: "Review Summary",
    title: "Summary",
    description: "Review and confirm your application",
    component: <Confirmation />,
  },
];
