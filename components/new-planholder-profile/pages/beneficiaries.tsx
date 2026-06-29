import {
  Avatar,
  Badge,
  Box,
  Flex,
  IconButton,
  Separator,
  Strong,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaUser, FaTrash } from "react-icons/fa";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { IoMdPersonAdd } from "react-icons/io";
import { LuMapPin } from "react-icons/lu";
import { Small } from "st-peter-ui";
import { EmptyState } from "../components/empty-state/empty-state";
import { AddBeneficiaryDrawer } from "../drawers/add-beneficiary-drawer";
import { EditBeneficiaryDrawer } from "../drawers/edit-beneficiary-drawer";

export interface BeneficiaryProps {
  personId: string;
  lpaNumber: string;
  beneficiaryClass: "PRINCIPAL" | "CONTINGENT";
  lastName: string;
  firstName: string;
  middleInitial: string;
  relationship: string;
  age: number;
  address: string;
}

export function Beneficiaries({
  beneficiaries,
  planholderAddress,
  columns = 1,
}: {
  beneficiaries: BeneficiaryProps[];
  planholderAddress?: string;
  columns?: 1 | 2;
}) {
  const principalBeneficiaries = beneficiaries?.filter(
    (b) => b.beneficiaryClass === "PRINCIPAL",
  );
  const contingentBeneficiaries = beneficiaries?.filter(
    (b) => b.beneficiaryClass === "CONTINGENT",
  );

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
        w={columns === 1 ? "full" : undefined}
      >
        <BeneficiarySection
          title="Principal Beneficiaries"
          subtitle="Receive benefits first"
          beneficiaries={principalBeneficiaries}
          beneficiaryClass="PRINCIPAL"
          emptyTitle="No Principal Beneficiaries"
          emptyDescription="No principal beneficiaries on record."
          addLabel="Add Principal Beneficiary"
          planholderAddress={planholderAddress}
        />
      </Box>

      <Box
        borderRadius="xl"
        borderWidth={1}
        borderColor="gray.100"
        bg="white"
        boxShadow="sm"
        p={4}
        w={columns === 1 ? "full" : undefined}
      >
        <BeneficiarySection
          title="Contingent Beneficiaries"
          subtitle="Receive benefits if principal is unavailable"
          beneficiaries={contingentBeneficiaries}
          beneficiaryClass="CONTINGENT"
          emptyTitle="No Contingent Beneficiaries"
          emptyDescription="No contingent beneficiaries on record."
          addLabel="Add Contingent Beneficiary"
          planholderAddress={planholderAddress}
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
}: {
  title: string;
  subtitle: string;
  beneficiaries: BeneficiaryProps[];
  beneficiaryClass: "PRINCIPAL" | "CONTINGENT";
  emptyTitle: string;
  emptyDescription: string;
  addLabel: string;
  planholderAddress?: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] =
    useState<BeneficiaryProps | null>(null);
  const [beneficiaries, setBeneficiaries] =
    useState<BeneficiaryProps[]>(initialBeneficiaries);

  const handleAdd = (
    data: Omit<BeneficiaryProps, "personId" | "lpaNumber">,
  ) => {
    setBeneficiaries((prev) => [
      ...prev,
      { ...data, personId: crypto.randomUUID(), lpaNumber: "" },
    ]);
  };

  const handleEdit = (updated: BeneficiaryProps) => {
    setBeneficiaries((prev) =>
      prev.map((b) => (b.personId === updated.personId ? updated : b)),
    );
  };

  const handleDelete = (personId: string) => {
    setBeneficiaries((prev) => prev.filter((b) => b.personId !== personId));
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
                bg="var(--chakra-colors-primary-disabled)/30"
                color="var(--chakra-colors-primary)"
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
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}

      {/* Beneficiary cards */}
      <Flex direction="column" gap={2}>
        {beneficiaries &&
          beneficiaries.map((beneficiary) => (
            <Box
              key={beneficiary.personId}
              w="full"
              borderRadius="xl"
              borderWidth={1}
              borderColor="gray.100"
              bg="white"
              boxShadow="sm"
              overflow="hidden"
            >
              <Flex align="center" gap={3} p={4}>
                <Avatar.Root
                  size="md"
                  bg="var(--chakra-colors-primary-disabled)/30"
                  display={{ base: "none", md: "flex" }}
                  flexShrink={0}
                >
                  <Avatar.Fallback
                    color="var(--chakra-colors-primary)"
                    fontWeight="semibold"
                    name={`${beneficiary.firstName} ${beneficiary.lastName}`}
                  />
                </Avatar.Root>

                <Flex direction="column" gap={1} flex={1} minW={0}>
                  <Text
                    fontWeight="semibold"
                    fontSize="sm"
                    color="gray.800"
                    lineClamp={1}
                  >
                    {beneficiary.firstName} {beneficiary.middleInitial}.{" "}
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
                    <Text fontSize="xs" color="gray.400">
                      {beneficiary.age} yrs old
                    </Text>
                  </Flex>
                  <Flex align="center" gap={1} mt="1px">
                    <LuMapPin size={11} color="var(--chakra-colors-gray-400)" />
                    <Text fontSize="xs" color="gray.400" lineClamp={1}>
                      {beneficiary.address}
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
                    onClick={() => handleDelete(beneficiary.personId)}
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

      <AddBeneficiaryDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        beneficiaryClass={beneficiaryClass}
        planholderAddress={planholderAddress}
        onAdd={handleAdd}
      />
      <EditBeneficiaryDrawer
        open={editingBeneficiary !== null}
        onOpenChange={(open) => { if (!open) setEditingBeneficiary(null); }}
        beneficiary={editingBeneficiary}
        planholderAddress={planholderAddress}
        onEdit={handleEdit}
      />
    </Box>
  );
}
