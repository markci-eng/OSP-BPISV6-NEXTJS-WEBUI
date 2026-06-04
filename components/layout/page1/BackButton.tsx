"use client";

import { Box, Flex } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LuChevronLeft } from "react-icons/lu";

const LAYOUT_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

const BackButton = () => {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const segments = pathname.split("/").filter(Boolean);

  const parentPath =
    segments.length === 0
      ? null
      : segments.length === 1
        ? "/"
        : "/" + segments.slice(0, -1).join("/");

  const [visible, setVisible] = useState(true);

  //   useEffect(() => {
  //     if (!parentPath) { setVisible(false); return; }
  //     if (parentPath === "/") { setVisible(true); return; }
  //     setVisible(false);
  //     const ctrl = new AbortController();
  //     fetch(parentPath, { method: "HEAD", signal: ctrl.signal })
  //       .then((res) => { if (!ctrl.signal.aborted) setVisible(res.ok); })
  //       .catch(() => {});
  //     return () => ctrl.abort();
  //   }, [parentPath]);

  if (!parentPath) return null;

  return (
    <Box
      maxH={visible ? "20px" : "0"}
      mb={visible ? "8px" : "0"}
      opacity={visible ? 1 : 0}
      overflow="hidden"
      pointerEvents={visible ? "auto" : "none"}
      transition={[
        `max-height 0.2s ${LAYOUT_EASE}`,
        `margin-bottom 0.2s ${LAYOUT_EASE}`,
        "opacity 0.18s ease",
      ].join(", ")}
    >
      <Flex
        as="button"
        align="center"
        gap="3px"
        onClick={() => router.push(parentPath)}
        cursor="pointer"
        color="gray.400"
        fontFamily="var(--font-dm-sans), system-ui, sans-serif"
        fontSize="12px"
        fontWeight="500"
        letterSpacing="0.01em"
        aria-label="Go back"
        _hover={{ color: "var(--chakra-colors-primary)" }}
        transition="color 0.15s ease"
      >
        <LuChevronLeft size={13} strokeWidth={2.5} />
        Back
      </Flex>
    </Box>
  );
};

export default BackButton;
