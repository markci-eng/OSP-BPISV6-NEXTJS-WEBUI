"use client";

// The claims area's toaster, built on Chakra's own toast rather than sonner.
//
// Chakra's toast is two halves that have to agree: `createToaster` makes the
// store you push messages onto, and `<ClaimsToaster/>` is the thing that draws
// them. Neither works alone — a `toaster.create(...)` with nothing rendering
// the store is silent, which is the one failure mode worth guarding against
// here. So both live in this file and are exported together: import the store
// and you can see, one line up, what has to be on screen for it to show.

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from "@chakra-ui/react";

/**
 * The message store. Push with `toaster.create({ type, title, description })`,
 * where `type` is `"success" | "error" | "warning" | "info" | "loading"`.
 *
 * Placement matches the app-wide toaster in `app/layout.tsx` (`top-right`), so
 * a claims toast lands where every other toast in the product already does.
 */
export const toaster = createToaster({
  placement: "top-end",
  pauseOnPageIdle: true,
});

/**
 * The toasts themselves. Must be mounted for {@link toaster} to show anything.
 *
 * Portalled to the document body so a toast raised from inside a drawer is not
 * clipped by it — the drawers in this area are full-height with `overflow:
 * hidden`, and an in-tree toast would be cut off by the first one it opened
 * under.
 *
 * NEVER MOUNT IT INSIDE `Page.Root`. That component walks its children looking
 * for `Page.ToolContent` and `Page.MainContent` and renders those two alone —
 * anything else is silently dropped, with no error and no warning. A toaster put
 * there does not fail loudly; it simply never draws, and every `toaster.create`
 * in the page goes nowhere. Render it as a SIBLING of `Page.Root`, inside a
 * fragment.
 */
export const ClaimsToaster = () => (
  <Portal>
    <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
      {(toast) => (
        <Toast.Root width={{ md: "sm" }}>
          {toast.type === "loading" ? (
            <Spinner size="sm" color="blue.solid" />
          ) : (
            <Toast.Indicator />
          )}
          <Stack gap="1" flex="1" maxWidth="100%">
            {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
            {toast.description && (
              <Toast.Description>{toast.description}</Toast.Description>
            )}
          </Stack>
          {toast.action && (
            <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
          )}
          {toast.closable && <Toast.CloseTrigger />}
        </Toast.Root>
      )}
    </ChakraToaster>
  </Portal>
);

export default ClaimsToaster;
