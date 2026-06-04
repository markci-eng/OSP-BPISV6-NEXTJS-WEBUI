"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Box,
  Button,
  createListCollection,
  Dialog,
  Portal,
  Separator,
  Text,
} from "@chakra-ui/react";

import type {
  ColumnConfig,
  FilterConfig,
} from "@/components/approval-component/types";
import type { DrawerSections } from "@/components/approval-component/ApprovalDrawer";
import { StatusBadge } from "@/components/approval-component/StatusBadge";
import { ApprovalPage } from "@/components/approval-component/ApprovalConfig";
import { Breadcrumb, H3, SelectFloatingLabel } from "st-peter-ui";
import {
  drsList,
  depositHdrList,
  depositDtlList,
  paymentList,
} from "@/app/approvals/data/data";
import {
  DRSWithDepositAndPayments,
  mapDRSToDepositAndPayments,
} from "@/app/approvals/data/types";
import { DRSPrintLayout } from "@/app/approvals/components/DRSPrintLayout";
import Page from "@/components/layout/page/Page";

type ApprovalView =
  | "reassignment-doc"
  | "drs"
  | "movement-employees"
  | "reassignment-sa2";
type ApprovalStatus = "Pending" | "Approved" | "Denied";

const APPROVAL_STATUSES: ApprovalStatus[] = [
  "Pending",
  "Pending",
  "Approved",
  "Denied",
];

//#region SA2 Reassignment

interface SA2Reassignment {
  id: string;
  employee: string;
  fromManager: string;
  toManager: string;
  branch: string;
  status: ApprovalStatus;
  date: string;

  // NEW
  requestDate: string;
  requester: string;
}

const SA2_DATA: SA2Reassignment[] = [
  {
    id: "SA2-0001",
    employee: "Grae Sensano",
    fromManager: "Marcus",
    toManager: "Allen",
    branch: "Head Office",
    status: "Pending",
    date: "2026-04-10",
    requestDate: "2026-04-10",
    requester: "Grae Sensano",
  },
  {
    id: "SA2-0002",
    employee: "John Cruz",
    fromManager: "Allen ",
    toManager: "Marcus",
    branch: "Cebu Branch",
    status: "Approved",
    date: "2026-04-09",
    requestDate: "2026-04-11",
    requester: "Grae Sensano",
  },
  {
    id: "SA2-0003",
    employee: "Maria Santos",
    fromManager: "Marcus",
    toManager: "Leo",
    branch: "Davao Branch",
    status: "Denied",
    date: "2026-04-08",
    requestDate: "2026-04-12",
    requester: "Grae Sensano",
  },
];

const sa2Columns: ColumnConfig<SA2Reassignment>[] = [
  { key: "id", header: "ID", sortable: true },
  { key: "employee", header: "Employee", sortable: true },
  { key: "fromManager", header: "From STL" },
  { key: "toManager", header: "To STL" },
  { key: "branch", header: "Branch" },

  // NEW
  { key: "requestDate", header: "Request Date", sortable: true },
  { key: "requester", header: "Requester", sortable: true },

  { key: "date", header: "Date", sortable: true },
  {
    key: "status",
    header: "Status",
    render: (v) => <StatusBadge status={String(v)} />,
  },
];

function getSA2DrawerSections(row: SA2Reassignment): DrawerSections {
  return {
    requestId: row.id,
    status: row.status,
    moduleType: "SA2 Reassignment",
    summary: [
      { label: "Employee", value: row.employee },
      { label: "From STL", value: row.fromManager },
      { label: "To STL", value: row.toManager },
      { label: "Branch", value: row.branch },
      { label: "Date", value: row.date },
    ],
    dynamicContent: (
      <Box>
        <Text fontSize="sm">
          Transfer of SA2 from <b>{row.fromManager}</b> to{" "}
          <b>{row.toManager}</b>.
        </Text>
      </Box>
    ),
    attachments: [],
    auditTrail: [
      { actor: row.fromManager, action: "Requested transfer", date: row.date },
    ],
  };
}

//#endregion

// #region Movement of Employees

interface EmployeeMovement {
  id: string;
  employee: string;
  currentPosition: string;
  newPosition: string;
  movementType: "Promotion" | "Demotion";
  status: ApprovalStatus;
  date: string;

  // NEW
  requestDate: string;
  requester: string;
}

