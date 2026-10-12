import { StatementOfAccount as StatementOfAccountPanel } from "@/components/plan-management/planholder-profile/pages/statement-of-accounts";
import type {
  PaymentRecord,
  PlanDetails,
  PlanOverview,
} from "@/types/plan-management.types";

/**
 * The plan's statement of accounts, drawn with the shared SOA panel. Totals
 * are summed from the payment records, so the figures and the table agree.
 */
export function StatementOfAccount({
  plan,
  planDetails,
  paymentRecords,
}: {
  plan: PlanOverview;
  planDetails: PlanDetails;
  paymentRecords: PaymentRecord[];
}) {
  const totalPayments = paymentRecords.reduce((sum, r) => sum + r.siAmount, 0);
  const installmentsPaid = paymentRecords.reduce(
    (max, r) => Math.max(max, r.instNo),
    plan.installmentNo ?? 0,
  );
  // Records are newest first, so the latest receipt names the next due date.
  const dueDate = plan.dueDate ?? paymentRecords[0]?.nextDueDate;

  return (
    <StatementOfAccountPanel
      props={{
        lpaNumber: planDetails.lpaNo,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        term: planDetails.term,
        mode: planDetails.mode,
        installmentNumber: installmentsPaid,
        installmentAmount: planDetails.installmentAmount,
        totalAmountPayable: planDetails.planTAP,
        totalPayments,
        balance: Math.max(0, planDetails.planTAP - totalPayments),
        // Early-surrender value: a conservative fraction of what has been paid in.
        terminationValue: Math.round(totalPayments * 0.6),
        paymentRecords: paymentRecords.map((r) => ({
          lpaNumber: planDetails.lpaNo,
          payClass: r.payClass,
          siNumber: r.siNumber,
          siDate: new Date(r.siDate),
          siAmount: r.siAmount,
          planCode: r.planCode,
          installmentNumber: r.instNo,
          nextDueDate: new Date(r.nextDueDate),
          cvNumber: r.cvNumber,
          pcvNumber: r.pcvNumber,
          auditDate: new Date(r.auditDate),
        })),
      }}
    />
  );
}
