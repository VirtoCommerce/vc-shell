import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, computed, reactive, watch, provide, nextTick } from "vue";
import { VcDataTable, VcColumn } from "@ui/components/organisms/vc-data-table";
import { VcButton } from "@ui/components/atoms";
import { useDataTablePagination } from "@ui/composables/useDataTablePagination";
import { useDataTableSort } from "@ui/composables/useDataTableSort";
import { useTableSearch } from "@ui/composables/useTableSearch";
import {
  TableQueryStateKey,
  type ITableQueryStateService,
  type TableQueryPatch,
} from "@core/blade-navigation/table-query-state";
import { Product, mockProducts } from "./vc-data-table.stories.helpers";

const meta = {
  title: "Data Display/VcDataTable",
  component: VcDataTable,
  // Grouped under the same sidebar node as the main file; autodocs lives only
  // in vc-data-table.stories.ts to avoid a duplicate docs page id.
  tags: ["!autodocs"],
} satisfies Meta<typeof VcDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const URL_DEMO_KEY = "demo_list";

/**
 * Child component: uses the state composables (which inject the query service
 * provided by the parent) over a client-filtered list. Page size is 2 so paging
 * is easy to exercise.
 */

const UrlStateTableDemo = {
  components: { VcDataTable, VcColumn },
  setup() {
    const { sortField, sortOrder, sortExpression } = useDataTableSort({
      stateKey: URL_DEMO_KEY,
      initialField: "name",
      initialDirection: "ASC",
    });
    const { searchValue } = useTableSearch({ stateKey: URL_DEMO_KEY });

    const filtered = computed(() => {
      const q = (searchValue.value ?? "").trim().toLowerCase();
      let rows = mockProducts.filter((p) => !q || p.name.toLowerCase().includes(q));
      const [field, dir] = (sortExpression.value ?? "").split(":");
      if (field) {
        rows = [...rows].sort((a, b) => {
          const av = a[field as keyof Product] as never;
          const bv = b[field as keyof Product] as never;
          const cmp = av < bv ? -1 : av > bv ? 1 : 0;
          return dir === "DESC" ? -cmp : cmp;
        });
      }
      return rows;
    });

    const pageSize = 2;
    const totalCount = computed(() => filtered.value.length);
    const pagination = useDataTablePagination({ stateKey: URL_DEMO_KEY, pageSize, totalCount });

    // Reset to page 1 on a new keyword so the persisted (search, page) pair stays consistent.
    watch(searchValue, () => pagination.setPage(1));

    const pagedItems = computed(() => filtered.value.slice(pagination.skip, pagination.skip + pageSize));

    return { sortField, sortOrder, searchValue, pagination, pagedItems };
  },
  template: `
    <VcDataTable
      :items="pagedItems"
      :total-count="pagination.totalCount"
      :pagination="pagination"
      :searchable="true"
      v-model:sort-field="sortField"
      v-model:sort-order="sortOrder"
      v-model:search-value="searchValue"
      state-key="demo_list"
      @pagination-click="pagination.goToPage"
    >
      <VcColumn id="name" field="name" title="Name" :sortable="true" />
      <VcColumn id="price" field="price" title="Price" type="money" :sortable="true" />
      <VcColumn id="status" field="status" title="Status" />
    </VcDataTable>
  `,
};

/**
 * Persisting sort, search, and the current page to the blade URL via the
 * `stateKey` option on `useDataTableSort` / `useTableSearch` / `useDataTablePagination`.
 *
 * In a real app the per-blade query service is provided by the blade layer and
 * writes to the router. This story provides an in-memory stand-in so the round
 * trip is visible: interact with the table and watch the simulated query string
 * update, then click **Remount table** to prove the state restores exactly as a
 * page reload would restore it from the URL.
 */

export const WithUrlStatePersistence: Story = {
  render: () => ({
    components: { UrlStateTableDemo, VcButton },
    setup() {
      // Stand-in for the per-blade URL query service the blade layer normally provides.
      const store = reactive<Record<string, TableQueryPatch>>({});
      const service: ITableQueryStateService = {
        read: (key = "") => ({ ...(store[key] ?? {}) }),
        write: (key = "", patch: TableQueryPatch) => {
          const next: TableQueryPatch = { ...(store[key] ?? {}), ...patch };
          // Empty/undefined slices clear the param, mirroring the real serializer.
          if (!next.sort) delete next.sort;
          if (!next.search) delete next.search;
          if (!next.page) delete next.page;
          store[key] = next;
        },
      };
      provide(TableQueryStateKey, service);

      const queryString = computed(() => {
        const patch = store[URL_DEMO_KEY] ?? {};
        const params: string[] = [];
        if (patch.sort) params.push(`${URL_DEMO_KEY}_sort=${patch.sort}`);
        if (patch.search) params.push(`${URL_DEMO_KEY}_search=${patch.search}`);
        if (patch.page) params.push(`${URL_DEMO_KEY}_page=${patch.page}`);
        return params.length ? `?${params.join("&")}` : "(no query params yet)";
      });

      const mounted = ref(true);
      const remount = () => {
        mounted.value = false;
        nextTick(() => (mounted.value = true));
      };

      return { queryString, mounted, remount };
    },
    template: `
    <div style="height: 460px">
      <div class="tw-mb-4 tw-p-3 tw-bg-primary-50 tw-rounded tw-text-sm">
        <p class="tw-font-semibold tw-mb-1">URL query state persistence</p>
        <p class="tw-text-neutrals-600 tw-mb-2">
          Sort a column, type a search, or change the page. The state composables persist each change
          through the injected query service (here an in-memory stand-in for the blade URL).
        </p>
        <div class="tw-flex tw-items-center tw-gap-3">
          <code class="tw-px-2 tw-py-1 tw-bg-white tw-rounded tw-border tw-border-solid tw-border-neutrals-200">{{ queryString }}</code>
          <VcButton @click="remount">Remount table</VcButton>
        </div>
        <p class="tw-text-neutrals-500 tw-mt-2 tw-text-xs">
          "Remount table" tears down and recreates the table — the composables restore from the
          persisted query, exactly as a page reload would restore from the URL.
        </p>
      </div>
      <UrlStateTableDemo v-if="mounted" />
    </div>
  `,
  }),
};

WithUrlStatePersistence.parameters = {
  docs: {
    description: {
      story:
        "URL-query persistence is opt-in via a `stateKey` option shared across `useDataTableSort`, " +
        "`useTableSearch`, and `useDataTablePagination`. Each composable restores its slice from the blade " +
        "URL on creation and writes changes back. Note `watch(searchValue, () => pagination.setPage(1))` in the " +
        "demo: resetting the page on a new keyword keeps the (search, page) pair consistent so a reload never " +
        "lands on an empty page. The `state-key` prop on the table is unrelated — it persists column layout to localStorage.",
    },
  },
};
