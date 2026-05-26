import type { DrawerSections } from "./ApprovalDrawer";

export interface ColumnConfig<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  meta?: {
    responsivePriority?: number; // lower = more important
    alwaysVisible?: boolean;
  };
}

export interface FilterConfig {
  key: string;
  options: { label: string; value: string }[];
  default?: string;
}

export interface ApprovalPageProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  rowIdKey: keyof T;
  isLoading?: boolean;
  sorting?: boolean;
  enableColumnFilter: boolean;
  onApprove: (row: T, remarks: string) => Promise<void>;
  onReject: (row: T, remarks: string) => Promise<void>;
  onBulkApprove: (rows: T[]) => Promise<void>;
  onBulkReject: (rows: T[]) => Promise<void>;
  renderDrawerContent: (row: T) => DrawerSections;
  filters?: FilterConfig[];
  title?: string;
  pageSize?: number;
  headerContent?: React.ReactNode;
}
