import { Suspense } from "react";
import PlanholderListPage from "./planholder-list-page";

// The list keeps its filters in the URL (useSearchParams), which needs a
// Suspense boundary to prerender.
export default function Page() {
  return (
    <Suspense>
      <PlanholderListPage />
    </Suspense>
  );
}
