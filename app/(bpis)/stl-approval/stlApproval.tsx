"use client";

import InfoItem from "@/components/common/info-item/info-item";
import { SearchPlanholderDialog } from "@/components/common/planholder-lookup/search-planholder-dialog";
import DataTable from "@/components/common/reusable-tableV2/DataTable";
import {
  EmptyState,
  Flex,
  SimpleGrid,
  VStack,
  Box as ChakraBox,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { LuCheck, LuShoppingCart } from "react-icons/lu";
import { Body, Box, DynamicButton, H3 } from "st-peter-ui";
import { depositColumns, depositHDR } from "../payment/data/paymentDetails";

export default function StlApproval() {
  const [selectedRemittance, setSelectedRemittance] = useState<any>(null);

  // 🔹 Sample data (replace with real data)

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
        <DataTable
          columns={depositColumns}
          data={depositHDR}
          title="Remittance For Approval"
          // 👇 If your table supports row click
          onRowClick={(row: any) => {
            setSelectedRemittance(row);
          }}
          features={{
            selection: false,
            draggable: false,
            columnToggle: false,
          }}
        />
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
                  search: false,
                  sorting: false,
                  columnToggle: false,
                  draggable: false,
                  selection: false,
                  filtering: false,
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
