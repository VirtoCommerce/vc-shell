import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import AssetsManager from "./assets-manager.vue";

// `defineBlade` is a compile-time macro the app build rewrites; the framework's test build does not,
// so it must exist before the component module evaluates.
vi.hoisted(() => {
  (globalThis as Record<string, unknown>).defineBlade = () => undefined;
});

vi.mock("@core/composables/useBlade", () => ({
  useBlade: () => ({
    options: ref({ manager: { items: ref([]), loading: ref(false) } }),
    openBlade: vi.fn(),
  }),
}));

vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-i18n")>()),
  useI18n: () => ({ t: (key: string) => key }),
}));

describe("AssetsManager", () => {
  it("carries a stable data-test-id on its blade root, so automation can address it", () => {
    const wrapper = mount(AssetsManager, {
      global: {
        stubs: {
          VcBlade: { template: "<div v-bind='$attrs'><slot /></div>", inheritAttrs: false },
          VcDataTable: { template: "<div />" },
          VcColumn: true,
          VcImage: true,
        },
        directives: { loading: {} },
        mocks: { $t: (key: string) => key },
      },
    });

    expect(wrapper.find('[data-test-id="assets-manager-blade"]').exists()).toBe(true);
  });
});
