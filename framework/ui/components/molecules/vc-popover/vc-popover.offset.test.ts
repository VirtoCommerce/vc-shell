import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import type { Ref } from "vue";
import VcPopover from "@ui/components/molecules/vc-popover/vc-popover.vue";

type Middleware = { name: string; options?: unknown };
const captured: { middleware?: Ref<Middleware[]> } = {};

vi.mock("@ui/composables", () => ({
  useFloatingPosition: (_anchor: unknown, _floating: unknown, options: { middleware: Ref<Middleware[]> }) => {
    captured.middleware = options.middleware;
    return { floatingStyle: { value: {} } };
  },
  useTeleportTarget: () => ({ teleportTarget: "body" }),
}));

vi.mock("@floating-ui/vue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@floating-ui/vue")>();
  return { ...actual, offset: (value: unknown) => ({ name: "offset", options: value }) };
});

const offsetOf = () => captured.middleware?.value.find((m) => m.name === "offset")?.options;
const mountPopover = (props: Record<string, unknown> = {}) =>
  mount(VcPopover as any, { props: { show: true, ...props }, global: { stubs: { VcIcon: true, Teleport: true } } });

describe("VcPopover offset", () => {
  it("keeps the panel 4px from the anchor by default", () => {
    mountPopover();
    expect(offsetOf()).toBe(4);
  });

  it("passes the offset prop to the positioning", () => {
    mountPopover({ offset: 6 });
    expect(offsetOf()).toBe(6);
  });
});
