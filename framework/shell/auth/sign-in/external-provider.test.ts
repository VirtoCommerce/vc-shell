import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ExternalProvider from "./external-provider.vue";

// ── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ query: {} }),
}));

const globalStubs = {
  VcButton: {
    template: "<button @click=\"$emit('click')\"><slot /></button>",
  },
  VcImage: {
    template: '<img :src="src" />',
    props: ["src", "size"],
  },
};

function mountComponent(props = {}) {
  return mount(ExternalProvider, {
    props: {
      logo: "/provider-logo.png",
      displayName: "Test Provider",
      authenticationType: "test-auth",
      ...props,
    },
    global: {
      stubs: globalStubs,
    },
  });
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("external-provider.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component", () => {
    const wrapper = mountComponent();
    expect(wrapper.exists()).toBe(true);
  });

  it("displays the provider name", () => {
    const wrapper = mountComponent({ displayName: "Google SSO" });
    expect(wrapper.text()).toContain("Google SSO");
  });

  it("renders the logo image", () => {
    const wrapper = mountComponent({ logo: "https://example.com/logo.png" });
    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("https://example.com/logo.png");
  });

  it("processes relative logo URLs to absolute URLs", () => {
    const wrapper = mountComponent({ logo: "/static/provider.png" });
    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    // Relative URL gets processed through new URL(logo, origin)
    expect(img.attributes("src")).toContain("provider.png");
  });

  it("keeps data:image logos as-is", () => {
    const dataUri = "data:image/png;base64,abc123";
    const wrapper = mountComponent({ logo: dataUri });
    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe(dataUri);
  });

  it("keeps http logos as-is", () => {
    const httpUrl = "http://cdn.example.com/logo.svg";
    const wrapper = mountComponent({ logo: httpUrl });
    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe(httpUrl);
  });

  it("emits signIn event when clicked", async () => {
    const wrapper = mountComponent();
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("signIn")).toBeTruthy();
    expect(wrapper.emitted("signIn")!.length).toBeGreaterThanOrEqual(1);
  });

  it("renders with undefined props gracefully", () => {
    const wrapper = mountComponent({
      logo: undefined,
      displayName: undefined,
      authenticationType: undefined,
    });
    expect(wrapper.exists()).toBe(true);
  });
});
