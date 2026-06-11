import LifePlanApplicationWrapper from "@/components/plan-management/lifeplan-application/lifeplan-application-wrapper";
import Beneficiary from "./steps/beneficiary";
import Confirmation, { type ConfirmationProps } from "./steps/confirmation";
import HealthDeclaration from "./steps/HealthDeclaration";
import { FaClipboardCheck, FaFileSignature, FaRegUser } from "react-icons/fa";
import { IoIosInformationCircleOutline } from "react-icons/io";

export const createLifePlanSteps = (
  confirmationProps?: ConfirmationProps & {
    onEdit?: (section?: string) => void;
    applicationSection?: string;
    applicationSectionKey?: number;
    onApplicationValidChange?: (valid: boolean) => void;
  },
) => [
  {
    id: "1",
    header: "Life Plan Application",
    title: "Application",
    description: "Complete the application form",
    icon: FaFileSignature,
    component: (
      <LifePlanApplicationWrapper
      // openSection={confirmationProps?.applicationSection}
      // openSectionKey={confirmationProps?.applicationSectionKey}
      // onValidChange={confirmationProps?.onApplicationValidChange}
      />
    ),
  },

  {
    id: "2",
    header: "Beneficiary Details",
    title: "Beneficiary",
    description: "Add Beneficiary Details",
    icon: FaRegUser,
    component: <Beneficiary />,
  },
  {
    id: "3",
    header: "Health Declaration & Terms and Conditions",
    title: "Terms",
    description: "Health Declaration & Terms and Conditions",
    icon: FaClipboardCheck,
    component: <HealthDeclaration />,
  },
  // {
  //   id: "4",
  //   header: "Upload Requirements",
  //   title: "Requirements",
  //   description: "Upload Requirements",
  //   component: <Requirements />,
  // },
  {
    id: "4",
    header: "Review Summary",
    title: "Summary",
    description: "Review and confirm your application",
    icon: IoIosInformationCircleOutline,
    component: <Confirmation {...confirmationProps} />,
  },
  // {
  //   id: "5",
  //   header: "Payment",
  //   title: "Payment",
  //   description: "Review and confirm your application",
  //   component: <Payment />,
  // },
];
