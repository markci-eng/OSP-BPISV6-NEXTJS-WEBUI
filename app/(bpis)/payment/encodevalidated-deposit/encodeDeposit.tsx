"use client";

import { Box, Flex, SimpleGrid } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { InputFloatingLabel, PrimaryMdFlexButton } from "st-peter-ui";
import { drsItems, samplePayments } from "../data/paymentDetails";

import DrsDataTable from "../components/drsDataTable";
import {
  LookupColumn,
  LookupField,
} from "@/components/common/reusable-lookup/LookUpField";

import { DepositHdr } from "../data/payment.types";
import DrsPaymentSummary from "../components/drsPaymentSummary";
import { DrsFunction } from "../utils/drsFunction";
import { toast } from "sonner";
import { Employee } from "@/data/doc-management/employeeSelector";
import { EMPLOYEES } from "@/data/doc-management/documenttype";
import { refBankBranch } from "@/app/(bpis)/Model/Types/global.types";
import { refBankBranchData } from "@/app/(bpis)/Model/Data/rawData";
import { useRouter } from "next/navigation";
import { useMessageDialog } from "@/components/common/message-box/message-box-provider";
import Page from "@/claude components/layout/page/Page";
import { EmptyStateCard } from "@/components/cards/EmptyStateCard";
import { InputCardAccordion } from "@/claude components/card-accordion/input-card-accordion";
import { LuBanknote, LuSearch } from "react-icons/lu";

export default function EncodeDeposit() {
  const { totals } = DrsFunction(samplePayments);
  const router = useRouter();

  const [selectedDRS, setSelectedDRS] = useState<DepositHdr | null>(null);
  const [searchOpen, setSearchOpen] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);

  const drsColumns: LookupColumn<DepositHdr>[] = [
    { key: "name", header: "DRS" },
    { key: "Amount", header: "Amount" },
  ];

  useEffect(() => {
    const data = sessionStorage.getItem("selectedDRS");
    if (data) {
      setSelectedDRS(JSON.parse(data));
      setSearchOpen(false);
      setDepositOpen(true);
      sessionStorage.removeItem("selectedDRS");
    }
  }, []);

  const defaultEmployee = EMPLOYEES[0];
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const employeeColumns: LookupColumn<Employee>[] = [
    { key: "id", header: "Employee ID" },
    { key: "name", header: "Name" },
    { key: "branch", header: "Branch" },
  ];

  const [selectedBank, setSelectedBank] = useState<refBankBranch | null>(null);
  const bankBranchColumns: LookupColumn<refBankBranch>[] = [
    { key: "BankCode", header: "Bank Code" },
    { key: "BankBranch", header: "Bank Description" },
  ];

  const { messageBox } = useMessageDialog();
  const handleConfirm = async () => {
    const confirmed = await messageBox({
      title: "CONFIRMATION",
      message: "Do you want to Save Deposit?",
      confirmText: "Ok",
      variant: "confirmation",
    });

    if (confirmed) {
      const isSuccess = await messageBox({
        title: "SUCCESS",
        message: "Deposit Successfully Saved.",
        confirmText: "Ok",
        variant: "success",
      });
      if (isSuccess) {
        router.push("/payment/viewvalidated-deposit");
        toast.success("Deposit Successfully Saved.");
      }
    }
  };

  return (
    <Page.Root
      title="Encode Validated Deposit"
      description="Encode your validated deposit"
      headerButton="menu"
    >
      <Page.MainContent>
        <Flex flexDir="column" gap={4}>
          {/* SECTION 1 — Find DRS */}
          <Flex justify="flex-end">
          <Box maxW={{ base: "full", md: "sm" }} w={{ base: "full", md: "sm" }}>
            <LookupField<DepositHdr>
              label=""
              placeholder="Search Digital Remittance Slip"
              modalTitle="Search Digital Remittance Slip"
              columns={drsColumns}
              dataSource={drsItems}
              searchKeys={["id", "name", "DepositDateTime"]}
              onSelect={(e) => {
                if (!e) {
                  setSelectedDRS(null);
                  setDepositOpen(false);
                  return;
                }
                if (drsItems[0].id === e.id) {
                  setSelectedDRS(e);
                  setSearchOpen(false);
                  setDepositOpen(true);
                } else {
                  toast.error("Please encode the first created DRS");
                }
              }}
              renderDisplay={(x) => `${x.name} (${x.Amount})`}
              value={selectedDRS}
            />
          </Box>
          </Flex>

          {/* SECTION 2 — Deposit Details */}
          <InputCardAccordion
            icon={<LuBanknote size={16} />}
            title="Deposit Details"
            subtitle={selectedDRS ? selectedDRS.name : "Select a DRS first"}
            isOpen={depositOpen}
            onToggle={() => setDepositOpen((p) => !p)}
          >
            {!selectedDRS ? (
              <EmptyStateCard
                title="No DRS Selected"
                description="Search and select a Digital Remittance Slip to start entering deposit details."
              />
            ) : (
              <>
                <SimpleGrid
                  columns={{ base: 1, sm: 2, lg: 3 }}
                  gapX={2}
                  gapY={1}
                >
                  <InputFloatingLabel
                    type="datetime-local"
                    id="depositdate"
                    label="Deposit Date Time"
                  />
                  <InputFloatingLabel
                    type="number"
                    id="AccountNo"
                    label="Account number"
                    value={"2010073262"}
                  />
                  <Flex alignItems="center">
                    <LookupField<refBankBranch>
                      label=""
                      placeholder="Bank Branch"
                      modalTitle="Search Bank Branch"
                      columns={bankBranchColumns}
                      dataSource={refBankBranchData}
                      searchKeys={["BankCode", "BankBranch"]}
                      onSelect={setSelectedBank}
                      renderDisplay={(b) => `${b.BankCode} (${b.BankBranch})`}
                      value={selectedBank}
                    />
                  </Flex>
                  <InputFloatingLabel
                    id="Amount"
                    label="Amount"
                    value={selectedDRS.Amount || "₱0.00"}
                  />
                  <Flex alignItems="center">
                    <LookupField<Employee>
                      label=""
                      placeholder="Search by name or ID..."
                      modalTitle="Search Employee"
                      columns={employeeColumns}
                      dataSource={EMPLOYEES}
                      searchKeys={["id", "name", "branch"]}
                      onSelect={setSelectedEmployee}
                      renderDisplay={(emp) => `${emp.name} (${emp.id})`}
                      value={selectedEmployee || defaultEmployee}
                    />
                  </Flex>
                </SimpleGrid>

                <Box mt={4}>
                  <DrsDataTable
                    payments={samplePayments}
                    onRowClick={(row) => console.log("Clicked row:", row)}
                  />
                  <Box display={{ base: "block", md: "none" }}>
                    <DrsPaymentSummary totals={totals} displayProp={true} />
                  </Box>
                </Box>

                <Flex gap={3} mt={4} justify="flex-end" flexWrap="wrap">
                  <Box
                    w={{ base: "full", md: "1/12" }}
                    minW={{ base: "full", md: "-webkit-fit-content" }}
                  >
                    <PrimaryMdFlexButton onClick={handleConfirm}>
                      SAVE
                    </PrimaryMdFlexButton>
                  </Box>
                </Flex>
              </>
            )}
          </InputCardAccordion>
        </Flex>
      </Page.MainContent>
    </Page.Root>
  );
}
