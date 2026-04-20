import type { API, FileInfo, Options } from "jscodeshift";
import type { Transform } from "./types.js";

/**
 * Diagnostic-only: detect files that still compute pagination manually and
 * should migrate to `useDataTablePagination()`.
 *
 * Flags two complementary signatures:
 * - Data composables (.ts) that return a `totalCount` / `pages` / `currentPage`
 *   computed triple (manual pagination boilerplate).
 * - Blade pages (.vue) with `@pagination-click="onPaginationClick"` handlers
 *   that wire pagination by hand.
 *
 * Rewrites are cross-file (composable + consumer blade) so automation is
 * unreliable — the migration-agent handles the actual code change.
 *
 * See: migration/41-use-data-table-pagination.md
 */

// Match the manual computed triple that exposes pagination state.
// Requires ALL THREE to avoid false-positives where only one is returned.
const TOTAL_COUNT_RE = /\btotalCount:\s*computed\s*\(/;
const PAGES_RE = /\bpages:\s*computed\s*\(/;
const CURRENT_PAGE_RE = /\bcurrentPage:\s*computed\s*\(/;

// Blade page signature: manual pagination click handler.
const PAGINATION_HANDLER_RE = /@pagination-click\s*=\s*["']onPaginationClick["']/;
const PAGINATION_FN_RE = /(?:function|const)\s+onPaginationClick\b/;

const transform: Transform = (fileInfo: FileInfo, api: API, _options: Options): string | null => {
  const src = fileInfo.source;

  if (fileInfo.path.endsWith(".ts")) {
    const hasTriple =
      TOTAL_COUNT_RE.test(src) && PAGES_RE.test(src) && CURRENT_PAGE_RE.test(src);
    if (hasTriple) {
      api.report(
        `${fileInfo.path}: Manual pagination triple (totalCount/pages/currentPage). Replace with useDataTablePagination(). See migration guide: useDataTablePagination.`,
      );
    }
  } else if (fileInfo.path.endsWith(".vue")) {
    const hasHandler = PAGINATION_HANDLER_RE.test(src) || PAGINATION_FN_RE.test(src);
    if (hasHandler) {
      api.report(
        `${fileInfo.path}: Uses manual onPaginationClick — delete it and bind @pagination-click="pagination.goToPage". See migration guide: useDataTablePagination.`,
      );
    }
  }

  return null; // diagnostic-only
};

export default transform;
export const parser = "tsx";
