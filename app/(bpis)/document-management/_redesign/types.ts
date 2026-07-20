export type Filters = {
  q: string;
  type: string;
  status: string;
  agent: string;
  expFrom: string;
  expTo: string;
  remMin: string;
  remMax: string;
};

export const EMPTY_FILTERS: Filters = {
  q: "",
  type: "",
  status: "",
  agent: "",
  expFrom: "",
  expTo: "",
  remMin: "",
  remMax: "",
};

export function hasActiveFilters(f: Filters): boolean {
  return (
    !!f.q ||
    !!f.type ||
    !!f.status ||
    !!f.agent ||
    !!f.expFrom ||
    !!f.expTo ||
    f.remMin !== "" ||
    f.remMax !== ""
  );
}
