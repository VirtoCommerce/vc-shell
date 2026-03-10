import { describe, it, expect, vi, beforeEach } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { mountWithSetup, expectNoVueWarnings } from "@framework/test-helpers";

// ── Mock useUserManagement to control user state ───────────────────────────────
// usePermissions reads module-level userPermissions ref which is set from user.value.
// We mock the shared composable to isolate each test from leaked permission state.

const mockUser = vi.fn();

vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: () => ({
    user: mockUser(),
  }),
}));

// Import after mocks are registered
import { usePermissions } from "./index";

function makeUser(overrides: { permissions?: string[]; isAdministrator?: boolean } = {}) {
  return {
    value: {
      permissions: overrides.permissions ?? [],
      isAdministrator: overrides.isAdministrator ?? false,
    },
  };
}

beforeEach(() => {
  mockUser.mockReset();
  // Default: user with no permissions
  mockUser.mockReturnValue(makeUser());
});

// ── usePermissions() ───────────────────────────────────────────────────────────

describe("usePermissions()", () => {
  it("returns expected interface (hasAccess function exists)", () => {
    const { result } = mountWithSetup(() => usePermissions());
    expect(typeof result.hasAccess).toBe("function");
  });

  it("hasAccess(undefined) returns true — no permission required means always allowed", () => {
    mockUser.mockReturnValue(makeUser({ permissions: [] }));
    const { result } = mountWithSetup(() => usePermissions());
    expect(result.hasAccess(undefined)).toBe(true);
  });

  it("hasAccess('some:permission') returns true when user has that permission", () => {
    mockUser.mockReturnValue(makeUser({ permissions: ["catalog:read", "some:permission"] }));
    const { result } = mountWithSetup(() => usePermissions());
    expect(result.hasAccess("some:permission")).toBe(true);
  });

  it("hasAccess('some:permission') returns false when user lacks that permission", () => {
    mockUser.mockReturnValue(makeUser({ permissions: ["catalog:read"] }));
    const { result } = mountWithSetup(() => usePermissions());
    expect(result.hasAccess("some:permission")).toBe(false);
  });

  it("administrator bypass — isAdministrator:true makes hasAccess always return true", () => {
    mockUser.mockReturnValue(makeUser({ permissions: [], isAdministrator: true }));
    const { result } = mountWithSetup(() => usePermissions());
    expect(result.hasAccess("any:permission")).toBe(true);
    expect(result.hasAccess("another:permission")).toBe(true);
  });

  it("hasAccess(array) returns true if user has at least one of the permissions", () => {
    mockUser.mockReturnValue(makeUser({ permissions: ["catalog:read"] }));
    const { result } = mountWithSetup(() => usePermissions());
    expect(result.hasAccess(["some:permission", "catalog:read"])).toBe(true);
  });

  it("hasAccess(array) returns false when user has none of the listed permissions", () => {
    mockUser.mockReturnValue(makeUser({ permissions: ["catalog:read"] }));
    const { result } = mountWithSetup(() => usePermissions());
    expect(result.hasAccess(["some:permission", "orders:write"])).toBe(false);
  });
});

// ── cleanup ────────────────────────────────────────────────────────────────────

describe("cleanup", () => {
  it("unmount() produces no Vue warnings", async () => {
    mockUser.mockReturnValue(makeUser());
    await expectNoVueWarnings(async () => {
      const Comp = defineComponent({
        setup() {
          usePermissions();
          return () => h("div");
        },
      });
      const wrapper = mount(Comp);
      await wrapper.vm.$nextTick();
      wrapper.unmount();
    });
  });
});
