import {
  refCatalogData,
  refOrgUnitData,
  refPlanTypeData,
  TblLoanHdrData,
  tblPersonData,
  tblPlanholderData,
  tblSalesForceIDData,
} from "../Data/rawData";
import { PlanholderLookupItem } from "../Types/global.types";

// Planholder Look Up
export const planholderLookup: PlanholderLookupItem[] =
  tblPlanholderData.flatMap((ph) => {
    const person = tblPersonData.find((p) => p.PersonID === ph.PersonID)!;

    const plan = refPlanTypeData.find((p) => p.PlanCode === ph.PlanCode)!;

    const catalog = refCatalogData.find((c) => c.CatalogID === plan.CatalogID)!;

    const OrgUnit = refOrgUnitData.find(
      (o) => o.OrgUnitCode === ph.OrgUnitCode,
    )!;

    const loan = TblLoanHdrData.find((l) => l.LPANo === ph.LPANo);

    const base = {
      SalesForceCode: ph.SalesForceCode,
      Person: person,
      SalesForceIDs: tblSalesForceIDData.filter(
        (id) => id.SalesForceCode === ph.SalesForceCode,
      ),
      Planholders: [ph],
      PlanData: {
        PlanType: plan,
        PlanCatalog: catalog,
      },
      OrgUnit,

      LPANo: ph.LPANo,
      FirstName: person.FirstName,
      LastName: person.LastName,
      MiddleName: person.MiddleName,
    };

    const result: PlanholderLookupItem[] = [
      // PLANHOLDER ENTRY (regular)
      {
        ...base,
        LoanHdr: undefined,
        LAFNo: undefined,
        EntryType: "PH",
      },
    ];

    // LOAN ENTRY (only if exists)
    if (loan) {
      result.push({
        ...base,
        LoanHdr: loan,
        LAFNo: loan.LAFNo,
        EntryType: "LOAN",
      });
    }

    return result;
  });
