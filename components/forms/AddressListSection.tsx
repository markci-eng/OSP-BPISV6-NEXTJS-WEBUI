"use client";
import React, { useState } from "react";
import { Box, Flex, Grid, IconButton } from "@chakra-ui/react";
import { LuMapPin, LuPlus, LuTrash2 } from "react-icons/lu";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import { AddressEntry, emptyAddress, uid } from "./person-edit-fields";
import {
  FloatingLabelInput,
  FloatingLabelSelect,
  InputCardAccordion,
} from "osp-ui-kit";

export function AddressListSection({
  selectedPerson,
  entityLabel,
}: {
  selectedPerson?: SalesAgent;
  entityLabel: string;
}) {
  const [addresses, setAddresses] = useState<AddressEntry[]>(() =>
    selectedPerson?.address
      ? [{ id: uid(), ...selectedPerson.address }]
      : [emptyAddress()],
  );

  const updateAddress = (id: string, patch: Partial<AddressEntry>) =>
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );

  const removeAddress = (id: string) =>
    setAddresses((prev) => prev.filter((a) => a.id !== id));

  const addAddress = () => setAddresses((prev) => [...prev, emptyAddress()]);

  return (
    <InputCardAccordion
      icon={<LuMapPin />}
      title="Addresses"
      subtitle={`Manage ${entityLabel} addresses`}
    >
      <Flex flexDir="column" gap={3}>
        <Flex justify="flex-end">
          <IconButton
            aria-label="Add address"
            size="xs"
            variant="ghost"
            color="var(--chakra-colors-primary)"
            onClick={addAddress}
          >
            <LuPlus /> Add Address
          </IconButton>
        </Flex>
        {addresses.map((addr, idx) => (
          <Box
            key={addr.id}
            p={3}
            borderRadius="md"
            borderWidth={1}
            borderColor="gray.200"
            bg="white"
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Box fontWeight="medium" color="gray.600">
                Address {idx + 1}
              </Box>
              <IconButton
                aria-label="Remove address"
                size="xs"
                variant="ghost"
                color="red.500"
                disabled={addresses.length === 1}
                onClick={() => removeAddress(addr.id)}
              >
                <LuTrash2 />
              </IconButton>
            </Flex>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
              gapX={2}
              gapY={3}
            >
              <FloatingLabelInput
                label="Lot/Bldg/Unit No."
                value={addr.unit}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateAddress(addr.id, { unit: e.target.value })
                }
                required
              />
              <FloatingLabelInput
                label="Street"
                value={addr.street}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateAddress(addr.id, { street: e.target.value })
                }
                required
              />

              <FloatingLabelSelect
                label="Province"
                value={addr.province}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  updateAddress(addr.id, { province: e.target.value })
                }
                required
              >
                {addr.province && (
                  <option value={addr.province}>{addr.province}</option>
                )}
              </FloatingLabelSelect>
              <FloatingLabelSelect
                label="City"
                value={addr.city}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  updateAddress(addr.id, { city: e.target.value })
                }
                required
              >
                {addr.city && <option value={addr.city}>{addr.city}</option>}
              </FloatingLabelSelect>
              <FloatingLabelSelect
                label="District"
                value={addr.district}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  updateAddress(addr.id, { district: e.target.value })
                }
                required
              >
                {addr.district && (
                  <option value={addr.district}>{addr.district}</option>
                )}
              </FloatingLabelSelect>

              <FloatingLabelSelect
                label="Barangay"
                value={addr.barangay}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  updateAddress(addr.id, { barangay: e.target.value })
                }
                required
              >
                {addr.barangay && (
                  <option value={addr.barangay}>{addr.barangay}</option>
                )}
              </FloatingLabelSelect>
              <FloatingLabelInput
                label="Zip Code"
                value={addr.zipCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateAddress(addr.id, { zipCode: e.target.value })
                }
                required
              />
            </Grid>
          </Box>
        ))}
      </Flex>
    </InputCardAccordion>
  );
}
