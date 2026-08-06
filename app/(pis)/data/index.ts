// Public entry point for the PIS data layer (app/(pis)).
//
// Import domain models and the mock database from here:
//
//   import { db, Planholder, toFullName } from "@/app/(pis)/data";
//
// Feature modules (e.g. claims) build their view-models on top of `db`.

export * from "./models";
export { PisDatabase, db } from "./database";
// The one piece of seed a feature has to know by name: which bulk claims were
// decided, for the death-claim endorsement queue's activity feed.
export { bulkDecidedClaimRefs } from "./seed";
