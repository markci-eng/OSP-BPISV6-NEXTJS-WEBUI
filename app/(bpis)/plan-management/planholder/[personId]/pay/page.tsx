import { redirect } from "next/navigation";
import { planholderLookup } from "../../../data/planholder-lookup";
import { PlanDetailsData } from "../../../data/plan-details.data";
import PayViaQr from "./pay-via-qr";

function toTitleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ personId: string }>;
  searchParams: Promise<{ lpaNumber?: string }>;
}) {
  const { personId } = await params;
  const { lpaNumber } = await searchParams;

  const personRecords = planholderLookup.filter(
    (ph) => ph.personId === personId,
  );

  if (personRecords.length === 0) {
    redirect("/plan-management/planholder");
  }

  const lpaNumbers = personRecords.map((ph) => ph.lpaNumber);
  const plans = PlanDetailsData.filter((plan) =>
    lpaNumbers.includes(plan.lpaNumber),
  );

  const plan =
    (lpaNumber && plans.find((p) => p.lpaNumber === lpaNumber)) || plans[0];

  if (!plan) {
    redirect(`/plan-management/planholder/${personId}`);
  }

  const planholder = personRecords.find((ph) => ph.lpaNumber === plan.lpaNumber) ?? personRecords[0];
  
  return (
    <PayViaQr
      personId={personId}
      lpaNumber={plan.lpaNumber}
      planholderName={[planholder.firstName, planholder.lastName]
        .filter(Boolean)
        .map(toTitleCase)
        .join(" ")}
      planDescription={plan.planDescription}
      mode={plan.mode}
      installmentAmount={plan.installmentAmount}
      totalAmountPayable={plan.totalAmountPayable}
      dueDate={plan.newEffectivityDate}
    />
  );
}
