import {
  Button,
  Flex,
  IconButton,
  Popover,
  Portal,
  Separator,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { BsMenuButtonWide } from "react-icons/bs";
import { FaRegFileAlt } from "react-icons/fa";
import {
  LuEllipsis,
  LuEllipsisVertical,
  LuLogOut,
  LuSettings,
  LuUser,
} from "react-icons/lu";
import { MdPayment } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { TbLockDollar, TbTransfer } from "react-icons/tb";
import { Body } from "st-peter-ui";

export function PlanholderHamburgerModules({
  personId,
  actions,
}: {
  personId: string;
  actions?: React.ReactNode | undefined;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button bg={"white"} boxShadow={"sm"} color={"gray.700"}>
          <BsMenuButtonWide />
          Menu
        </Button>
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
                  onClick={() => (window.location.href = "/plan-management")}
                >
                  <MdPayment size={14} />
                  <Body>Pay My Plan</Body>
                </Flex>
                {/* <Flex
                  align="center"
                  gap={1}
                  p={1} // decreased padding
                  borderRadius="md"
                  _hover={{ bg: "gray.100", cursor: "pointer" }}
                  onClick={() =>
                    (window.location.href =
                      "/plan-management/planholder/" +
                      personId +
                      "/reinstate-plans")
                  }
                >
                  <LuUser size={14} />
                  <Body>Reinstatement</Body>
                </Flex> */}
                <Flex
                  align="center"
                  gap={1}
                  p={1} // decreased padding
                  borderRadius="md"
                  _hover={{ bg: "gray.100", cursor: "pointer" }}
                  onClick={() =>
                    (window.location.href =
                      "/plan-management/planholder/" +
                      personId +
                      "/change-of-mode")
                  }
                >
                  <LuSettings size={14} />
                  <Body>Change of Mode</Body>
                </Flex>
                {/* <Flex
                  align="center"
                  gap={1}
                  p={1} // decreased padding
                  borderRadius="md"
                  _hover={{ bg: "gray.100", cursor: "pointer" }}
                  onClick={() =>
                    (window.location.href =
                      "/plan-management/planholder/" +
                      personId +
                      "/transfer-of-rights")
                  }
                >
                  <TbTransfer size={14} />
                  <Body>Transfer of Rights</Body>
                </Flex> */}
                <Flex
                  align="center"
                  gap={1}
                  p={1} // decreased padding
                  borderRadius="md"
                  _hover={{ bg: "gray.100", cursor: "pointer" }}
                  onClick={() =>
                    (window.location.href =
                      "/plan-management/planholder/" + personId + "/rop")
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
                {actions && (
                  <>
                    <Separator />
                    {actions}
                  </>
                )}
              </VStack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
