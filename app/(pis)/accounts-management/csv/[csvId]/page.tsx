import { notFound } from "next/navigation";
import { getCsvRequestById } from "../data/data";
import { EditCsvPage } from "./edit-csv-page";

interface PageProps {
  params: Promise<{ csvId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { csvId } = await params;
  const request = getCsvRequestById(csvId);

  if (!request) notFound();

  return <EditCsvPage request={request} />;
}
