import { ref, computed, reactive, watch, inject, type MaybeRefOrGetter, toValue } from "vue";
import { TableQueryStateKey } from "@core/blade-navigation/table-query-state";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-data-table-pagination");

export interface UseDataTablePaginationOptions {
  /** Items per page. Default: 20 */
  pageSize?: MaybeRefOrGetter<number>;
  /** Total item count from API response (reactive) */
  totalCount: MaybeRefOrGetter<number>;
  /** Event callback fired after currentPage updates via goToPage(). */
  onPageChange?: (state: { page: number; skip: number }) => void;
  /** When set, syncs the current page to the blade URL query under this key. */
  stateKey?: string;
}

export interface UseDataTablePaginationReturn {
  /**
   * Current 1-based page number.
   *
   * @deprecated Writing to this is a silent `setPage`: the page changes and the URL slice is
   * written, but `onPageChange` does not fire, so the table keeps showing the previous page's
   * rows. Call `goToPage(page)` to change the page and load, or `setPage(page)` to seed it
   * deliberately without loading. Reading stays fully supported.
   */
  currentPage: number;
  /** Total number of pages */
  readonly pages: number;
  /** Current skip offset: (currentPage - 1) * pageSize */
  readonly skip: number;
  /** Resolved page size */
  readonly pageSize: number;
  /** Resolved total item count — pass to VcDataTable :total-count */
  readonly totalCount: number;
  /** Navigate to a specific page. Fires onPageChange if provided. */
  goToPage: (page: number) => void;
  /**
   * Set the current page without firing onPageChange. Use to seed the page from a
   * URL restore, so the seed itself does not trigger a load.
   */
  setPage: (page: number) => void;
  /** Reset to page 1. Does NOT fire onPageChange. */
  reset: () => void;
  /**
   * The page seeded from the blade URL at setup, or `undefined` when nothing was restored.
   *
   * A restore deliberately does not fire `onPageChange` — that would cause a duplicate load —
   * so without this the consumer had no way to know it happened, and an unconditional first
   * load at `skip: 0` left the paginator on page N showing page 1's rows (VCST-5664).
   *
   * Read it, or simply always pass `skip` to the first load, which is correct either way.
   *
   * Optional on purpose: consumers build this interface by hand to re-expose a nested
   * pagination (a facade over two views, say), and a required property would break every one
   * of them at compile time. Our own composable always provides it.
   */
  readonly restoredPage?: number;
}

export function useDataTablePagination(options: UseDataTablePaginationOptions): UseDataTablePaginationReturn {
  const pageSize = computed(() => toValue(options.pageSize) ?? 20);
  const currentPage = ref(1);
  const pages = computed(() => Math.ceil(toValue(options.totalCount) / pageSize.value) || 0);
  const skip = computed(() => (currentPage.value - 1) * pageSize.value);
  const totalCount = computed(() => toValue(options.totalCount));

  function goToPage(page: number) {
    currentPage.value = page;
    options.onPageChange?.({ page, skip: skip.value });
  }

  function setPage(page: number) {
    currentPage.value = page;
  }

  function reset() {
    currentPage.value = 1;
  }

  let restoredPage: number | undefined;

  if (options.stateKey) {
    const service = inject(TableQueryStateKey, undefined);
    if (service) {
      const restored = service.read(options.stateKey);
      if (restored.page != null) {
        setPage(restored.page); // seed without onPageChange
        restoredPage = restored.page;
      }
      // Page 1 is the default: clear the param rather than writing _page=1.
      watch(
        () => currentPage.value,
        (page) => service.write(options.stateKey!, { page: page === 1 ? undefined : page }),
      );
    } else {
      // Without a provider the whole feature silently disappears — no URL sync, no restore —
      // which is indistinguishable from "the URL had no page". That happens outside a blade and
      // in unit tests, so say it out loud rather than leaving the caller to wonder.
      logger.warn(
        `stateKey "${options.stateKey}" is set but no TableQueryState provider is in scope — ` +
          "page state will not be synced to the URL or restored from it.",
      );
    }
  }

  // Exposed as a writable computed rather than the raw ref so a direct assignment can be called
  // out. `reactive()` unwraps both the same way, so reading is unchanged for every consumer.
  //
  // Assignment behaves exactly like `setPage` — the URL slice is still written, because that
  // watch fires on any change to the ref — so the only thing it skips is `onPageChange`. That
  // makes it a silently-different duplicate of a public method: the paginator moves to page N
  // while the table keeps page 1's rows, which is the same symptom as VCST-5664 but with no URL
  // restore involved.
  //
  // Warn instead of making it readonly: in a production build Vue drops a write to a readonly
  // reactive property SILENTLY, so an existing consumer would just stop being able to change the
  // page, with no error and no failing test. Turning that into a hard error belongs in a major.
  // Internal callers use the raw ref, so they never trip this.
  const currentPageModel = computed({
    get: () => currentPage.value,
    set: (page: number) => {
      logger.warn(
        "Assigning to pagination.currentPage is deprecated: it changes the page without firing " +
          "onPageChange, so the table keeps the previous page's rows. Use goToPage(page) to " +
          "change the page and load, or setPage(page) to seed it without loading.",
      );
      setPage(page);
    },
  });

  return reactive({
    currentPage: currentPageModel,
    pages,
    skip,
    pageSize,
    totalCount,
    goToPage,
    setPage,
    reset,
    restoredPage,
  });
}
