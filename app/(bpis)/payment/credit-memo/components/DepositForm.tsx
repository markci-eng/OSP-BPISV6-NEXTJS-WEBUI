"use client";

import { useState } from "react";
import { createListCollection } from "@chakra-ui/react";
import { Flex, Grid } from "@chakra-ui/react";
import { PrimaryMdFlexButton } from "st-peter-ui";
import { FloatingLabelInput } from "@/components/inputs/floating-label-input";
import { FloatingLabelSelect } from "@/components/inputs/floating-label-select";
import { Deposit } from "./types";

const DEPOSIT_TYPES = ["Cash", "Check", "Wire Transfer", "Online"];
const BANKS = ["BDO", "BPI", "Metrobank", "Landbank", "PNB"];

const depositTypeCollection = createListCollection({
  items: DEPOSIT_TYPES.map((t) => ({ value: t, label: t })),
});

const bankCollection = createListCollection({
  items: BANKS.map((b) => ({ value: b, label: b })),
});

const initialForm: Omit<Deposit, "id"> = {
  depositDate: "",
  remittanceDate: "",
  bankName: "",
  bankCode: "",
  bankBranch: "",
  account: "",
  checkbook: "",
  amount: 0,
  depositedBy: "",
  depositType: "",
};

interface DepositFormProps {
  onAdd: (deposit: Deposit) => void;
}

export function DepositForm({ onAdd }: DepositFormProps) {
  const [form, setForm] = useState<Omit<Deposit, "id">>(initialForm);

  const handleSubmit = () => {
    if (!form.depositDate || !form.amount) return;
    onAdd({ ...form, id: crypto.randomUUID() });
    setForm(initialForm);
  };

  return (
    <Grid
      templateColumns={{
        base: "1fr",
        md: "repeat(2, 1fr)",
        xl: "repeat(3, 1fr)",
      }}
      gap={4}
    >
      <FloatingLabelInput
        label="Deposit Date"
        type="datetime-local"
        value={form.depositDate}
        onChange={(e) => setForm({ ...form, depositDate: e.target.value })}
      />
      <FloatingLabelInput
        label="Remittance Date"
        type="date"
        value={form.remittanceDate}
        onChange={(e) => setForm({ ...form, remittanceDate: e.target.value })}
      />
      <FloatingLabelSelect
        label="Type of Deposit"
        value={form.depositType}
        onChange={(e) => setForm({ ...form, depositType: e.target.value })}
      >
        {depositTypeCollection.items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </FloatingLabelSelect>
      <FloatingLabelSelect
        label="Bank Name"
        value={form.bankName}
        onChange={(e) => setForm({ ...form, bankName: e.target.value })}
      >
        {bankCollection.items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </FloatingLabelSelect>
      <FloatingLabelInput
        label="Bank Code"
        value={form.bankCode}
        onChange={(e) => setForm({ ...form, bankCode: e.target.value })}
      />
      <FloatingLabelInput
        label="Branch"
        value={form.bankBranch}
        onChange={(e) => setForm({ ...form, bankBranch: e.target.value })}
      />
      <FloatingLabelInput
        label="Account"
        value={form.account}
        onChange={(e) => setForm({ ...form, account: e.target.value })}
      />
      <FloatingLabelInput
        label="Checkbook"
        value={form.checkbook}
        onChange={(e) => setForm({ ...form, checkbook: e.target.value })}
      />
      <FloatingLabelInput
        label="Amount Deposited"
        type="number"
        value={form.amount ? String(form.amount) : ""}
        onChange={(e) =>
          setForm({ ...form, amount: parseFloat(e.target.value) || 0 })
        }
      />
      <FloatingLabelInput
        label="Deposited By"
        value={form.depositedBy}
        onChange={(e) => setForm({ ...form, depositedBy: e.target.value })}
      />
      <Flex align="flex-end">
        <PrimaryMdFlexButton onClick={handleSubmit}>
          Add Deposit
        </PrimaryMdFlexButton>
      </Flex>
    </Grid>
  );
}
