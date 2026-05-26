"use client";
import {
  Badge,
  Box,
  Button,
  Carousel,
  CloseButton,
  Dialog,
  Flex,
  Grid,
  GridItem,
  Group,
  IconButton,
  Input,
  InputGroup,
  Portal,
  Separator,
  Show,
  Strong,
  Tabs,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  LuArrowLeft,
  LuArrowRight,
  LuHistory,
  LuMail,
  LuPencil,
  LuPhone,
  LuSmartphone,
  LuTrash,
  LuUser,
} from "react-icons/lu";
import {
  Body,
  Breadcrumb,
  BreadcrumbItemProps,
  BreadcrumbItemType,
  CancelButton,
  H3,
  InputFloatingLabel,
  SaveButton,
} from "st-peter-ui";
import { PlanholderHamburgerModules } from "./components/planholder-hamburger-modules";
import { PlanholderInfoCard } from "./components/planholder-info";
import {
  AddressCard,
  PlanholderAddressCard,
} from "./components/planholder-address";
import InfoItem from "@/components/common/info-item/info-item";
import { ProgressCard } from "../planholders/cards/pending-request-card";
import { PhListOfPlans } from "./components/ph-list-of-plans";
import { PhListOfPlansMobile } from "./components/ph-list-of-plans-mobile";
import { useState } from "react";
import LookUp from "@/components/common/reusable-lookup/dynamic-lookup";
import { PlanholderLookup } from "@/components/common/planholder-lookup/planholder-lookup";
import { useRouter } from "next/navigation";
import { planholderLookup } from "@/app/plan-management/data/planholder-lookup";
import RequestHistoryDrawer from "./components/drawers/request-history-drawer";

export interface PlanholderInfoType {
  personId: string;
  lastName: string | null;
  firstName: string | null;
  middleName: string | null;
  suffix?: string | undefined;
  nationality: string | null;
  naturalizationDate: Date | null;
  dateOfBirth: Date | null;
  placeOfBirth: string | null;
  gender: string | null;
  civilStatus: string | null;
  height: string | null;
  weight: number | null;
  employerName: string | null;
  employmentStatus: string | null;
  tin: string | null;
  securityNo: string | null;
  sourceOfFund: string | null;
}

export interface PlanholderAddressType {
  personId: string;
  addressType: string;
  addressNo: string | null;
  street: string | null;
  barangay: string | null;
  district: string | null;
  city: string;
  province: string;
  zipCode: number | null;
}

export interface PlanholderContactType {
  personId: string;
  value: string;
  type: "Email" | "MobileNo" | "LandlineNo";
}

export interface PlanDetailType {
  lpaNumber: string;
  planDescription: string;
  mode: string;
  term: number;
  planClass: string;
  accountClass: string;
  planCode: string;
  contractPrice: number;
  installmentAmount: number;
  totalAmountPayable: number;
  effectivityDate: Date;
  newEffectivityDate: Date;
  branch: string;
  cfpNumber?: string | null;
  cfpDate?: Date | null;
  isServiceOnly: boolean;
  isInsured: boolean;
  accountStatus: string;
  terminationStatus: string;
  salesAgent1: string;
  salesAgent2: string;
  beneficiaries: PhBeneficiaryType[];
  statementOfAccount: PhStatementOfAccountType;
}

export interface PhBeneficiaryType {
  lpaNumber: string;
  name: string;
  relationship: string;
  dateOfBirth: Date;
  contactNumber: string;
  type: "principal" | "contingent";
}

export interface PhStatementOfAccountType {
  lpaNumber: string;
  dueDate: Date;
  term: number;
  mode: string;
  installmentNumber: number;
  installmentAmount: number;
  totalAmountPayable: number;
  totalPayments: number;
  balance: number;
  terminationValue: number;
  paymentRecords: PhPaymentType[];
}

export interface PhPaymentType {
  lpaNumber: string;
  payClass: string;
  siNumber: string;
  siDate: Date;
  siAmount: number;
  planCode: string;
  installmentNumber: number;
  nextDueDate: Date;
  cvNumber: string;
  pcvNumber: string;
  auditDate: Date;
}

