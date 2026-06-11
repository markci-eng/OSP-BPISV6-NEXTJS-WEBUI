"use client";

import {
  Badge,
  Box,
  CloseButton,
  Dialog,
  Flex,
  HStack,
  Icon,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CancelButton, ConfirmButton, H3 } from "st-peter-ui";
import { FaRegAddressCard } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import { RowItem } from "@/claude components/info-card/row-item";
import { CartItem } from "../cartItem";
import { ITransactionData } from "../planholder";
import { checkboxList } from "../checkBoxList";
import { InfoCardAccordion } from "../info-card-accordion";

export type ConfirmationProps = {
  onAllAcceptedChange?: (allAccepted: boolean) => void;
  onEdit?: (section?: string) => void;
};

const modeLabel = (mode?: string) => {
  switch (mode) {
    case "M":
      return "Monthly";
    case "Q":
      return "Quarterly";
    case "S":
      return "Semi-Annual";
    case "A":
      return "Annual";
    case "C":
      return "Cash";
    default:
      return mode || "-";
  }
};

type TabItem = {
  icon: IconType;
  label: string;
  subtitle?: string;
  value: string;
  page: React.ReactNode;
};

const ApplicationAccordion = ({
  items,
  onEdit,
}: {
  items: TabItem[];
  onEdit?: (section?: string) => void;
}) => {
  return (
    <VStack align="stretch" gap={3}>
      {items.map((item, index) => (
        <InfoCardAccordion
          key={item.value}
          icon={<Icon as={item.icon} boxSize="18px" />}
          title={item.label}
          subtitle={item.subtitle}
          defaultOpen={index === 0}
          onEdit={() => onEdit?.(item.value)}
        >
          {item.page}
        </InfoCardAccordion>
      ))}
    </VStack>
  );
};

const ReviewRows = ({
  rows,
}: {
  rows: { label: string; value?: React.ReactNode }[];
}) => (
  <VStack align="stretch" gap={1}>
    {rows.map((row) => (
      <RowItem key={row.label} label={row.label} value={row.value} />
    ))}
  </VStack>
);

