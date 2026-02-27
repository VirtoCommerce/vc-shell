import { describe, it, expect, vi } from "vitest";
import { ref, defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import VcAppMenu from "@ui/components/organisms/vc-app/_internal/menu/VcAppMenu.vue";

vi.mock("@core/composables", () => ({
  useMenuService: () => ({
    menuItems: ref([
      { title: "Orders", priority: 1, routeId: "Orders", url: "/orders", id: undefined },
    ]),
  }),
  usePermissions: () => ({
    hasAccess: () => true,
  }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ path: "/orders", params: {}, query: {}, hash: "", name: "Orders", fullPath: "/orders", matched: [], meta: {}, redirectedFrom: undefined }),
}));

describe("VcAppMenu", () => {
  it("renders item without explicit id using fallback key fields", () => {
    const RouterLinkStub = defineComponent({
      props: { to: { type: String, required: false } },
      setup(_, { slots }) {
        return () => h("div", slots.default?.());
      },
    });

    const wrapper = mount(VcAppMenu, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          VcContainer: defineComponent({ setup(_, { slots }) { return () => h("div", slots.default?.()); } }),
          VcAppMenuGroup: defineComponent({ setup() { return () => h("div"); } }),
          VcAppMenuItem: defineComponent({ props: ["title"], setup(props) { return () => h("button", String(props.title)); } }),
        },
      },
    });

    expect(wrapper.text()).toContain("Orders");
  });
});