export interface PlanholderProfileProps {
  breadcrumbItems: BreadcrumbItemType[];
  personId?: string | null;
  plans?: PlanDetailType[] | null;
  planholderInfo?: PlanholderInfoType | null;
  planholderAddress?: PlanholderAddressType[] | null;
  planholderContact?: PlanholderContactType[] | null;
}

/* ======================= COMPONENT ======================= */

export function PlanholderProfilePage({
  props,
}: {
  props: PlanholderProfileProps;
}) {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;

  const [historyOpen, setHistoryOpen] = useState(false);

  /* ---------- PRECOMPUTED DATA (FAST) ---------- */

  const contacts = {
    Email: props.planholderContact?.filter((c) => c.type === "Email"),
    MobileNo: props.planholderContact?.filter((c) => c.type === "MobileNo"),
    LandlineNo: props.planholderContact?.filter((c) => c.type === "LandlineNo"),
  };

  const addresses = {
    residence: props.planholderAddress?.filter(
      (a) => a.addressType === "RESIDENCE",
    ),
    office: props.planholderAddress?.filter((a) => a.addressType === "OFFICE"),
  };

  const formatDate = (date?: Date | null) =>
    date ? date.toISOString().slice(0, 10) : "1900-01-01";

  const mapAddress = (a: any) => ({
    id: a.personId,
    addressType: a.addressType,
    addressNo: a.addressNo ?? "",
    street: a.street ?? "",
    barangay: a.barangay ? `BARANGAY ${a.barangay}` : "",
    district: a.district ? `DISTRICT ${a.district}` : "",
    city: a.city,
    province: a.province,
    zipCode: a.zipCode?.toString() ?? "",
  });

  /* ======================= INTERNAL UI BLOCKS ======================= */

  const PendingRequestCard = () => {
    const content = (
      <Flex flexDir="column">
        <Carousel.Root slideCount={2} maxW="full">
          <Carousel.Control justifyContent="center" gap={2} w="full">
            {!isMobile && (
              <Carousel.PrevTrigger asChild>
                <IconButton size="2xs" variant="outline">
                  <LuArrowLeft />
                </IconButton>
              </Carousel.PrevTrigger>
            )}

            <Carousel.ItemGroup w="full">
              <Carousel.Item index={0} minW={0}>
                <ProgressCard
                  current={3}
                  total={7}
                  title="Reinstatement Application"
                  description="Waiting for approval."
                  transactionId="RI-202-6311"
                  onClick={() =>
                    (window.location.href = "/transaction/CA-202-6311")
                  }
                />
              </Carousel.Item>

              <Carousel.Item index={1} minW={0}>
                <ProgressCard
                  current={2}
                  total={3}
                  title="Transfer of Rights Application"
                  description="Waiting for approval."
                  transactionId="TR-202-6309"
                  onClick={() =>
                    (window.location.href = "/transaction/TR-202-6311")
                  }
                />
              </Carousel.Item>
            </Carousel.ItemGroup>

            {!isMobile && (
              <Carousel.NextTrigger asChild>
                <IconButton size={{ base: "2xs", md: "xs" }} variant="outline">
                  <LuArrowRight />
                </IconButton>
              </Carousel.NextTrigger>
            )}
          </Carousel.Control>

          <Carousel.Indicators
            transition="width 0.2s ease-in-out"
            transformOrigin="center"
            opacity="0.5"
            boxSize="2"
            _current={{
              width: "10",
              bg: "colorPalette.subtle",
              opacity: 1,
            }}
          />
        </Carousel.Root>
      </Flex>
    );
    return (
      <Box my={5} p={5} boxShadow="sm" borderRadius="md">
        <Flex justify="space-between" align="center">
          <Strong fontSize="md" color="var(--chakra-colors-primary)">
            Pending Request{" "}
            <Badge bg={"red.500"} color={"white"}>
              2
            </Badge>
          </Strong>
          <IconButton
            aria-label="View request history"
            size="xs"
            variant="ghost"
            color="var(--chakra-colors-primary)"
            onClick={() => setHistoryOpen(true)}
          >
            <LuHistory />
          </IconButton>
        </Flex>
        <RequestHistoryDrawer
          open={historyOpen}
          onOpenChange={setHistoryOpen}
        />
        <Separator my={2} />
        {content}
      </Box>
    );
  };

  const ContactRow = ({
    icon,
    values,
  }: {
    icon: React.ReactNode;
    values: any[];
  }) => (
    <Flex align="center" mt={2} gap={3}>
      <Box color="#747474">{icon}</Box>

      {values.length ? (
        values.map((v, i) => (
          <Body key={i} color="gray.600">
            {v.value}
          </Body>
        ))
      ) : (
        <Body color="gray.600">—</Body>
      )}
    </Flex>
  );

  function EditPlanholderInfoButton(props: {
    planholderInfo: PlanholderInfoType | null;
    planholderAddress: PlanholderAddressType[] | null;
    planholderContact: PlanholderContactType[] | null;
  }) {
    const addresses = {
      residence: props.planholderAddress?.filter(
        (a) => a.addressType === "RESIDENCE",
      ),
      office: props.planholderAddress?.filter(
        (a) => a.addressType === "OFFICE",
      ),
    };

    const formatDate = (date?: Date | null) =>
      date ? date.toISOString().slice(0, 10) : "1900-01-01";

    const mapAddress = (a: any) => ({
      id: a.personId,
      addressType: a.addressType,
      addressNo: a.addressNo ?? "",
      street: a.street ?? "",
      barangay: a.barangay ? `BARANGAY ${a.barangay}` : "",
      district: a.district ? `DISTRICT ${a.district}` : "",
      city: a.city,
      province: a.province,
      zipCode: a.zipCode?.toString() ?? "",
    });

    return (
      <Dialog.Root size={isMobile ? "full" : "xl"}>
        <Dialog.Trigger asChild>
          <Button>
            <LuPencil /> Edit
          </Button>
        </Dialog.Trigger>

        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Edit Planholder Information</Dialog.Title>
              </Dialog.Header>

              <Separator />

              <Dialog.Body p={5}>
                <Tabs.Root
                  variant="subtle"
                  defaultValue="personal"
                  orientation="vertical"
                >
                  <Tabs.List>
                    <Tabs.Trigger value="personal">Personal</Tabs.Trigger>
                    <Tabs.Trigger value="address">Address</Tabs.Trigger>
                    <Tabs.Trigger value="contact">Contact</Tabs.Trigger>
                    <Tabs.Trigger value="employment">Employment</Tabs.Trigger>
                  </Tabs.List>

                  <Separator orientation="vertical" mx={2} />

                  {/* PERSONAL */}
                  <Tabs.Content value="personal" w={"full"}>
                    <Strong fontSize={"md"}>Personal Information</Strong>
                    <Grid
                      gapX={3}
                      templateColumns={{
                        base: "1fr",
                        lg: "repeat(3, 1fr)",
                      }}
                    >
                      <InputFloatingLabel
                        label={"First Name"}
                        value={props.planholderInfo?.firstName ?? ""}
                      />
                      <InputFloatingLabel
                        label={"Middle Name"}
                        value={props.planholderInfo?.middleName ?? ""}
                      />
                      <InputFloatingLabel
                        label={"Last Name"}
                        value={props.planholderInfo?.lastName ?? ""}
                      />
                      <InputFloatingLabel
                        label={"Nationality"}
                        value={props.planholderInfo?.nationality ?? ""}
                      />
                      <InputFloatingLabel
                        label={"Naturalization Date"}
                        type="date"
                        value={
                          props.planholderInfo?.naturalizationDate
                            ? `${props.planholderInfo.naturalizationDate.getFullYear()}-${String(props.planholderInfo.naturalizationDate.getMonth() + 1).padStart(2, "0")}-${String(props.planholderInfo.naturalizationDate.getDate()).padStart(2, "0")}`
                            : "1900-01-01"
                        }
                      />
                      <InputFloatingLabel
                        label={"Date of Birth"}
                        type="date"
                        value={
                          props.planholderInfo?.dateOfBirth
                            ? `${props.planholderInfo.dateOfBirth.getFullYear()}-${String(props.planholderInfo.dateOfBirth.getMonth() + 1).padStart(2, "0")}-${String(props.planholderInfo.dateOfBirth.getDate()).padStart(2, "0")}`
                            : "1900-01-01"
                        }
                      />
                      <InputFloatingLabel
                        label={"Place of Birth"}
                        value={props.planholderInfo?.placeOfBirth ?? ""}
                      />
                      <InputFloatingLabel
                        label={"Gender"}
                        value={props.planholderInfo?.gender ?? ""}
                      />
                      <InputFloatingLabel
                        label={"Civil Status"}
                        value={props.planholderInfo?.civilStatus ?? ""}
                      />
                      <InputFloatingLabel
                        label={"Height"}
                        value={props.planholderInfo?.height ?? ""}
                      />
                      <InputFloatingLabel
                        label={"Weight"}
                        value={
                          props.planholderInfo?.weight?.toLocaleString() ?? ""
                        }
                      />
                    </Grid>
                  </Tabs.Content>

                  {/* ADDRESS */}
                  <Tabs.Content value="address" w={"full"}>
                    <Strong>Address Information</Strong>

                    <Grid
                      gapX={3}
                      templateColumns={{
                        base: "1fr",
                        lg: "repeat(2, 1fr)",
                      }}
                    >
                      <InputFloatingLabel
                        label={"Lot Number"}
                        value={addresses?.residence?.[0]?.addressNo ?? ""}
                      />
                      <InputFloatingLabel
                        label={"Street"}
                        value={addresses?.residence?.[0]?.street ?? ""}
                      />
                      <InputFloatingLabel
                        label={"Barangay"}
                        value={addresses?.residence?.[0]?.barangay ?? ""}
                      />
                      <InputFloatingLabel
                        label={"District"}
                        value={addresses?.residence?.[0]?.district ?? ""}
                      />
                      <InputFloatingLabel
                        label={"City"}
                        value={addresses?.residence?.[0]?.city ?? ""}
                      />
                      <InputFloatingLabel
                        label={"Province"}
                        value={addresses?.residence?.[0]?.province ?? ""}
                      />
                      <InputFloatingLabel
                        label={"Zip Code"}
                        type="number"
                        value={
                          addresses?.residence?.[0]?.zipCode?.toString() ?? ""
                        }
                      />
                    </Grid>
                  </Tabs.Content>
                  <Tabs.Content value="contact" w={"full"}>
                    <Strong>Contact Information</Strong>

                    <Flex direction="column">
                      <InputFloatingLabel
                        label={"Email Address"}
                        value={
                          props.planholderContact?.find(
                            (c) => c.type === "Email",
                          )?.value
                        }
                        required
                      />
                      <InputFloatingLabel
                        label={"Mobile Number"}
                        value={
                          props.planholderContact?.find(
                            (c) => c.type === "MobileNo",
                          )?.value
                        }
                        required
                      />
                      <InputFloatingLabel
                        label={"Landline (Optional)"}
                        value={
                          props.planholderContact?.find(
                            (c) => c.type === "LandlineNo",
                          )?.value
                        }
                      />
                    </Flex>
                  </Tabs.Content>
                  <Tabs.Content value="employment" w={"full"}>
                    <Strong>Employment Information</Strong>
                    <Grid
                      gapX={3}
                      templateColumns={{
                        base: "1fr",
                        lg: "repeat(2, 1fr)",
                      }}
                    >
                      <InputFloatingLabel
                        label={"Employer"}
                        value={props.planholderInfo?.employerName ?? ""}
                      />
                      <InputFloatingLabel
                        label={"TIN"}
                        value={props.planholderInfo?.tin ?? ""}
                      />
                      <InputFloatingLabel
                        label={"SSS/GSIS Number"}
                        value={props.planholderInfo?.securityNo ?? ""}
                      />
                      <InputFloatingLabel
                        label={"Source of Fund if Not Employed"}
                        value={props.planholderInfo?.sourceOfFund ?? ""}
                      />
                    </Grid>
                  </Tabs.Content>
                </Tabs.Root>
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <CancelButton />
                </Dialog.ActionTrigger>
                <SaveButton />
              </Dialog.Footer>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    );
  }

  const router = useRouter();
  /* ======================= RENDER ======================= */

  return (
    <Box mx={isMobile ? 0 : 5}>
      {!isMobile && <Breadcrumb items={props.breadcrumbItems} />}

      {/* HEADER */}
      <Flex justify="space-between" align="center">
        <Box textAlign="start" mt={4}>
          <H3>Planholder Information</H3>
          <Body mt={2}>Clear Access to Every Planholder Detail.</Body>
        </Box>

        {!isMobile && (
          <Flex gap={3}>
            <PlanholderLookup
              onSelectChange={(e) =>
                router.push(`/plan-management/planholder/${e?.lpaNumber}`)
              }
            />
            {props.personId && (
              <>
                <PlanholderHamburgerModules
                  personId={props.personId ?? ""}
                  actions={
                    <>
                      <EditPlanholderInfoButton
                        planholderInfo={props.planholderInfo ?? null}
                        planholderAddress={props.planholderAddress ?? null}
                        planholderContact={props.planholderContact ?? null}
                      />
                      <Button bg="red.500" color="white">
                        <LuTrash /> Delete
                      </Button>
                    </>
                  }
                />
              </>
            )}
          </Flex>
        )}
      </Flex>

      {isMobile && (
        <Box mt={4}>
          <PlanholderLookup
            value={
              planholderLookup.find(
                (p) => p.lpaNumber === props?.plans?.[0].lpaNumber,
              ) ?? undefined
            }
            onSelectChange={(e) =>
              router.push(`/plan-management/planholder/${e?.lpaNumber}`)
            }
          />
        </Box>
      )}

      {isMobile && props.personId && (
        <Grid templateColumns={"repeat(3, 1fr)"} gap={2} mt={4}>
          <Show when={props.personId}>
            <PlanholderHamburgerModules personId={props.personId ?? ""} />
            <EditPlanholderInfoButton
              planholderInfo={props.planholderInfo ?? null}
              planholderAddress={props.planholderAddress ?? null}
              planholderContact={props.planholderContact ?? null}
            />
            <Button bg="red.500" color="white">
              <LuTrash /> Delete
            </Button>
          </Show>
        </Grid>
      )}

      {/* MAIN GRID */}
      <Grid gap={6} templateColumns={{ base: "1fr", lg: "2fr 1fr" }}>
        <GridItem>
          {isMobile && props.personId && <PendingRequestCard />}
          <PlanholderInfoCard planholder={props.planholderInfo ?? null} />

          <PlanholderAddressCard phAddress={props.planholderAddress ?? []} />
        </GridItem>

        <GridItem>
          {!isMobile && props.personId && <PendingRequestCard />}

          {/* CONTACT */}
          <Box p={5} boxShadow="sm" borderRadius="md">
            <Strong color="var(--chakra-colors-primary)">
              Contact Information
            </Strong>

            <Separator my={2} />

            <ContactRow
              icon={<LuMail size={24} />}
              values={contacts?.Email ?? []}
            />
            <ContactRow
              icon={<LuSmartphone size={24} />}
              values={contacts?.MobileNo ?? []}
            />
            <ContactRow
              icon={<LuPhone size={24} />}
              values={contacts?.LandlineNo ?? []}
            />
          </Box>

          {/* EMPLOYMENT */}
          <Box mt={5} p={5} boxShadow="sm" borderRadius="md">
            <Strong color="var(--chakra-colors-primary)">
              Employment Information
            </Strong>

            <Separator my={2} />

            <Flex direction="column" gap={5} mt={5}>
              <InfoItem
                label="Employer"
                value={props.planholderInfo?.employerName ?? "—"}
              />

              <InfoItem label="TIN" value={props.planholderInfo?.tin ?? "—"} />
              <InfoItem
                label="SSS/GSIS Number"
                value={props.planholderInfo?.securityNo ?? "—"}
              />
              <InfoItem
                label="Source of Fund if Not Employed"
                value={props.planholderInfo?.sourceOfFund ?? "—"}
              />
            </Flex>
          </Box>
        </GridItem>

        {/* PLANS */}
        {props.plans && props.plans?.length > 0 && (
          <GridItem colSpan={{ base: 1, lg: 2 }} minW={0}>
            {isMobile ? (
              <PhListOfPlansMobile plans={props.plans} />
            ) : (
              <PhListOfPlans plans={props.plans} />
            )}
          </GridItem>
        )}
      </Grid>
    </Box>
  );
}
