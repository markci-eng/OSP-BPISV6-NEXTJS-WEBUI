import { notFound } from "next/navigation";
import NotFound from "../not-found";

// Root-level catch-all. Any URL that isn't matched by a defined route falls
// through to here (static/dynamic routes take priority over a catch-all), and
// calling notFound() renders app/not-found.tsx. This is required because the
// app's index route lives in a route group (app/(bpis)/page.tsx) rather than
// app/page.tsx, so the root not-found doesn't otherwise catch unmatched URLs.
export default function CatchAllNotFound() {
  // notFound();
  return <NotFound />;
}
