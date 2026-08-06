"use client";

import { SearchPlanholderDialog } from "@/components/common/planholder-lookup/search-planholder-dialog";
import {
  EmptyState,
  Flex,
  Skeleton,
  SimpleGrid,
  VStack,
  Box as ChakraBox,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { LuCheck, LuShoppingCart } from "react-icons/lu";
import { Body, Box, DynamicButton, H3 } from "st-peter-ui";
import { depositColumns } from "../payment/data/paymentDetails";
import { useDepositList } from "../payment/hooks/useDepositList";
import { DataTable, ErrorStateCard, InfoItem } from "osp-ui-kit";

export default function StlApproval() {
  const [selectedRemittance, setSelectedRemittance] = useState<any>(null);
  const { data: depositHDR, isLoading, error, refetch } = useDepositList();

  return (
    <Box mx="auto" p={{ base: 0, md: 4 }}>
      {/* Header */}
      <Box mb={8}>
        <H3>Sales Team Leader Approval</H3>
        <Body>Approve all the branch transaction</Body>
      </Box>

      {/* Search */}
      <Box p={4} bg="white" boxShadow="sm" borderRadius="lg" my={4}>
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ md: "center" }}
          justify="end"
          gap={3}
        >
          <SearchPlanholderDialog />
        </Flex>
      </Box>

      {/* Remittance Table */}
      <Box p={4} bg="white" boxShadow="sm" borderRadius="lg" my={4}>
        {isLoading ? (
          <ChakraBox display="flex" flexDirection="column" gap={2}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} h="40px" borderRadius="md" />
            ))}
          </ChakraBox>
        ) : error ? (
          <ErrorStateCard onRetry={refetch} />
        ) : (
          <DataTable
            columns={depositColumns}
            data={depositHDR}
            title="Remittance For Approval"
            // 👇 If your table supports row click
            onRowClick={(row: any) => {
              setSelectedRemittance(row);
            }}
            features={{
              sorting: true,
              filtering: true,
              search: true,
              selection: false,
              columnToggle: true,
            }}
          />
        )}
      </Box>

      {/* Details Section */}
      <Box p={4} bg="white" boxShadow="sm" borderRadius="lg" my={4}>
        {!selectedRemittance ? (
          /* EMPTY STATE */
          <EmptyState.Root w="full">
            <EmptyState.Content>
              <EmptyState.Indicator>
                <LuShoppingCart />
              </EmptyState.Indicator>
              <VStack textAlign="center">
                <EmptyState.Title>No Remittance Selected</EmptyState.Title>
                <EmptyState.Description>
                  Select a remittance above to approve
                </EmptyState.Description>
              </VStack>
            </EmptyState.Content>
          </EmptyState.Root>
        ) : (
          /* CONTENT */
          <>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
              <InfoItem
                label="Deposit Date Time"
                value={selectedRemittance.DepositDateTime ?? ""}
              />
              <InfoItem
                label="DRS Reference No"
                value={selectedRemittance.name}
              />
              <InfoItem
                label="Account No"
                value={selectedRemittance.AccountNo ?? ""}
              />
              <InfoItem
                label="Bank Branch"
                value={selectedRemittance.BankBranch ?? ""}
              />
              <InfoItem
                label="Bank Code"
                value={selectedRemittance.BankCode ?? ""}
              />
              <InfoItem
                label="Amount"
                value={selectedRemittance.Amount ?? ""}
              />
              <InfoItem
                label="Deposited By"
                value={selectedRemittance.DepositedBy ?? "-"}
              />
            </SimpleGrid>

            <Box my={8}>
              <DataTable
                title="Deposit Payment List"
                columns={[]}
                data={[]}
                size="sm"
                features={{
                  search: true,
                  sorting: true,
                  columnToggle: true,
                  selection: false,
                  filtering: true,
                }}
              />
              <Flex mt={4} justifyContent={"end"}>
                <DynamicButton label="Approve" />
              </Flex>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
