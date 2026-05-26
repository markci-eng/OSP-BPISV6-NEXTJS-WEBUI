"use client";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  IconButton,
  Popover,
  Portal,
  Separator,
  Strong,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import { PhPlanDetails } from "./ph-plan-details";
import { PlanholdersProps } from "./planholders.types";
import {
  Body,
  CancelButton,
  DeleteButton,
  DynamicButton,
  EditButton,
  H3,
  SaveButton,
} from "st-peter-ui";
import {
  LuLogOut,
  LuPencil,
  LuSettings,
  LuTrash,
  LuUser,
} from "react-icons/lu";
import { RxHamburgerMenu } from "react-icons/rx";
import { TbLockDollar, TbTransfer } from "react-icons/tb";
import { GiCash } from "react-icons/gi";
import { IoSkullSharp } from "react-icons/io5";
import { FaFileAlt, FaRegFileAlt } from "react-icons/fa";
import { MdPayment } from "react-icons/md";

export function PlanholderPage({ props }: { props: PlanholdersProps }) {
  return (
    <Box mx="auto">
      <Box>
        <Flex justify={"space-between"} align={"center"}>
          <Box textAlign="start" mt={4}>
            <H3>Planholder Information</H3>
            <Body mt={2}>Clear Access to Every Planholder Detail.</Body>
          </Box>
          <Flex gap={3}>
            <Popover.Root positioning={{ placement: "bottom-start" }}>
              <Popover.Trigger asChild>
                <IconButton bg={"white"} color={"gray.700"}>
                  <RxHamburgerMenu />
                </IconButton>
              </Popover.Trigger>
              <Portal>
                <Popover.Positioner>
                  <Popover.Content>
                    <Popover.Arrow />
                    <Popover.Body>
                      <VStack
                        align="stretch"
                        gap={1}
                        fontFamily="'Open Sans'"
                        font-size="normal"
                        fontWeight="semibold"
                      >
                        <Flex
                          align="center"
                          gap={1}
                          p={1}
                          borderRadius="md"
                          _hover={{ bg: "gray.100", cursor: "pointer" }}
                          onClick={() =>
                            (window.location.href = "/plan-management")
                          }
                        >
                          <MdPayment size={14} />
                          <Body>Pay My Plan</Body>
                        </Flex>
                        <Flex
                          align="center"
                          gap={1}
                          p={1} // decreased padding
                          borderRadius="md"
                          _hover={{ bg: "gray.100", cursor: "pointer" }}
                          onClick={() =>
                            (window.location.href =
                              "/plan-management/planholder/" +
                              props.lpaNumber +
                              "/reinstatement")
                          }
                        >
                          <LuUser size={14} />
                          <Body>Reinstatement</Body>
                        </Flex>
                        <Flex
                          align="center"
                          gap={1}
                          p={1} // decreased padding
                          borderRadius="md"
                          _hover={{ bg: "gray.100", cursor: "pointer" }}
                          onClick={() =>
                            (window.location.href =
                              "/plan-management/planholder/" +
                              props.lpaNumber +
                              "/change-of-mode")
                          }
                        >
                          <LuSettings size={14} />
                          <Body>Change of Mode</Body>
                        </Flex>
                        <Flex
                          align="center"
                          gap={1}
                          p={1} // decreased padding
                          borderRadius="md"
                          _hover={{ bg: "gray.100", cursor: "pointer" }}
                          onClick={() =>
                            (window.location.href =
                              "/plan-management/planholder/" +
                              props.lpaNumber +
                              "/transfer-of-rights")
                          }
                        >
                          <TbTransfer size={14} />
                          <Body>Transfer of Rights</Body>
                        </Flex>
                        <Flex
                          align="center"
                          gap={1}
                          p={1} // decreased padding
                          borderRadius="md"
                          _hover={{ bg: "gray.100", cursor: "pointer" }}
                          onClick={() =>
                            (window.location.href =
                              "/plan-management/planholder/" +
                              props.lpaNumber +
                              "/rop")
                          }
                        >
                          <TbLockDollar />
                          <Body>Return of Premium</Body>
                        </Flex>
                        <Flex
                          align="center"
                          gap={1}
                          p={1} // decreased padding
                          borderRadius="md"
                          _hover={{ bg: "gray.100", cursor: "pointer" }}
                          onClick={() => (window.location.href = "/claims")}
                        >
                          <FaRegFileAlt />
                          <Body>Claim Application</Body>
                        </Flex>
                        <Flex
                          align="center"
                          gap={1}
                          p={1} // decreased padding
                          borderRadius="md"
                          _hover={{ bg: "gray.100", cursor: "pointer" }}
                        >
                          <LuLogOut size={14} color="red.700" />
                          <Body>Cash Surrendered Value</Body>
                        </Flex>
                      </VStack>
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </Popover.Root>

            <Dialog.Root size={"xl"}>
              <Dialog.Trigger asChild>
                <Button>
                  <LuPencil /> Edit
                </Button>
              </Dialog.Trigger>
              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content>
                    <Dialog.Header>
                      <Dialog.Title>Edit Planholder Information</Dialog.Title>
                    </Dialog.Header>
                    <Separator />
                    <Dialog.Body p={5}>
                      <Tabs.Root
                        variant="subtle"
                        defaultValue="personal"
                        orientation={"vertical"}
                      >
                        <Tabs.List>
                          <Tabs.Trigger
                            width={"150px"}
                            value="personal"
                            _selected={{
                              bg: "white",
                              boxShadow: "sm",
                              fontWeight: "semibold",
                              color: "var(--chakra-colors-primary)",
                            }}
                          >
                            Personal
                          </Tabs.Trigger>
                          <Tabs.Trigger
                            value="address"
                            _selected={{
                              bg: "white",
                              boxShadow: "sm",
                              fontWeight: "semibold",
                              color: "var(--chakra-colors-primary)",
                            }}
                          >
                            Address
                          </Tabs.Trigger>
                          <Tabs.Trigger
                            value="contact"
                            _selected={{
                              bg: "white",
                              boxShadow: "sm",
                              fontWeight: "semibold",
                              color: "var(--chakra-colors-primary)",
                            }}
                          >
                            Contact
                          </Tabs.Trigger>
                          <Tabs.Trigger
                            value="employment"
                            _selected={{
                              bg: "white",
                              boxShadow: "sm",
                              fontWeight: "semibold",
                              color: "var(--chakra-colors-primary)",
                            }}
                          >
                            Employment
                          </Tabs.Trigger>
                        </Tabs.List>
                        <Separator orientation={"vertical"} mx={2} />
                        <Tabs.Content value="personal">
                          <Strong fontSize={"md"}>Personal Information</Strong>
                        </Tabs.Content>

                        <Tabs.Content value="address">
                          <Strong fontSize={"md"}>Address Information</Strong>
                        </Tabs.Content>

                        <Tabs.Content value="contact">
                          <Strong fontSize={"md"}>Contact Information</Strong>
                        </Tabs.Content>

                        <Tabs.Content value="employment">
                          <Strong fontSize={"md"}>
                            Employment Information
                          </Strong>
                        </Tabs.Content>
                      </Tabs.Root>
                    </Dialog.Body>
                    <Dialog.Footer>
                      <Dialog.ActionTrigger asChild>
                        <CancelButton />
                      </Dialog.ActionTrigger>
                      <SaveButton />
                    </Dialog.Footer>
                    <Dialog.CloseTrigger asChild>
                      <CloseButton size="sm" />
                    </Dialog.CloseTrigger>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>
            <Button bg={"red.500"} color={"white"}>
              <LuTrash /> Delete
            </Button>
          </Flex>
        </Flex>

        <PhPlanDetails props={props} />
      </Box>
    </Box>
  );
}
