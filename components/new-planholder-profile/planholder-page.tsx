"use client";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Show,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  PlanholderInfo,
  PlanholderInfoProps,
} from "./sections/planholder-info";
import { PlanholderLookup as PlanholderLookupType } from "../common/planholder-lookup/planholder-lookup.type";
import { PendingRequests, RequestProps } from "./sections/pending-requests";
import { ContactInfo } from "./sections/contact-info";
import { EmploymentInfo } from "./sections/employment-info";
import { Address, PlanholderAddressCard } from "./sections/address-info";
import ProfileHeaderCard from "../cards/ProfileHeaderCard";
import { PlanholderLookup } from "../common/planholder-lookup/planholder-lookup";
import { redirect, useRouter } from "next/navigation";
import { ListOfPlans } from "./sections/list-of-plans";
import { PlanDetailType } from "../plan-management/planholders/planholders.types";
import {
  LuUserPen,
  LuReplace,
  LuTrendingUpDown,
  LuTrash2,
  LuFile,
  LuPhone,
  LuMail,
  LuMapPin,
  LuSearch,
  LuChevronsDown,
  LuChevronsUp,
} from "react-icons/lu";
import MenuButton, {
  MenuItemButton,
} from "../../claude components/buttons/MenuButton";
import { MdPayment } from "react-icons/md";
import { useMessageDialog } from "../common/message-box/message-box-provider";
import { TbMoneybagMove } from "react-icons/tb";
import Page from "@/claude components/layout/page/Page";
import {
  ACCOUNT_SUMMARY_STEPS,
  OnboardingTutorial,
} from "./onboarding-tutorial";
import { SecondarySmButton, TertiarySmButton } from "st-peter-ui";
import ActionButtons from "../../claude components/buttons/ActionButtons";

export interface Hyperlinks {
  payMyPlan?: string | undefined;
  changeOfMode?: string | undefined;
  returnedOfPremium?: string | undefined;
  claimApplication?: string | undefined;
  cashSurrenderedValue?: string | undefined;
  transferOfRights: string | undefined;
  reinstement: string | undefined;
}

export interface ActionFunctions {
  deletePlanFunction?: (lpaNumber: string) => void;
}

export interface PlanholderPageProps {
  hyperlinks?: Hyperlinks;
  actionFunctions?: ActionFunctions;
  planholderInfo?: PlanholderInfoProps | undefined;
  planholderAddress?: Address[] | undefined;
  planholderContact?:
    | {
        personId: string;
        value: string;
        type: string;
      }[]
    | undefined;
  plans?: PlanDetailType[] | undefined;
}

const MOCK_REQUESTS: RequestProps[] = [
  {
    type: "Reinstatement",
    title: "Reinstatement",
    description: "LPA No. 2025-001234 · Annual Premium",
    transactionId: "RI-2025-001234",
    currentStep: 2,
    totalSteps: 4,
    status: "Pending",
    date: "May 20, 2026",
    hyperlink: "#",
  },
  {
    type: "Change of Mode",
    title: "Change of Mode",
    description: "LPA No. 2025-005678 · Quarterly to Monthly",
    transactionId: "COM-2025-005678",
    currentStep: 1,
    totalSteps: 3,
    status: "Pending",
    date: "May 24, 2026",
    hyperlink: "#",
  },
  {
    type: "Returned of Premium",
    title: "ROP Application",
    description: "LPA No. 2024-009876 · Maturity Benefit",
    transactionId: "ROP-2024-009876",
    currentStep: 3,
    totalSteps: 3,
    status: "Approved",
    date: "Nov 15, 2025",
    hyperlink: "#",
  },
  {
    type: "Transfer of Rights",
    title: "Transfer of Rights",
    description: "LPA No. 2024-003456 · Beneficiary Change",
    transactionId: "TF-2024-003456",
    currentStep: 2,
    totalSteps: 4,
    status: "Denied",
    date: "Sep 3, 2025",
    hyperlink: "#",
  },
];

