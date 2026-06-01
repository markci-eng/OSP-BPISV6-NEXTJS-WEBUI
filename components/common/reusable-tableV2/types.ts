import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

export type TableSize = "sm" | "md" | "lg";

export type RowAction<T> = {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "destructive";
  separator?: boolean;
  hidden?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
  onClick: (row: T) => void;
};

export type BulkAction<T> = RowAction<T[]>;

export const multiSelectFilter: FilterFn<any> = (
  row,
  columnId,
  filterValue,
) => {
  const selected = (filterValue ?? []) as string[];

  if (!selected.length) return true;

  const cellValue = String(row.getValue(columnId) ?? "");

  return selected.includes(cellValue);
};

export type DataTableFeatures = {
  sorting?: boolean;
  filtering?: boolean;
  search?: boolean;
  pagination?: boolean;
  columnToggle?: boolean;
  selection?: boolean;
  draggable?: boolean;
  detailSidebar?: boolean;
};

export const DEFAULT_FEATURES: Required<DataTableFeatures> = {
  sorting: true,
  filtering: true,
  search: true,
  pagination: true,
  columnToggle: true,
  selection: true,
  draggable: true,
  detailSidebar: true,
};

export const SIZE_STYLES = {
  sm: {
    headerPx: 2,
    cellPx: 2,
    fontSize: "xs",
  },
  md: {
    headerPx: 3,
    cellPx: 3,
    fontSize: "sm",
  },
  lg: {
    headerPx: 4,
    cellPx: 4,
    fontSize: "sm",
  },
};

export interface HeaderButton {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
}

export type DataTableSummaryAggregation = "sum" | "average" | "count" | "min" | "max";

export type DataTableSummaryValueContext<TData> = {
  columnId: string;
  rows: TData[];
  allRows: TData[];
  values: unknown[];
  aggregate: (type: DataTableSummaryAggregation, columnId: string) => number;
  formatNumber: (value: number) => string;
};

export type DataTableSummaryCell<TData> =
  | React.ReactNode
  | ((context: DataTableSummaryValueContext<TData>) => React.ReactNode);

export type DataTableSummaryRow<TData> = {
  id?: string;
  label?: React.ReactNode;
  labelColumnId?: keyof TData & string;
  includeFilteredRows?: boolean;
  values?: Partial<Record<keyof TData & string, DataTableSummaryCell<TData>>>;
  aggregations?: Partial<
    Record<keyof TData & string, DataTableSummaryAggregation>
  >;
};

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];

  headerContent?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;

  features?: DataTableFeatures;
  size?: TableSize;

  pageSizeOptions?: number[];
  defaultPageSize?: number;

  renderDetail?: (row: TData) => React.ReactNode;

  onRowClick?: (row: TData) => void;
  headerButton?: HeaderButton;

  rowActions?: RowAction<TData>[];
  bulkActions?: BulkAction<TData>[];

  onReorder?: (next: TData[]) => void;
  onSelectionChange?: (rows: TData[]) => void;

  emptyState?: React.ReactNode;
  headerActions?: React.ReactNode;

  className?: string;
  getRowId?: (row: TData, index: number) => string;

  floatingBulkActions?: boolean;

  summaryRows?: DataTableSummaryRow<TData>[];

  mobileConfig?: DataTableMobileConfig<TData>;

  toolbarTop?: string | number;
};

export type DataTableMobileViewMode = "scroll" | "card" | "accordion";

export type DataTableMobileField<TData> = keyof TData & string;

export type DataTableMobileConfig<TData> = {
  /**
   * scroll    = keep desktop-like table with horizontal scroll
   * card      = render each row as a mobile card
   * accordion = render each row as collapsible mobile row
   */
  viewMode?: DataTableMobileViewMode;

  /**
   * Main value displayed in mobile view.
   * Example: documentType, referenceNo, ORNo, employeeName
   */
  primaryField?: DataTableMobileField<TData>;

  /**
   * Optional text transformation for the primary field in mobile view. Defaults to "uppercase".
   * Example: "uppercase" for document types, "capitalize" for names, "none" to keep original casing.
   */
  titleTransform?: "none" | "uppercase" | "capitalize";

  /**
   * Smaller secondary value below the primary value.
   * Example: documentCode, controlNo, payor, department
   */
  secondaryField?: DataTableMobileField<TData>;

  /**
   * Optional right-side field.
   * Example: remainingQtyNum, status, amount
   */
  badgeField?: DataTableMobileField<TData>;

  /**
   * Fields shown as label/value rows inside the mobile card or accordion.
   */
  visibleFields?: DataTableMobileField<TData>[];

  /**
   * A map for customizing the labels of visible fields.
   */
  labelMap?: Partial<Record<keyof TData & string, string>>;

  /**
   * Optional map for custom value formatting in mobile view. If a field is not included here, it will fall back to default rendering.
   */
  valueFormatter?: Partial<
    Record<
      keyof TData & string,
      (value: unknown, row: TData) => React.ReactNode
    >
  >;

  /**
   * Optional map for customizing badge colors based on the badgeField value.
   * Example: { "Expired": "red", "Expiring Soon": "yellow", "Valid": "green" }
   */
  badgeColorMap?: Record<string, string>;

  /**
   * Fully custom mobile card renderer.
   * If provided, this overrides the default card layout.
   */
  renderMobileCard?: (row: TData) => React.ReactNode;

  /**
   * Fully custom mobile accordion renderer.
   * If provided, this overrides the default accordion content layout.
   */
  renderMobileAccordion?: (row: TData) => React.ReactNode;
};
