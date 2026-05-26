"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";
import { Box, Button, HStack, Separator, Text } from "@chakra-ui/react";
import { ConfirmDialog } from "./ConfirmDialog";

interface BulkActionBarProps {
  count: number;
  onBulkApprove: () => Promise<void>;
  onBulkReject: () => Promise<void>;
  onClear: () => void;
}

const MotionBox = motion.create(Box);

export function BulkActionBar({
  count,
  onBulkApprove,
  onBulkReject,
  onClear,
}: BulkActionBarProps) {
  const [loading, setLoading] = React.useState<"approve" | "reject" | null>(
    null,
  );
  const [confirmAction, setConfirmAction] = React.useState<
    "approve" | "reject" | null
  >(null);

  const handleConfirm = async () => {
    if (!confirmAction) return;

    setLoading(confirmAction);
    try {
      if (confirmAction === "approve") await onBulkApprove();
      else await onBulkReject();
    } finally {
      setLoading(null);
      setConfirmAction(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {count > 0 && (
          <MotionBox
            position="fixed"
            bottom="8"
            left="50%"
            transform="translateX(-50%)"
            zIndex="50"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }} // ✅ FIXED (removed invalid ease array)
            px={4}
            py={2}
            rounded="full"
            bg="green.700"
            color="white"
            boxShadow="xl"
          >
            <HStack gap={4}>
              <Text fontSize="sm" fontWeight="medium">
                {count} selected
              </Text>

              <Separator orientation="vertical" height="4" />

              {/* Approve */}
              <Button
                size="xs"
                variant="subtle"
                colorPalette="green"
                onClick={() => setConfirmAction("approve")}
                disabled={loading !== null}
              >
                {loading === "approve" ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Check size={14} />
                )}
                Approve
              </Button>

              {/* Reject */}
              <Button
                size="xs"
                variant="subtle"
                colorPalette="red"
                onClick={() => setConfirmAction("reject")}
                disabled={loading !== null}
              >
                {loading === "reject" ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <X size={14} />
                )}
                Reject
              </Button>

              <Separator orientation="vertical" height="4" />

              {/* Clear */}
              <Button size="xs" variant="ghost" color="white" onClick={onClear}>
                Clear
              </Button>
            </HStack>
          </MotionBox>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmAction !== null}
        title={
          confirmAction === "approve"
            ? `Approve ${count} Requests`
            : `Reject ${count} Requests`
        }
        description={`Are you sure you want to ${confirmAction} ${count} selected request${count > 1 ? "s" : ""}?`}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
        loading={loading !== null}
        variant={confirmAction === "reject" ? "destructive" : "primary"}
      />
    </>
  );
}
