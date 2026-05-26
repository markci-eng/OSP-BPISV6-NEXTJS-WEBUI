"use client";
import {
  Box,
  Text,
  VStack,
  createListCollection,
  Grid,
  GridItem,
  Steps,
} from "@chakra-ui/react";
import React from "react";
import { PrimaryMdButton } from "st-peter-ui";

const eWallets = createListCollection({
  items: [
    { label: "GCash", value: "gcash" },
    { label: "Maya", value: "maya" },
    { label: "Coins.ph", value: "coins" },
    { label: "PayPal", value: "paypal" },
    { label: "ShopeePay", value: "shopeepay" },
    { label: "Lazada Wallet", value: "lazadawallet" },
  ],
});
const PaymentPage = () => {
  const [showEWallets, setShowEWallets] = React.useState(false);
  return (
    <>
      <Box mb={8}>
        <Box maxW="4xl" mx="auto" p={8} boxShadow="lg" borderRadius="md">
          <Text fontWeight="semibold"> Select Payment Method</Text>
          <Text mt={4} color="gray.600">
            Please choose a payment method to proceed with your order.
          </Text>
          <VStack mt={8} gap={4}>
            <Box
              w="full"
              p={4}
              borderWidth={1}
              borderRadius="md"
              _hover={{ borderColor: "blue.500" }}
            >
              <Text fontWeight="semibold">Credit/Debit Card</Text>
              <Text color="gray.600">Pay with your credit/debit card.</Text>
            </Box>
            <Box
              w="full"
              p={4}
              borderWidth={1}
              borderRadius="md"
              _hover={{ borderColor: "blue.500" }}
              cursor="pointer"
              onClick={() => setShowEWallets(!showEWallets)}
            >
              <Text fontWeight="semibold">E-Wallet</Text>
              <Text color="gray.600">Pay with your e-wallet.</Text>
            </Box>
            {showEWallets && (
              <Grid gap={4} mt={4} w="full" templateColumns="repeat(2, 1fr)">
                {eWallets.items.map((wallet) => (
                  <GridItem
                    key={wallet.value}
                    w="full"
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    _hover={{ borderColor: "blue.500" }}
                  >
                    <Text fontWeight="semibold">{wallet.label}</Text>
                    <Text color="gray.600">Pay with {wallet.label}.</Text>
                  </GridItem>
                ))}
              </Grid>
            )}
          </VStack>
          <Steps.NextTrigger asChild>
            <PrimaryMdButton mt={8}>
                Proceed
            </PrimaryMdButton>
          </Steps.NextTrigger>
        </Box>
      </Box>
    </>
  );
};

export default PaymentPage;