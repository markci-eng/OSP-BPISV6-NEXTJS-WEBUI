"use client";

// Account Verification — a master/detail screen laid out like CSV and Return
// of Premium: the list on the left, the picked planholder's profile on the
// right. The list's header switches between the accounts waiting for
// verification and the chapel corrections.

import { useEffect, useMemo, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Page, ProfileHeaderCardSkeleton } from "osp-ui-kit";

import { SURFACE_RADIUS } from "../../claims/components/section-card";
import { CollapsibleListLayout } from "../components/collapsible-list-layout";
import { PlanholderProfileBody } from "../planholder-profile/components/planholder-profile-body";
import { buildPlanholderProfile } from "../planholder-profile/data/build-profile";
import { AccountVerificationListCard } from "./components/account-verification-list-card";
import {
  ACCOUNT_VERIFICATION_VIEWS,
  CHAPEL_CORRECTION_STATUSES,
  fetchAccountVerificationRecords,
} from "./data/data";
import type {
  AccountVerificationRecord,
  AccountVerificationView,
  ChapelCorrectionStatus,
} from "./data/types";

function EmptyPanel({ title, message }: { title: string; message: string }) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={2}
      bg="white"
      borderWidth="1px"
      borderColor="border.muted"
      borderRadius={SURFACE_RADIUS}
      shadow="xs"
      py={16}
      px={6}
      textAlign="center"
    >
      <Text fontSize="md" fontWeight="600" color="gray.700">
        {title}
      </Text>
      <Text fontSize="sm" color="gray.500">
        {message}
      </Text>
    </Flex>
  );
}

export default function AccountVerificationPage() {
  const [records, setRecords] = useState<AccountVerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AccountVerificationView>(
    ACCOUNT_VERIFICATION_VIEWS[0],
  );
  const [chapelStatus, setChapelStatus] = useState<ChapelCorrectionStatus>(
    CHAPEL_CORRECTION_STATUSES[0],
  );
  const [selectedId, setSelectedId] = useState<string>();
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetchAccountVerificationRecords().then((rows) => {
      if (cancelled) return;
      setRecords(rows);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const inView = useMemo(
    () => records.filter((record) => record.view === view),
    [records, view],
  );

  // Switching views starts Chapel Correction over on For Process and clears
  // the pick, so the right panel is always one of the rows on the left.
  const changeView = (next: AccountVerificationView) => {
    setView(next);
    setChapelStatus(CHAPEL_CORRECTION_STATUSES[0]);
    setSelectedId(undefined);
  };

  const changeChapelStatus = (next: ChapelCorrectionStatus) => {
    setChapelStatus(next);
    setSelectedId(undefined);
  };

  // The rows the list shows: Chapel Correction is narrowed to its pile.
  const listed = useMemo(
    () =>
      view === "Chapel Correction"
        ? inView.filter((record) => record.status === chapelStatus)
        : inView,
    [inView, view, chapelStatus],
  );

  // Each list opens on its top record until another row is picked.
  const selected = useMemo(
    () => listed.find((record) => record.id === selectedId) ?? listed[0],
    [listed, selectedId],
  );

  // The same profile the Planholder Profile screen shows, held to the picked
  // record's plan alone: the planholder's other accounts are not part of this
  // verification, and with one plan the profile draws no arrows between them.
  const profile = useMemo(() => {
    if (!selected) return undefined;
    const built = buildPlanholderProfile(selected.personId);
    if (!built?.plans) return built;
    return {
      ...built,
      plans: built.plans.filter((plan) => plan.lpaNumber === selected.lpaNo),
    };
  }, [selected]);

  return (
    <Page.Root
      title="Account Verification"
      headerButton="menu"
      px={{ base: 0, lg: "10px" }}
    >
      <Page.MainContent>
        <CollapsibleListLayout
          defaultListVisible={false}
          list={
            <AccountVerificationListCard
              records={inView}
              view={view}
              onViewChange={changeView}
              chapelStatus={chapelStatus}
              onChapelStatusChange={changeChapelStatus}
              selectedId={selected?.id}
              onSelect={(record) => setSelectedId(record.id)}
              query={query}
              onQueryChange={setQuery}
              loading={loading}
            />
          }
        >
          {loading ? (
            <ProfileHeaderCardSkeleton />
          ) : profile ? (
            <Box minW={0}>
              {/* Keyed by record, so the profile's plan and cards start over
                  on each pick. */}
              <PlanholderProfileBody key={selected?.id} props={profile} />
            </Box>
          ) : selected ? (
            <EmptyPanel
              title="Planholder not found"
              message={`No planholder profile is on file for ${selected.lpaNo}.`}
            />
          ) : (
            <EmptyPanel
              title="No account selected"
              message="Pick a record from the list to view the planholder profile."
            />
          )}
        </CollapsibleListLayout>
      </Page.MainContent>
    </Page.Root>
  );
}