const MOVEMENT_DATA: EmployeeMovement[] = [
  {
    id: "MOV-0001",
    employee: "Grae Sensano",
    currentPosition: "SA1",
    newPosition: "SA2",
    movementType: "Promotion",
    status: "Pending",
    date: "2026-04-11",
    requestDate: "2026-04-11",
    requester: "Grae Sensano",
  },
  {
    id: "MOV-0002",
    employee: "John Cruz",
    currentPosition: "SA2",
    newPosition: "STL",
    movementType: "Promotion",
    status: "Approved",
    date: "2026-04-10",
    requestDate: "2026-04-12",
    requester: "Grae Sensano",
  },
  {
    id: "MOV-0003",
    employee: "Maria Santos",
    currentPosition: "STL",
    newPosition: "SA2",
    movementType: "Demotion",
    status: "Denied",
    date: "2026-04-09",
    requestDate: "2026-04-13",
    requester: "Grae Sensano",
  },
];

const movementColumns: ColumnConfig<EmployeeMovement>[] = [
  { key: "id", header: "ID" },
  { key: "employee", header: "Employee" },
  { key: "currentPosition", header: "From" },
  { key: "newPosition", header: "To" },
  { key: "movementType", header: "Type" },
  { key: "date", header: "Date" },
  { key: "requestDate", header: "Request Date" },
  { key: "requester", header: "Requester" },
  {
    key: "status",
    header: "Status",
    render: (v) => <StatusBadge status={String(v)} />,
  },
];

function getMovementDrawerSections(row: EmployeeMovement): DrawerSections {
  return {
    requestId: row.id,
    status: row.status,
    moduleType: "Employee Movement",
    summary: [
      { label: "Employee", value: row.employee },
      { label: "From", value: row.currentPosition },
      { label: "To", value: row.newPosition },
      { label: "Type", value: row.movementType },
      { label: "Date", value: row.date },
    ],
    dynamicContent: (
      <Box>
        <Text fontSize="sm">
          {row.movementType} from <b>{row.currentPosition}</b> to{" "}
          <b>{row.newPosition}</b>.
        </Text>
      </Box>
    ),
    attachments: [],
    auditTrail: [
      { actor: row.employee, action: row.movementType, date: row.date },
    ],
  };
}

// #endregion

//#region Reassignment of Documents

interface Request {
  salesForceId: string;
  document: string;
  from: string;
  to: string;
  series: string;
  status: ApprovalStatus;

  // NEW
  requestDate: string;
  requester: string;
}

const DOCUMENT_TYPES = [
  "Official Receipt",
  "Collection Receipt",
  "Sales Invoice",
  "Acknowledgement Receipt",
];

const EMPLOYEES = [
  "Grae Sensano",
  "Bryan Breezy Dalagdag",
  "Mark Ibe",
  "Jerome Jardio",
  "Jimwell Ocsio",
];

const REASSIGNMENT_DATA: Request[] = Array.from({ length: 20 }, (_, i) => {
  const start = 1 + i * 50;
  const end = start + 49;

  return {
    salesForceId: `SF-${String(1000 + i).padStart(4, "0")}`,
    document: DOCUMENT_TYPES[i % DOCUMENT_TYPES.length],
    series: `${String(start).padStart(8, "0")} - ${String(end).padStart(8, "0")}`,
    from: EMPLOYEES[i % EMPLOYEES.length],
    to: EMPLOYEES[(i + 1) % EMPLOYEES.length],
    status: APPROVAL_STATUSES[i % APPROVAL_STATUSES.length],
    requestDate: `2026-04-${String((i % 30) + 1).padStart(2, "0")}`,
    requester: EMPLOYEES[i % EMPLOYEES.length],
  };
});

function getReassignmentDrawerSections(row: Request): DrawerSections {
  return {
    requestId: row.salesForceId,
    status: row.status,
    moduleType: "Reassignment of Documents",
    summary: [
      { label: "Document", value: row.document },
      { label: "From", value: row.from },
      { label: "To (Employee ID)", value: row.to },
      { label: "Series", value: row.series },
      { label: "Request Date", value: row.requestDate },
      { label: "Requester", value: row.requester },
    ],
    dynamicContent: (
      <Box>
        <Text fontSize="sm">
          Reassignment of <b>{row.document}</b> from <b>{row.from}</b> to{" "}
          <b>{row.to}</b>.
        </Text>
      </Box>
    ),
    attachments: [],
    auditTrail: [
      { actor: row.from, action: "Requested reassignment", date: "2026-04-12" },
    ],
  };
}