export default function PlanholderProfilePage({
  props,
}: {
  props: PlanholderPageProps;
}) {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const router = useRouter();
  const { messageBox } = useMessageDialog();
  const [isProfileOpen, setIsProfileOpen] = useState(true);
  const isWebOnMount = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches;
  const [personalOpen, setPersonalOpen] = useState(isWebOnMount);
  const [addressOpen, setAddressOpen] = useState(isWebOnMount);
  const [contactOpen, setContactOpen] = useState(isWebOnMount);
  const [employmentOpen, setEmploymentOpen] = useState(isWebOnMount);

  const expandAll = () => {
    setPersonalOpen(true);
    setAddressOpen(true);
    setContactOpen(true);
    setEmploymentOpen(true);
  };

  const collapseAll = () => {
    setPersonalOpen(false);
    setAddressOpen(false);
    setContactOpen(false);
    setEmploymentOpen(false);
  };

  const planholderAddress = (() => {
    const addr =
      props.planholderAddress?.find((a) => a.addressType === "RESIDENCE") ??
      props.planholderAddress?.[0];
    return addr
      ? [addr.addressNo, addr.street, addr.barangay, addr.city, addr.province]
          .filter(Boolean)
          .join(", ")
      : undefined;
  })();

  const phone =
    props.planholderContact?.find((c) => c.type === "MobileNo")?.value ??
    props.planholderContact?.find((c) => c.type === "LandlineNo")?.value;
  const email = props.planholderContact?.find((c) => c.type === "Email")?.value;

  // const contactActions = props.planholderInfo ? (
  //   <Flex gap={2} overflow="hidden" id="tour-contact-actions" flexWrap="wrap">
  //     <Button
  //       bg={"white"}
  //       variant="outline"
  //       size="sm"
  //       borderRadius="full"
  //       disabled={!phone}
  //       asChild={!!phone}
  //       flexShrink={0}
  //     >
  //       {phone ? (
  //         <a href={`tel:${phone}`}>
  //           <LuPhone />
  //           {(() => {
  //             const d = phone.replace(/\D/g, "");
  //             const local = d.startsWith("63") ? "0" + d.slice(2) : d;
  //             return local.startsWith("09") && local.length === 11
  //               ? local.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3")
  //               : phone;
  //           })()}
  //         </a>
  //       ) : (
  //         <>
  //           <LuPhone />
  //           No phone
  //         </>
  //       )}
  //     </Button>
  //     <Button
  //       bg={"white"}
  //       variant="outline"
  //       size="sm"
  //       borderRadius="full"
  //       disabled={!email}
  //       asChild={!!email}
  //       flexShrink={0}
  //     >
  //       {email ? (
  //         <a href={`mailto:${email}`}>
  //           <LuMail />
  //           Send email
  //         </a>
  //       ) : (
  //         <>
  //           <LuMail />
  //           Send email
  //         </>
  //       )}
  //     </Button>
  //     <Button
  //       bg={"white"}
  //       variant="outline"
  //       size="sm"
  //       borderRadius="full"
  //       disabled={!planholderAddress}
  //       asChild={!!planholderAddress}
  //       flexShrink={0}
  //     >
  //       {planholderAddress ? (
  //         <a
  //           href={`https://maps.google.com/?q=${encodeURIComponent(planholderAddress)}`}
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           <LuMapPin />
  //           Map address
  //         </a>
  //       ) : (
  //         <>
  //           <LuMapPin />
  //           Map address
  //         </>
  //       )}
  //     </Button>
  //   </Flex>
  // ) : undefined;

  const actionButtonDefs = [
    {
      label: "Edit",
      href: `/plan-management/planholder/${props.planholderInfo?.personId}/edit`,
      icon: () => <LuUserPen size={16} />,
    },
    {
      label: "Delete",
      icon: () => <LuTrash2 size={16} />,
      onClick: () =>
        messageBox({
          title: "Unable to delete planholder.",
          message: "Unable to delete planholder with active plans.",
          confirmText: "Dismiss",
          variant: "error",
        }),
    },

    ...(props.hyperlinks?.payMyPlan
      ? [
          {
            label: "Pay My Plan",
            href: props.hyperlinks.payMyPlan as string,
            icon: () => <MdPayment size={16} />,
          },
        ]
      : []),

    ...(props.hyperlinks?.changeOfMode
      ? [
          {
            label: "Change of Mode",
            href: props.hyperlinks.changeOfMode as string,
            icon: () => <LuReplace size={16} />,
          },
        ]
      : []),

    ...(props.hyperlinks?.returnedOfPremium
      ? [
          {
            label: "ROP Application",
            href: props.hyperlinks.returnedOfPremium as string,
            icon: () => <LuTrendingUpDown size={16} />,
          },
        ]
      : []),

    ...(props.hyperlinks?.claimApplication
      ? [
          {
            label: "Claim Application",
            href: props.hyperlinks.claimApplication as string,
            icon: () => <LuFile size={16} />,
          },
        ]
      : []),

    ...(props.hyperlinks?.cashSurrenderedValue
      ? [
          {
            label: "CSV Application",
            href: props.hyperlinks.cashSurrenderedValue as string,
            icon: () => <TbMoneybagMove size={16} />,
          },
        ]
      : []),
  ];

  return (
    <Page.Root
      title={"Planholder Profile"}
      description="Clear Access to Every Planholder Detail."
    >
      <Page.ToolContent>
        {props.planholderInfo && <ActionButtons buttons={actionButtonDefs} />}
      </Page.ToolContent>
      <Page.MainContent>
        {/* Mobile empty state — visible only on mobile when no planholder is selected */}
        <Flex
          display={{ base: props.planholderInfo ? "none" : "flex", lg: "none" }}
          direction="column"
          align="center"
          justify="center"
          gap={4}
          py={16}
          px={6}
          textAlign="center"
        >
          <Box
            p={5}
            borderRadius="full"
            bg="var(--chakra-colors-primary-disabled)/20"
          >
            <LuSearch size={36} color="var(--chakra-colors-primary)" />
          </Box>
          <Box>
            <Text fontWeight="semibold" fontSize="lg" color="gray.700">
              No Planholder Selected
            </Text>
            <Text fontSize="sm" color="gray.400" mt={1}>
              Use the search bar above to find a planholder.
            </Text>
          </Box>
        </Flex>

        {/* Main content — hidden on mobile when no planholder is selected */}
        <Box
          display={{
            base: props.planholderInfo ? "block" : "none",
            lg: "block",
          }}
        >
          {/* Unified 2-column profile grid */}
          <Grid
            templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
            gap={5}
            alignItems="start"
          >
            {/* Left column — identity & details */}
            <GridItem>
              <Flex direction="column" gap={4}>
                <Box id="tour-profile-header" pt={0}>
                  <ProfileHeaderCard
                    name={
                      props.planholderInfo
                        ? props.planholderInfo.firstName +
                          " " +
                          props.planholderInfo.lastName
                        : undefined
                    }
                    personId={props.planholderInfo?.personId}
                    isInsured={props.plans?.[0]?.isInsured}
                    homeAddress={
                      (props.planholderAddress?.slice(-1)?.[0]?.addressNo ??
                        "") +
                      " " +
                      (props.planholderAddress?.slice(-1)?.[0]?.street ?? "") +
                      "\n" +
                      (props.planholderAddress?.slice(-1)?.[0]?.barangay ??
                        "") +
                      " " +
                      (props.planholderAddress?.slice(-1)?.[0]?.district ??
                        "") +
                      "\n" +
                      (props.planholderAddress?.slice(-1)?.[0]?.city ?? "") +
                      " " +
                      (props.planholderAddress?.slice(-1)?.[0]?.province ?? "")
                    }
                    email={
                      props.planholderContact?.find((x) => x.type === "Email")
                        ?.value
                    }
                    landlineNo={
                      props.planholderContact?.find(
                        (x) => x.type === "LandlineNo",
                      )?.value
                    }
                    contactNo={phone}
                    isOpen={isProfileOpen}
                    contentId="profile-details-content"
                  />
                </Box>
                {/* {contactActions} */}
                <Show when={isMobile}>
                  <ListOfPlans
                    plans={(props.plans ?? []) as any}
                    deletePlanFunction={
                      props.actionFunctions?.deletePlanFunction
                    }
                    personId={props.planholderInfo?.personId}
                    planholderAddress={planholderAddress}
                  />
                  <PendingRequests requests={MOCK_REQUESTS} />
                </Show>

                {/* Expand / Collapse strip */}
                <Flex justify="flex-end" gap={2} mb={1}>
                  <TertiarySmButton onClick={expandAll}>
                    <LuChevronsDown size={14} />
                    Expand All
                  </TertiarySmButton>
                  <TertiarySmButton onClick={collapseAll}>
                    <LuChevronsUp size={14} />
                    Collapse All
                  </TertiarySmButton>
                </Flex>

                <Box id="tour-planholder-info">
                  <PlanholderInfo
                    planholder={props.planholderInfo ?? undefined}
                    isOpen={personalOpen}
                    onToggle={() => setPersonalOpen((p) => !p)}
                  />
                </Box>
                <PlanholderAddressCard
                  phAddress={props.planholderAddress}
                  isOpen={addressOpen}
                  onToggle={() => setAddressOpen((p) => !p)}
                />
              </Flex>
            </GridItem>

            {/* Right column — activity & admin */}
            <GridItem>
              <Flex direction="column" gap={4}>
                <Show when={!isMobile}>
                  <Box id="tour-pending-requests">
                    <PendingRequests requests={MOCK_REQUESTS} />
                  </Box>
                </Show>
                <ContactInfo
                  contacts={{
                    Email:
                      props.planholderContact
                        ?.filter((x) => x.type === "Email")
                        .map((x) => x.value) ?? [],
                    MobileNo:
                      props.planholderContact
                        ?.filter((x) => x.type === "MobileNo")
                        .map((x) => x.value) ?? [],
                    LandlineNo:
                      props.planholderContact
                        ?.filter((x) => x.type === "LandlineNo")
                        .map((x) => x.value) ?? [],
                  }}
                  isOpen={contactOpen}
                  onToggle={() => setContactOpen((p) => !p)}
                />
                <EmploymentInfo
                  planholderInfo={undefined}
                  isOpen={employmentOpen}
                  onToggle={() => setEmploymentOpen((p) => !p)}
                />
              </Flex>
            </GridItem>
          </Grid>

          {/* Plans section — full width */}
          <Box id="tour-plans-list" display={{ base: "none", lg: "block" }}>
            <ListOfPlans
              plans={(props.plans ?? []) as any}
              deletePlanFunction={props.actionFunctions?.deletePlanFunction}
              personId={props.planholderInfo?.personId}
              planholderAddress={planholderAddress}
            />
          </Box>
        </Box>
        <OnboardingTutorial
          steps={
            props.planholderInfo
              ? ACCOUNT_SUMMARY_STEPS.slice(1)
              : ACCOUNT_SUMMARY_STEPS.slice(0, 1)
          }
          storageKey={
            props.planholderInfo
              ? "osp-account-summary-tour-person-v1"
              : "osp-account-summary-tour-base-v1"
          }
        />
      </Page.MainContent>
    </Page.Root>
  );
}
