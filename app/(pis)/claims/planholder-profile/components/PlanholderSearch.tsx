"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Text } from "@chakra-ui/react";
import { LuUserSearch } from "react-icons/lu";
import { PlanholderResultRow } from "../../components/planholder-result-row";
import { SearchBar } from "../../components/search-bar";
import { searchPlanholders } from "../../claims-data";

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

  /**
   * Go, when there is exactly one place to go.
   *
   * The common case is pasting a full LPA number off a form, which matches one
   * plan holder and nothing else — so the answer is already decided and both
   * Enter and the magnifier just take it. With several hits there is a choice
   * to make and the list below is where it is made; doing anything on a partial
   * name would be guessing.
   */
  const submit = () => {
    if (results.length === 1) openProfile(results[0].lpaNo);
  };

  return (
    <Box>
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search by LPA No. or plan holder name"
        label="Search plan holders"
        onSearch={submit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submit();
          }
        }}
      />

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
              <PlanholderResultRow
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
