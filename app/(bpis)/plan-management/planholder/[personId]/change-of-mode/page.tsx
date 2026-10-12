import { redirect } from "next/navigation";
import { ChangeOfModePage } from "./change-of-mode-page";

export default async function Page({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;

  // A list row with no personId stringifies into the URL as "null" or
  // "undefined". There is no one to show, so go back to the list.
  if (personId === "null" || personId === "undefined") {
    redirect("/plan-management/planholder");
  }

  return <ChangeOfModePage personId={personId} />;
}
