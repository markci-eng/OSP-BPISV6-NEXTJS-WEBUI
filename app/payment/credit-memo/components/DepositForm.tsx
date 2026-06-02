"use client";

import { useState } from "react";
import { createListCollection } from "@chakra-ui/react";
import { Flex, Grid } from "@chakra-ui/react";
import { InputFloatingLabel, PrimaryMdFlexButton, SelectFloatingLabel } from "st-peter-ui";
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
      <InputFloatingLabel
        label="Deposit Date"
        type="datetime-local"
        value={form.depositDate}
        onChange={(e) => setForm({ ...form, depositDate: e.target.value })}
      />
      <InputFloatingLabel
        label="Remittance Date"
        type="date"
        value={form.remittanceDate}
        onChange={(e) => setForm({ ...form, remittanceDate: e.target.value })}
      />
      <SelectFloatingLabel
        label="Type of Deposit"
        collection={depositTypeCollection}
        value={form.depositType ? [form.depositType] : []}
        onValueChanged={(e) => setForm({ ...form, depositType: e[0] })}
      />
      <SelectFloatingLabel
        label="Bank Name"
        collection={bankCollection}
        value={form.bankName ? [form.bankName] : []}
        onValueChanged={(e) => setForm({ ...form, bankName: e[0] })}
      />
      <InputFloatingLabel
        label="Bank Code"
        value={form.bankCode}
        onChange={(e) => setForm({ ...form, bankCode: e.target.value })}
      />
      <InputFloatingLabel
        label="Branch"
        value={form.bankBranch}
        onChange={(e) => setForm({ ...form, bankBranch: e.target.value })}
      />
      <InputFloatingLabel
        label="Account"
        value={form.account}
        onChange={(e) => setForm({ ...form, account: e.target.value })}
      />
      <InputFloatingLabel
        label="Checkbook"
        value={form.checkbook}
        onChange={(e) => setForm({ ...form, checkbook: e.target.value })}
      />
      <InputFloatingLabel
        label="Amount Deposited"
        type="number"
        value={form.amount || ""}
        onChange={(e) =>
          setForm({ ...form, amount: parseFloat(e.target.value) || 0 })
        }
      />
      <InputFloatingLabel
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
