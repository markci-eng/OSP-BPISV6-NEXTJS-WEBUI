"use client";
import { BreadcrumbItemType } from "st-peter-ui";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Separator,
  Show,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  PlanholderInfo,
  PlanholderInfoProps,
} from "./sections/planholder-info";
import { PendingRequests } from "./sections/pending-requests";
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
} from "react-icons/lu";
import MenuButton, { MenuItemButton } from "../buttons/MenuButton";
import { MdPayment } from "react-icons/md";
import { useMessageDialog } from "../common/message-box/message-box-provider";
import { TbMoneybagMove } from "react-icons/tb";
import { Page } from "@/components/page/page";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
} from "@/lib/theme/standard-design-tokens";

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
  breadcrumbItems: BreadcrumbItemType[];
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

const PlanOverviewItem = ({
  label,
  value,
  accent = BRAND_COLORS.primaryGreen,
}: {
  label: string;
  value: string;
  accent?: string;
}) => {
  return (
    <Box
      bg={BRAND_COLORS.white}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius={STANDARD_RADIUS.md}
      boxShadow={STANDARD_SHADOWS.level1}
      p={{ base: 3, md: 4 }}
      minW={0}
    >
      <Box
        color="gray.500"
        fontSize="xs"
        fontWeight="600"
        textTransform="uppercase"
      >
        {label}
      </Box>
      <Box
        color={accent}
        fontSize={{ base: "lg", md: "xl" }}
        fontWeight="700"
        wordBreak="break-word"
      >
        {value}
      </Box>
    </Box>
  );
};

export default function PlanholderProfilePage({
  props,
}: {
  props: PlanholderPageProps;
}) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const router = useRouter();
  const { messageBox } = useMessageDialog();
  const plans = props.plans ?? [];
  const activePlans = plans.filter((plan) => plan.accountStatus === "ACTIVE");
  const lapsedPlans = plans.filter((plan) => plan.accountStatus === "LAPSED");
  const totalContractValue = plans.reduce(
    (sum, plan) => sum + plan.contractPrice,
    0,
  );

  return (
    <Page
      breadcrumbItems={props.breadcrumbItems}
      title={"Account Summary"}
      description="Clear Access to Every Planholder Detail."
      actionComponent={
        <Flex
          direction={{ base: "column", sm: "row" }}
          gap={2}
          my={2}
          align={{ base: "stretch", sm: "center" }}
          w={{ base: "full", md: "auto" }}
        >
          <PlanholderLookup
            onSelectChange={(e) =>
              router.push(`/plan-management/planholder/${e?.personId}`)
            }
          />
          {props.planholderInfo && (
            <>
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
                      message: "Unable to delete planholder with active plans.",
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
                    onClick={() => redirect(props.hyperlinks?.payMyPlan ?? "")}
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
                {props.hyperlinks && props.hyperlinks.cashSurrenderedValue && (
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
            </>
          )}
        </Flex>
      }
    >
      {props.planholderInfo && (
        <Grid
          gap={{ base: 3, md: 4 }}
          templateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
            xl: "repeat(4, 1fr)",
          }}
          mb={{ base: 4, md: 5 }}
        >
          <PlanOverviewItem label="Total Plans" value={String(plans.length)} />
          <PlanOverviewItem
            label="Active Plans"
            value={String(activePlans.length)}
          />
          <PlanOverviewItem
            label="Lapsed Plans"
            value={String(lapsedPlans.length)}
            accent={BRAND_COLORS.warningText}
          />
          <PlanOverviewItem
            label="Contract Value"
            value={`PHP ${totalContractValue.toLocaleString()}`}
          />
        </Grid>
      )}

      <Grid
        gap={{ base: 4, md: 5 }}
        templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
      >
        <GridItem>
          <Flex direction={"column"} gap={{ base: 4, md: 5 }}>
            {props.planholderInfo ? (
              <ProfileHeaderCard
                name={
                  props.planholderInfo.firstName +
                  " " +
                  props.planholderInfo.lastName
                }
                nameSubtitle={{ active: true, value: "Insurable" }}
              />
            ) : (
              <ProfileHeaderCard />
            )}
            <Show when={isMobile}>
              <PendingRequests />
            </Show>
            <PlanholderInfo planholder={props.planholderInfo ?? undefined} />
            <PlanholderAddressCard phAddress={props.planholderAddress} />
          </Flex>
        </GridItem>
        <GridItem>
          <Flex direction={"column"} gap={{ base: 4, md: 5 }}>
            <Show when={!isMobile}>
              <PendingRequests />
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
            />
            <EmploymentInfo planholderInfo={props.planholderInfo} />
          </Flex>
        </GridItem>
      </Grid>
      <ListOfPlans
        plans={(props.plans ?? []) as any}
        deletePlanFunction={props.actionFunctions?.deletePlanFunction}
      />
    </Page>
  );
}
