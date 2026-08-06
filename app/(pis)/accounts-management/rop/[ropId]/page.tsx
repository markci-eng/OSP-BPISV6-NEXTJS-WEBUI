import { notFound } from "next/navigation";
import { getRopRequestById } from "../data/data";
import { EditRopPaymentPage } from "./edit-rop-payment-page";

interface PageProps {
  params: Promise<{ ropId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { ropId } = await params;
  const request = getRopRequestById(ropId);

  if (!request) notFound();

  return <EditRopPaymentPage request={request} />;
}