const reassignmentColumns: ColumnConfig<Request>[] = [
  { key: "salesForceId", header: "SalesForce ID", sortable: true },
  { key: "document", header: "Document", sortable: true },
  { key: "series", header: "Series" },
  { key: "from", header: "From" },
  { key: "to", header: "To (Employee ID)" },

  // NEW
  { key: "requestDate", header: "Request Date", sortable: true },
  { key: "requester", header: "Requester", sortable: true },

  {
    key: "status",
    header: "Status",
    render: (v) => <StatusBadge status={String(v)} />,
  },
];

//#endregion

//#region DRS Approval

interface DRSApproval {
  id: string;
  depositedBy: string;
  siNo: string;
  amount: number;
  status: ApprovalStatus;
  date: string;
  branch: string;
  remarks: string;

  // NEW COMMON FIELDS
  requestDate: string;
  requester: string;

  // NEW DRS EXCLUSIVE
  depositDateTime: string;
}

export function mapDRSApprovalRows(
  items: DRSWithDepositAndPayments[],
): DRSApproval[] {
  return items.map((item) => {
    const details = item.deposit?.details ?? [];
    const payments = details
      .map((detail) => detail.payment)
      .filter(
        (payment): payment is NonNullable<typeof payment> => payment !== null,
      );

    const amount = payments.reduce(
      (sum, payment) => sum + Number(payment.SIAmount ?? 0),
      0,
    );

    return {
      id: item.drs.id,
      depositedBy: item.deposit?.deposit.DepositedBy ?? "-",
      siNo:
        details.length === 1
          ? details[0].depositDtl.SINo
          : `${details.length} SI(s)`,
      amount,
      status: item.drs.status,
      date: item.drs.createdAt,
      branch: "Head Office 1",
      requestDate: item.drs.createdAt,
      requester: item.deposit?.deposit.DepositedBy ?? "-",
      depositDateTime:
        item.deposit?.deposit.DepositDateTime ?? item.drs.createdAt,

      remarks: `Matched ${payments.length} payment(s)`,
    };
  });
}

const mappedDrs = mapDRSToDepositAndPayments(
  drsList,
  depositHdrList,
  depositDtlList,
  paymentList,
);

const DRS_DATA = mapDRSApprovalRows(mappedDrs);

const drsColumns: ColumnConfig<DRSApproval>[] = [
  {
    key: "id",
    header: "Reference No",
    sortable: true,
    render: (v) => (
      <Text fontFamily="mono" fontSize="sm">
        {String(v)}
      </Text>
    ),
  },

  { key: "requester", header: "Requester", sortable: true },
  { key: "requestDate", header: "Request Date", sortable: true },

  {
    key: "depositedBy",
    header: "Deposited By",
    sortable: true,
  },

  // EXCLUSIVE REQUIREMENT
  {
    key: "siNo",
    header: "SI No (Range)",
    sortable: true,
  },

  {
    key: "depositDateTime",
    header: "Deposit Date & Time",
    sortable: true,
  },

  {
    key: "amount",
    header: "Amount",
  },

  {
    key: "status",
    header: "Status",
    render: (v) => <StatusBadge status={String(v)} />,
  },
];
function getFullDRSById(id: string) {
  return mappedDrs.find((item) => item.drs.id === id) ?? null;
}

