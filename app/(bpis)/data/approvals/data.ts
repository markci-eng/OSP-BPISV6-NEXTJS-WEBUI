import type { DRSRecord } from "./types";

export const drsList: DRSRecord[] = [
  {
    id: "DRS1",
    referenceNo: "DRS-001",
    status: "Pending",
    createdAt: "2026-03-01",
  },
  {
    id: "DRS2",
    referenceNo: "DRS-002",
    status: "Approved",
    createdAt: "2026-03-02",
  },
  {
    id: "DRS3",
    referenceNo: "DRS-003",
    status: "Denied",
    createdAt: "2026-03-03",
  },
  {
    id: "DRS4",
    referenceNo: "DRS-004",
    status: "Pending",
    createdAt: "2026-03-04",
  },
  {
    id: "DRS5",
    referenceNo: "DRS-005",
    status: "Approved",
    createdAt: "2026-03-05",
  },
];

export const depositHdrList = [
  {
    id: "DEP1",
    name: "DRS-001",
    DepositDateTime: "2026-03-01 10:00:00",
    AccountNo: "AC001",
    BankBranch: "Branch A",
    BankCode: "B001",
    Amount: "10000.00",
    DepositedBy: "User1",
    isApproved: 1,
  },
  {
    id: "DEP2",
    name: "DRS-002",
    DepositDateTime: "2026-03-02 10:00:00",
    AccountNo: "AC002",
    BankBranch: "Branch B",
    BankCode: "B002",
    Amount: "12000.00",
    DepositedBy: "User2",
    isApproved: 1,
  },
  {
    id: "DEP3",
    name: "DRS-003",
    DepositDateTime: "2026-03-03 10:00:00",
    AccountNo: "AC003",
    BankBranch: "Branch C",
    BankCode: "B003",
    Amount: "9000.00",
    DepositedBy: "User3",
    isApproved: 0,
  },
  {
    id: "DEP4",
    name: "DRS-004",
    DepositDateTime: "2026-03-04 10:00:00",
    AccountNo: "AC004",
    BankBranch: "Branch D",
    BankCode: "B004",
    Amount: "15000.00",
    DepositedBy: "User4",
    isApproved: 1,
  },
  {
    id: "DEP5",
    name: "DRS-005",
    DepositDateTime: "2026-03-05 10:00:00",
    AccountNo: "AC005",
    BankBranch: "Branch E",
    BankCode: "B005",
    Amount: "11000.00",
    DepositedBy: "User5",
    isApproved: 1,
  },
];

export const depositDtlList = Array.from({ length: 5 }).flatMap((_, i) => {
  const depositIndex = i + 1;
  const depositDate = `2026-03-0${depositIndex} 10:00:00`;

  return Array.from({ length: 10 }).map((_, j) => ({
    depositDateTime: depositDate,
    SINo: `SI-${depositIndex}${String(j + 1).padStart(3, "0")}`,
  }));
});

export const paymentList = Array.from({ length: 5 }).flatMap((_, i) => {
  const depositIndex = i + 1;

  return Array.from({ length: 10 }).map((_, j) => {
    const SINo = `SI-${depositIndex}${String(j + 1).padStart(3, "0")}`;

    return {
      LPANo: `LPA-${depositIndex}${j + 1}`,
      name: `Customer ${depositIndex}-${j + 1}`,
      SI: `SI-${depositIndex}${j + 1}`,
      SIDate: "2026-03-01",
      SIAmount: (1000 + j * 100).toFixed(2),
      InstNo: j + 1,
      PayClass: j % 2 === 0 ? "NS" : "DC",
      TEPCV: "0.00",
      TEDue: "0.00",
      COMPCV: `CV-${depositIndex}${j + 1}`,
      GrossCom: "10.00",
      TaxCom: "1.00",
      ComDue: "9.00",
      AuditDate: "2026-03-01",
      AuditUser: "SYSTEM",
      EditDate: "2026-03-01",
      EditUser: "SYSTEM",

      // IMPORTANT LINK
      SINo: SINo,
    };
  });
});

import type {
  ApprovalStatus,
  EmployeeMovement,
  ReassignmentRequest,
  SA2Reassignment,
  UserAssignmentRequest,
} from "./types";

export const APPROVAL_STATUSES: ApprovalStatus[] = [
  "Pending",
  "Pending",
  "Approved",
  "Denied",
];

export const DOCUMENT_TYPES = [
  "Official Receipt",
  "Collection Receipt",
  "Sales Invoice",
  "Acknowledgement Receipt",
];

export const EMPLOYEES = [
  "Grae Sensano",
  "Bryan Breezy Dalagdag",
  "Mark Ibe",
  "Jerome Jardio",
  "Jimwell Ocsio",
];

export const EMPLOYEE_CODES = [
  "EMP-1001",
  "EMP-1002",
  "EMP-1003",
  "EMP-1004",
  "EMP-1005",
];

