/**
 * Reference documents shared by the request modules. Codes follow the
 * CS###### convention used by the current RITF system.
 */
export interface DocumentRef {
  refCode: string;
  refDesc: string;
}

export const DOCUMENT_REQUIREMENTS: DocumentRef[] = [
  { refCode: "CS000476", refDesc: "AFFIDAVIT OF LOSS (COFP)" },
  { refCode: "CS000474", refDesc: "AFFIDAVIT OF LOSS (LPA)" },
  { refCode: "CS000475", refDesc: "AFFIDAVIT OF LOSS (POLICY CARD)" },
  { refCode: "CS000333", refDesc: "AFFIDAVIT OF TWO DISINTERESTED PERSONS" },
  { refCode: "CS000513", refDesc: "APPLICATION FOR TRANSFER OF RIGHT" },
  { refCode: "CS000156", refDesc: "BSOA" },
  { refCode: "CS000517", refDesc: "TRANSFEREE ID" },
  { refCode: "CS000518", refDesc: "TRANSFEROR ID" },
  { refCode: "CS000201", refDesc: "AUTHORIZATION LETTER" },
  { refCode: "CS000202", refDesc: "BARANGAY CERTIFICATION" },
  { refCode: "CS000203", refDesc: "BIRTH CERTIFICATE" },
  { refCode: "CS000204", refDesc: "CERTIFICATE OF FULL PAYMENT" },
  { refCode: "CS000205", refDesc: "CERTIFICATE OF NO MARRIAGE" },
  { refCode: "CS000206", refDesc: "COLLECTOR ENDORSEMENT" },
  { refCode: "CS000207", refDesc: "DEATH CERTIFICATE" },
  { refCode: "CS000208", refDesc: "DEED OF ASSIGNMENT" },
  { refCode: "CS000209", refDesc: "DEED OF DONATION" },
  { refCode: "CS000210", refDesc: "DEED OF SALE" },
  { refCode: "CS000211", refDesc: "ENDORSEMENT LETTER" },
  { refCode: "CS000212", refDesc: "GOVERNMENT ISSUED ID (BACK)" },
  { refCode: "CS000213", refDesc: "GOVERNMENT ISSUED ID (FRONT)" },
  { refCode: "CS000214", refDesc: "INSTALLMENT RECEIPT" },
  { refCode: "CS000215", refDesc: "LETTER OF INTENT" },
  { refCode: "CS000216", refDesc: "LPA CONTRACT COPY" },
  { refCode: "CS000217", refDesc: "MARRIAGE CERTIFICATE" },
  { refCode: "CS000218", refDesc: "NOTARIZED SPECIAL POWER OF ATTORNEY" },
  { refCode: "CS000219", refDesc: "OFFICIAL RECEIPT" },
  { refCode: "CS000220", refDesc: "POLICY CARD" },
  { refCode: "CS000221", refDesc: "PROOF OF BILLING" },
  { refCode: "CS000222", refDesc: "PROOF OF RELATIONSHIP" },
  { refCode: "CS000223", refDesc: "REINSTATEMENT APPLICATION FORM" },
  { refCode: "CS000224", refDesc: "SIGNATURE SPECIMEN" },
  { refCode: "CS000225", refDesc: "STATEMENT OF ACCOUNT" },
  { refCode: "CS000226", refDesc: "WAIVER OF RIGHTS" },
];

// A few requirements already on file, so the "Documents Submitted" list is
// not empty on every request.
export function buildSubmittedDocuments(i: number): DocumentRef[] {
  const count = i % 5;
  return Array.from(
    { length: count },
    (_, d) => DOCUMENT_REQUIREMENTS[(i + d * 7) % DOCUMENT_REQUIREMENTS.length],
  );
}
