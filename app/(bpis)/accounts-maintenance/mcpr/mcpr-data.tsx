import React from "react";
import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { LuChartBar, LuCoins, LuFileText } from "react-icons/lu";
import { RowItem } from "@/components/info-card/row-item";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

import MCPRList from "./mcpr-list";
import { StaticCard } from "osp-ui-kit";

export default function MCPRDataPage() {
  return (
    <Flex direction="column" gap={4}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        <StaticCard
          activeIcon={<LuFileText size={18} />}
          title="No. of Accounts"
          subtitle="Total active accounts"
        >
          <Flex justify="center" align="center" py={3}>
            <Text
              fontSize="4xl"
              fontWeight="800"
              color={BRAND_COLORS.primaryGreen}
              lineHeight="1"
            >
              150
            </Text>
          </Flex>
        </StaticCard>

        <Box display={{ base: "none", lg: "block" }}>
          <StaticCard
            activeIcon={<LuChartBar size={18} />}
            title="Quota"
            subtitle="Target collection amounts"
          >
            <RowItem label="Commission" value="₱50,000.00" />
            <RowItem label="Non-Commission" value="₱50,000.00" />
          </StaticCard>
        </Box>

        <Box display={{ base: "none", lg: "block" }}>
          <StaticCard
            activeIcon={<LuCoins size={18} />}
            title="Collection"
            subtitle="Actual collection amounts"
          >
            <RowItem label="Commission" value="₱50,000.00" />
            <RowItem label="Non-Commission" value="₱50,000.00" />
          </StaticCard>
        </Box>
      </SimpleGrid>

      <MCPRList />
    </Flex>
  );
}
