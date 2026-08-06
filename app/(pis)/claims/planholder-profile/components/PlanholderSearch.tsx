"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Input, InputGroup, Text } from "@chakra-ui/react";
import { LuChevronRight, LuSearch, LuUserSearch } from "react-icons/lu";
import { BrandedAvatar } from "osp-ui-kit";
import { mockAvatarUrl } from "@/lib/mock-avatar";
import {
  searchPlanholders,
  type PlanholderSearchResult,
} from "../../claims-data";

/** A single hit — tap anywhere on the row to open that plan holder's profile. */
function ResultRow({
  result,
  onSelect,
}: {
  result: PlanholderSearchResult;
  onSelect: (lpaNo: string) => void;
}) {
  // `asChild` so the row is a real <button> — keyboard and screen readers get
  // the semantics, Chakra still does the styling.
  return (
    <Flex
      asChild
      align="center"
      gap={3}
      w="full"
      textAlign="left"
      px={{ base: 3, md: 4 }}
      py={3}
      borderRadius="xl"
      transition="background 0.15s ease"
      _hover={{ bg: "gray.50" }}
      _focusVisible={{ outline: "2px solid", outlineColor: "primary" }}
    >
      <button type="button" onClick={() => onSelect(result.lpaNo)}>
        <BrandedAvatar
          name={result.name}
          imageUrl={mockAvatarUrl(result.personId)}
          size="sm"
          flexShrink={0}
        />

        <Box minW={0} flex="1">
          <Text fontSize="sm" fontWeight="semibold" color="gray.800" truncate>
            {result.name}
          </Text>
          <Text fontSize="xs" color="gray.500" truncate>
            {result.lpaNo} · {result.planDesc}
          </Text>
        </Box>

        <Box color="gray.400" flexShrink={0}>
          <LuChevronRight size={16} />
        </Box>
      </button>
    </Flex>
  );
}

/** Centred icon + message, used for both the resting and the no-match states. */
function SearchHint({ title, message }: { title: string; message: string }) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      py={{ base: 10, md: 14 }}
      gap={3}
    >
      <Box p={4} borderRadius="full" bg="gray.100" color="gray.500">
        <LuUserSearch size={24} />
      </Box>
      <Text fontSize="md" fontWeight="700" color="gray.800">
        {title}
      </Text>
      <Text fontSize="sm" color="gray.500" maxW="360px">
        {message}
      </Text>
    </Flex>
  );
}

/**
 * Plan holder search — the way in to a profile when you have a claim form in
 * hand rather than a link.
 *
 * The query runs against the LPA number and the name at once, because the
 * paperwork gives a processor one or the other and they should not have to say
 * which. Results are filtered as you type; picking one routes to that plan
 * holder's profile.
 */
export function PlanholderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchPlanholders(query), [query]);
  const hasQuery = query.trim().length > 0;

  const openProfile = (lpaNo: string) =>
    router.push(`/claims/planholder/${encodeURIComponent(lpaNo)}`);

  return (
    <Box>
      <InputGroup startElement={<LuSearch size={16} />}>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by LPA No. or plan holder name"
          autoComplete="off"
          borderRadius="xl"
          bg="white"
          size="lg"
          // Enter with exactly one hit goes straight there — the common case is
          // pasting a full LPA number off a form.
          onKeyDown={(event) => {
            if (event.key === "Enter" && results.length === 1) {
              event.preventDefault();
              openProfile(results[0].lpaNo);
            }
          }}
        />
      </InputGroup>

      <Box mt={4}>
        {!hasQuery ? (
          <SearchHint
            title="Find a Plan Holder"
            message="Type an LPA number or a name to look up a plan holder, then pick a result to open their profile."
          />
        ) : results.length === 0 ? (
          <SearchHint
            title="No Matches"
            message={`No plan holder on file matches "${query.trim()}". Check the LPA number or try part of the name.`}
          />
        ) : (
          <Flex direction="column">
            {results.map((result) => (
              <ResultRow
                key={result.lpaNo}
                result={result}
                onSelect={openProfile}
              />
            ))}
          </Flex>
        )}
      </Box>
    </Box>
  );
}

export default PlanholderSearch;
