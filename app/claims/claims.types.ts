export interface PayeeInfo {
  id: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  suffix?: string;
  relToPh: string;
  email: string;
  contactNumber: string;
  channel: string;
  bankName: string;
  accountName: string;
  accountNo: string;
}

export interface ClaimInfoState {
  incidentDate: string; // ISO yyyy-mm-dd
  incidentType: string;
  claimType: string;
}

export const blankPayee = (): PayeeInfo => ({
  id: Math.random().toString(36).slice(2, 9),
  lastName: "",
  firstName: "",
  middleName: "",
  suffix: "",
  relToPh: "",
  email: "",
  contactNumber: "",
  channel: "",
  bankName: "",
  accountName: "",
  accountNo: "",
});

export const composePayeeName = (p: PayeeInfo): string =>
  [p.firstName, p.middleName, p.lastName, p.suffix]
    .filter(Boolean)
    .join(" ")
    .trim() || "—";

export const initialPayees: PayeeInfo[] = [
  {
    id: "1",
    lastName: "Torvalds",
    firstName: "Linus",
    middleName: "Benedict",
    suffix: "",
    relToPh: "Sibling",
    email: "linus.torvalds@example.com",
    contactNumber: "+63 912 345 6789",
    channel: "Bank Transfer",
    bankName: "BDO",
    accountName: "Linus Torvalds",
    accountNo: "1234567890",
  },
  {
    id: "2",
    lastName: "Musk",
    firstName: "Elon",
    middleName: "Reeve",
    suffix: "",
    relToPh: "Cousin",
    email: "elon.musk@example.com",
    contactNumber: "+63 912 999 8888",
    channel: "Check",
    bankName: "BPI",
    accountName: "Elon Musk",
    accountNo: "9876543210",
  },
];

export const initialClaimInfo: ClaimInfoState = {
  incidentDate: "2026-03-13",
  incidentType: "Accident",
  claimType: "Cash Assistance, Accidental Death",
};
