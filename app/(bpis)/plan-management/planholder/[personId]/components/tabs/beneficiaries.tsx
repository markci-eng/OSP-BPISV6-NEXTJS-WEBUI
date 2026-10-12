import {
  Badge,
  Box,
  Flex,
  IconButton,
  Separator,
  Strong,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FaUser, FaTrash } from "react-icons/fa";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { IoMdPersonAdd } from "react-icons/io";
import { LuMapPin } from "react-icons/lu";
import { Small, BrandedAvatar, EmptyStateCard } from "osp-ui-kit";
import { AddressInfo, Beneficiary } from "@/types/plan-management.types";
import { computeAge } from "../planholder-info";
import { formatAddress } from "@/lib/format/address";
import {
  BeneficiaryFormModal,
  BeneficiaryFormValues,
} from "../beneficiary-form-modal";
import { addBeneficiary } from "../../api/beneficiary.api";
import { toBeneficiaryPayload } from "../../lib/beneficiary-payload";

export function Beneficiaries({
  lpaNo,
  beneficiaries,
  planholderAddress,
  columns = 1,
}: {
  /** The plan these beneficiaries are named on; adds are saved against it. */
  lpaNo: string;
  beneficiaries: Beneficiary[];
  planholderAddress?: AddressInfo | null;
  columns?: 1 | 2;
}) {
  const principalBeneficiaries = beneficiaries?.filter((b) => b.isPrincipal);
  const contingentBeneficiaries = beneficiaries?.filter((b) => !b.isPrincipal);

  return (
    <Box
      display={{ base: "flex", md: columns === 2 ? "grid" : "flex" }}
      flexDirection="column"
      gridTemplateColumns={{ md: columns === 2 ? "1fr 1fr" : undefined }}
      gap={4}
      alignItems="start"
    >
      <Box
        borderRadius="xl"
        borderWidth={1}
        borderColor="gray.100"
        bg="white"
        boxShadow="sm"
        p={4}
        w={{ base: "full", md: columns === 1 ? "full" : undefined }}
      >
        {/* Keyed by plan: each section copies its list into state, so a new
            plan needs a fresh section rather than the last plan's copy. */}
        <BeneficiarySection
          key={lpaNo}
          title="Principal Beneficiaries"
          subtitle="Receive benefits first"
          beneficiaries={principalBeneficiaries}
          beneficiaryClass="PRINCIPAL"
          emptyTitle="No Principal Beneficiaries"
          emptyDescription="No principal beneficiaries on record."
          addLabel="Add Principal Beneficiary"
          planholderAddress={planholderAddress}
          lpaNo={lpaNo}
        />
      </Box>

      <Box
        borderRadius="xl"
        borderWidth={1}
        borderColor="gray.100"
        bg="white"
        boxShadow="sm"
        p={4}
        w={{ base: "full", md: columns === 1 ? "full" : undefined }}
      >
        <BeneficiarySection
          key={lpaNo}
          title="Contingent Beneficiaries"
          subtitle="Receive benefits if principal is unavailable"
          beneficiaries={contingentBeneficiaries}
          beneficiaryClass="CONTINGENT"
          emptyTitle="No Contingent Beneficiaries"
          emptyDescription="No contingent beneficiaries on record."
          addLabel="Add Contingent Beneficiary"
          planholderAddress={planholderAddress}
          lpaNo={lpaNo}
        />
      </Box>
    </Box>
  );
}

