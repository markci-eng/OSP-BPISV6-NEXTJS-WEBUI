"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Page from "@/claude components/layout/page/Page";
import { PdfViewerState } from "@/components/common/pdf-viewer/PdfViewerStates";
import { planholderLookup } from "@/app/(bpis)/plan-management/data/planholder-lookup";
import { PlanDetailsData } from "@/app/(bpis)/plan-management/data/plan-details.data";
import { getPlanStatement } from "@/components/new-planholder-profile/data/plan-statement";
import { findSoaRecordByPersonId } from "./soa.data";
import { SoaDocument } from "./soa-document";

function SoaPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const personId = params?.personId as string;
  const lpaNumber = searchParams?.get("lpaNumber") ?? undefined;

  const planholder = planholderLookup.find((ph) => ph.personId === personId);

  // Resolve the plan the statement is for: prefer the LPA passed from the
  // planholder profile, otherwise fall back to this person's first plan.
  const personLpaNumbers = planholderLookup
    .filter((ph) => ph.personId === personId)
    .map((ph) => ph.lpaNumber);
  const plan =
    (lpaNumber
      ? PlanDetailsData.find((p) => p.lpaNumber === lpaNumber)
      : undefined) ??
    PlanDetailsData.find((p) => personLpaNumbers.includes(p.lpaNumber));

  if (!planholder || !plan) {
    return (
      <Page.Root title="Statement of Account" headerButton="back">
        <Page.MainContent>
          <Page.Row>
            <PdfViewerState variant="empty" />
          </Page.Row>
        </Page.MainContent>
      </Page.Root>
    );
  }

  // Same single source of truth the LPA button and the Statement of Accounts
  // page use, so the printed SOA balances with everything else.
  const statement = getPlanStatement(plan);
  const soaRecord = findSoaRecordByPersonId(personId);
  const soaNumber = soaRecord?.soaNumber ?? `SOA-${plan.lpaNumber}`;

  return (
    <SoaDocument
      planholder={planholder}
      plan={plan}
      statement={statement}
      soaNumber={soaNumber}
    />
  );
}

export default function SoaPage() {
  return (
    <Suspense
      fallback={
        <Page.Root title="Statement of Account" headerButton="back">
          <Page.MainContent>
            <Page.Row>
              <PdfViewerState variant="loading" />
            </Page.Row>
          </Page.MainContent>
        </Page.Root>
      }
    >
      <SoaPageContent />
    </Suspense>
  );
}
