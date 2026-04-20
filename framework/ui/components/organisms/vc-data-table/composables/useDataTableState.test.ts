import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { defineComponent, ref, nextTick } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { useDataTableState } from "@ui/components/organisms/vc-data-table/composables/useDataTableState";
import type { ColumnState } from "@ui/components/organisms/vc-data-table/types";

/**
 * Build a ColumnState from a simple weight map { id: weight }.
 */
function makeColumnState(weights: Record<string, number>): ColumnState {
  const order = Object.keys(weights);
  const specs: Record<string, { weight: number; minPx: number; maxPx: number }> = {};
  for (const [id, w] of Object.entries(weights)) {
    specs[id] = { weight: w, minPx: 40, maxPx: Infinity };
  }
  return { order, specs };
}

const DEFAULT_AVAILABLE_WIDTH = 1000;

describe("useDataTableState", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("restores hidden and shown column ids synchronously during setup", () => {
    // Persisted as v2 format
    localStorage.setItem(
      "VC_DATATABLE_PRODUCTS-LIST",
      JSON.stringify({
        v: 2,
        order: ["img"],
        weights: { img: 1.0 },
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
        const columnState = ref<ColumnState>({ order: [], specs: {} });
        useDataTableState({
          stateKey: ref("products-list"),
          stateStorage: ref("local"),
          columnState,
          hiddenColumnIds,
          shownColumnIds,
          getAvailableWidth: () => DEFAULT_AVAILABLE_WIDTH,
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
        const columnState = ref<ColumnState>(makeColumnState({ name: 0.5, price: 0.5 }));
        useDataTableState({
          stateKey: ref("products-list"),
          stateStorage: ref("local"),
          columnState,
          hiddenColumnIds,
          shownColumnIds: shownColumnIdsRef,
          getAvailableWidth: () => DEFAULT_AVAILABLE_WIDTH,
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

describe("useDataTableState — hiddenColumnIds persistence (debounce)", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("changing hiddenColumnIds persists to localStorage after debounce", async () => {
    let hiddenRef = ref(new Set<string>());

    const Harness = defineComponent({
      setup() {
        hiddenRef = ref(new Set<string>());
        const columnState = ref<ColumnState>(makeColumnState({ name: 0.5, price: 0.5 }));
        useDataTableState({
          stateKey: ref("my-table"),
          stateStorage: ref("local"),
          columnState,
          hiddenColumnIds: hiddenRef,
          getAvailableWidth: () => DEFAULT_AVAILABLE_WIDTH,
        });
        return () => null;
      },
    });

    const wrapper = mount(Harness);

    hiddenRef.value = new Set(["sellerId", "createdDate"]);

    // Flush Vue's async watcher queue (microtasks) so debouncedSave() is called
    await flushPromises();
    await nextTick();

    // Advance fake timers past the debounce (150ms) so the setTimeout fires saveState()
    vi.advanceTimersByTime(200);

    const raw = localStorage.getItem("VC_DATATABLE_MY-TABLE");
    expect(raw).toBeTruthy();
    const state = JSON.parse(raw!);
    expect(state.v).toBe(2);
    expect(state.hiddenColumnIds).toContain("sellerId");
    expect(state.hiddenColumnIds).toContain("createdDate");

    wrapper.unmount();
  });

  it("columnState changes persist to localStorage after debounce", async () => {
    let columnStateRef = ref<ColumnState>(makeColumnState({ name: 0.5, price: 0.5 }));

    const Harness = defineComponent({
      setup() {
        columnStateRef = ref<ColumnState>(makeColumnState({ name: 0.5, price: 0.5 }));
        useDataTableState({
          stateKey: ref("my-table"),
          stateStorage: ref("local"),
          columnState: columnStateRef,
          hiddenColumnIds: ref(new Set<string>()),
          getAvailableWidth: () => DEFAULT_AVAILABLE_WIDTH,
        });
        return () => null;
      },
    });

    const wrapper = mount(Harness);

    // Update the column state
    columnStateRef.value = makeColumnState({ name: 0.7, price: 0.3 });

    // Flush Vue's watcher queue first, then advance the debounce timer
    await flushPromises();
    await nextTick();
    vi.advanceTimersByTime(200);

    const raw = localStorage.getItem("VC_DATATABLE_MY-TABLE");
    expect(raw).toBeTruthy();
    const state = JSON.parse(raw!);
    expect(state.v).toBe(2);
    expect(state.weights).toBeDefined();
    expect(state.weights["name"]).toBeCloseTo(0.7, 2);
    expect(state.weights["price"]).toBeCloseTo(0.3, 2);

    wrapper.unmount();
  });
});

describe("useDataTableState — sessionStorage mode", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("when stateStorage is 'session', state persists to sessionStorage instead of localStorage", async () => {
    let hiddenRef = ref(new Set<string>());

    const Harness = defineComponent({
      setup() {
        hiddenRef = ref(new Set<string>());
        const columnState = ref<ColumnState>(makeColumnState({ name: 0.5, price: 0.5 }));
        useDataTableState({
          stateKey: ref("sess-table"),
          stateStorage: ref("session"),
          columnState,
          hiddenColumnIds: hiddenRef,
          getAvailableWidth: () => DEFAULT_AVAILABLE_WIDTH,
        });
        return () => null;
      },
    });

    const wrapper = mount(Harness);

    hiddenRef.value = new Set(["col1"]);
    await new Promise((resolve) => setTimeout(resolve, 220));

    // Must be in sessionStorage, NOT localStorage
    expect(sessionStorage.getItem("VC_DATATABLE_SESS-TABLE")).toBeTruthy();
    expect(localStorage.getItem("VC_DATATABLE_SESS-TABLE")).toBeNull();

    wrapper.unmount();
  });
});

describe("useDataTableState — restore from persisted state", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("restores hiddenColumnIds from localStorage on mount (v2 format)", () => {
    localStorage.setItem(
      "VC_DATATABLE_RESTORE-TEST",
      JSON.stringify({
        v: 2,
        order: ["name"],
        weights: { name: 1.0 },
        hiddenColumnIds: ["price", "sku"],
        shownColumnIds: [],
      }),
    );

    let hiddenAtSetup = new Set<string>();

    const Harness = defineComponent({
      setup() {
        const hiddenColumnIds = ref(new Set<string>());
        const columnState = ref<ColumnState>({ order: [], specs: {} });
        useDataTableState({
          stateKey: ref("restore-test"),
          stateStorage: ref("local"),
          columnState,
          hiddenColumnIds,
          getAvailableWidth: () => DEFAULT_AVAILABLE_WIDTH,
        });
        hiddenAtSetup = new Set(hiddenColumnIds.value);
        return () => null;
      },
    });

    const wrapper = mount(Harness);

    expect(hiddenAtSetup.has("price")).toBe(true);
    expect(hiddenAtSetup.has("sku")).toBe(true);

    wrapper.unmount();
  });

  it("migrates v1 persisted state to v2 on restore", () => {
    localStorage.setItem(
      "VC_DATATABLE_MIGRATE-TEST",
      JSON.stringify({
        v: 1,
        columnWidths: { name: 200, price: 100 },
        columnOrder: ["name", "price"],
        hiddenColumnIds: ["stock"],
      }),
    );

    let hiddenAtSetup = new Set<string>();

    const Harness = defineComponent({
      setup() {
        const hiddenColumnIds = ref(new Set<string>());
        const columnState = ref<ColumnState>({ order: [], specs: {} });
        useDataTableState({
          stateKey: ref("migrate-test"),
          stateStorage: ref("local"),
          columnState,
          hiddenColumnIds,
          getAvailableWidth: () => DEFAULT_AVAILABLE_WIDTH,
        });
        hiddenAtSetup = new Set(hiddenColumnIds.value);
        return () => null;
      },
    });

    const wrapper = mount(Harness);

    // v1 migration should still restore hidden columns
    expect(hiddenAtSetup.has("stock")).toBe(true);

    wrapper.unmount();
  });

  it("ignores persisted state with wrong schema version", () => {
    localStorage.setItem(
      "VC_DATATABLE_BAD-SCHEMA",
      JSON.stringify({
        v: 99, // wrong version
        hiddenColumnIds: ["price"],
      }),
    );

    let hiddenAtSetup = new Set<string>();

    const Harness = defineComponent({
      setup() {
        const hiddenColumnIds = ref(new Set<string>());
        const columnState = ref<ColumnState>({ order: [], specs: {} });
        useDataTableState({
          stateKey: ref("bad-schema"),
          stateStorage: ref("local"),
          columnState,
          hiddenColumnIds,
          getAvailableWidth: () => DEFAULT_AVAILABLE_WIDTH,
        });
        hiddenAtSetup = new Set(hiddenColumnIds.value);
        return () => null;
      },
    });

    const wrapper = mount(Harness);

    // Wrong schema version — nothing should be restored
    expect(hiddenAtSetup.has("price")).toBe(false);

    wrapper.unmount();
  });
});

describe("useDataTableState — resetState", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("resetState clears storage and resets columnState, hiddenColumnIds", async () => {
    localStorage.setItem(
      "VC_DATATABLE_RESET-TEST",
      JSON.stringify({
        v: 2,
        order: ["name", "price"],
        weights: { name: 0.6, price: 0.4 },
        hiddenColumnIds: ["stock"],
      }),
    );

    const Harness = defineComponent({
      setup() {
        const columnState = ref<ColumnState>(makeColumnState({ name: 0.6, price: 0.4 }));
        const hiddenColumnIds = ref(new Set<string>(["stock"]));
        const { resetState } = useDataTableState({
          stateKey: ref("reset-test"),
          stateStorage: ref("local"),
          columnState,
          hiddenColumnIds,
          getAvailableWidth: () => DEFAULT_AVAILABLE_WIDTH,
        });
        return { resetState, columnState, hiddenColumnIds };
      },
      render: () => null,
    });

    const wrapper = mount(Harness);
    const vm = wrapper.vm as any;

    vm.resetState();
    await nextTick();

    expect(localStorage.getItem("VC_DATATABLE_RESET-TEST")).toBeNull();
    expect(vm.columnState.order).toEqual([]);
    expect(vm.columnState.specs).toEqual({});
    expect(vm.hiddenColumnIds.size).toBe(0);

    wrapper.unmount();
  });
});

describe("useDataTableState — clearState", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("clearState removes the key from localStorage", async () => {
    let clearStateFn: (() => void) | undefined;

    const Harness = defineComponent({
      setup() {
        const hiddenColumnIds = ref(new Set<string>(["col1"]));
        const columnState = ref<ColumnState>(makeColumnState({ name: 1.0 }));
        const { clearState } = useDataTableState({
          stateKey: ref("clear-test"),
          stateStorage: ref("local"),
          columnState,
          hiddenColumnIds,
          getAvailableWidth: () => DEFAULT_AVAILABLE_WIDTH,
        });
        clearStateFn = clearState;
        return () => null;
      },
    });

    const wrapper = mount(Harness);

    // Allow any pending debounce to flush
    await new Promise((resolve) => setTimeout(resolve, 220));

    clearStateFn!();

    expect(localStorage.getItem("VC_DATATABLE_CLEAR-TEST")).toBeNull();

    wrapper.unmount();
  });
});
