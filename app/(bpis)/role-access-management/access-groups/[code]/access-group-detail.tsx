"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { EmptyStateCard, Page, PrimaryMdButton } from "osp-ui-kit";

import { AccessListSkeleton } from "../../components/AccessListSkeleton";
import { useAccessGroups } from "../../hooks/useRoleAccess";
import { GroupAccessEditor } from "../../components/GroupAccessEditor";

const LIST_HREF = "/role-access-management/access-groups";

/**
 * One access group, on a page of its own.
 *
 * This is where a phone edits a preset: the console's two-column layout has no
 * room for a detail pane below `lg`, so the rail hands the group over here
 * instead of filling a column that is not on screen. The editor is the same
 * component either way — only the frame around it differs — and it reads its
 * group from the same cache the rail was listing, so arriving here neither
 * re-fetches the list nor needs anything handed through the URL but the code.
 */
export default function AccessGroupDetailPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = decodeURIComponent(params?.code ?? "");

  const { groups, isLoading } = useAccessGroups();

  const group = useMemo(
    () => groups.find((item) => item.code === code) ?? null,
    [groups, code],
  );

  return (
    <Page.Root
      title={group?.description ?? "Access Group"}
      subtitle="Role & Access Group Management"
      description={
        group?.summary ??
        "Review and edit the permissions this access group grants."
      }
      headerButton="back"
    >
      <Page.MainContent>
        {isLoading && !group && <AccessListSkeleton userName={code} />}

        {!isLoading && !group && (
          <EmptyStateCard
            title="Access group not found"
            description={`No access group is registered under the code “${code}”. It may have been renamed or removed.`}
            py={16}
          >
            <PrimaryMdButton mt={4} onClick={() => router.push(LIST_HREF)}>
              Back to access groups
            </PrimaryMdButton>
          </EmptyStateCard>
        )}

        {group && <GroupAccessEditor key={group.code} group={group} />}
      </Page.MainContent>
    </Page.Root>
  );
}
