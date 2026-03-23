import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ExternalProviders from "./external-providers.vue";

// ── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ query: {} }),
}));

const mockSignIn = vi.fn();

vi.mock("@shell/auth/sign-in/useExternalProvider", () => ({
  useExternalProvider: () => ({
    signIn: mockSignIn,
    getProviders: vi.fn().mockResolvedValue([]),
    storage: { value: {} },
  }),
}));

const ExternalProviderStub = {
  name: "ExternalProvider",
  template: "<button @click=\"$emit('signIn')\">{{ displayName }}</button>",
  props: ["logo", "displayName", "authenticationType"],
  emits: ["signIn"],
};

function mountComponent(providers: Array<{ authenticationType: string; displayName: string; logoUrl?: string }> = []) {
  return mount(ExternalProviders, {
    props: { providers },
    global: {
      stubs: {
        ExternalProvider: ExternalProviderStub,
      },
    },
  });
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("external-providers.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component", () => {
    const wrapper = mountComponent();
    expect(wrapper.exists()).toBe(true);
  });

  it("renders nothing when providers list is empty", () => {
    const wrapper = mountComponent([]);
    const buttons = wrapper.findAll("button");
    expect(buttons.length).toBe(0);
  });

  it("renders one provider button per provider", () => {
    const providers = [
      { authenticationType: "google", displayName: "Google", logoUrl: "/google.png" },
      { authenticationType: "azure", displayName: "Azure AD", logoUrl: "/azure.png" },
    ];
    const wrapper = mountComponent(providers);
    const buttons = wrapper.findAll("button");
    expect(buttons.length).toBe(2);
  });

  it("displays provider display names", () => {
    const providers = [{ authenticationType: "google", displayName: "Sign in with Google" }];
    const wrapper = mountComponent(providers);
    expect(wrapper.text()).toContain("Sign in with Google");
  });

  it("calls signIn with authenticationType when provider is clicked", async () => {
    const providers = [{ authenticationType: "okta", displayName: "Okta" }];
    const wrapper = mountComponent(providers);
    await wrapper.find("button").trigger("click");
    expect(mockSignIn).toHaveBeenCalledWith("okta");
  });

  it("renders multiple providers and clicking calls correct type", async () => {
    const providers = [
      { authenticationType: "google", displayName: "Google" },
      { authenticationType: "azure", displayName: "Azure" },
    ];
    const wrapper = mountComponent(providers);
    const buttons = wrapper.findAll("button");
    await buttons[1].trigger("click");
    expect(mockSignIn).toHaveBeenCalledWith("azure");
  });
});
