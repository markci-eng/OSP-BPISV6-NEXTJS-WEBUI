import { redirect } from "next/navigation";

/**
 * `/claims/death-claim` is a grouping segment, not a page — the sidebar item
 * for it is an accordion with no `href` of its own, so nothing in the app links
 * here. It exists only so a hand-typed or bookmarked URL lands on the group's
 * first nature instead of a 404, which is also where the mobile bottom-nav tab
 * for the group points.
 */
export default function DeathClaimIndexPage() {
  redirect("/claims/death-claim/death");
}
