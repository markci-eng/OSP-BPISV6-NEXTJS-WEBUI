"use client";

import { DrawerSections } from "@/components/approval-component/ApprovalDrawer";
import { ApprovalPage } from "@/components/approval-component/ApprovalConfig";
import ApprovalTest from "@/components/approval-component/ApprovalTest";
import { Box } from "st-peter-ui";

const ApprovalsPage = () => {
  return (
    <Box>
      {/* <DocumentUploader /> */}
      {/* <ApprovalPage
        data={[]}
        columns={[]}
        rowIdKey={""}
        onApprove={function (
          row: Record<string, any>,
          remarks: string,
        ): Promise<void> {
          throw new Error("Function not implemented.");
        }}
        onReject={function (
          row: Record<string, any>,
          remarks: string,
        ): Promise<void> {
          throw new Error("Function not implemented.");
        }}
        onBulkApprove={function (rows: Record<string, any>[]): Promise<void> {
          throw new Error("Function not implemented.");
        }}
        onBulkReject={function (rows: Record<string, any>[]): Promise<void> {
          throw new Error("Function not implemented.");
        }}
        renderDrawerContent={function (
          row: Record<string, any>,
        ): DrawerSections {
          throw new Error("Function not implemented.");
        }}
      /> */}

      <ApprovalTest />
    </Box>
  );
};

export default ApprovalsPage;
