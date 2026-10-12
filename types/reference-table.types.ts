/** One row of the `refrelationship` reference table. */
export interface RefRelationship {
  relationCode: string;
  // Upper-case label, e.g. "SPOUSE".
  description: string;
  isActive: boolean;
  auditUser: string | null;
  auditDate: string | null;
  editUser: string | null;
  editDate: string | null;
}

/** One row of the `refplantype` reference table. */
export interface RefPlanType {
  planCode: string;
  // Groups one product's plan codes across modes and terms.
  catalogId: string | null;
  planClass: string | null;
  // M, Q, S, A, or C (spot cash).
  mode: string | null;
  term: string | null;
  tap: number | null;
  cbi: number | null;
  instAmt: number | null;
  benefits: string | null;
  isActive: boolean;
  auditUser: string | null;
  auditDate: string | null;
  editUser: string | null;
  editDate: string | null;
}
