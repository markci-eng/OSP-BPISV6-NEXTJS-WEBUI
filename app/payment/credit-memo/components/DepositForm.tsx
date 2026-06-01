"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  Box,
  Button,
  Grid,
  HStack,
  Input,
  NativeSelect,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Deposit } from "./types";

interface DepositFormProps {
  onAdd: (deposit: Deposit) => void;
}

const DEPOSIT_TYPES = ["Cash", "Check", "Wire Transfer", "Online"];
const BANKS = ["BDO", "BPI", "Metrobank", "Landbank", "PNB"];

function generateId() {
  return crypto.randomUUID();
}

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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <VStack align="stretch" gap={1.5}>
      <Text fontSize="sm" fontWeight="medium" color="fg">
        {label}
      </Text>
      {children}
    </VStack>
  );
}

export function DepositForm({ onAdd }: DepositFormProps) {
  const [form, setForm] = React.useState<Omit<Deposit, "id">>(initialForm);

  const handleSubmit = () => {
    if (!form.depositDate || !form.amount) return;

    onAdd({ ...form, id: generateId() });
    setForm(initialForm);
  };

  return (
    <Box>
      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
          xl: "repeat(3, 1fr)",
        }}
        gap={4}
      >
        <Field label="Deposit Date">
          <Input
            type="datetime-local"
            value={form.depositDate}
            onChange={(e) => setForm({ ...form, depositDate: e.target.value })}
          />
        </Field>

        <Field label="Remittance Date">
          <Input
            type="date"
            value={form.remittanceDate}
            onChange={(e) =>
              setForm({ ...form, remittanceDate: e.target.value })
            }
          />
        </Field>

        <Field label="Type of Deposit">
          <NativeSelect.Root>
            <NativeSelect.Field
              value={form.depositType}
              onChange={(e) =>
                setForm({ ...form, depositType: e.target.value })
              }
            >
              <option value="">Select type</option>
              {DEPOSIT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field>

        <Field label="Bank Name">
          <NativeSelect.Root>
            <NativeSelect.Field
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            >
              <option value="">Select bank</option>
              {BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field>

        <Field label="Bank Code">
          <Input
            value={form.bankCode}
            onChange={(e) => setForm({ ...form, bankCode: e.target.value })}
            placeholder="e.g. BDO001"
          />
        </Field>

        <Field label="Branch">
          <Input
            value={form.bankBranch}
            onChange={(e) => setForm({ ...form, bankBranch: e.target.value })}
            placeholder="Branch name"
          />
        </Field>

        <Field label="Account">
          <Input
            fontVariantNumeric="tabular-nums"
            value={form.account}
            onChange={(e) => setForm({ ...form, account: e.target.value })}
            placeholder="Account number"
          />
        </Field>

        <Field label="Checkbook">
          <Input
            value={form.checkbook}
            onChange={(e) => setForm({ ...form, checkbook: e.target.value })}
            placeholder="Checkbook ref"
          />
        </Field>

        <Field label="Amount Deposited">
          <Input
            fontVariantNumeric="tabular-nums"
            type="number"
            min={0}
            step={0.01}
            value={form.amount || ""}
            onChange={(e) =>
              setForm({
                ...form,
                amount: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0.00"
          />
        </Field>

        <Field label="Deposited By">
          <Input
            value={form.depositedBy}
            onChange={(e) => setForm({ ...form, depositedBy: e.target.value })}
            placeholder="Employee name"
          />
        </Field>
      </Grid>

      <HStack mt={4}>
        <Button onClick={handleSubmit} size="sm">
          <Plus size={16} />
          Add Deposit
        </Button>
      </HStack>
    </Box>
  );
}
