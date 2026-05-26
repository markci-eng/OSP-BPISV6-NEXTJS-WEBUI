"use client";

import * as React from "react";
import {
  Badge,
  Box,
  Button,
  CloseButton,
  // Drawer,
  HStack,
  Icon,
  Portal,
  Separator,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { Clock, Loader2, Paperclip } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { StatusBadge } from "./StatusBadge";

import Drawer from "@/components/drawers/Drawer";

interface AuditEntry {
  actor: string;
  action: string;
  date: string;
  remarks?: string;
}

interface Attachment {
  name: string;
  size: string;
}

export interface DrawerSections {
  requestId: string;
  status: string;
  moduleType: string;
  summary: { label: string; value: string }[];
  dynamicContent?: React.ReactNode;
  attachments?: Attachment[];
  auditTrail?: AuditEntry[];
}

interface ApprovalDrawerProps<T> {
  row: T | null;
  onClose: () => void;
  onApprove: (row: T, remarks: string) => Promise<void>;
  onReject: (row: T, remarks: string) => Promise<void>;
  renderContent: (row: T) => DrawerSections;
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      rounded="xl"
      borderWidth="1px"
      borderColor="border.muted"
      bg="bg"
      p={4}
      boxShadow="sm"
    >
      <Text
        fontSize="xs"
        fontWeight="semibold"
        color="fg.muted"
        textTransform="uppercase"
        letterSpacing="wider"
        mb={3}
      >
        {title}
      </Text>
      {children}
    </Box>
  );
}