function getDRSDrawerSections(row: DRSApproval): DrawerSections {
  const fullDrs = getFullDRSById(row.id);

  return {
    requestId: row.id,
    status: row.status,
    moduleType: "DRS Approval",
    summary: [
      { label: "Deposited By", value: row.depositedBy },
      { label: "Date", value: row.date },
      {
        label: "Amount",
        value: new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
          minimumFractionDigits: 2,
        }).format(row.amount),
      },
    ],
    dynamicContent: (
      <Box>
        <Text fontSize="xs" color="fg.muted">
          Remarks
        </Text>
        <Text fontSize="sm" mb={4}>
          {row.remarks}
        </Text>

        {/* NEW SCROLLABLE SI LIST */}
        <Box
          maxH="200px"
          overflowY="auto"
          borderWidth="1px"
          borderRadius="md"
          p={2}
        >
          <Text fontSize="xs" mb={2} color="fg.muted">
            SI Encoded List (ORDate ↑, ORNo ↑)
          </Text>

          {fullDrs?.deposit?.details
            ?.slice()
            .sort((a, b) => {
              const aDate = new Date(a.payment?.SIDate ?? 0).getTime();
              const bDate = new Date(b.payment?.SIDate ?? 0).getTime();
              const aNo = Number(a.payment?.SI ?? 0);
              const bNo = Number(b.payment?.SI ?? 0);

              return aDate - bDate || aNo - bNo;
            })
            .map((d, i) => (
              <Box key={i} fontSize="sm" py={1}>
                <Text>
                  SI: <b>{d.depositDtl.SINo}</b> | OR: {d.payment?.SI} |{" "}
                  {d.payment?.SIDate}
                </Text>
              </Box>
            ))}
        </Box>

        <Box mt={4}>
          {fullDrs ? (
            <DRSPreviewModal drs={fullDrs} />
          ) : (
            <Text fontSize="sm">Full DRS not found.</Text>
          )}
        </Box>
      </Box>
    ),
    attachments: [],
    auditTrail: [
      { actor: row.depositedBy, action: "Submitted payment", date: row.date },
    ],
  };
}

function DRSPreviewModal({
  drs,
  triggerLabel = "View Full DRS",
}: {
  drs: DRSWithDepositAndPayments;
  triggerLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const details = drs.deposit?.details ?? [];
  const depositHdr = drs.deposit?.deposit;
  const payments = details
    .map((d) => d.payment)
    .filter((p): p is NonNullable<typeof p> => p != null);

  const totalAmount = payments.reduce(
    (sum, p) => sum + Number(p.SIAmount ?? 0),
    0,
  );

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>

      <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)} size="xl">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="5xl">
              <Dialog.Header>
                <Dialog.Title>Digital Remittance Slip</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body p={0}>
                <DRSPrintLayout drs={drs} />
              </Dialog.Body>

              <Dialog.Footer>
                <Button variant="outline" onClick={() => window.print()}>
                  Print
                </Button>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Close</Button>
                </Dialog.ActionTrigger>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}

//#endregion

const commonFilters: FilterConfig[] = [
  {
    key: "status",
    options: [
      { label: "All", value: "" },
      { label: "Pending", value: "Pending" },
      { label: "Approved", value: "Approved" },
      { label: "Denied", value: "Denied" },
    ],
    default: "Pending",
  },
];

function RenderApproval<T extends Record<string, any>>({
  config,
  delay,
  headerContent,
}: {
  config: {
    title: string;
    data: T[];
    columns: ColumnConfig<T>[];
    drawer: (row: T) => DrawerSections;
    setData: React.Dispatch<React.SetStateAction<T[]>>;
    successLabel: string;
    rowIdKey: keyof T;
  };
  delay: () => Promise<void>;
  headerContent?: React.ReactNode;
}) {
  const key = config.rowIdKey;

  return (
    <ApprovalPage<T>
      title={config.title}
      data={config.data}
      columns={config.columns}
      rowIdKey={key}
      filters={commonFilters}
      enableColumnFilter={true}
      sorting={true}
      renderDrawerContent={config.drawer}
      onApprove={async (row, remarks) => {
        await delay();
        config.setData((prev) =>
          prev.map((r) =>
            r[key] === row[key] ? { ...r, status: "Approved" } : r,
          ),
        );
        toast.success(`${row[key]} approved`);
      }}
      onReject={async (row, remarks) => {
        await delay();
        config.setData((prev) =>
          prev.map((r) =>
            r[key] === row[key] ? { ...r, status: "Denied" } : r,
          ),
        );
        toast.success(`${row[key]} denied`);
      }}
      onBulkApprove={async (rows) => {
        await delay();
        const ids = new Set(rows.map((r) => r[key]));
        config.setData((prev) =>
          prev.map((r) => (ids.has(r[key]) ? { ...r, status: "Approved" } : r)),
        );
        toast.success(`${rows.length} ${config.successLabel} approved`);
      }}
      onBulkReject={async (rows) => {
        await delay();
        const ids = new Set(rows.map((r) => r[key]));
        config.setData((prev) =>
          prev.map((r) => (ids.has(r[key]) ? { ...r, status: "Denied" } : r)),
        );
        toast.success(`${rows.length} ${config.successLabel} denied`);
      }}
      headerContent={headerContent}
    />
  );
}

