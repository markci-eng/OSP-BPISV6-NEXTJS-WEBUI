"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button, Portal } from "@chakra-ui/react";
import { LuChevronUp, LuIdCard } from "react-icons/lu";
import { BRAND_COLORS } from "@/lib/theme/brand-colors";
import type { Planholder } from "../../claims-data";
import { PlanholderInfoCard } from "./PlanholderInfoCard";

/**
 * Plan holder details for the claim form. Shows the compact, clickable
 * {@link PlanholderInfoCard} inline; once it scrolls out of view while the form
 * is being filled, a floating trigger fades in that opens the card's own
 * full-screen details drawer — so the details are always one tap away without
 * reflowing the form.
 */
export function PlanholderDetailsDrawer({
  planholder,
}: {
  planholder: Planholder;
}) {
  const [open, setOpen] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const inlineRef = useRef<HTMLDivElement>(null);

  // The floating trigger only appears when the inline card is out of view.
  useEffect(() => {
    const el = inlineRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowButton(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Inline details — the same clickable card used on the profile page. */}
      <Box ref={inlineRef} mt={4}>
        <PlanholderInfoCard
          planholder={planholder}
          open={open}
          onOpenChange={setOpen}
        />
      </Box>

      {/* Floating trigger — fades in only when the inline card is out of view;
          opens the card's full-screen details drawer. */}
      <Portal>
        <Box
          position="fixed"
          bottom={{ base: "88px", md: "24px" }}
          left="50%"
          zIndex={1400}
          pointerEvents={showButton && !open ? "auto" : "none"}
          opacity={showButton && !open ? 1 : 0}
          transition="opacity 0.2s ease, transform 0.2s ease"
          style={{
            transform:
              showButton && !open
                ? "translateX(-50%) translateY(0)"
                : "translateX(-50%) translateY(12px)",
          }}
        >
          <Button
            onClick={() => setOpen(true)}
            size="sm"
            borderRadius="full"
            bg={BRAND_COLORS.primaryGreen}
            color="white"
            boxShadow="lg"
            _hover={{ bg: BRAND_COLORS.darkGreen }}
          >
            <LuIdCard />
            Planholder Details
            <LuChevronUp />
          </Button>
        </Box>
      </Portal>
    </>
  );
}

export default PlanholderDetailsDrawer;
