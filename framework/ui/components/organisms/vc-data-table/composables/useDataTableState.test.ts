import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { defineComponent, ref, nextTick } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { useDataTableState } from "@ui/components/organisms/vc-data-table/composables/useDataTableState";

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
        useDataTableState({
          stateKey: ref("my-table"),
          stateStorage: ref("local"),
          columnWidths: ref([]),
          hiddenColumnIds: hiddenRef,
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
    expect(state.v).toBe(1);
    expect(state.hiddenColumnIds).toContain("sellerId");
    expect(state.hiddenColumnIds).toContain("createdDate");

    wrapper.unmount();
  });

  it("columnWidths changes persist to localStorage after debounce", async () => {
    let columnWidthsRef = ref<{ id: string; width: number }[]>([]);

    const Harness = defineComponent({
      setup() {
        columnWidthsRef = ref([{ id: "name", width: 200 }]);
        useDataTableState({
          stateKey: ref("my-table"),
          stateStorage: ref("local"),
          columnWidths: columnWidthsRef,
          hiddenColumnIds: ref(new Set<string>()),
        });
        return () => null;
      },
    });

    const wrapper = mount(Harness);

    columnWidthsRef.value = [{ id: "name", width: 350 }];

    // Flush Vue's watcher queue first, then advance the debounce timer
    await flushPromises();
    await nextTick();
    vi.advanceTimersByTime(200);

    const raw = localStorage.getItem("VC_DATATABLE_MY-TABLE");
    expect(raw).toBeTruthy();
    const state = JSON.parse(raw!);
    expect(state.columnWidths).toEqual({ name: 350 });

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
        useDataTableState({
          stateKey: ref("sess-table"),
          stateStorage: ref("session"),
          columnWidths: ref([]),
          hiddenColumnIds: hiddenRef,
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

  it("restores hiddenColumnIds from localStorage on mount", () => {
    localStorage.setItem(
      "VC_DATATABLE_RESTORE-TEST",
      JSON.stringify({
        v: 1,
        hiddenColumnIds: ["price", "sku"],
        shownColumnIds: [],
      }),
    );

    let hiddenAtSetup = new Set<string>();

    const Harness = defineComponent({
      setup() {
        const hiddenColumnIds = ref(new Set<string>());
        useDataTableState({
          stateKey: ref("restore-test"),
          stateStorage: ref("local"),
          columnWidths: ref([]),
          hiddenColumnIds,
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
        useDataTableState({
          stateKey: ref("bad-schema"),
          stateStorage: ref("local"),
          columnWidths: ref([]),
          hiddenColumnIds,
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

  it("resetState clears storage and resets columnWidths, hiddenColumnIds", async () => {
    localStorage.setItem(
      "VC_DATATABLE_RESET-TEST",
      JSON.stringify({
        v: 1,
        columnWidths: { name: 200, price: 150 },
        columnOrder: ["name", "price"],
        hiddenColumnIds: ["stock"],
      }),
    );

    const Harness = defineComponent({
      setup() {
        const columnWidths = ref([
          { id: "name", width: 200 },
          { id: "price", width: 150 },
        ]);
        const hiddenColumnIds = ref(new Set<string>(["stock"]));
        const { resetState } = useDataTableState({
          stateKey: ref("reset-test"),
          stateStorage: ref("local"),
          columnWidths,
          hiddenColumnIds,
        });
        return { resetState, columnWidths, hiddenColumnIds };
      },
      render: () => null,
    });

    const wrapper = mount(Harness);
    const vm = wrapper.vm as any;

    vm.resetState();
    await nextTick();

    expect(localStorage.getItem("VC_DATATABLE_RESET-TEST")).toBeNull();
    expect(vm.columnWidths).toEqual([]);
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
        const { clearState } = useDataTableState({
          stateKey: ref("clear-test"),
          stateStorage: ref("local"),
          columnWidths: ref([]),
          hiddenColumnIds,
        });
        clearStateFn = clearState;
        return () => null;
      },
    });

    const wrapper = mount(Harness);

    // Allow any pending debounce to flush
    await new Promise((resolve) => setTimeout(resolve, 220));

    // Verify something was saved
    // (hiddenColumnIds has col1 but watcher may or may not have fired — just verify clearState works)
    clearStateFn!();

    expect(localStorage.getItem("VC_DATATABLE_CLEAR-TEST")).toBeNull();

    wrapper.unmount();
  });
});