export default function ApprovalsPage() {
  const [view, setView] = React.useState<ApprovalView>("reassignment-doc");

  const [reassignmentData, setReassignmentData] =
    React.useState(REASSIGNMENT_DATA);
  const [drsData, setDrsData] = React.useState(DRS_DATA);
  const [sa2Data, setSa2Data] = React.useState(SA2_DATA);
  const [movementData, setMovementData] = React.useState(MOVEMENT_DATA);

  const delay = () => new Promise<void>((resolve) => setTimeout(resolve, 500));

  const ApprovalType = createListCollection({
    items: [
      { label: "Reassignment of Documents", value: "reassignment-doc" },
      { label: "Digital Remittance Slip", value: "drs" },
      { label: "Reassignment of SA2", value: "reassignment-sa2" },
      { label: "Movement of Employees", value: "movement-employees" },
    ],
  });

  const configMap = {
    "reassignment-doc": {
      title: "Reassignment",
      data: reassignmentData,
      columns: reassignmentColumns,
      drawer: getReassignmentDrawerSections,
      setData: setReassignmentData,
      successLabel: "requests",
      rowIdKey: "salesForceId" as const,
    },

    drs: {
      title: "Digital Remittance Slip",
      data: drsData,
      columns: drsColumns,
      drawer: getDRSDrawerSections,
      setData: setDrsData,
      successLabel: "payments",
      rowIdKey: "id" as const,
    },

    "reassignment-sa2": {
      title: "Reassignment of SA2",
      data: sa2Data,
      columns: sa2Columns,
      drawer: getSA2DrawerSections,
      setData: setSa2Data,
      successLabel: "reassignments",
      rowIdKey: "id" as const,
    },

    "movement-employees": {
      title: "Movement of Employees",
      data: movementData,
      columns: movementColumns,
      drawer: getMovementDrawerSections,
      setData: setMovementData,
      successLabel: "movements",
      rowIdKey: "id" as const,
    },
  };

  return (
    <Page.Root
      title="Approvals"
      description="Manage your pending approvals here."
      // separator={true}
    >
      <Page.MainContent>
        <Box></Box>
        {/* Dropdown */}
        {/* <Box maxW="320px">
        <SelectFloatingLabel
          label="Select Approval Type"
          collection={ApprovalType}
          value={[view]}
          onValueChanged={(values) => setView(values[0] as ApprovalView)}
        />
      </Box> */}

        {/* Dynamic Rendering */}
        {/* {view === "reassignment-doc" && (
        <RenderApproval<Request>
          config={configMap["reassignment-doc"]}
          delay={delay}
          headerContent={
            <SelectFloatingLabel
              label="Select Approval Type"
              collection={ApprovalType}
              value={[view]}
              onValueChanged={(values) => setView(values[0] as ApprovalView)}
              maxW="320px"
            />
          }
        />
      )}

      {view === "drs" && (
        <RenderApproval<DRSApproval>
          config={configMap["drs"]}
          delay={delay}
          headerContent={
            <SelectFloatingLabel
              label="Select Approval Type"
              collection={ApprovalType}
              value={[view]}
              onValueChanged={(values) => setView(values[0] as ApprovalView)}
              maxW="320px"
            />
          }
        />
      )}

      {view === "reassignment-sa2" && (
        <RenderApproval<SA2Reassignment>
          config={configMap["reassignment-sa2"]}
          delay={delay}
          headerContent={
            <SelectFloatingLabel
              label="Select Approval Type"
              collection={ApprovalType}
              value={[view]}
              onValueChanged={(values) => setView(values[0] as ApprovalView)}
              maxW="320px"
            />
          }
        />
      )}

      {view === "movement-employees" && (
        <RenderApproval<EmployeeMovement>
          config={configMap["movement-employees"]}
          delay={delay}
          headerContent={
            <SelectFloatingLabel
              label="Select Approval Type"
              collection={ApprovalType}
              value={[view]}
              onValueChanged={(values) => setView(values[0] as ApprovalView)}
              maxW="320px"
            />
          }
        />
      )} */}
      </Page.MainContent>
    </Page.Root>
  );
}
