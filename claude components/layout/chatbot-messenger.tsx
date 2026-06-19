"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Drawer,
  Portal,
  HStack,
  VStack,
  Flex,
  CloseButton,
  Text,
  Input,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import { LuSend } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import {
  STANDARD_RADIUS,
  STANDARD_SHADOWS,
  STANDARD_SPACING,
} from "@/lib/theme/standard-design-tokens";

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  id: number;
  role: "bot" | "user";
  text: string;
  time: string;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    role: "bot",
    text: "Hello! I'm your St. Peter Customer Service Team. How can I help you today?",
    time: "9:00 AM",
  },
  {
    id: 2,
    role: "user",
    text: "How do I process a claim application?",
    time: "9:01 AM",
  },
  {
    id: 3,
    role: "bot",
    text: "Navigate to Claims › Claim Application from the sidebar. Fill in the policy details and claimant information, then submit for review.",
    time: "9:01 AM",
  },
  {
    id: 4,
    role: "user",
    text: "What documents are required for a death claim?",
    time: "9:02 AM",
  },
  {
    id: 5,
    role: "bot",
    text: "For a standard death claim you'll need: Death Certificate, Policy document, Claimant ID, and a completed claim form. Originals or certified true copies are required.",
    time: "9:02 AM",
  },
];

function nowTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const SHEET_BG = BRAND_COLORS.white;
const DRAG_COLOR = BRAND_COLORS.neutralBorder;
const TITLE_COLOR = BRAND_COLORS.neutralText;
const STATUS_COLOR = BRAND_COLORS.grey;

// ─── Bot avatar ───────────────────────────────────────────────────────────────

function BotAvatar({ size = 36 }: { size?: number }) {
  return (
    <Flex
      w={`${size}px`}
      h={`${size}px`}
      borderRadius={STANDARD_RADIUS.full}
      bg="linear-gradient(135deg, #006838 0%, #109448 100%)"
      align="center"
      justify="center"
      flexShrink={0}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 22 22"
        fill="none"
      >
        <rect
          x="3"
          y="6"
          width="16"
          height="13"
          rx="4"
          fill="white"
          fillOpacity="0.9"
        />
        <rect x="6" y="9" width="10" height="7" rx="2" fill="#0f172a" />
        <circle cx="9" cy="12" r="1.4" fill="#00d4aa" />
        <circle cx="13" cy="12" r="1.4" fill="#00d4aa" />
        <path
          d="M8 15.5 Q11 17.5 14 15.5"
          stroke="#00d4aa"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
        <line
          x1="11"
          y1="6"
          x2="11"
          y2="3.5"
          stroke="#94a3b8"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <circle cx="11" cy="2.8" r="1.2" fill="#00d4aa" />
      </svg>
    </Flex>
  );
}

// ─── Message bubbles ──────────────────────────────────────────────────────────

const UserBubble = React.memo(({ msg }: { msg: Message }) => (
  <Flex justify="flex-end">
    <Box maxW="78%">
      <Box
        bg={BRAND_COLORS.darkGreen}
        color={BRAND_COLORS.white}
        px="12px"
        py="8px"
        borderRadius={`${STANDARD_RADIUS.lg} ${STANDARD_RADIUS.lg} 4px ${STANDARD_RADIUS.lg}`}
        fontSize="14px"
        lineHeight="1.45"
        boxShadow={STANDARD_SHADOWS.level1}
      >
        {msg.text}
      </Box>
      <Text
        fontSize="10px"
        color={BRAND_COLORS.grey}
        textAlign="end"
        mt="2px"
      >
        {msg.time}
      </Text>
    </Box>
  </Flex>
));
UserBubble.displayName = "UserBubble";

const BotBubble = React.memo(({ msg }: { msg: Message }) => (
  <HStack align="flex-end" gap="6px">
    <BotAvatar size={28} />
    <Box maxW="78%">
      <Box
        bg={BRAND_COLORS.subtleBg}
        color={BRAND_COLORS.neutralText}
        px="12px"
        py="8px"
        borderRadius={`${STANDARD_RADIUS.lg} ${STANDARD_RADIUS.lg} ${STANDARD_RADIUS.lg} 4px`}
        fontSize="14px"
        lineHeight="1.45"
        borderWidth="1px"
        borderColor={BRAND_COLORS.neutralBorder}
        boxShadow={STANDARD_SHADOWS.level1}
      >
        {msg.text}
      </Box>
      <Text fontSize="10px" color={BRAND_COLORS.grey} ml="4px" mt="2px">
        {msg.time}
      </Text>
    </Box>
  </HStack>
));
BotBubble.displayName = "BotBubble";

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <HStack align="flex-end" gap="6px">
      <style>{`
        @keyframes osp-typing-dot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        .osp-typing-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${BRAND_COLORS.grey};
          display: inline-block;
        }
        .osp-typing-dot:nth-child(1) { animation: osp-typing-dot 1.2s 0.0s infinite; }
        .osp-typing-dot:nth-child(2) { animation: osp-typing-dot 1.2s 0.2s infinite; }
        .osp-typing-dot:nth-child(3) { animation: osp-typing-dot 1.2s 0.4s infinite; }
      `}</style>
      <BotAvatar size={28} />
      <Box
        bg={BRAND_COLORS.subtleBg}
        px="12px"
        py="10px"
        borderRadius={`${STANDARD_RADIUS.lg} ${STANDARD_RADIUS.lg} ${STANDARD_RADIUS.lg} 4px`}
        borderWidth="1px"
        borderColor={BRAND_COLORS.neutralBorder}
        boxShadow={STANDARD_SHADOWS.level1}
      >
        <HStack gap="3px">
          <span className="osp-typing-dot" />
          <span className="osp-typing-dot" />
          <span className="osp-typing-dot" />
        </HStack>
      </Box>
    </HStack>
  );
}

