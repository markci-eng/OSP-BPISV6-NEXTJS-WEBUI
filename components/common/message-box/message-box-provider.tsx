"use client";

import React, { createContext, useContext, useRef, useState } from "react";
import MessageDialog from "@/components/common/message-box/message-box";

type DialogVariant =
  | "information"
  | "error"
  | "warning"
  | "success"
  | "confirmation";

type DialogOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  showCancel?: boolean;
};

type DialogContextType = {
  messageBox: (options: DialogOptions) => Promise<boolean>;
};

const MessageDialogContext = createContext<DialogContextType | null>(null);

export const useMessageDialog = () => {
  const ctx = useContext(MessageDialogContext);
  if (!ctx) throw new Error("useMessageDialog must be used within Provider");
  return ctx;
};

export function MessageDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions>({});

  // ✅ resolver for Promise
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const messageBox = (opts: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setOptions(opts);
      setOpen(true);
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <MessageDialogContext.Provider value={{ messageBox }}>
      {children}

      <MessageDialog
        open={open}
        onOpenChange={(isOpen) => {
          // 🔥 Handle ESC / outside click
          if (!isOpen) {
            resolverRef.current?.(false);
            resolverRef.current = null;
          }
          setOpen(isOpen);
        }}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        showCancel={options.showCancel}
        onConfirm={() => {
          resolverRef.current?.(true);
          resolverRef.current = null;
          handleClose();
        }}
        onCancel={() => {
          resolverRef.current?.(false);
          resolverRef.current = null;
          handleClose();
        }}
      />
    </MessageDialogContext.Provider>
  );
}
