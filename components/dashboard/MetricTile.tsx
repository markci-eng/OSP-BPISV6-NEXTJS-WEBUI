"use client";

import { MetricCard } from "osp-ui-kit";
import type { IconType } from "react-icons";

/**
 * Adapter from the dashboard's KPI data onto the kit's MetricCard. It adds no
 * styling of its own.
 *
 * `accent` is a semantic name, never a colour: MetricCard looks it up in its
 * own tint map, so a hex would yield an invalid token and an unstyled icon.
 *
 * `deltaDirection` drives colour only, so it carries the good/bad reading
 * while `deltaLabel` carries the literal direction. That split lets a falling
 * lapsed-account count read as a green "decreased".
 */
export type MetricTileProps = {
  Icon: IconType;
  title: string;
  value: string;
  /** Prior-period figure, already formatted. */
  prevVal: string;
  monthOverMonthPercentage: number;
  /** "asc" (default) treats a rise as good news; "desc" treats a fall as good. */
  order?: "asc" | "desc";
  accent: "success" | "info" | "warning" | "danger" | "primary";
};

export const MetricTile = ({
  Icon,
  title,
  value,
  prevVal,
  monthOverMonthPercentage,
  order = "asc",
  accent,
}: MetricTileProps) => {
  const isGood =
    order === "asc"
      ? monthOverMonthPercentage >= 0
      : monthOverMonthPercentage <= 0;

  return (
    <MetricCard
      icon={<Icon size={24} />}
      label={title}
      accent={accent}
      value={value}
      subtitle={`vs ${prevVal}`}
      delta={`${Math.abs(monthOverMonthPercentage).toFixed(1)}%`}
      deltaDirection={isGood ? "up" : "down"}
      deltaLabel={
        monthOverMonthPercentage > 0
          ? "increased"
          : monthOverMonthPercentage < 0
            ? "decreased"
            : "no change"
      }
    />
  );
};
