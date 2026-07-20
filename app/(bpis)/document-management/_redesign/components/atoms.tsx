"use client";

import * as React from "react";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import { AlertTriangle, BookOpen, Check, Hash } from "lucide-react";

import {
  type Agent,
  type DocumentRecord,
  type ExpiryState,
  booklets,
  expState,
  fmt,
  fmtDate,
} from "../data";
import { statusPalette, typePalette } from "../meta";

/* ----------------------------- Type / Status ----------------------------- */

export function TypeBadge({
  type,
  size = "sm",
}: {
  type: string;
  size?: "sm" | "md";
}) {
  return (
    <Badge
      colorPalette={typePalette(type)}
      variant="subtle"
      size={size}
      maxW="full"
      title={type}
    >
      <Text as="span" truncate>
        {type}
      </Text>
    </Badge>
  );
}

export function StatusChip({ status }: { status: string }) {
  const palette = statusPalette(status);
  return (
    <Badge
      colorPalette={palette}
      variant="subtle"
      flexShrink={0}
      borderRadius="full"
      px={2.5}
    >
      <Box
        as="span"
        w="7px"
        h="7px"
        borderRadius="full"
        bg="colorPalette.solid"
        mr={1.5}
        flexShrink={0}
      />
      {status}
    </Badge>
  );
}

/* --------------------------------- Agent --------------------------------- */

export function AgentAvatar({
  agent,
  size = 32,
}: {
  agent: Agent;
  size?: number;
}) {
  const initials = agent.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Box
      w={`${size}px`}
      h={`${size}px`}
      borderRadius="full"
      bg={"gray.400"}
      color="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize={`${Math.round(size * 0.38)}px`}
      fontWeight="600"
      flexShrink={0}
      letterSpacing="0.01em"
    >
      {initials || "?"}
    </Box>
  );
}

export function AgentInline({
  agent,
  size = 32,
}: {
  agent: Agent;
  size?: number;
}) {
  return (
    <HStack gap={2.5} align="center" minW={0}>
      <AgentAvatar agent={agent} size={size} />
      <Box minW={0} lineHeight="1.25">
        <Text fontSize="sm" fontWeight="600" color="fg" truncate>
          {agent.name}
        </Text>
        {agent.emp && (
          <Text fontSize="xs" color="fg.muted" fontFamily="mono">
            {agent.emp}
          </Text>
        )}
      </Box>
    </HStack>
  );
}

/* ------------------------------- Progress -------------------------------- */

export function ProgressMeter({
  remaining,
  total,
  active,
}: {
  remaining: number;
  total: number;
  active: boolean;
}) {
  const pct =
    total > 0
      ? Math.max(0, Math.min(100, Math.round((remaining / total) * 100)))
      : 0;
  return (
    <Box h="5px" borderRadius="full" bg="bg.muted" overflow="hidden" w="full">
      <Box
        h="full"
        w={`${pct}%`}
        borderRadius="full"
        bg={active ? "colorPalette.solid" : "gray.400"}
        transition="width .4s cubic-bezier(.4,0,.2,1)"
      />
    </Box>
  );
}

export function RemainingCell({ doc }: { doc: DocumentRecord }) {
  return (
    <VStack align="stretch" gap={1.5} minW="130px">
      <HStack align="baseline" gap={1}>
        <Text fontSize="sm" fontWeight="700" fontFamily="mono" color="fg">
          {fmt(doc.remaining)}
        </Text>
        <Text fontSize="xs" color="fg.muted">
          / {fmt(doc.assignedQty)}
        </Text>
      </HStack>
      <ProgressMeter
        remaining={doc.remaining}
        total={doc.assignedQty}
        active={
          doc.status === "Assigned" || doc.status === "Partially Assigned"
        }
      />
    </VStack>
  );
}

/* -------------------------------- Series --------------------------------- */

export function SeriesRange({ doc }: { doc: DocumentRecord }) {
  const isBooklet = doc.unit === "Booklets";
  return (
    <VStack align="start" gap={0.5}>
      <Text fontSize="sm" fontFamily="mono" color="fg" whiteSpace="nowrap">
        {doc.s} – {doc.e}
      </Text>
      <Badge
        size="xs"
        variant="subtle"
        colorPalette={isBooklet ? "blue" : "gray"}
        borderRadius="md"
      >
        <Box as="span" mr={1} display="inline-flex">
          {isBooklet ? <BookOpen size={11} /> : <Hash size={11} />}
        </Box>
        {isBooklet
          ? `${booklets(doc.assignedQty, doc.bookletSize)} booklets`
          : "Pieces"}
      </Badge>
    </VStack>
  );
}

