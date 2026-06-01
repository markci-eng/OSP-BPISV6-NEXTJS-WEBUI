import {
  Box,
  CloseButton,
  Dialog,
  Flex,
  Heading,
  HStack,
  Portal,
  SimpleGrid,
  Stack,
  Table,
  type TableRowProps,
  useBreakpointValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  Body,
  Checkbox,
  SaveButton,
  SecondarySmButton,
  SelectButton,
  Small,
  UnselectSolidButton,
} from "st-peter-ui";
import type { CheckedPlan, PhLapsedPlan } from "./reinstatement.types";
import { useEffect, useState } from "react";

interface RIPlanItemProps extends TableRowProps {
  checked: boolean;
  plan: PhLapsedPlan;
  onChanged?: (checked: boolean, values: CheckedPlan) => void;
}

export function RITableRow({
  checked,
  plan,
  onChanged,
  ...rowProps
}: RIPlanItemProps) {
  const [isChecked, setIsChecked] = useState(checked);
  const [isFullyPaid, setIsFullyPaid] = useState(false);
  const [isCheckedFullyPaid, setIsCheckedFullyPaid] = useState(false);
  const { open, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const reinstatementFee = 500;
  const reinstatementPayment = isFullyPaid
    ? Number(plan.newBalance ?? 0)
    : Number(plan.newInstAmt ?? 0);
  const totalAmountDue = reinstatementFee + reinstatementPayment;

  function handleSelect(select: boolean) {
    setIsChecked(select);
    setIsCheckedFullyPaid(isFullyPaid);
    onChanged?.(select, {
      lpaNo: plan.lpaNo,
      planType: plan.planType,
      isFullyPaid,
      reinstatementFee,
      reinstatementPayment,
    });

    onClose();
  }

  const handleClick = useBreakpointValue({
      base: onOpen,
      md: () => {}
    });

  const Input = ({label, value} : {label: string, value: string}) => {
    return(
        <Box width={"full"}>
            <Small>{label}</Small>
            <Box border={"none"} py={0} borderRadius={"sm"} >
                <Body fontWeight={"semibold"}>{value}</Body>
            </Box>
        </Box>
    );
  }

  return (
    <Table.Row
      data-selected={isChecked ? "" : undefined}
      {...rowProps}
      _selected={{
        bg: "var(--chakra-colors-primary-disabled)",
        color: "var(--chakra-colors-primary-hover)",
      }}
      onClick={handleClick}
      py={{base: 0, mdDown: 4}}
    >
      <Table.Cell>           
        <Checkbox
          display={{base: "none", mdDown: "block"}}
          checked={isChecked}
          onCheckedChange={(changes) => {}}
        />
        <Checkbox
          display={{base: "block", mdDown: "none"}}
          checked={isChecked}
          onCheckedChange={(changes) => {
            const nextChecked = changes.checked === true;
            setIsChecked(nextChecked);

            onChanged?.(nextChecked, {
              lpaNo: plan.lpaNo,
              planType: plan.planType,
              isFullyPaid,
              reinstatementFee,
              reinstatementPayment,
            });
          }}
        />
      </Table.Cell>
      <Table.Cell py={{base: 0, mdDown: 4}}>{plan.lpaNo}</Table.Cell>
      <Table.Cell>{plan.planType}</Table.Cell>
      <Table.Cell>{plan.mop}</Table.Cell>
      <Table.Cell>{plan.duedate}</Table.Cell>

      <Table.Cell textAlign="end" display={{base: "block", mdDown: "none"}}>
        <SecondarySmButton onClick={onOpen}>View Details</SecondarySmButton>

        {/* ------------------- MODAL ------------------- */}
        <Dialog.Root
          open={open}
          onOpenChange={onClose}
          size="xl"
          placement={"center"}
        >
          <Portal>
            <Dialog.Backdrop zIndex={1000} />
            <Dialog.Positioner zIndex={1001}>
              <Dialog.Content zIndex={1001}>
                <Dialog.Header>
                  <Dialog.Title>Plan Details</Dialog.Title>
                </Dialog.Header>

                <Dialog.Body>
                  <Stack direction={{ base: "column", md: "row" }}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} width="full">
                      {/* Current Plan */}
                      <Box px={3} py={3}>
                        <Heading size="lg" textAlign="center">
                          Current Plan
                        </Heading>

                        <Flex my={3} gap={2}>
                            <Input label="LPA Number" value={plan.lpaNo} />
                            <Input label="Account Status" value={plan.status} />
                        </Flex>

                        <Flex my={3} gap={2}>
                          <Input label="Total Amount Payable" value={formatMoney(parseFloat(plan.totalAmtPayable))} />
                          <Input label="Total Amount Paid" value={formatMoney(parseFloat(plan.totalAmtPaid))} />
                        </Flex>

                        <Flex my={3} gap={2}>
                          <Input label="Balance" value={formatMoney(parseFloat(plan.balance))} />
                          <Input label="Installment Amount" value={formatMoney(parseFloat(plan.instAmt))} />
                        </Flex>

                        <Checkbox
                          checked={isFullyPaid}
                          onCheckedChange={() =>
                            setIsFullyPaid((prev) => !prev)
                          }
                          label=" Reinstate Fully Paid"
                          display={{ base: "block", mdDown: "none" }}
                        />
                      </Box>

                      {/* After Reinstatement */}
                      <Box
                        p={3}
                        bg="gray.50"
                        border="1px solid #ddd"
                        borderRadius="md"
                      >
                        <Heading size="lg" textAlign="center">
                          After Reinstatement
                        </Heading>

                        <Flex my={3} gap={2}>
                          <Input  label="LPA Number" value={plan.newLpaNo} />
                          <Input label="Account Status" value={plan.newStatus} />
                        </Flex>

                        <Flex my={3} gap={2}>
                          <Input label="Total Amount Payable" value={formatMoney(parseFloat(plan.newTotalAmtPayable))} />
                          <Input label="Total Amount Paid" value={formatMoney(parseFloat(plan.newTotalAmtPaid))} />
                        </Flex>

                        <Flex my={3} gap={2}>
                          <Input label="Balance" value={formatMoney(parseFloat(plan.newBalance))} />
                          <Input label="Installment Amount" value={formatMoney(parseFloat(plan.newInstAmt))} />
                        </Flex>
                      </Box>
                    </SimpleGrid>
                  </Stack>

                  {/* Mobile fully paid toggle */}
                  <Checkbox
                    checked={isFullyPaid}
                    onCheckedChange={() => setIsFullyPaid((prev) => !prev)}
                    label=" Reinstate Fully Paid"
                    display={{ base: "none", mdDown: "block" }}
                    mt={3}
                  />

                  {/* Payment Summary */}
                  <Box
                    p={5}
                    mt={5}
                    width={{base: "md", mdDown: "full"}}
                    mx="auto"
                    borderWidth="1px"
                    borderColor="var(--chakra-colors-primary)"
                    borderRadius="lg"
                    bg={"var(--chakra-colors-primary-disabled)/50"}
                  >
                    <Body>Applying for reinstatement requires:</Body>

                    <HStack justifyContent={"space-between"} mt={3} width={"full"}>
                      <VStack align={"start"} mr={3}>
                        <Body>Reinstatement Fee:{" "}</Body>
                        <Body>Reinstatement Payment:{" "}</Body>
                        <Body fontWeight="bold">Total Amount Due: </Body>
                      </VStack>
                      <VStack align={"end"}>
                        <Body><strong>₱ {reinstatementFee.toLocaleString()}</strong></Body>
                        <Body><strong>₱ {reinstatementPayment.toLocaleString()}</strong></Body>
                        <Body><strong>₱ {totalAmountDue.toLocaleString()}</strong></Body>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* Select / Unselect */}
                  <Box mt={3} textAlign="center" pb={{base: "0", mdDown: "60px"}}>
                    {isChecked ? isCheckedFullyPaid == isFullyPaid ? (
                      <UnselectSolidButton
                        onClick={() => handleSelect(false)}
                      />
                    ) : (
                      <SaveButton
                        onClick={() => handleSelect(true)}
                      />
                    ) : (
                      <SelectButton onClick={() => handleSelect(true)}/>
                    )}
                  </Box>
                </Dialog.Body>

                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Table.Cell>
    </Table.Row>
  );
}

function formatMoney(num: number) {
  return (
    "₱ " +
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
