import { Box, Flex, Strong } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { OSPBadge } from "../common/badge/badge";
import { LuArrowDown, LuArrowUp } from "react-icons/lu";
import { Body, Small } from "st-peter-ui";
import { Tooltip } from "../ui/tooltip";

export const TileItem = ({
  Icon,
  title,
  value,
  monthOverMonthPercentage,
  order = "asc",
}: {
  Icon: IconType;
  title: string;
  value: string;
  monthOverMonthPercentage: number;
  order?: "asc" | "desc";
}) => {
  return (
    <Box bg={"white"} borderRadius={"md"} boxShadow={"sm"} p={5}>
      <Flex justify={"space-between"} align={"flex-start"}>
        <Body>{title}</Body>
        <Box borderRadius={"md"}>
          <Icon size={"35px"} color="var(--chakra-colors-primary)" />
        </Box>
      </Flex>

      <Flex justify={"space-between"} align={"flex-end"} mt={4}>
        <Strong fontSize={"4xl"} color={"gray.700"}>
          {value}
        </Strong>
        <Flex align={"end"} direction={"column"}>
          <Tooltip content=""></Tooltip>
          <OSPBadge
            type={
              order === "asc"
                ? monthOverMonthPercentage > 0
                  ? "success"
                  : "danger"
                : monthOverMonthPercentage > 0
                  ? "danger"
                  : "success"
            }
            size={"md"}
          >
            {monthOverMonthPercentage > 0 ? (
              <LuArrowUp />
            ) : monthOverMonthPercentage === 0 ? null : (
              <LuArrowDown />
            )}{" "}
            {monthOverMonthPercentage.toFixed(2) + "%"}
          </OSPBadge>
          <Small textAlign={"end"} color={"gray.500"}>
            vs previous month
          </Small>
        </Flex>
      </Flex>
    </Box>
  );
};