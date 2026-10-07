"use client";

// THE CARD STRIP OVER A TABLE — each card a count, and pressing one narrows the
// table to it. Approvals drew it first; Franchise Deductions uses the same one
// (user, 2026-10-01: "same as the for approval"), so it lives here rather than
// in either page.
//
// Desktop: one column per card. Phone: a carousel, mounted only on phones —
// hidden with `display: none` it cannot measure its slides and re-emits
// `onPageChange(0)`, which would clobber the selected card with the first one.

import * as React from "react";
import {
  Box,
  Carousel,
  Flex,
  IconButton,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";

export interface FilterCardSpec {
  label: string;
  value: number;
  /** What pressing it narrows the table to. */
  filter: string;
  sub: string;
  icon: LucideIcon;
  /** A Chakra palette name — the card reads `${accent}.50` and friends. */
  accent: string;
}

export interface FilterCardsProps {
  cards: FilterCardSpec[];
  /** The `filter` of the pressed card. */
  active: string;
  onSelect: (filter: string) => void;
}

function FilterCard({
  card,
  isActive,
  onSelect,
}: {
  card: FilterCardSpec;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <Box
      position="relative"
      bg={isActive ? `${card.accent}.100` : `${card.accent}.50`}
      border="2px solid"
      borderColor={isActive ? `${card.accent}.500` : `${card.accent}.200`}
      borderRadius="xl"
      p={4}
      mt={2}
      boxShadow={isActive ? "lg" : "xs"}
      cursor="pointer"
      transform={isActive ? "translateY(-2px)" : "none"}
      onClick={onSelect}
      transition="all 0.15s ease"
      _hover={{
        bg: `${card.accent}.100`,
        borderColor: `${card.accent}.400`,
      }}
    >
      {isActive && (
        <Box
          position="absolute"
          top={-2}
          right={-2}
          zIndex={2}
          w="22px"
          h="22px"
          borderRadius="full"
          bg={`${card.accent}.500`}
          color="white"
          border="2px solid"
          borderColor="white"
          display={{ base: "none", md: "flex" }}
          alignItems="center"
          justifyContent="center"
          fontSize="11px"
          fontWeight="800"
          boxShadow="sm"
        >
          ✓
        </Box>
      )}
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Text
            fontSize="10px"
            fontWeight={isActive ? "800" : "700"}
            letterSpacing="0.08em"
            textTransform="uppercase"
            color={isActive ? `${card.accent}.600` : `${card.accent}.500`}
            mb={1}
          >
            {card.label}
          </Text>
          <Text
            fontSize={isActive ? "4xl" : "2xl"}
            fontWeight="bold"
            color={isActive ? `${card.accent}.700` : `${card.accent}.600`}
            lineHeight="1"
            mb={1}
            transition="font-size 0.15s ease"
          >
            {card.value}
          </Text>
          <Text fontSize="xs" color="gray.600" fontWeight="medium">
            {card.sub}
          </Text>
        </Box>
        <Box
          p={2}
          borderRadius="lg"
          bg={isActive ? `${card.accent}.200` : `${card.accent}.100`}
          color={`${card.accent}.500`}
        >
          <card.icon size={18} />
        </Box>
      </Flex>
    </Box>
  );
}

export function FilterCards({ cards, active, onSelect }: FilterCardsProps) {
  const activeIndex = Math.max(
    0,
    cards.findIndex((card) => card.filter === active),
  );
  const carouselReady = React.useRef(false);

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 47.99em)"); // below Chakra `md`
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <>
      <SimpleGrid
        columns={cards.length}
        gap={3}
        display={{ base: "none", md: "grid" }}
      >
        {cards.map((card) => (
          <Box key={card.label}>
            <FilterCard
              card={card}
              isActive={card.filter === active}
              onSelect={() => onSelect(card.filter)}
            />
          </Box>
        ))}
      </SimpleGrid>

      {isMobile && (
        <Box>
          <Carousel.Root
            slideCount={cards.length}
            page={activeIndex}
            onPageChange={(details: { page: number }) => {
              // The carousel emits an initial onPageChange(0) on mount; skip it
              // and only react to real page changes afterward.
              if (!carouselReady.current) {
                carouselReady.current = true;
                return;
              }
              onSelect(cards[details.page].filter);
            }}
          >
            <Carousel.ItemGroup>
              {cards.map((card, i) => (
                <Carousel.Item key={card.label} index={i}>
                  <FilterCard
                    card={card}
                    isActive={card.filter === active}
                    onSelect={() => onSelect(card.filter)}
                  />
                </Carousel.Item>
              ))}
            </Carousel.ItemGroup>

            <Carousel.Control justifyContent="center" gap="4">
              <Carousel.PrevTrigger asChild>
                <IconButton size="xs" variant="ghost" aria-label="Previous">
                  <ChevronLeft size={16} />
                </IconButton>
              </Carousel.PrevTrigger>

              <Carousel.Indicators />

              <Carousel.NextTrigger asChild>
                <IconButton size="xs" variant="ghost" aria-label="Next">
                  <ChevronRight size={16} />
                </IconButton>
              </Carousel.NextTrigger>
            </Carousel.Control>
          </Carousel.Root>
        </Box>
      )}
    </>
  );
}

export default FilterCards;