// ─── ChatbotMessenger ─────────────────────────────────────────────────────────

export type ChatbotMessengerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ChatbotMessenger = ({
  open,
  onOpenChange,
}: ChatbotMessengerProps) => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(MOCK_MESSAGES.length + 1);

  useEffect(() => {
    if (open) {
      const t = setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "instant" }),
        80,
      );
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || typing) return;
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role: "user", text, time: nowTime() },
    ]);
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "bot",
          text: "I've noted your question. For detailed assistance, please contact your branch administrator or refer to the OSP operations manual.",
          time: nowTime(),
        },
      ]);
    }, 1600);
  };

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="bottom"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            borderTopRadius="16px"
            borderBottomRadius="0"
            bg={SHEET_BG}
            maxW="480px"
            mx="auto"
            boxShadow={STANDARD_SHADOWS.level4}
            overflow="hidden"
            style={{ height: "72dvh" }}
          >
            <Flex direction="column" h="100%">
              {/* Drag handle */}
              <Flex justify="center" pt="10px" pb="4px" flexShrink={0}>
                <Box
                  w="36px"
                  h="4px"
                  borderRadius={STANDARD_RADIUS.full}
                  bg={DRAG_COLOR}
                />
              </Flex>

              {/* Header */}
              <Drawer.Header
                px={STANDARD_SPACING.sm}
                pt="8px"
                pb="12px"
                borderBottomWidth="1px"
                borderColor={BRAND_COLORS.neutralBorder}
              >
                <Flex align="center" justify="space-between" gap="12px">
                  <HStack gap="10px" flex="1" minW={0}>
                    <BotAvatar size={38} />
                    <Box>
                      <Drawer.Title
                        fontSize="16px"
                        fontWeight="700"
                        color={TITLE_COLOR}
                        lineHeight="1.25"
                      >
                        St. Peter Customer Service Team
                      </Drawer.Title>
                      <HStack gap="5px" mt="2px">
                        <Box
                          w="7px"
                          h="7px"
                          borderRadius={STANDARD_RADIUS.full}
                          bg={BRAND_COLORS.primaryGreen}
                        />
                        <Text
                          fontSize="11px"
                          color={STATUS_COLOR}
                          lineHeight="1"
                        >
                          Online
                        </Text>
                      </HStack>
                    </Box>
                  </HStack>
                  <Drawer.CloseTrigger asChild flexShrink={0}>
                    <CloseButton
                      size="sm"
                      color={BRAND_COLORS.neutralText}
                      borderRadius={STANDARD_RADIUS.full}
                      _hover={{ bg: BRAND_COLORS.mutedBg }}
                    />
                  </Drawer.CloseTrigger>
                </Flex>
              </Drawer.Header>

              {/* Messages */}
              <Box
                flex="1"
                overflowY="auto"
                px={STANDARD_SPACING.sm}
                py={STANDARD_SPACING.xs}
              >
                <VStack gap="8px" align="stretch">
                  {messages.map((msg) =>
                    msg.role === "user" ? (
                      <UserBubble key={msg.id} msg={msg} />
                    ) : (
                      <BotBubble key={msg.id} msg={msg} />
                    ),
                  )}
                  {typing && <TypingIndicator />}
                  <div ref={bottomRef} />
                </VStack>
              </Box>

              {/* Input row */}
              <Box
                px={STANDARD_SPACING.sm}
                py={STANDARD_SPACING.xs}
                pb={`calc(${STANDARD_SPACING.xs} + env(safe-area-inset-bottom))`}
                borderTopWidth="1px"
                borderColor={BRAND_COLORS.neutralBorder}
                bg={BRAND_COLORS.subtleBg}
                flexShrink={0}
              >
                <HStack gap="8px">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                    placeholder="Type a message…"
                    size="sm"
                    borderRadius={STANDARD_RADIUS.full}
                    borderColor={BRAND_COLORS.neutralBorder}
                    bg={BRAND_COLORS.white}
                    fontSize="14px"
                    _placeholder={{ color: BRAND_COLORS.grey }}
                    _focus={{
                      borderColor: BRAND_COLORS.primaryGreen,
                      boxShadow: `0 0 0 1px ${BRAND_COLORS.primaryGreen}`,
                    }}
                    flex="1"
                  />
                  <IconButton
                    aria-label="Send message"
                    size="sm"
                    borderRadius={STANDARD_RADIUS.full}
                    bg={BRAND_COLORS.primaryGreen}
                    color={BRAND_COLORS.white}
                    _hover={{ bg: BRAND_COLORS.darkGreen }}
                    _active={{
                      bg: BRAND_COLORS.darkGreen,
                      transform: "scale(0.95)",
                    }}
                    onClick={handleSend}
                    disabled={!draft.trim() || typing}
                  >
                    <Icon as={LuSend} boxSize="14px" />
                  </IconButton>
                </HStack>
              </Box>
            </Flex>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default ChatbotMessenger;
