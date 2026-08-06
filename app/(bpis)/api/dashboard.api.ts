import { delay } from "@/lib/delay";

import type {
  DashboardOverview,
  MonthlySalesPoint,
  MonthlySalesYear,
} from "./dashboard.types";
import { quotaAndCollections } from "@/app/(pis)/accounts-management/dashboard-data";
import {
  planholders,
  agentLeaderboards,
  monthlyNewSales,
} from "@/components/dashboard/mock-data/dashboard-data";

/**
 * Mock API layer for the dashboard page. Each function simulates the shape
 * and latency of a real network call so it can be swapped for a live
 * endpoint later without touching hooks or components.
 */

export async function getDashboardOverview(): Promise<DashboardOverview> {
  await delay(300);

  return {
    accountOverview: planholders,
    quotaAndCollections,
    agentLeaderboard: agentLeaderboards,
  };
}

export async function getMonthlyNewSales(
  year: MonthlySalesYear,
): Promise<MonthlySalesPoint[]> {
  await delay(200);

  return monthlyNewSales.find((entry) => entry.year === year)?.data ?? [];
}
