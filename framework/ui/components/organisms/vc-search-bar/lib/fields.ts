import type { EnumOperator, FilterOption, SearchBarField } from "@core/types/search-bar";
import { warnOnce } from "./warn";

export type FieldKind = "text" | "select" | "multiselect" | "dateRange" | "toggle" | "number" | "custom";

export interface BarField {
  id: string;
  label: string;
  kind: FieldKind;
  key: string;
  options: FilterOption[];
  operators: EnumOperator[];
  range?: [string, string];
  textField?: string;
  source: SearchBarField;
}

export function normalizeField(f: SearchBarField): BarField {
  const filter = f.filter;
  const out: BarField = {
    id: f.id,
    label: f.label,
    kind: "text",
    key: f.key ?? f.id,
    options: [],
    operators: f.operators ?? ["any"],
    source: f,
  };

  if (typeof filter === "string") {
    out.textField = filter;
  } else if (typeof filter !== "object" || filter === null) {
    out.textField = f.id;
  } else if ("toggle" in filter) {
    out.kind = "toggle";
  } else if ("number" in filter) {
    out.kind = "number";
  } else if ("component" in filter) {
    out.kind = "custom";
  } else if ("range" in filter) {
    out.kind = "dateRange";
    out.range = filter.range;
  } else if ("options" in filter) {
    out.kind = filter.multiple ? "multiselect" : "select";
    out.options = filter.options;
  } else {
    out.textField = f.id;
  }
  return out;
}

export function normalizeFields(list: SearchBarField[]): BarField[] {
  const seen = new Set<string>();
  const result: BarField[] = [];
  for (const f of list) {
    // `filter: false` means no filter UI, as in the old filters panel
    if (f.filter === false) continue;
    if (seen.has(f.id)) {
      // normalizeFields runs inside a computed: once per id, not on every recompute
      warnOnce(`duplicate:${f.id}`, `duplicate field id "${f.id}" ignored`);
      continue;
    }
    seen.add(f.id);
    result.push(normalizeField(f));
  }
  return result;
}
