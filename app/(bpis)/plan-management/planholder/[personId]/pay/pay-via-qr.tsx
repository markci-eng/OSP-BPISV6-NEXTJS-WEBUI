"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { LuCheck, LuMinus, LuPlus } from "react-icons/lu";
import { TbQrcode } from "react-icons/tb";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
  STANDARD_SPACING,
} from "@/lib/theme/standard-design-tokens";
import Page from "@/claude components/layout/page/Page";
import { useDemoAuth } from "@/components/ui/demo-auth";
import QrScreen from "@/components/common/qr-screen/qr-screen";

type PayViaQrProps = {
  personId: string;
  lpaNumber: string;
  planholderName: string;
  planDescription: string;
  mode: string;
  installmentAmount: number;
  totalAmountPayable: number;
  dueDate: Date;
};

type Screen = "details" | "loading" | "success" | "qr";
type PayOption = "due" | "full";

const peso = (amount: number) =>
  "₱" + Math.round(amount).toLocaleString("en-PH");

const HOW_TO_PAY_STEPS = [
  "Open your preferred banking or e-wallet app.",
  "Choose Scan QR.",
  "Scan the generated QR code.",
  "Verify the payment amount.",
  "Complete the transaction.",
  "Keep your receipt for reference.",
];

export default function PayViaQr({
  personId,
  lpaNumber,
  planholderName,
  planDescription,
  mode,
  installmentAmount,
  totalAmountPayable,
  dueDate,
}: PayViaQrProps) {
  const [screen, setScreen] = useState<Screen>("details");
  const [option, setOption] = useState<PayOption>("due");
  const [multiplier, setMultiplier] = useState(1);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const dueAmount = installmentAmount;
  const dueMax = Math.max(
    1,
    Math.round(totalAmountPayable / (installmentAmount || totalAmountPayable)),
  );
  const fullAmount = totalAmountPayable;
  const fullMax = 1;

  const baseAmount = option === "full" ? fullAmount : dueAmount;
  const maxMult = option === "full" ? fullMax : dueMax;
  const computedAmount = baseAmount * multiplier;

  const dueDateLabel = dueDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const selectOption = (opt: PayOption) => {
    setOption(opt);
    setMultiplier(1);
  };

  const step = (delta: number) => {
    setMultiplier((prev) => Math.min(maxMult, Math.max(1, prev + delta)));
  };

  const generate = () => {
    setScreen("loading");
    timers.current.push(setTimeout(() => setScreen("success"), 1200));
    timers.current.push(setTimeout(() => setScreen("qr"), 2000));
  };

  const qrValue = useMemo(
    () => `PAY|${lpaNumber}|${personId}|${Math.round(computedAmount)}`,
    [lpaNumber, personId, computedAmount],
  );

    const { login } = useDemoAuth();
    useEffect(() => {
      login();
    }, [login]);

  if (screen === "loading" || screen === "success") {
    return (
      <Page.Root title="Pay via QR" description="Generating your payment code.">
        <Page.MainContent>
          <Page.Row>
            <VStack gap={STANDARD_SPACING.md} py="80px">
              {screen === "loading" ? (
                <>
                  <style>{`@keyframes payQrSpin { to { transform: rotate(360deg); } }`}</style>
                  <Box
                    boxSize="72px"
                    borderRadius={STANDARD_RADIUS.full}
                    borderWidth="5px"
                    borderColor={BRAND_COLORS.neutralBorder}
                    borderTopColor={BRAND_COLORS.primaryGreen}
                    borderRightColor={BRAND_COLORS.primaryGreen}
                    style={{ animation: "payQrSpin 0.8s linear infinite" }}
                  />
                  <VStack gap="4px">
                    <Text fontSize="18px" fontWeight="800" color={BRAND_COLORS.neutralText}>
                      Generating QR
                    </Text>
                    <Text fontSize="14px" color={BRAND_COLORS.grey} fontWeight="500">
                      Securely preparing your payment code…
                    </Text>
                  </VStack>
                </>
              ) : (
                <>
                  <Flex
                    boxSize="84px"
                    borderRadius={STANDARD_RADIUS.full}
                    bg={BRAND_COLORS.successBg}
                    align="center"
                    justify="center"
                  >
                    <Flex
                      boxSize="58px"
                      borderRadius={STANDARD_RADIUS.full}
                      bg={BRAND_COLORS.primaryGreen}
                      align="center"
                      justify="center"
                    >
                      <LuCheck size={28} color="#fff" strokeWidth={3} />
                    </Flex>
                  </Flex>
                  <VStack gap="4px">
                    <Text fontSize="18px" fontWeight="800" color={BRAND_COLORS.neutralText}>
                      QR Ready
                    </Text>
                    <Text fontSize="14px" color={BRAND_COLORS.grey} fontWeight="500">
                      Your payment code has been generated.
                    </Text>
                  </VStack>
                </>
              )}
            </VStack>
          </Page.Row>
        </Page.MainContent>
      </Page.Root>
    );
  }

  if (screen === "qr") {
    return (
      <QrScreen
        variant="with-amount"
        pageTitle="Payment QR"
        pageSubtitle="Scan using any supported banking or e-wallet."
        qrValue={qrValue}
        amount={computedAmount}
        downloadFileName={`payment-qr-${lpaNumber}`}
        infoCardValue1={planholderName}
        infoCardValue2={lpaNumber}
      />
    );
  }

  return (
    <Page.Root
      title="Pay via QR"
      description=""
    >
      <Page.MainContent maxW="560px" mx="auto">
        <Page.Row>
          <VStack align="stretch" gap={STANDARD_SPACING.xs}>
            <Text
            mt={5}
              fontSize="11px"
              fontWeight="700"
              letterSpacing="0.06em"
              textTransform="uppercase"
              color={BRAND_COLORS.grey}
            >
              Payment Options
            </Text>

            <Box
              as="button"
              onClick={() => selectOption("due")}
              textAlign="left"
              cursor="pointer"
              display="flex"
              alignItems="flex-start"
              gap={STANDARD_SPACING.sm}
              borderRadius={STANDARD_RADIUS.xl}
              p={STANDARD_SPACING.sm}
              borderWidth="2px"
              borderColor={option === "due" ? BRAND_COLORS.primaryGreen : BRAND_COLORS.neutralBorder}
              bg={option === "due" ? BRAND_COLORS.successBg : BRAND_COLORS.white}
              boxShadow={STANDARD_SHADOWS.level1}
              transition="all 0.15s ease"
              _active={{ transform: "scale(0.99)" }}
            >
              <Flex
                flexShrink={0}
                boxSize="24px"
                mt="2px"
                borderRadius={STANDARD_RADIUS.full}
                borderWidth="2px"
                borderColor={option === "due" ? BRAND_COLORS.primaryGreen : "#CBD5E1"}
                bg={option === "due" ? BRAND_COLORS.primaryGreen : BRAND_COLORS.white}
                align="center"
                justify="center"
              >
                {option === "due" && <LuCheck size={13} color="#fff" strokeWidth={3.5} />}
              </Flex>
              <Box flex="1" minW={0}>
                <Text fontSize="12.5px" fontWeight="700" color={BRAND_COLORS.grey}>
                  Amount Due
                </Text>
                <Text
                  fontSize="22px"
                  fontWeight="800"
                  letterSpacing="-0.02em"
                  color={option === "due" ? BRAND_COLORS.primaryGreen : BRAND_COLORS.neutralText}
                  mt="2px"
                >
                  {peso(dueAmount)}
                </Text>
                <Text fontSize="11.5px" color={BRAND_COLORS.grey} fontWeight="600" mt="2px">
                  Due on {dueDateLabel} · {mode} billing amount
                </Text>
              </Box>
            </Box>

            <Box
              as="button"
              onClick={() => selectOption("full")}
              textAlign="left"
              cursor="pointer"
              display="flex"
              alignItems="flex-start"
              gap={STANDARD_SPACING.sm}
              borderRadius={STANDARD_RADIUS.xl}
              p={STANDARD_SPACING.sm}
              borderWidth="2px"
              borderColor={option === "full" ? BRAND_COLORS.primaryGreen : BRAND_COLORS.neutralBorder}
              bg={option === "full" ? BRAND_COLORS.successBg : BRAND_COLORS.white}
              boxShadow={STANDARD_SHADOWS.level1}
              transition="all 0.15s ease"
              _active={{ transform: "scale(0.99)" }}
            >
              <Flex
                flexShrink={0}
                boxSize="24px"
                mt="2px"
                borderRadius={STANDARD_RADIUS.full}
                borderWidth="2px"
                borderColor={option === "full" ? BRAND_COLORS.primaryGreen : "#CBD5E1"}
                bg={option === "full" ? BRAND_COLORS.primaryGreen : BRAND_COLORS.white}
                align="center"
                justify="center"
              >
                {option === "full" && <LuCheck size={13} color="#fff" strokeWidth={3.5} />}
              </Flex>
              <Box flex="1" minW={0}>
                <Text fontSize="12.5px" fontWeight="700" color={BRAND_COLORS.grey}>
                  Remaining Balance
                </Text>
                <Text
                  fontSize="22px"
                  fontWeight="800"
                  letterSpacing="-0.02em"
                  color={option === "full" ? BRAND_COLORS.primaryGreen : BRAND_COLORS.neutralText}
                  mt="2px"
                >
                  {peso(fullAmount)}
                </Text>
                <Text fontSize="11.5px" color={BRAND_COLORS.grey} fontWeight="500" mt="2px">
                  Pay off the remaining balance of the {planDescription} plan
                </Text>
              </Box>
            </Box>
          </VStack>
        </Page.Row>

        <Page.Row>
          <VStack
            align="stretch"
            gap={0}
            bg={BRAND_COLORS.white}
            borderWidth="1px"
            borderColor={BRAND_COLORS.neutralBorder}
            borderRadius={STANDARD_RADIUS.xl}
            boxShadow={STANDARD_SHADOWS.level1}
            overflow="hidden"
          >
            <Box p={STANDARD_SPACING.sm}>
              <Text fontSize="14.5px" fontWeight="800" color={BRAND_COLORS.neutralText}>
                Number of Installments
              </Text>
              <Text fontSize="12px" color={BRAND_COLORS.grey} fontWeight="500" mt="3px">
                Choose how many installments to cover.
              </Text>

              <HStack gap={STANDARD_SPACING.sm} mt={STANDARD_SPACING.sm}>
                <Flex
                  as="button"
                  boxSize="54px"
                  flexShrink={0}
                  borderRadius={STANDARD_RADIUS.lg}
                  align="center"
                  justify="center"
                  cursor={multiplier <= 1 ? "not-allowed" : "pointer"}
                  aria-disabled={multiplier <= 1}
                  borderWidth="1.6px"
                  borderColor={multiplier <= 1 ? BRAND_COLORS.mutedBg : BRAND_COLORS.primaryGreen}
                  bg={BRAND_COLORS.white}
                  color={multiplier <= 1 ? "#CBD5E1" : BRAND_COLORS.primaryGreen}
                  _active={{ transform: multiplier <= 1 ? undefined : "scale(0.94)" }}
                  onClick={() => multiplier > 1 && step(-1)}
                >
                  <LuMinus size={20} />
                </Flex>

                <Flex
                  flex="1"
                  h="54px"
                  borderRadius={STANDARD_RADIUS.lg}
                  borderWidth="1.6px"
                  borderColor={BRAND_COLORS.neutralBorder}
                  bg={BRAND_COLORS.subtleBg}
                  align="center"
                  justify="center"
                >
                  <Text fontSize="24px" fontWeight="800" color={BRAND_COLORS.neutralText}>
                    {multiplier}
                  </Text>
                </Flex>

                <Flex
                  as="button"
                  boxSize="54px"
                  flexShrink={0}
                  borderRadius={STANDARD_RADIUS.lg}
                  align="center"
                  justify="center"
                  cursor={multiplier >= maxMult ? "not-allowed" : "pointer"}
                  aria-disabled={multiplier >= maxMult}
                  bg={multiplier >= maxMult ? "#A7D9B8" : BRAND_COLORS.primaryGreen}
                  color="#fff"
                  boxShadow={multiplier >= maxMult ? undefined : STANDARD_SHADOWS.level2}
                  _active={{ transform: multiplier >= maxMult ? undefined : "scale(0.94)" }}
                  onClick={() => multiplier < maxMult && step(1)}
                >
                  <LuPlus size={20} />
                </Flex>
              </HStack>

              <Text fontSize="11.5px" color={BRAND_COLORS.grey} fontWeight="500" mt="9px" textAlign="center">
                Maximum {maxMult} {maxMult === 1 ? "installment" : "installments"} available for this option
              </Text>
            </Box>

            <Box
              bg="linear-gradient(150deg, #16A34A 0%, #12833D 100%)"
              p={STANDARD_SPACING.sm}
              position="relative"
              overflow="hidden"
            >
              <Flex align="center" justify="space-between" gap={STANDARD_SPACING.sm} position="relative">
                <Text
                  fontSize="12px"
                  fontWeight="700"
                  letterSpacing="0.05em"
                  textTransform="uppercase"
                  color="whiteAlpha.900"
                >
                  Amount to Generate QR
                </Text>
                <Text fontSize="26px" fontWeight="800" color="#fff" letterSpacing="-0.02em">
                  {peso(computedAmount)}
                </Text>
              </Flex>
              
            </Box>
          </VStack>
        </Page.Row>

        <Page.Row>
          <Flex
            as="button"
            w="full"
            h="54px"
            borderRadius={STANDARD_RADIUS.full}
            bg={BRAND_COLORS.primaryGreen}
            color="#fff"
            align="center"
            justify="center"
            gap="9px"
            fontWeight="700"
            fontSize="16.5px"
            cursor="pointer"
            boxShadow={STANDARD_SHADOWS.level3}
            _active={{ transform: "scale(0.98)" }}
            onClick={generate}
          >
            <TbQrcode size={20} />
            Generate QR
          </Flex>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