function BeneficiarySection({
  title,
  subtitle,
  beneficiaries: initialBeneficiaries,
  beneficiaryClass,
  emptyTitle,
  emptyDescription,
  addLabel,
  planholderAddress,
  lpaNo,
}: {
  title: string;
  subtitle: string;
  beneficiaries: Beneficiary[];
  beneficiaryClass: "PRINCIPAL" | "CONTINGENT";
  emptyTitle: string;
  emptyDescription: string;
  addLabel: string;
  planholderAddress?: AddressInfo | null;
  lpaNo: string;
}) {
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] =
    useState<Beneficiary | null>(null);
  const [beneficiaries, setBeneficiaries] =
    useState<Beneficiary[]>(initialBeneficiaries);

  // Saved first, shown second: a beneficiary appears in the list only once
  // the API has taken them. A refusal rejects, which keeps the modal open
  // with the API's reason and the form as it was.
  const handleAdd = async (values: BeneficiaryFormValues) => {
    const isPrincipal = beneficiaryClass === "PRINCIPAL";
    const added = await addBeneficiary(
      toBeneficiaryPayload(values, { lpaNo, isPrincipal }),
    );
    // The plan as cached is now missing someone; let it be fetched afresh.
    void queryClient.invalidateQueries({
      queryKey: ["plan-management", "plan-info", lpaNo],
    });
    setBeneficiaries((prev) => [
      ...prev,
      {
        ...values,
        // The ids the API gave, when its answer carries them. Otherwise local
        // stand-ins, until the plan is next loaded.
        beneficiaryId: added.beneficiaryId ?? crypto.randomUUID(),
        personId: added.personId ?? values.personId ?? crypto.randomUUID(),
        avatarUrl: null,
        isPrincipal,
        address: {
          ...values.address,
          addressId: "",
          personId: "",
          isPrimary: true,
        },
      },
    ]);
  };

  const handleEdit = (values: BeneficiaryFormValues, original: Beneficiary) => {
    setBeneficiaries((prev) =>
      prev.map((b) =>
        b.beneficiaryId === original.beneficiaryId
          ? {
              ...original,
              ...values,
              personId: values.personId ?? original.personId,
              address: { ...original.address, ...values.address },
            }
          : b,
      ),
    );
  };

  const handleDelete = (beneficiaryId: string) => {
    setBeneficiaries((prev) =>
      prev.filter((b) => b.beneficiaryId !== beneficiaryId),
    );
  };

  return (
    <Box w="full">
      {/* Section header */}
      <Flex align="center" gap={3} mb={3}>
        <Box
          p={2}
          borderRadius="lg"
          bg="var(--chakra-colors-primary-disabled)/30"
          flexShrink={0}
        >
          <FaUser color="var(--chakra-colors-primary)" size={16} />
        </Box>
        <Box flex={1} minW={0}>
          <Flex align="center" gap={2}>
            <Strong fontSize="sm">{title}</Strong>
            {beneficiaries && beneficiaries.length > 0 && (
              <Badge
                size="sm"
                borderRadius="full"
                bg="red.500"
                color="white"
                px={2}
                border="none"
              >
                {beneficiaries.length}
              </Badge>
            )}
          </Flex>
          <Small color="gray.500">{subtitle}</Small>
        </Box>
      </Flex>

      <Separator mb={3} />

      {/* Empty state */}
      {beneficiaries && beneficiaries.length === 0 && (
        <EmptyStateCard title={emptyTitle} description={emptyDescription} />
      )}

      {/* Beneficiary cards */}
      <Flex direction="column" gap={2}>
        {beneficiaries &&
          beneficiaries.map((beneficiary) => (
            <Box
              key={beneficiary.beneficiaryId}
              w="full"
              borderRadius="xl"
              borderWidth={1}
              borderColor="gray.100"
              bg="white"
              boxShadow="sm"
              overflow="hidden"
            >
              <Flex align="center" gap={3} p={4}>
                <BrandedAvatar
                  name={beneficiary.firstName + " " + beneficiary.lastName}
                  imageUrl={beneficiary.avatarUrl ?? ""}
                  ringed
                />

                <Flex direction="column" gap={1} flex={1} minW={0}>
                  <Text
                    fontWeight="semibold"
                    fontSize="sm"
                    color="gray.800"
                    lineClamp={1}
                  >
                    {beneficiary.firstName}{" "}
                    {!beneficiary.middleName || beneficiary.middleName === "NA"
                      ? ""
                      : beneficiary.middleName
                          .split(" ")
                          .map((word) => word.charAt(0).toUpperCase())
                          .join(". ") + "."}
                    {beneficiary.lastName}
                  </Text>
                  <Flex align="center" gap={2} flexWrap="wrap">
                    <Box
                      px={2}
                      py="1px"
                      borderRadius="full"
                      bg="var(--chakra-colors-primary-disabled)/30"
                      color="var(--chakra-colors-primary)"
                      fontSize="xs"
                      fontWeight="medium"
                    >
                      {beneficiary.relationship}
                    </Box>
                    {beneficiary.dateOfBirth && (
                      <Text fontSize="xs" color="gray.400">
                        {computeAge(
                          new Date(beneficiary.dateOfBirth),
                          new Date(),
                          true,
                        )}
                      </Text>
                    )}
                  </Flex>
                  <Flex align="center" gap={1} mt="1px">
                    <LuMapPin size={11} color="var(--chakra-colors-gray-400)" />
                    <Text fontSize="xs" color="gray.400" lineClamp={1}>
                      {formatAddress(beneficiary.address)}
                    </Text>
                  </Flex>
                </Flex>

                <Flex align="center" gap={1} flexShrink={0}>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    aria-label="Edit beneficiary"
                    color="gray.500"
                    _hover={{ bg: "gray.100", color: "gray.700" }}
                    onClick={() => setEditingBeneficiary(beneficiary)}
                  >
                    <HiOutlinePencilAlt />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    aria-label="Delete beneficiary"
                    color="red.400"
                    _hover={{ bg: "red.50", color: "red.600" }}
                    onClick={() => handleDelete(beneficiary.beneficiaryId)}
                  >
                    <FaTrash />
                  </IconButton>
                </Flex>
              </Flex>
            </Box>
          ))}
      </Flex>

      {/* Add button */}
      <Flex
        mt={3}
        w="full"
        borderRadius="xl"
        border="1.5px dashed"
        borderColor="var(--chakra-colors-primary-disabled)"
        color="var(--chakra-colors-primary)"
        cursor="pointer"
        _hover={{ bg: "var(--chakra-colors-primary-disabled)/20" }}
        py={3}
        px={4}
        align="center"
        justify="center"
        gap={2}
        fontSize="sm"
        fontWeight="medium"
        transition="background 0.15s"
        onClick={() => setDrawerOpen(true)}
      >
        <IoMdPersonAdd />
        {addLabel}
      </Flex>

      <BeneficiaryFormModal
        open={drawerOpen || editingBeneficiary !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDrawerOpen(false);
            setEditingBeneficiary(null);
          }
        }}
        beneficiary={editingBeneficiary}
        planholderAddress={planholderAddress}
        onAdd={handleAdd}
        onEdit={handleEdit}
      />
    </Box>
  );
}