export const REASSIGNMENT_DATA: ReassignmentRequest[] = Array.from(
  { length: 20 },
  (_, i) => {
    const start = 1 + i * 50;
    const end = start + 49;

    return {
      salesForceId: `SF-${String(1000 + i).padStart(4, "0")}`,
      document: DOCUMENT_TYPES[i % DOCUMENT_TYPES.length],
      series: `${String(start).padStart(8, "0")} - ${String(end).padStart(
        8,
        "0",
      )}`,
      from: EMPLOYEES[i % EMPLOYEES.length],
      fromEmpCode: EMPLOYEE_CODES[i % EMPLOYEE_CODES.length],
      to: EMPLOYEES[(i + 1) % EMPLOYEES.length],
      toEmpCode: EMPLOYEE_CODES[(i + 1) % EMPLOYEE_CODES.length],
      status: APPROVAL_STATUSES[i % APPROVAL_STATUSES.length],
      requestDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 30) + 1).padStart(2, "0")}`,
      requester: EMPLOYEES[i % EMPLOYEES.length],
    };
  },
);

export const SA2_DATA: SA2Reassignment[] = Array.from(
  { length: 20 },
  (_, i) => {
    const branches = [
      "Head Office",
      "Cebu Branch",
      "Davao Branch",
      "Makati Branch",
      "Quezon City Branch",
    ];

    const managers = [
      "Marcus Sensano",
      "Allen Reyes",
      "Leo Santos",
      "Ramon Cruz",
      "Carlo Mendoza",
    ];

    const employee = EMPLOYEES[i % EMPLOYEES.length];

    return {
      id: `SA2-${String(i + 1).padStart(4, "0")}`,
      employee,
      fromManager: managers[i % managers.length],
      toManager: managers[(i + 1) % managers.length],
      branch: branches[i % branches.length],
      status: APPROVAL_STATUSES[i % APPROVAL_STATUSES.length],
      date: `2026-04-${String((i % 30) + 1).padStart(2, "0")}`,
      requestDate: `2026-04-${String((i % 30) + 1).padStart(2, "0")}`,
      requester: EMPLOYEES[(i + 2) % EMPLOYEES.length],
    };
  },
);

export const MOVEMENT_DATA: EmployeeMovement[] = Array.from(
  { length: 20 },
  (_, i) => {
    const positions = ["SA1", "SA2", "STL", "BM", "AM"];
    const movementTypes: EmployeeMovement["movementType"][] = [
      "Promotion",
      "Demotion",
    ];

    const currentPosition = positions[i % positions.length];
    const newPosition =
      i % 2 === 0
        ? positions[Math.min((i % positions.length) + 1, positions.length - 1)]
        : positions[Math.max((i % positions.length) - 1, 0)];

    return {
      id: `MOV-${String(i + 1).padStart(4, "0")}`,
      employee: EMPLOYEES[i % EMPLOYEES.length],
      currentPosition,
      newPosition,
      movementType: movementTypes[i % movementTypes.length],
      status: APPROVAL_STATUSES[i % APPROVAL_STATUSES.length],
      date: `2026-04-${String((i % 30) + 1).padStart(2, "0")}`,
      requestDate: `2026-04-${String((i % 30) + 1).padStart(2, "0")}`,
      requester: EMPLOYEES[(i + 1) % EMPLOYEES.length],
    };
  },
);

/**
 * Pending and settled access group assignments.
 *
 * Written out rather than generated: a role change only reads as a decision
 * worth approving when the user, the groups they hold, and what the change
 * costs them in permissions line up — which they cannot when the three are
 * picked independently out of a modulo. The users and AccessGroupCodes here
 * are the ones the access console itself ships with.
 */
export const USER_ASSIGNMENT_DATA: UserAssignmentRequest[] = [
  {
    id: "UAR-0001",
    user: "Jasmine Delos Reyes",
    memberCode: "10247",
    position: "Sales Supervisor",
    branch: "Cebu — Mandaue",
    currentGroups: "SLSSUP",
    requestedGroups: "SLSSUP, BRMGR",
    permissionEffect: "+21 / −0",
    status: "Pending",
    date: "2026-09-16",
    requestDate: "2026-09-16",
    requester: "Mark Cristian Ibe",
  },
  {
    id: "UAR-0002",
    user: "Renato Villanueva",
    memberCode: "10382",
    position: "Cashier",
    branch: "Davao — Matina",
    currentGroups: "CASHR",
    requestedGroups: "CASHR, AUDIT",
    permissionEffect: "+6 / −0",
    status: "Pending",
    date: "2026-09-15",
    requestDate: "2026-09-15",
    requester: "Grace Ann Tolentino",
  },
  {
    id: "UAR-0003",
    user: "Paolo Mendoza",
    memberCode: "10612",
    position: "New Hire — Trainee",
    branch: "Manila — Ortigas",
    currentGroups: "TRNEE",
    requestedGroups: "SLSSUP",
    permissionEffect: "+9 / −2",
    status: "Pending",
    date: "2026-09-15",
    requestDate: "2026-09-15",
    requester: "Jasmine Delos Reyes",
  },
  {
    id: "UAR-0004",
    user: "Mark Cristian Ibe",
    memberCode: "10001",
    position: "Branch Manager",
    branch: "Cebu — Mandaue",
    currentGroups: "BRMGR",
    requestedGroups: "BRMGR, CASHR",
    permissionEffect: "+5 / −0",
    status: "Pending",
    date: "2026-09-12",
    requestDate: "2026-09-12",
    requester: "Grace Ann Tolentino",
  },
  {
    id: "UAR-0005",
    user: "Aileen Bautista",
    memberCode: "10455",
    position: "Accounts Officer",
    branch: "Manila — Ortigas",
    currentGroups: "BRMGR",
    requestedGroups: "AUDIT",
    permissionEffect: "+3 / −27",
    status: "Approved",
    date: "2026-09-08",
    requestDate: "2026-09-08",
    requester: "Mark Cristian Ibe",
  },
  {
    id: "UAR-0006",
    user: "Grace Ann Tolentino",
    memberCode: "10733",
    position: "Regional Director",
    branch: "National",
    currentGroups: "BRMGR, AUDIT",
    requestedGroups: "SYSADM",
    permissionEffect: "+24 / −0",
    status: "Denied",
    date: "2026-09-04",
    requestDate: "2026-09-04",
    requester: "Mark Cristian Ibe",
  },
];
