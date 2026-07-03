"use client";

import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import { Card } from "@/claude components/card-accordion/card";
import DataTable from "@/components/common/reusable-tableV2/DataTable";
import { Badge, Flex, Text } from "@chakra-ui/react";
import { LuArrowRight, LuUsers, LuUsersRound } from "react-icons/lu";
import { agentColumns, agentMobileConfig } from "../data/agent-columns";
import { fullName } from "../utils";
import { EmptyState } from "./shared";

/* ─── Agent selection panel ──────────────────────────────────────────────── */

export const AgentPanel = ({
  superior,
  eligible,
  selectedCount,
  onSelectionChange,
}: {
  superior: SalesAgent | null;
  eligible: SalesAgent[];
  selectedCount: number;
  onSelectionChange: (rows: SalesAgent[]) => void;
}) => {
  return (
    <Card
      activeIcon={<LuUsers size={16} />}
      title="Select Agents"
      subtitle={
        superior
          ? `Choose agents to move under ${fullName(superior)}`
          : "Select a receiving superior first"
      }
      headerAction={
        selectedCount > 0 ? (
          <Badge
            colorPalette="gray"
            variant="subtle"
            borderRadius="full"
            px={2}
          >
            <Text fontSize="11px" fontWeight="700">
              {selectedCount} selected
            </Text>
          </Badge>
        ) : undefined
      }
    >
      {!superior ? (
        <EmptyState icon={<LuUsers size={30} />}>
          Once you select a receiving superior, the agents eligible to move
          under them will appear here.
        </EmptyState>
      ) : eligible.length === 0 ? (
        <EmptyState icon={<LuUsersRound size={30} />}>
          No agents are eligible to be transferred under {fullName(superior)}.
        </EmptyState>
      ) : (
        <Flex direction="column" gap={3}>
          <Flex
            align="center"
            gap={2}
            px={3}
            py={2}
            borderRadius="10px"
            bg="gray.50"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <LuArrowRight size={14} color="#667085" />
            <Text fontSize="12px" color="gray.600" fontWeight="600">
              Selected agents will move under {fullName(superior)} (
              {superior.id})
            </Text>
          </Flex>

          <DataTable<SalesAgent>
            key={superior.id}
            columns={agentColumns}
            data={eligible}
            getRowId={(row) => row.id}
            onSelectionChange={onSelectionChange}
            defaultPageSize={10}
            emptyState={
              <EmptyState icon={<LuUsersRound size={30} />}>
                No agents match your search or filters.
              </EmptyState>
            }
            features={{
              search: true,
              filtering: true,
              sorting: true,
              pagination: true,
              columnToggle: false,
              selection: true,
              draggable: false,
              detailSidebar: false,
            }}
            mobileConfig={agentMobileConfig}
          />
        </Flex>
      )}
    </Card>
  );
};
