"use client";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Separator,
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
  LuChevronUp,
} from "react-icons/lu";
import MenuButton, { MenuItemButton } from "../buttons/MenuButton";
import { MdPayment } from "react-icons/md";
import { useMessageDialog } from "../common/message-box/message-box-provider";
import { TbMoneybagMove } from "react-icons/tb";
import Page from "@/components/layout/page/Page";
import {
  ACCOUNT_SUMMARY_STEPS,
  OnboardingTutorial,
} from "./onboarding-tutorial";

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
    transactionId: "TXN-2025-001234",
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
    transactionId: "TXN-2025-005678",
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
    transactionId: "TXN-2024-009876",
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
    transactionId: "TXN-2024-003456",
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

  const toggleProfile = () => setIsProfileOpen((prev) => !prev);

  const phone =
    props.planholderContact?.find((c) => c.type === "MobileNo")?.value ??
    props.planholderContact?.find((c) => c.type === "LandlineNo")?.value;
  const email = props.planholderContact?.find((c) => c.type === "Email")?.value;

  const contactActions = props.planholderInfo ? (
    <Flex gap={2} overflow="hidden" id="tour-contact-actions" flexWrap="wrap">
      <Button
        bg={"white"}
        variant="outline"
        size="sm"
        borderRadius="full"
        disabled={!phone}
        asChild={!!phone}
        flexShrink={0}
      >
        {phone ? (
          <a href={`tel:${phone}`}>
            <LuPhone />
            {(() => {
              const d = phone.replace(/\D/g, "");
              const local = d.startsWith("63") ? "0" + d.slice(2) : d;
              return local.startsWith("09") && local.length === 11
                ? local.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3")
                : phone;
            })()}
          </a>
        ) : (
          <>
            <LuPhone />
            No phone
          </>
        )}
      </Button>
      <Button
        bg={"white"}
        variant="outline"
        size="sm"
        borderRadius="full"
        disabled={!email}
        asChild={!!email}
        flexShrink={0}
      >
        {email ? (
          <a href={`mailto:${email}`}>
            <LuMail />
            Send email
          </a>
        ) : (
          <>
            <LuMail />
            Send email
          </>
        )}
      </Button>
      <Button
        bg={"white"}
        variant="outline"
        size="sm"
        borderRadius="full"
        disabled={!planholderAddress}
        asChild={!!planholderAddress}
        flexShrink={0}
      >
        {planholderAddress ? (
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(planholderAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LuMapPin />
            Map address
          </a>
        ) : (
          <>
            <LuMapPin />
            Map address
          </>
        )}
      </Button>
    </Flex>
  ) : undefined;

  return (
    <Page.Root
      title={"Account Summary"}
      description="Clear Access to Every Planholder Detail."
    >
      <Page.ToolContent>
        <Flex
          direction="row"
          gap={2}
          my={2}
          align="center"
          justify={{ sm: "flex-end" }}
          w="full"
        >
          {/* <Box flex={1} minW={0} id="tour-search">
            <PlanholderLookup
              value={
                props.planholderInfo
                  ? ({
                      personId: props.planholderInfo.personId,
                      firstName: props.planholderInfo.firstName,
                      middleName: props.planholderInfo.middleName ?? "",
                      lastName: props.planholderInfo.lastName,
                      lpaNumber: "",
                      dueDate: new Date(),
                      installmentNo: 0,
                      totalInstallment: 0,
                      balance: 0,
                      planDescription: "",
                      mode: "",
                      effectivityDate: new Date(),
                      branch: "",
                      accountStatus: "",
                      terminationStatus: "",
                    } as PlanholderLookupType)
                  : undefined
              }
              onSelectChange={(e) =>
                router.push(`/plan-management/planholder/${e?.personId}`)
              }
              mobileFullscreen
            />
          </Box> */}
          {props.planholderInfo && (
            <>
              <Box id="tour-actions-menu" flexShrink={0}>
                <MenuButton>
                  <MenuItemButton
                    icon={<LuUserPen />}
                    label="Edit Planholder Info"
                    itemKey="edit"
                    value="edit"
                    onClick={() => {
                      redirect(
                        `/plan-management/planholder/${props.planholderInfo?.personId}/edit`,
                      );
                    }}
                  />
                  <MenuItemButton
                    icon={<LuTrash2 />}
                    label="Delete Planholder"
                    itemKey="delete"
                    value="delete"
                    onClick={() =>
                      messageBox({
                        title: "Unable to delete planholder.",
                        message:
                          "Unable to delete planholder with active plans.",
                        confirmText: "Dismiss",
                        variant: "error",
                      })
                    }
                  />
                  {props.hyperlinks && <Separator />}
                  {props.hyperlinks && props.hyperlinks.payMyPlan && (
                    <MenuItemButton
                      icon={<MdPayment />}
                      label="Pay My Plan"
                      itemKey="pay-my-plan"
                      value="pay-my-plan"
                      onClick={() =>
                        redirect(props.hyperlinks?.payMyPlan ?? "")
                      }
                    />
                  )}
                  {props.hyperlinks && props.hyperlinks.changeOfMode && (
                    <MenuItemButton
                      icon={<LuReplace />}
                      label="Change of Mode"
                      itemKey="change-of-mode"
                      value="change-of-mode"
                      onClick={() =>
                        redirect(props.hyperlinks?.changeOfMode ?? "")
                      }
                    />
                  )}
                  {props.hyperlinks && props.hyperlinks.returnedOfPremium && (
                    <MenuItemButton
                      icon={<LuTrendingUpDown />}
                      label="ROP Application"
                      itemKey="return-of-premium"
                      value="return-of-premium"
                      onClick={() =>
                        redirect(props.hyperlinks?.returnedOfPremium ?? "")
                      }
                    />
                  )}
                  {props.hyperlinks && props.hyperlinks.claimApplication && (
                    <MenuItemButton
                      icon={<LuFile />}
                      label="Claim Application"
                      itemKey="claim-application"
                      value="claim-application"
                      onClick={() =>
                        redirect(props.hyperlinks?.claimApplication ?? "")
                      }
                    />
                  )}
                  {props.hyperlinks &&
                    props.hyperlinks.cashSurrenderedValue && (
                      <MenuItemButton
                        icon={<TbMoneybagMove />}
                        label="CSV Application"
                        itemKey="cash-surrendered-value"
                        value="cash-surrendered-value"
                        onClick={() =>
                          redirect(props.hyperlinks?.cashSurrenderedValue ?? "")
                        }
                      />
                    )}
                </MenuButton>
              </Box>
            </>
          )}
        </Flex>
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
          <Grid gap={5} templateColumns={{ base: "1fr", lg: "2fr 1fr" }}>
            <GridItem>
              <Flex direction="column" gap={5}>
                {/* ProfileHeaderCard — accordion trigger with contact actions */}
                <Box id="tour-profile-header">
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
                    onToggle={toggleProfile}
                    contentId="profile-details-content"
                    actions={contactActions}
                  />
                </Box>

                {/* Collapsible content */}
                {isProfileOpen && (
                  <Flex
                    id="profile-details-content"
                    role="region"
                    aria-label="Profile Details"
                    direction="column"
                    gap={5}
                  >
                    {/* Personal Information + Addresses | Contact Information + Employment Information */}
                    <Grid
                      gap={5}
                      templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
                    >
                      <GridItem>
                        <Flex direction="column" gap={5}>
                          <Box id="tour-planholder-info">
                            <PlanholderInfo
                              planholder={props.planholderInfo ?? undefined}
                            />
                          </Box>
                          <PlanholderAddressCard
                            phAddress={props.planholderAddress}
                          />
                        </Flex>
                      </GridItem>
                      <GridItem>
                        <Flex direction="column" gap={5}>
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
                          />
                          <EmploymentInfo planholderInfo={undefined} />
                        </Flex>
                      </GridItem>
                    </Grid>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleProfile}
                      alignSelf="center"
                      color="gray.500"
                      gap={1}
                    >
                      <LuChevronUp size={14} />
                      Collapse
                    </Button>
                  </Flex>
                )}

                <Show when={isMobile}>
                  <PendingRequests requests={MOCK_REQUESTS} />
                </Show>
                <Show when={isMobile}>
                  <ListOfPlans
                    plans={(props.plans ?? []) as any}
                    deletePlanFunction={
                      props.actionFunctions?.deletePlanFunction
                    }
                    personId={props.planholderInfo?.personId}
                    planholderAddress={planholderAddress}
                  />
                </Show>
              </Flex>
            </GridItem>

            <GridItem>
              <Flex direction="column" gap={5}>
                <Show when={!isMobile}>
                  <Box id="tour-pending-requests">
                    <PendingRequests requests={MOCK_REQUESTS} />
                  </Box>
                </Show>
              </Flex>
            </GridItem>
          </Grid>

          <Box id="tour-plans-list" display={{ base: "none", md: "block" }}>
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