const Confirmation = ({ onAllAcceptedChange, onEdit }: ConfirmationProps) => {
  const [cartItems, setCartItems] = useState<CartItem[] | null>(null);
  const [lifePlanApplication, setLifePlanApplication] =
    useState<ITransactionData | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [pendingCheck, setPendingCheck] = useState<number | null>(null);
  const [acceptedAgreements, setAcceptedAgreements] = useState<boolean[]>(() =>
    checkboxList.map(() => false),
  );

  useEffect(() => {
    const loadStoredData = () => {
      try {
        const checkoutStored = sessionStorage.getItem("CheckoutCart");
        const cartStored = sessionStorage.getItem("Cart");
        const lifePlanApplicationStored = localStorage.getItem(
          "LifePlanApplication",
        );

        const parsedApplicationData = lifePlanApplicationStored
          ? (JSON.parse(lifePlanApplicationStored) as ITransactionData)
          : null;

        setLifePlanApplication(parsedApplicationData);

        if (checkoutStored) {
          const parsedCheckout = JSON.parse(checkoutStored);
          setCartItems(
            Array.isArray(parsedCheckout) ? parsedCheckout : [parsedCheckout],
          );
          return;
        }

        if (cartStored) {
          const parsedCart = JSON.parse(cartStored);
          setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
        } else {
          setCartItems([]);
        }
      } catch (e) {
        console.error("Failed to read Cart from sessionStorage", e);
        setCartItems([]);
      }
    };

    const timeoutId = window.setTimeout(loadStoredData, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const selectedPlan = cartItems && cartItems.length > 0 ? cartItems[0] : null;

  const acceptedCount = acceptedAgreements.filter(Boolean).length;
  const allAccepted =
    checkboxList.length > 0 && acceptedCount === checkboxList.length;

  const pendingAgreement =
    pendingCheck !== null ? checkboxList[pendingCheck] : null;

  useEffect(() => {
    onAllAcceptedChange?.(allAccepted);
  }, [allAccepted, onAllAcceptedChange]);

  const beneficiaries = [
    {
      name: "John Doe",
      relationship: "Relative",
      dob: "1990-11-02",
      address: "Sample Street, Sample Barangay, Sample City",
    },
    {
      name: "Jane Smith",
      relationship: "Relative",
      dob: "1992-04-15",
      address: "Sample Avenue, Sample District, Sample City",
    },
  ];

  const confirmAgreement = () => {
    if (pendingCheck === null) return;
    setAcceptedAgreements((prev) => {
      const copy = [...prev];
      copy[pendingCheck] = true;
      return copy;
    });
    setOpenDialog(false);
    setPendingCheck(null);
  };

  return (
    <Box minH="100vh">
      <Box px={{ base: 0, md: 8 }} pb={{ base: 4, md: 8 }}>
        <VStack align="stretch" gap={3}>
          <InfoCardAccordion
            icon={<Icon as={IoIosInformationCircleOutline} boxSize="18px" />}
            title="Order Summary"
            subtitle={modeLabel(selectedPlan?.mode)}
            defaultOpen
          >
            <ReviewRows
              rows={[
                {
                  label: "Selected Plan",
                  value: selectedPlan?.planDesc,
                },
                {
                  label: "Quantity",
                  value: selectedPlan?.quantity,
                },
                {
                  label: "Total Amount Payable",
                  value: selectedPlan
                    ? `\u20b1 ${selectedPlan.total}`
                    : undefined,
                },
              ]}
            />
          </InfoCardAccordion>

          <ApplicationAccordion
            onEdit={onEdit}
            items={[
              {
                icon: FaRegUser,
                label: "Personal Info",
                subtitle: "Identification and full name",
                value: "personal",
                page: (
                  <ReviewRows
                    rows={[
                      {
                        label: "Uploaded ID",
                        value: lifePlanApplication?.personalInfo.idType,
                      },
                      {
                        label: "Last Name",
                        value: lifePlanApplication?.personalInfo.lastName,
                      },
                      {
                        label: "First Name",
                        value: lifePlanApplication?.personalInfo.firstName,
                      },
                      {
                        label: "Middle Name",
                        value: lifePlanApplication?.personalInfo.middleName,
                      },
                      {
                        label: "Suffix",
                        value: lifePlanApplication?.personalInfo.suffix,
                      },
                      {
                        label: "Date of Birth",
                        value: lifePlanApplication?.personalInfo.birthDate,
                      },
                      {
                        label: "Gender",
                        value: lifePlanApplication?.personalInfo.gender,
                      },
                      {
                        label: "Contact Number",
                        value: lifePlanApplication?.personalInfo.mobileNumber,
                      },
                      {
                        label: "Email",
                        value: lifePlanApplication?.personalInfo.emailAddress,
                      },
                      {
                        label: "Landline Number",
                        value: lifePlanApplication?.personalInfo.landLineNumber,
                      },
                      {
                        label: "Mailing Address",
                        value: lifePlanApplication?.personalInfo.mailingAddress,
                      },
                      {
                        label: "Civil Status",
                        value: lifePlanApplication?.personalInfo.civilStatus,
                      },
                    ]}
                  />
                ),
              },
              {
                icon: FaRegAddressCard,
                label: "Address",
                subtitle: "Where you currently live",
                value: "address",
                page: (
                  <ReviewRows
                    rows={[
                      {
                        label: "Lot #",
                        value: lifePlanApplication?.address.lot,
                      },
                      {
                        label: "Street",
                        value: lifePlanApplication?.address.street,
                      },
                      {
                        label: "Barangay",
                        value: lifePlanApplication?.address.barangay,
                      },
                      {
                        label: "City",
                        value: lifePlanApplication?.address.city,
                      },
                      {
                        label: "Province",
                        value: lifePlanApplication?.address.province,
                      },
                    ]}
                  />
                ),
              },
              {
                icon: IoIosInformationCircleOutline,
                label: "Employment",
                subtitle: "Work and income details",
                value: "employment",
                page: (
                  <ReviewRows
                    rows={[
                      {
                        label: "Occupation",
                        value: lifePlanApplication?.employment.occupation,
                      },
                      {
                        label: "Employer Name",
                        value: lifePlanApplication?.employment.employerName,
                      },
                      {
                        label: "Employment Status",
                        value: lifePlanApplication?.employment.employmentStatus,
                      },
                      {
                        label: "Office Address",
                        value: lifePlanApplication?.employment.officeAddress,
                      },
                      {
                        label: "TIN",
                        value: lifePlanApplication?.employment.TIN,
                      },
                      {
                        label: "SSS/GSIS",
                        value: lifePlanApplication?.employment.SSS,
                      },
                      {
                        label: "Source of Income",
                        value: lifePlanApplication?.employment.sourceOfIncome,
                      },
                    ]}
                  />
                ),
              },
            ]}
          />

          <InfoCardAccordion
            icon={<Icon as={FaRegUser} boxSize="18px" />}
            title="Beneficiaries"
            subtitle={`${beneficiaries.length} listed`}
          >
            <VStack align="stretch" gap={4}>
              {beneficiaries.map((beneficiary, index) => (
                <Box key={`${beneficiary.name}-${index}`}>
                  <Text fontWeight="semibold" fontSize="sm" mb={1}>
                    {beneficiary.name}
                  </Text>
                  <ReviewRows
                    rows={[
                      {
                        label: "Relationship",
                        value: beneficiary.relationship,
                      },
                      {
                        label: "Date of Birth",
                        value: beneficiary.dob,
                      },
                      {
                        label: "Address",
                        value: beneficiary.address,
                      },
                    ]}
                  />
                </Box>
              ))}
            </VStack>
          </InfoCardAccordion>

          <InfoCardAccordion
            icon={<Icon as={IoIosInformationCircleOutline} boxSize="18px" />}
            title="Agreements"
            subtitle={`${acceptedCount}/${checkboxList.length} accepted`}
          >
            <VStack align="stretch" gap={3}>
              {checkboxList.map((item, index) => {
                const isAccepted = acceptedAgreements[index];

                return (
                  <Box
                    key={index}
                    role="button"
                    tabIndex={0}
                    p={4}
                    borderWidth="1px"
                    rounded="xl"
                    bg={isAccepted ? "green.50" : "gray.50"}
                    transition="all 0.15s ease"
                    _hover={{ bg: isAccepted ? "green.100" : "gray.100" }}
                    onClick={() => {
                      setPendingCheck(index);
                      setOpenDialog(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setPendingCheck(index);
                        setOpenDialog(true);
                      }
                    }}
                  >
                    <Flex justify="space-between" align="start" gap={4}>
                      <Box flex="1" minW={0}>
                        <Text fontWeight="semibold" lineClamp={2}>
                          {item.checkBoxTitle}.
                        </Text>

                        <Text
                          fontSize="sm"
                          color="gray.600"
                          mt={1}
                          lineClamp={1}
                        >
                          Tap to review details.
                        </Text>
                      </Box>

                      <Badge
                        variant="subtle"
                        colorPalette={isAccepted ? "green" : "gray"}
                      >
                        {isAccepted ? "Accepted" : "Review"}
                      </Badge>
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          </InfoCardAccordion>

          <Dialog.Root
            open={openDialog}
            onOpenChange={(details) => setOpenDialog(details.open)}
            size={{ mdDown: "full", md: "xl" }}
            scrollBehavior="inside"
          >
            <Portal>
              <Dialog.Backdrop backdropFilter="blur(6px)" />
              <Dialog.Positioner>
                <Dialog.Content
                  bg="white"
                  rounded="xl"
                  shadow="lg"
                  overflow="hidden"
                >
                  <Dialog.CloseTrigger asChild>
                    <CloseButton position="absolute" top={3} right={3} />
                  </Dialog.CloseTrigger>

                  <Dialog.Header
                    px={{ base: 4, md: 6 }}
                    pt={{ base: 5, md: 6 }}
                  >
                    <H3>
                      {pendingCheck !== null
                        ? pendingAgreement?.title || "Agreement"
                        : "Agreement"}
                    </H3>
                    <Text fontSize="sm" color="gray.600" mt={2}>
                      Please read carefully. Confirm to accept this agreement.
                    </Text>
                  </Dialog.Header>

                  <Dialog.Body px={{ base: 4, md: 6 }} pb={{ base: 5, md: 6 }}>
                    <Box p={4} borderWidth="0px" rounded="lg" bg="gray.50">
                      <Text
                        whiteSpace="pre-wrap"
                        fontSize="sm"
                        color="gray.800"
                      >
                        {pendingCheck !== null
                          ? pendingAgreement?.description ||
                            "Please review and confirm before proceeding."
                          : "Please review and confirm before proceeding."}
                      </Text>
                    </Box>
                  </Dialog.Body>

                  <Dialog.Footer
                    px={{ base: 4, md: 6 }}
                    pb={{ base: 5, md: 6 }}
                  >
                    <HStack justify="flex-end" gap={3} w="full">
                      <CancelButton
                        onClick={() => {
                          setOpenDialog(false);
                          setPendingCheck(null);
                        }}
                      />
                      <ConfirmButton onClick={confirmAgreement} />
                    </HStack>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        </VStack>
      </Box>
    </Box>
  );
};

export default Confirmation;
