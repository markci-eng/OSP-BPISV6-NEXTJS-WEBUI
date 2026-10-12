"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Flex, Skeleton } from "@chakra-ui/react";
import { ErrorStateCard, Page } from "osp-ui-kit";
import { planholderLookup } from "@/app/(bpis)/plan-management/data/planholder-lookup";
import { getPlanholderInfo } from "../api/planholder-profile.api";
import {
  ChangeOfModeTable,
  type ModePlan,
} from "./components/change-of-mode-table";

export function ChangeOfModePage({ personId }: { personId: string }) {
  const router = useRouter();

  // The planholder's own plans carry the total amount payable; the list rows
  // carry the balance and installments paid. Neither has all of it, so join
  // them on the LPA number.
  const info = useQuery({
    queryKey: ["plan-management", "planholder-info", personId],
    queryFn: () => getPlanholderInfo(personId),
  });

  const plans = useMemo<ModePlan[]>(() => {
    const rows = new Map(
      planholderLookup
        .filter((row) => row.personId === personId)
        .map((row) => [row.lpaNumber, row]),
    );
    return (
      (info.data?.plans ?? [])
        // Only active, not-yet-terminated plans can change mode.
        .filter(
          (plan) =>
            plan.accountStatus?.toUpperCase() === "ACTIVE" &&
            plan.terminationStatus?.toUpperCase() === "NOT YET TERMINATED",
        )
        .map((plan) => {
          const row = rows.get(plan.lpaNo);
          return {
            lpaNo: plan.lpaNo,
            planDescription: plan.planDescription,
            mode: plan.mode,
            term: String(plan.term),
            instNo: row?.installmentNo ?? plan.installmentNo ?? 0,
            totalAmountPayable: plan.planTAP,
            balance: row?.balance ?? null,
          };
        })
    );
  }, [info.data, personId]);

  return (
    <Page.Root
      headerButton="back"
      title={"Change of Mode Application"}
      description="Switch your payment mode anytime."
    >
      <Page.MainContent>
        {info.isLoading ? (
          <Flex direction="column" gap={5}>
            <Skeleton h="100px" borderRadius="card" />
            <Skeleton h="320px" borderRadius="card" />
            <Skeleton h="100px" borderRadius="card" />
          </Flex>
        ) : info.isError ? (
          <ErrorStateCard
            title="Could not load plans"
            description="Something went wrong while loading this planholder's plans. Please try again."
            onRetry={() => info.refetch()}
            retrying={info.isRefetching}
          />
        ) : (
          <ChangeOfModeTable
            plans={plans}
            onChangeMode={() =>
              router.push(
                `/plan-management/planholder/${encodeURIComponent(personId)}/change-of-mode/success`,
              )
            }
          />
        )}
      </Page.MainContent>
    </Page.Root>
  );
}
