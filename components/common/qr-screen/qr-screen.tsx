"use client";

import { useRef } from "react";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { LuDownload, LuShare2 } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
  STANDARD_SPACING,
} from "@/lib/theme/standard-design-tokens";
import Page from "@/claude components/layout/page/Page";

const peso = (amount: number) =>
  "₱" + Math.round(amount).toLocaleString("en-PH");

type QrScreenBaseProps = {
  pageTitle: string;
  pageSubtitle?: string;
  qrValue: string;
  downloadFileName?: string;
  centerImage?: string;
  infoCardLabel1?: string;
  infoCardValue1: string;
  infoCardLabel2?: string;
  infoCardValue2: string;
};

export type QrScreenProps =
  | (QrScreenBaseProps & { variant: "with-amount"; amount: number })
  | (QrScreenBaseProps & { variant: "without-amount" });

export default function QrScreen(props: QrScreenProps) {
  const {
    pageTitle,
    pageSubtitle,
    qrValue,
    downloadFileName = "payment-qr",
    centerImage = "/images/QR_Ph_Logo.png",
    infoCardLabel1 = "Planholder",
    infoCardValue1,
    infoCardLabel2 = "LPA Number",
    infoCardValue2,
  } = props;

  const qrDownloadRef = useRef<HTMLCanvasElement>(null);

  const downloadQr = () => {
    const canvas = qrDownloadRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${downloadFileName}.png`;
    link.click();

    toast.success("QR code saved to your device");
  };

  return (
    <Page.Root title={pageTitle} description={pageSubtitle ?? ""}>
      <Page.MainContent maxW="560px" mx="auto">
        <Page.Row>
          <VStack
            gap={STANDARD_SPACING.md}
            bg={BRAND_COLORS.white}
            borderWidth="1px"
            borderColor={BRAND_COLORS.neutralBorder}
            borderRadius={STANDARD_RADIUS.xl}
            boxShadow={STANDARD_SHADOWS.level2}
            p={STANDARD_SPACING.md}
          >
            <Flex
              p={STANDARD_SPACING.sm}
              borderWidth="1px"
              borderColor={BRAND_COLORS.neutralBorder}
              borderRadius={STANDARD_RADIUS.lg}
            >
              <QRCodeSVG
                value={qrValue}
                size={180}
                bgColor="#ffffff"
                fgColor="#0F172A"
                level="H"
                imageSettings={{
                  src: centerImage,
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />
            </Flex>

            <QRCodeCanvas
              ref={qrDownloadRef}
              value={qrValue}
              size={512}
              bgColor="#ffffff"
              fgColor="#0F172A"
              level="H"
              imageSettings={{
                src: centerImage,
                height: 102,
                width: 102,
                excavate: true,
              }}
              style={{ display: "none" }}
            />

            {props.variant === "with-amount" && (
              <VStack gap="2px">
                <Text
                  fontSize="11px"
                  fontWeight="700"
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                  color={BRAND_COLORS.grey}
                >
                  Amount
                </Text>
                <Text fontSize="30px" fontWeight="800" color={BRAND_COLORS.primaryGreen} letterSpacing="-0.02em">
                  {peso(props.amount)}
                </Text>
              </VStack>
            )}

            <HStack w="full" gap={STANDARD_SPACING.sm}>
              <Box flex="1" bg={BRAND_COLORS.subtleBg} borderRadius={STANDARD_RADIUS.lg} p={STANDARD_SPACING.sm}>
                <Text fontSize="11px" fontWeight="700" letterSpacing="0.04em" textTransform="uppercase" color={BRAND_COLORS.grey}>
                  {infoCardLabel1}
                </Text>
                <Text fontSize="14px" fontWeight="700" color={BRAND_COLORS.neutralText} mt="3px">
                  {infoCardValue1}
                </Text>
              </Box>
              <Box flex="1" bg={BRAND_COLORS.subtleBg} borderRadius={STANDARD_RADIUS.lg} p={STANDARD_SPACING.sm}>
                <Text fontSize="11px" fontWeight="700" letterSpacing="0.04em" textTransform="uppercase" color={BRAND_COLORS.grey}>
                  {infoCardLabel2}
                </Text>
                <Text fontSize="14px" fontWeight="700" color={BRAND_COLORS.neutralText} mt="3px">
                  {infoCardValue2}
                </Text>
              </Box>
            </HStack>
          </VStack>
        </Page.Row>

        <Page.Row>
          <HStack gap={STANDARD_SPACING.sm}>
            <Flex
              flex="1"
              as="button"
              h="54px"
              borderRadius={STANDARD_RADIUS.full}
              borderWidth="1.6px"
              borderColor={BRAND_COLORS.primaryGreen}
              bg={BRAND_COLORS.white}
              color={BRAND_COLORS.primaryGreen}
              align="center"
              justify="center"
              gap="8px"
              fontWeight="700"
              fontSize="15px"
              cursor="pointer"
              _active={{ transform: "scale(0.98)" }}
              onClick={downloadQr}
            >
              <LuDownload size={18} />
              Download QR
            </Flex>
            <Flex
              flex="1"
              as="button"
              h="54px"
              borderRadius={STANDARD_RADIUS.full}
              bg={BRAND_COLORS.primaryGreen}
              color="#fff"
              align="center"
              justify="center"
              gap="8px"
              fontWeight="700"
              fontSize="15px"
              cursor="pointer"
              boxShadow={STANDARD_SHADOWS.level2}
              _active={{ transform: "scale(0.98)" }}
              onClick={() => toast.info("Sharing QR code…")}
            >
              <LuShare2 size={18} />
              Share QR
            </Flex>
          </HStack>
        </Page.Row>
      </Page.MainContent>
    </Page.Root>
  );
}
