import type { TableQueryPatch } from "./types";

/** Router query value can be string | string[] | null. */
type RawQuery = Record<string, string | (string | null)[] | null | undefined>;

/**
 * Build the namespaced query record for a patch. Keys present in `patch` are
 * always emitted; cleared values become "" so the descriptor strips them.
 */
export function encodeQueryState(ns: string, patch: TableQueryPatch): Record<string, string> {
  const out: Record<string, string> = {};
  if ("sort" in patch) out[`${ns}_sort`] = patch.sort ?? "";
  if ("search" in patch) out[`${ns}_search`] = patch.search ?? "";
  if ("page" in patch) out[`${ns}_page`] = patch.page != null ? String(patch.page) : "";
  return out;
}

const SORT_RE = /^.+:(ASC|DESC)$/;

/** Read and validate the view state for a namespace from a router query record. */
export function decodeQueryState(ns: string, query: RawQuery): TableQueryPatch {
  const res: TableQueryPatch = {};

  const sort = query[`${ns}_sort`];
  if (typeof sort === "string" && SORT_RE.test(sort)) res.sort = sort;

  const search = query[`${ns}_search`];
  if (typeof search === "string" && search !== "") res.search = search;

  const pageRaw = query[`${ns}_page`];
  if (typeof pageRaw === "string") {
    const n = Number(pageRaw);
    if (Number.isInteger(n) && n >= 1) res.page = n;
  }

  return res;
}
