import { notFound } from "next/navigation";
import { getRitfRequestById } from "../data/data";
import { EditRitfPage } from "./edit-ritf-page";

interface PageProps {
  params: Promise<{ ritfId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { ritfId } = await params;
  const request = getRitfRequestById(ritfId);

  if (!request) notFound();

  return <EditRitfPage request={request} />;
}
