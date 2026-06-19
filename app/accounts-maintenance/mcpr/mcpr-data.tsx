import React from "react";
import { Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { LuChartBar, LuCoins, LuFileText } from "react-icons/lu";

import { Card } from "@/claude components/card-accordion/card";
import { RowItem } from "@/claude components/info-card/row-item";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";

import MCPRList from "./mcpr-list";

export default function MCPRDataPage() {
  return (
    <Flex direction="column" gap={4}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        <Card
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
        </Card>

        {/* <Card
          activeIcon={<LuChartBar size={18} />}
          title="Quota"
          subtitle="Target collection amounts"
        >
          <RowItem label="Commission" value="₱50,000.00" />
          <RowItem label="Non-Commission" value="₱50,000.00" />
        </Card>

        <Card
          activeIcon={<LuCoins size={18} />}
          title="Collection"
          subtitle="Actual collection amounts"
        >
          <RowItem label="Commission" value="₱50,000.00" />
          <RowItem label="Non-Commission" value="₱50,000.00" />
        </Card> */}
      </SimpleGrid>

      <MCPRList />
    </Flex>
  );
}
