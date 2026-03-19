import { describe, it, expect, vi } from "vitest";
import { defineComponent, h, provide } from "vue";
import { mount } from "@vue/test-utils";
import { mountWithSetup } from "@framework/test-helpers";
import { GlobalSearchKey } from "@framework/injection-keys";
import type { GlobalSearchState } from "@core/services/global-search-service";
import { ref } from "vue";

vi.mock("@core/utilities", () => ({
  createLogger: () => ({
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
  InjectionError: class InjectionError extends Error {
    constructor(name: string) {
      super(`${name} was not provided`);
      this.name = "InjectionError";
    }
  },
}));

import { useGlobalSearch, provideGlobalSearch } from "./index";

function createMockGlobalSearchState(): GlobalSearchState {
  return {
    isSearchVisible: ref({}),
    searchQuery: ref({}),
    toggleSearch: vi.fn(),
    setSearchQuery: vi.fn(),
    closeSearch: vi.fn(),
  };
}

describe("useGlobalSearch", () => {
  it("throws InjectionError when called without provider", () => {
    expect(() => {
      mountWithSetup(() => useGlobalSearch());
    }).toThrow("GlobalSearchService");
  });

  it("returns the global search state when provided", () => {
    const mockState = createMockGlobalSearchState();
    let result: GlobalSearchState;

    const Inner = defineComponent({
      setup() {
        result = useGlobalSearch();
        return () => h("div");
      },
    });

    const Outer = defineComponent({
      setup() {
        provide(GlobalSearchKey, mockState);
        return () => h(Inner);
      },
    });

    mount(Outer);
    expect(result!).toBe(mockState);
    expect(result!).toHaveProperty("isSearchVisible");
    expect(result!).toHaveProperty("searchQuery");
    expect(result!).toHaveProperty("toggleSearch");
    expect(result!).toHaveProperty("setSearchQuery");
    expect(result!).toHaveProperty("closeSearch");
  });
});

describe("provideGlobalSearch", () => {
  it("creates and returns a global search state", () => {
    const { result } = mountWithSetup(() => provideGlobalSearch());
    expect(result).toHaveProperty("isSearchVisible");
    expect(result).toHaveProperty("searchQuery");
    expect(result).toHaveProperty("toggleSearch");
    expect(result).toHaveProperty("setSearchQuery");
    expect(result).toHaveProperty("closeSearch");
  });

  it("provided state is accessible by child via useGlobalSearch", () => {
    let childResult: GlobalSearchState;

    const Inner = defineComponent({
      setup() {
        childResult = useGlobalSearch();
        return () => h("div");
      },
    });

    const Outer = defineComponent({
      setup() {
        provideGlobalSearch();
        return () => h(Inner);
      },
    });

    mount(Outer);
    expect(childResult!).toHaveProperty("toggleSearch");
  });

  it("is idempotent - returns existing if already provided in parent", () => {
    const mockState = createMockGlobalSearchState();
    let result: GlobalSearchState;

    const Inner = defineComponent({
      setup() {
        // provideGlobalSearch should detect the existing injection and return it
        result = provideGlobalSearch();
        return () => h("div");
      },
    });

    const Outer = defineComponent({
      setup() {
        provide(GlobalSearchKey, mockState);
        return () => h(Inner);
      },
    });

    mount(Outer);
    expect(result!).toBe(mockState);
  });
});
