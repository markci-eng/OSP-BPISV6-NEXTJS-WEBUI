"use client";

import { useParams } from "next/navigation";
import Page from "@/claude components/layout/page/Page";
import { PdfViewerState } from "@/components/common/pdf-viewer/PdfViewerStates";
import { planholderLookup } from "@/app/(bpis)/plan-management/data/planholder-lookup";
import { findSoaRecordByPersonId } from "./soa.data";
import { SoaViewerPage } from "./soa-viewer-page";

export default function SoaPage() {
  const params = useParams();
  const personId = params?.personId as string;

  const planholder = planholderLookup.find((ph) => ph.personId === personId);
  const soaRecord = findSoaRecordByPersonId(personId);

  if (!planholder || !soaRecord) {
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

  return <SoaViewerPage planholder={planholder} soaRecord={soaRecord} />;
}
