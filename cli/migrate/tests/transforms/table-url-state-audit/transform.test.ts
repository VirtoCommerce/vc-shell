// @vitest-environment node
import { describe, it, expect } from "vitest";
import transform from "../../../src/transforms/table-url-state-audit";
import { applyTransformWithReports } from "../../../src/utils/test-helpers";

describe("table-url-state-audit (diagnostic)", () => {
  it("reports state composables used without a stateKey", () => {
    const source = `<script setup lang="ts">
const { sortField, sortOrder, sortExpression } = useDataTableSort({
  initialField: "createdDate",
  initialDirection: "DESC",
});
const pagination = useDataTablePagination({ pageSize: 20, totalCount });
</script>`;

    const { result, reports } = applyTransformWithReports(transform, {
      path: "src/modules/orders/pages/orders-list.vue",
      source,
    });
    expect(result).toBeNull();
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("stateKey");
  });

  it("reports the deprecated useTableQueryState preview API", () => {
    const source = `<script setup lang="ts">
const restored = useTableQueryState("orders_list").read();
const { sortField } = useDataTableSort({ initialField: "createdDate" });
</script>`;

    const { reports } = applyTransformWithReports(transform, {
      path: "src/modules/orders/pages/orders-list.vue",
      source,
    });
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0]).toContain("useTableQueryState");
  });

  it("reports a searchable VcDataTable whose keyword is not owned by useTableSearch", () => {
    const source = `<template>
  <VcDataTable :searchable="true" @search="onSearchChange" :pagination="pagination" />
</template>
<script setup lang="ts">
const pagination = useDataTablePagination({ stateKey: "orders_list", pageSize: 20, totalCount });
</script>`;

    const { reports } = applyTransformWithReports(transform, {
      path: "src/modules/orders/pages/orders-list.vue",
      source,
    });
    expect(reports.length).toBeGreaterThan(0);
    expect(reports.some((r) => r.includes("useTableSearch"))).toBe(true);
  });

  it("stays silent when every composable already has a stateKey", () => {
    const source = `<template>
  <VcDataTable :searchable="true" v-model:search-value="searchValue" :pagination="pagination" />
</template>
<script setup lang="ts">
const { sortField, sortOrder, sortExpression } = useDataTableSort({
  stateKey: "orders_list",
  initialField: "createdDate",
  initialDirection: "DESC",
});
const { searchValue } = useTableSearch({ stateKey: "orders_list" });
const pagination = useDataTablePagination({ stateKey: "orders_list", pageSize: 20, totalCount });
</script>`;

    const { reports } = applyTransformWithReports(transform, {
      path: "src/modules/orders/pages/orders-list.vue",
      source,
    });
    expect(reports).toHaveLength(0);
  });

  it("ignores files that use no table state composables", () => {
    const source = `<script setup lang="ts">
const { item } = useOrderDetails();
</script>`;

    const { reports } = applyTransformWithReports(transform, {
      path: "src/modules/orders/pages/order-details.vue",
      source,
    });
    expect(reports).toHaveLength(0);
  });
});