/* -------------------------------- Expiry --------------------------------- */

const EXPIRY_COLOR: Record<ExpiryState, string> = {
  ok: "fg",
  near: "orange.600",
  expired: "red.600",
};

export function ExpiryText({ date }: { date: string }) {
  const state = expState(date);
  return (
    <HStack gap={1.5} whiteSpace="nowrap">
      {state !== "ok" && (
        <Box
          as="span"
          color={state === "expired" ? "red.500" : "orange.400"}
          display="inline-flex"
        >
          <AlertTriangle size={14} />
        </Box>
      )}
      <Text
        fontSize="sm"
        color={EXPIRY_COLOR[state]}
        fontWeight={state === "ok" ? "medium" : "600"}
      >
        {fmtDate(date)}
      </Text>
    </HStack>
  );
}

/* ---------------------------- Workflow helpers --------------------------- */

export function RadioCard({
  selected,
  onClick,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc?: string;
}) {
  return (
    <Box
      as="button"
      textAlign="left"
      w="full"
      display="flex"
      gap={3}
      alignItems="flex-start"
      p={4}
      borderRadius="xl"
      borderWidth="1.5px"
      borderColor={selected ? "colorPalette.solid" : "border"}
      bg={selected ? "colorPalette.subtle" : "bg"}
      cursor="pointer"
      transition="all .15s"
      _hover={selected ? undefined : { borderColor: "border.emphasized" }}
      onClick={onClick}
    >
      <Box
        w="20px"
        h="20px"
        borderRadius="full"
        borderWidth="2px"
        borderColor={selected ? "colorPalette.solid" : "border.emphasized"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
        mt="1px"
      >
        {selected && (
          <Box w="10px" h="10px" borderRadius="full" bg="colorPalette.solid" />
        )}
      </Box>
      <Box>
        <Text fontSize="sm" fontWeight="600" color="fg">
          {title}
        </Text>
        {desc && (
          <Text fontSize="xs" color="fg.muted" mt={0.5} lineHeight="1.45">
            {desc}
          </Text>
        )}
      </Box>
    </Box>
  );
}

export function CalcBox({
  label,
  value,
  tone = "fg",
  ok,
}: {
  label: string;
  value: React.ReactNode;
  tone?: string;
  ok?: boolean;
}) {
  return (
    <Box
      p={3}
      bg="bg"
      borderWidth="1px"
      borderColor="border.muted"
      borderRadius="lg"
    >
      <Text
        fontSize="10px"
        fontWeight="600"
        color="fg.muted"
        textTransform="uppercase"
        letterSpacing="0.03em"
        mb={1.5}
      >
        {label}
      </Text>
      <HStack
        gap={1}
        fontFamily="mono"
        fontWeight="700"
        fontSize="md"
        color={tone}
      >
        {ok && (
          <Box as="span" color="green.600" display="inline-flex">
            <Check size={15} />
          </Box>
        )}
        <Text>{value}</Text>
      </HStack>
    </Box>
  );
}

export function ReviewRow({
  label,
  value,
  last,
}: {
  label: string;
  value: React.ReactNode;
  last?: boolean;
}) {
  return (
    <HStack
      justify="space-between"
      align="center"
      px={4}
      py={3}
      borderBottomWidth={last ? "0" : "1px"}
      borderColor="border.muted"
    >
      <Text fontSize="xs" color="fg.muted" fontWeight="medium">
        {label}
      </Text>
      <Box fontSize="sm" color="fg" textAlign="right">
        {value}
      </Box>
    </HStack>
  );
}

/** Horizontal series-range bar used in the reassign preview. */
export function SeriesBar({
  label,
  s,
  e,
  domainS,
  domainE,
  muted,
}: {
  label: string;
  s: number;
  e: number;
  domainS: number;
  domainE: number;
  muted?: boolean;
}) {
  const span = domainE - domainS || 1;
  const left = ((s - domainS) / span) * 100;
  const width = ((e - s + 1) / span) * 100;

  return (
    <Box mb={3}>
      <HStack justify="space-between" mb={1.5}>
        <Text fontSize="xs" fontWeight="600" color="fg.muted">
          {label}
        </Text>
        <Text fontSize="xs" fontFamily="mono" color="fg.muted">
          {s} – {e} ({fmt(e - s + 1)})
        </Text>
      </HStack>
      <Box
        position="relative"
        h="14px"
        borderRadius="full"
        bg="bg.muted"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top={0}
          bottom={0}
          left={`${Math.max(0, left)}%`}
          w={`${Math.min(100, width)}%`}
          borderRadius="full"
          bg={muted ? "gray.400" : "colorPalette.solid"}
        />
      </Box>
    </Box>
  );
}
