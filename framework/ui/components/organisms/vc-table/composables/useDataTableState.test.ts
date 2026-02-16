import { describe, expect, it, beforeEach } from "vitest";
import { defineComponent, ref } from "vue";
import { mount } from "@vue/test-utils";
import { useDataTableState } from "./useDataTableState";

describe("useDataTableState", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("restores hidden and shown column ids synchronously during setup", () => {
    localStorage.setItem(
      "VC_DATATABLE_PRODUCTS-LIST",
      JSON.stringify({
        v: 1,
        columnWidths: { img: 0 },
        columnOrder: ["img"],
        hiddenColumnIds: ["sellerId"],
        shownColumnIds: ["createdDate"],
      }),
    );

    let hiddenAtSetup: Set<string> = new Set();
    let shownAtSetup: Set<string> = new Set();

    const Harness = defineComponent({
      setup() {
        const hiddenColumnIds = ref(new Set<string>());
        const shownColumnIds = ref(new Set<string>());
        useDataTableState({
          stateKey: ref("products-list"),
          stateStorage: ref("local"),
          columnWidths: ref([]),
          hiddenColumnIds,
          shownColumnIds,
        });
        hiddenAtSetup = new Set(hiddenColumnIds.value);
        shownAtSetup = new Set(shownColumnIds.value);
        return () => null;
      },
    });

    const wrapper = mount(Harness);
    expect(hiddenAtSetup.has("sellerId")).toBe(true);
    expect(shownAtSetup.has("createdDate")).toBe(true);
    wrapper.unmount();
  });

  it("persists shownColumnIds updates", async () => {
    let shownColumnIdsRef = ref(new Set<string>());

    const Harness = defineComponent({
      setup() {
        const hiddenColumnIds = ref(new Set<string>());
        shownColumnIdsRef = ref(new Set<string>());
        useDataTableState({
          stateKey: ref("products-list"),
          stateStorage: ref("local"),
          columnWidths: ref([]),
          hiddenColumnIds,
          shownColumnIds: shownColumnIdsRef,
        });
        return () => null;
      },
    });

    const wrapper = mount(Harness);
    shownColumnIdsRef.value = new Set(["code", "productType"]);
    await new Promise((resolve) => setTimeout(resolve, 220));

    const raw = localStorage.getItem("VC_DATATABLE_PRODUCTS-LIST");
    expect(raw).toBeTruthy();
    const state = raw ? JSON.parse(raw) : null;
    expect(state?.shownColumnIds).toEqual(["code", "productType"]);
    wrapper.unmount();
  });
});
