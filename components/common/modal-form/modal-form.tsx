"use client";

import * as React from "react";
import {
  Dialog,
  Separator,
  Box,
  Grid,
  Text,
  Heading,
  Stack,
  Button,
} from "@chakra-ui/react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ModalFormProps = {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Customize the confirmation dialog. Set to false to disable confirmation entirely. */
  confirmation?:
    | true
    | false
    | {
        title?: React.ReactNode;
        description?: React.ReactNode;
        confirmLabel?: React.ReactNode;
        cancelLabel?: React.ReactNode;
      };
};

// ---------------------------------------------------------------------------
// ConfirmationDialog (internal)
// ---------------------------------------------------------------------------

// type ConfirmationDialogProps = {
//   open: boolean;
//   onCancel: () => void;
//   onConfirm: () => void;
//   title?: React.ReactNode;
//   description?: React.ReactNode;
//   confirmLabel?: React.ReactNode;
//   cancelLabel?: React.ReactNode;
// };

// function ConfirmationDialog({
//   open,
//   onCancel,
//   onConfirm,
//   title = "Confirm Submission",
//   description = "Are you sure you want to save these changes?",
//   confirmLabel = "Save",
//   cancelLabel = "Cancel",
// }: ConfirmationDialogProps) {
//   return (
//     <Dialog.Root
//       open={open}
//       onOpenChange={(d) => {
//         if (!d.open) onCancel();
//       }}
//       size="sm"
//       role="alertdialog"
//       placement={"center"}
//     >
//       <Dialog.Backdrop />
//       <Dialog.Positioner>
//         <Dialog.Content>
//           <Dialog.Header>
//             <Dialog.Title>{title}</Dialog.Title>
//           </Dialog.Header>

//           <Dialog.Body>
//             <Dialog.Description>{description}</Dialog.Description>
//           </Dialog.Body>

//           <Dialog.Footer gap={2}>
//             <Button variant="outline" onClick={onCancel}>
//               {cancelLabel}
//             </Button>
//             <Button onClick={onConfirm}>{confirmLabel}</Button>
//           </Dialog.Footer>
//         </Dialog.Content>
//       </Dialog.Positioner>
//     </Dialog.Root>
//   );
// }

// ---------------------------------------------------------------------------
// ModalForm
// ---------------------------------------------------------------------------

export function ModalForm({
  open,
  onOpenChange,
  title,
  description,
  header,
  footer,
  children,
  onSubmit,
  confirmation,
}: ModalFormProps) {
  // Holds the captured submit event so we can replay it after confirmation.
  const pendingEventRef = React.useRef<React.FormEvent<HTMLFormElement> | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const confirmationEnabled =
    confirmation !== false && typeof onSubmit === "function";

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!onSubmit) return;

    if (confirmationEnabled) {
      setConfirmOpen(true);
    } else {
      onSubmit(e);
    }
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    onSubmit?.({} as any); // OR refactor to store form state instead
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    pendingEventRef.current = null;
  };

  const confirmationProps =
    confirmation && typeof confirmation === "object" ? confirmation : {};

  return (
    <>
      <Dialog.Root
        open={open}
        onOpenChange={onOpenChange}
        size="xl"
        placement={"center"}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger position="absolute" top={3} insetEnd={3} />

            {/* Header ------------------------------------------------------- */}
            {header ??
              ((title || description) && (
                <Dialog.Header>
                  {title && <Dialog.Title>{title}</Dialog.Title>}
                  {description && (
                    <Dialog.Description>{description}</Dialog.Description>
                  )}
                </Dialog.Header>
              ))}

            <Separator mb={4} />

            {/* Body --------------------------------------------------------- */}
            <form onSubmit={handleFormSubmit}>
              <Dialog.Body display="flex" flexDirection="column" gap={6}>
                <Grid
                  templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
                  columnGap={6}
                  rowGap={4}
                >
                  {children}
                </Grid>

                <Separator />

                <Dialog.Footer>{footer}</Dialog.Footer>
              </Dialog.Body>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Confirmation dialog — only mounted when confirmation is enabled */}
      {/* {confirmationEnabled && (
        <ConfirmationDialog
          open={confirmOpen}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          {...confirmationProps}
        />
      )} */}
    </>
  );
}

// ---------------------------------------------------------------------------
// ModalFormSection
// ---------------------------------------------------------------------------

type ModalFormSectionProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** When true, section spans both columns on large screens. Defaults to true. */
  fullWidth?: boolean;
};

export function ModalFormSection({
  title,
  description,
  children,
  fullWidth = true,
}: ModalFormSectionProps) {
  return (
    <Box
      as="section"
      display="flex"
      flexDirection="column"
      gap={4}
      gridColumn={fullWidth ? { lg: "span 2" } : undefined}
    >
      {(title || description) && (
        <Stack gap={1}>
          {title && (
            <Heading as="h3" size="xs" fontWeight="semibold">
              {title}
            </Heading>
          )}
          {description && (
            <Text fontSize="xs" color="fg.muted">
              {description}
            </Text>
          )}
        </Stack>
      )}

      <Grid
        templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
        columnGap={6}
        rowGap={4}
      >
        {children}
      </Grid>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// ModalFormSeparator
// ---------------------------------------------------------------------------

/** Visual separator between sections inside the modal body. */
export function ModalFormSeparator() {
  return <Separator gridColumn={{ lg: "span 2" }} />;
}

// ---------------------------------------------------------------------------
// ModalFormField
// ---------------------------------------------------------------------------

type ModalFormFieldProps = {
  children: React.ReactNode;
  /** Span both columns on large screens. */
  fullWidth?: boolean;
};

export function ModalFormField({ children, fullWidth }: ModalFormFieldProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      gridColumn={fullWidth ? { lg: "span 2" } : undefined}
    >
      {children}
    </Box>
  );
}
