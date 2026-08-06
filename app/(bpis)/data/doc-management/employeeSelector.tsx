"use client";

import * as React from "react";
import {
  Box,
  Flex,
  Text,
  HStack,
  NativeSelect,
  Avatar,
} from "@chakra-ui/react";
import { User } from "lucide-react";

export interface Employee {
  id: string;
  name: string;
  branch: string;
  avatar?: string;
}

export interface EmployeeSelectorProps {
  label: string;
  employee: Employee | null;
  employees: Employee[];
  onSelect: (employee: Employee) => void;
  disabled?: boolean;
}

export default function EmployeeSelector({
  label,
  employee,
  employees,
  onSelect,
  disabled,
}: EmployeeSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = employees.find((emp) => emp.id === e.target.value);
    if (found) onSelect(found);
  };

  return (
    <Flex direction="column" gap="3">
      <Text
        fontSize="sm"
        fontWeight="semibold"
        color="fg.muted"
        textTransform="uppercase"
        letterSpacing="wider"
      >
        {label}
      </Text>

      <NativeSelect.Root disabled={disabled}>
        <NativeSelect.Field value={employee?.id ?? ""} onChange={handleChange}>
          <option value="">Select an employee...</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} — {emp.branch}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>

      {employee ? (
        <HStack
          p="3"
          borderRadius="lg"
          bg="bg.muted"
          gap="3"
          align="center"
          color="black"
        >
          <Avatar.Root size="sm" variant="subtle">
            {employee.avatar ? <Avatar.Image src={employee.avatar} /> : null}
            <Avatar.Fallback name={employee.name}>
              <User size={18} />
            </Avatar.Fallback>
          </Avatar.Root>

          <Box>
            <Text fontWeight="medium">{employee.name}</Text>
            <Text fontSize="sm" color="fg.muted">
              {employee.branch}
            </Text>
          </Box>
        </HStack>
      ) : null}
    </Flex>
  );
}
