// Public entry point for the PIS data layer (app/(pis)).
//
// Import domain models and the mock database from here:
//
//   import { db, Planholder, toFullName } from "@/app/(pis)/data";
//
// Feature modules (e.g. claims) build their view-models on top of `db`.

export * from "./models";
// The billing period and the code a chapel's period is known by. In the data
// layer because `TblBillingHdr.BillingCode` is a column the seed has to write —
// see the note at the top of that file.
export * from "./billing-period";
// The one thing the billing tables' builder exposes beyond the rows themselves:
// the company that owes a payable, which a billing raised in the browser has to
// write the same way one already on file does.
export { BILLING_COMPANY } from "./billing-seed";
export { PisDatabase, db } from "./database";
// The one piece of seed a feature has to know by name: which bulk claims were
// decided, for the death-claim endorsement queue's activity feed.
export { bulkDecidedClaimRefs } from "./seed";
