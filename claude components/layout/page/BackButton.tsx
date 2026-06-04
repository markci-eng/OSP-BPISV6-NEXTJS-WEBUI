"use client";

import { Box } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LuChevronLeft } from "react-icons/lu";

const LAYOUT_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
const SPRING      = "cubic-bezier(0.34, 1.56, 0.64, 1)";

const BackButton = () => {
    const pathname = usePathname() ?? "/";
    const router   = useRouter();
    const segments = pathname.split("/").filter(Boolean);

    const parentPath =
        segments.length === 0 ? null
        : segments.length === 1 ? "/"
        : "/" + segments.slice(0, -1).join("/");

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!parentPath) { setVisible(false); return; }
        if (parentPath === "/") { setVisible(true); return; }
        setVisible(false);
        const ctrl = new AbortController();
        fetch(parentPath, { method: "HEAD", signal: ctrl.signal })
            .then((res) => { if (!ctrl.signal.aborted) setVisible(res.ok); })
            .catch(() => {});
        return () => ctrl.abort();
    }, [parentPath]);

    if (!parentPath) return null;

    return (
        // Outer: owns the glass appearance + circular shadow (not clipped by its own overflow)
        <Box
            display={{ base: "block", lg: "none" }}
            flexShrink={0}
            overflow="hidden"
            borderRadius="full"
            w={visible ? "30px" : "0"}
            h="30px"
            mr={visible ? "8px" : "0"}
            pointerEvents={visible ? "auto" : "none"}
            bg="rgba(255, 255, 255, 0.65)"
            backdropFilter="blur(28px) saturate(200%)"
            border="1px solid rgba(255, 255, 255, 0.52)"
            boxShadow="0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06), inset 0 1.5px 0 rgba(255,255,255,0.85), inset 0 -0.5px 0 rgba(0,0,0,0.04)"
            transition={[
                `width 0.2s ${LAYOUT_EASE}`,
                `margin-right 0.2s ${LAYOUT_EASE}`,
                "background 0.12s ease",
            ].join(", ")}
            _hover={{ bg: "rgba(255, 255, 255, 0.88)" }}
        >
            {/* Inner: icon + entrance animation + press feedback */}
            <Box
                as="button"
                w="30px"
                h="30px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                onClick={() => router.push(parentPath)}
                aria-label="Go back"
                opacity={visible ? 1 : 0}
                transform={visible ? "scale(1)" : "scale(0.6)"}
                transition={`opacity 0.18s ease 0.06s, transform 0.26s ${SPRING} 0.06s`}
                _active={{ bg: "rgba(0,0,0,0.06)" }}
            >
                <LuChevronLeft size={16} color="var(--chakra-colors-primary)" strokeWidth={2.5} />
            </Box>
        </Box>
    );
};

export default BackButton;