export function ApprovalDrawer<T>({
  row,
  onClose,
  onApprove,
  onReject,
  renderContent,
}: ApprovalDrawerProps<T>) {
  const [loading, setLoading] = React.useState<"approve" | "reject" | null>(
    null,
  );
  const [confirmAction, setConfirmAction] = React.useState<
    "approve" | "reject" | null
  >(null);
  const [remarks, setRemarks] = React.useState("");

  React.useEffect(() => {
    setLoading(null);
    setConfirmAction(null);
    setRemarks("");
  }, [row]);

  const sections = React.useMemo(
    () => (row ? renderContent(row) : null),
    [row, renderContent],
  );

  const handleConfirm = async () => {
    if (!row || !confirmAction) return;

    setLoading(confirmAction);
    try {
      if (confirmAction === "approve") {
        await onApprove(row, remarks);
      } else {
        await onReject(row, remarks);
      }
      setRemarks("");
      onClose();
    } finally {
      setLoading(null);
      setConfirmAction(null);
    }
  };

  return (
    <>
      {/* <Drawer.Root
        open={!!row}
        onOpenChange={(details) => {
          if (!details.open) onClose();
        }}
        placement="end"
        size={{ base: "full", md: "md" }}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header
                px={6}
                py={4}
                borderBottomWidth="1px"
                borderColor="border.muted"
                bg="bg"
              >
                <HStack
                  justify="space-between"
                  w="full"
                  gap={3}
                  alignItems={"center"}
                >
                  <HStack gap={3} minW="0">
                    <Drawer.Title asChild>
                      <Text
                        fontWeight="semibold"
                        fontSize="md"
                        color="fg"
                        truncate
                      >
                        {sections?.requestId ?? "Details"}
                      </Text>
                    </Drawer.Title>

                    {sections?.status ? (
                      <StatusBadge status={sections.status} />
                    ) : null}
                  </HStack>

                  <Drawer.CloseTrigger asChild>
                    <CloseButton />
                  </Drawer.CloseTrigger>
                </HStack>
              </Drawer.Header>

              <Drawer.Body px={6} py={5}>
                {sections ? (
                  <VStack align="stretch" gap={5}>
                    <Text
                      fontSize="xs"
                      fontWeight="medium"
                      color="fg.muted"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      {sections.moduleType}
                    </Text>

                    <SectionCard title="Request Summary">
                      <Box
                        display="grid"
                        gridTemplateColumns={{
                          base: "1fr",
                          sm: "repeat(2, 1fr)",
                        }}
                        gap={3}
                      >
                        {sections.summary.map((item) => (
                          <Box key={item.label}>
                            <Text fontSize="11px" color="fg.muted" mb="0.5">
                              {item.label}
                            </Text>
                            <Text fontSize="sm" fontWeight="medium" color="fg">
                              {item.value}
                            </Text>
                          </Box>
                        ))}
                      </Box>
                    </SectionCard>

                    {sections.dynamicContent ? (
                      <SectionCard title="Details">
                        {sections.dynamicContent}
                      </SectionCard>
                    ) : null}

                    {sections.attachments && sections.attachments.length > 0 ? (
                      <SectionCard title="Attachments">
                        <VStack align="stretch" gap={2}>
                          {sections.attachments.map((file) => (
                            <HStack
                              key={`${file.name}-${file.size}`}
                              gap={3}
                              p={2.5}
                              rounded="lg"
                              bg="bg.muted"
                              _hover={{ bg: "bg.emphasized" }}
                              cursor="pointer"
                            >
                              <Icon
                                as={Paperclip}
                                boxSize={4}
                                color="fg.muted"
                                flexShrink={0}
                              />
                              <Text
                                fontSize="sm"
                                fontWeight="medium"
                                color="fg"
                                truncate
                                flex="1"
                              >
                                {file.name}
                              </Text>
                              <Text fontSize="xs" color="fg.muted">
                                {file.size}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                      </SectionCard>
                    ) : null}

                    {sections.auditTrail && sections.auditTrail.length > 0 ? (
                      <SectionCard title="Audit Trail">
                        <Box position="relative" pl={5}>
                          <Box
                            position="absolute"
                            left="7px"
                            top="4px"
                            bottom="4px"
                            w="1px"
                            bg="border.muted"
                          />
                          <VStack align="stretch" gap={0}>
                            {sections.auditTrail.map((entry, i) => (
                              <Box
                                key={`${entry.actor}-${entry.date}-${i}`}
                                position="relative"
                                pb={
                                  i === sections.auditTrail!.length - 1 ? 0 : 4
                                }
                              >
                                <Box
                                  position="absolute"
                                  left="-13px"
                                  top="6px"
                                  h="2"
                                  w="2"
                                  rounded="full"
                                  bg="blue.solid"
                                  borderWidth="2px"
                                  borderColor="bg"
                                />
                                <Box>
                                  <HStack gap={2} align="center">
                                    <Text
                                      fontSize="sm"
                                      fontWeight="medium"
                                      color="fg"
                                    >
                                      {entry.actor}
                                    </Text>
                                    <Text fontSize="sm" color="fg.muted">
                                      ·
                                    </Text>
                                    <Text fontSize="sm" color="fg.muted">
                                      {entry.action}
                                    </Text>
                                  </HStack>

                                  <HStack gap={1} mt="0.5" color="fg.muted">
                                    <Icon as={Clock} boxSize={3} />
                                    <Text fontSize="xs">{entry.date}</Text>
                                  </HStack>

                                  {entry.remarks ? (
                                    <Text
                                      mt={1}
                                      fontSize="xs"
                                      color="fg.muted"
                                      fontStyle="italic"
                                    >
                                      "{entry.remarks}"
                                    </Text>
                                  ) : null}
                                </Box>
                              </Box>
                            ))}
                          </VStack>
                        </Box>
                      </SectionCard>
                    ) : null}
                  </VStack>
                ) : null}
              </Drawer.Body>

              <Drawer.Footer
                px={5}
                py={5}
                borderTopWidth="1px"
                borderColor="border.muted"
                bg="bg"
              >
                <VStack w="full" align="stretch" gap={3}>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add remarks (optional)..."
                    minH="72px"
                    resize="vertical"
                  />

                  <HStack gap={3}>
                    <Button
                      flex="1"
                      variant="outline"
                      colorPalette="red"
                      onClick={() => setConfirmAction("reject")}
                      disabled={!row || loading !== null}
                    >
                      {loading === "reject" ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        "Reject"
                      )}
                    </Button>

                    <Button
                      flex="1"
                      colorPalette="blue"
                      onClick={() => setConfirmAction("approve")}
                      disabled={!row || loading !== null}
                    >
                      {loading === "approve" ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        "Approve"
                      )}
                    </Button>
                  </HStack>
                </VStack>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root> */}
      <Drawer
        title={sections?.requestId ?? "Details"}
        open={!!row}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        {sections ? (
          <VStack align="stretch" gap={5}>
            <Text
              fontSize="xs"
              fontWeight="medium"
              color="fg.muted"
              textTransform="uppercase"
              letterSpacing="wider"
              mt={3}
            >
              {sections.moduleType}
            </Text>
            <SectionCard title="Request Summary">
              <Box
                display="grid"
                gridTemplateColumns={{
                  base: "1fr",
                  sm: "repeat(2, 1fr)",
                }}
                gap={3}
              >
                {sections.summary.map((item) => (
                  <Box key={item.label}>
                    <Text fontSize="11px" color="fg.muted" mb="0.5">
                      {item.label}
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="fg">
                      {item.value}
                    </Text>
                  </Box>
                ))}
              </Box>
            </SectionCard>

            {sections.dynamicContent ? (
              <SectionCard title="Details">
                {sections.dynamicContent}
              </SectionCard>
            ) : null}
            {sections.attachments && sections.attachments.length > 0 ? (
              <SectionCard title="Attachments">
                <VStack align="stretch" gap={2}>
                  {sections.attachments.map((file) => (
                    <HStack
                      key={`${file.name}-${file.size}`}
                      gap={3}
                      p={2.5}
                      rounded="lg"
                      bg="bg.muted"
                      _hover={{ bg: "bg.emphasized" }}
                      cursor="pointer"
                    >
                      <Icon
                        as={Paperclip}
                        boxSize={4}
                        color="fg.muted"
                        flexShrink={0}
                      />
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="fg"
                        truncate
                        flex="1"
                      >
                        {file.name}
                      </Text>
                      <Text fontSize="xs" color="fg.muted">
                        {file.size}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </SectionCard>
            ) : null}
            {sections.auditTrail && sections.auditTrail.length > 0 ? (
              <SectionCard title="Audit Trail">
                <Box position="relative" pl={5}>
                  <Box
                    position="absolute"
                    left="7px"
                    top="4px"
                    bottom="4px"
                    w="1px"
                    bg="border.muted"
                  />
                  <VStack align="stretch" gap={0}>
                    {sections.auditTrail.map((entry, i) => (
                      <Box
                        key={`${entry.actor}-${entry.date}-${i}`}
                        position="relative"
                        pb={i === sections.auditTrail!.length - 1 ? 0 : 4}
                      >
                        <Box
                          position="absolute"
                          left="-13px"
                          top="6px"
                          h="2"
                          w="2"
                          rounded="full"
                          bg="blue.solid"
                          borderWidth="2px"
                          borderColor="bg"
                        />
                        <Box>
                          <HStack gap={2} align="center">
                            <Text fontSize="sm" fontWeight="medium" color="fg">
                              {entry.actor}
                            </Text>
                            <Text fontSize="sm" color="fg.muted">
                              ·
                            </Text>
                            <Text fontSize="sm" color="fg.muted">
                              {entry.action}
                            </Text>
                          </HStack>
                          <HStack gap={1} mt="0.5" color="fg.muted">
                            <Icon as={Clock} boxSize={3} />
                            <Text fontSize="xs">{entry.date}</Text>
                          </HStack>
                          {entry.remarks ? (
                            <Text
                              mt={1}
                              fontSize="xs"
                              color="fg.muted"
                              fontStyle="italic"
                            >
                              "{entry.remarks}"
                            </Text>
                          ) : null}
                        </Box>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </SectionCard>
            ) : null}
            <HStack gap={3}>
              <Button
                flex="1"
                variant="outline"
                colorPalette="red"
                onClick={() => setConfirmAction("reject")}
                disabled={!row || loading !== null}
              >
                {loading === "reject" ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Reject"
                )}
              </Button>
              <Button
                flex="1"
                colorPalette="blue"
                onClick={() => setConfirmAction("approve")}
                disabled={!row || loading !== null}
              >
                {loading === "approve" ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Approve"
                )}
              </Button>
            </HStack>
          </VStack>
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={confirmAction !== null}
        title={
          confirmAction === "approve" ? "Approve Request" : "Reject Request"
        }
        description={`Are you sure you want to ${confirmAction} ${sections?.requestId ?? "this request"}?`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
        loading={loading !== null}
        variant={confirmAction === "reject" ? "destructive" : "primary"}
      />
    </>
  );
}
