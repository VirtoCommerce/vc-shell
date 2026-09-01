import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcButton from "@ui/components/atoms/vc-button/vc-button.vue";

describe("VcButton", () => {
  const mountButton = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) =>
    mount(VcButton as any, {
      props,
      slots,
      global: { stubs: { VcIcon: true } },
    });

  it("renders a native button element", () => {
    const wrapper = mountButton({}, { default: "Click me" });
    expect(wrapper.find("button").exists()).toBe(true);
    expect(wrapper.text()).toContain("Click me");
  });

  it("defaults to type=button", () => {
    const wrapper = mountButton();
    expect(wrapper.find("button").attributes("type")).toBe("button");
  });

  it("sets disabled when disabled prop is true", () => {
    const wrapper = mountButton({ disabled: true });
    expect(wrapper.find("button").attributes("disabled")).toBeDefined();
  });

  it("sets disabled when loading prop is true", () => {
    const wrapper = mountButton({ loading: true });
    expect(wrapper.find("button").attributes("disabled")).toBeDefined();
  });

  it("sets aria-busy when loading", () => {
    const wrapper = mountButton({ loading: true });
    expect(wrapper.find("button").attributes("aria-busy")).toBe("true");
  });

  it("does not set aria-busy when not loading", () => {
    const wrapper = mountButton();
    expect(wrapper.find("button").attributes("aria-busy")).toBeUndefined();
  });

  it("forwards ariaLabel prop", () => {
    const wrapper = mountButton({ ariaLabel: "Submit form" });
    expect(wrapper.find("button").attributes("aria-label")).toBe("Submit form");
  });

  it("emits click on button click", async () => {
    const wrapper = mountButton({}, { default: "Go" });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("does not emit click when disabled", async () => {
    const wrapper = mountButton({ disabled: true }, { default: "Go" });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toBeUndefined();
  });

  it("applies variant class", () => {
    const wrapper = mountButton({ variant: "danger" }, { default: "Delete" });
    expect(wrapper.find("button").classes()).toContain("vc-button-danger");
  });

  it("sets aria-pressed when selected", () => {
    const w = mountButton({ selected: true });
    expect(w.find("button").attributes("aria-pressed")).toBe("true");
  });

  it("does not set aria-pressed when not selected", () => {
    const w = mountButton({});
    expect(w.find("button").attributes("aria-pressed")).toBeUndefined();
  });
});

/**
 * A button that disables itself in response to its own activation — the Sign in
 * button while the request is in flight, a dashboard range toggle while the chart
 * reloads — takes focus down with it: a natively disabled element cannot hold
 * focus, so it drops to <body> and the next Tab restarts at the top of the
 * document (WCAG 2.4.3 Focus Order).
 */
describe("VcButton focus while disabling", () => {
  const mountAttached = (props: Record<string, unknown> = {}) =>
    mount(VcButton as any, {
      props,
      attachTo: document.body,
      global: { stubs: { VcIcon: true } },
    });

  // Asserted as "does not carry the native attribute", not as "activeElement is
  // still the button": jsdom does not implement the blur-on-disable rule, so the
  // direct assertion passes with or without the fix. The rule was verified in
  // Chrome against the framework's own Sign in button; dropping the attribute is
  // the part that decides it, and the part a unit test can actually falsify.
  it("does not disable itself natively while it is the focused element", async () => {
    const wrapper = mountAttached();
    (wrapper.find("button").element as HTMLButtonElement).focus();

    await wrapper.setProps({ disabled: true });

    expect(wrapper.find("button").attributes("disabled")).toBeUndefined();
    wrapper.unmount();
  });

  it("treats loading the same way — it is the same disabled state", async () => {
    const wrapper = mountAttached();
    (wrapper.find("button").element as HTMLButtonElement).focus();

    await wrapper.setProps({ loading: true });

    expect(wrapper.find("button").attributes("disabled")).toBeUndefined();
    wrapper.unmount();
  });

  // Focus is retained by dropping the native attribute, so the state has to be
  // announced some other way or the button silently looks enabled to a screen reader.
  it("announces the disabled state while it is holding focus", async () => {
    const wrapper = mountAttached();
    (wrapper.find("button").element as HTMLButtonElement).focus();

    await wrapper.setProps({ disabled: true });

    expect(wrapper.find("button").attributes("aria-disabled")).toBe("true");
    wrapper.unmount();
  });

  it("does not activate while disabled and holding focus", async () => {
    const wrapper = mountAttached();
    (wrapper.find("button").element as HTMLButtonElement).focus();
    await wrapper.setProps({ disabled: true });

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("click")).toBeUndefined();
    wrapper.unmount();
  });

  // Only the focused button is kept in the tab order. A form full of disabled
  // buttons must not gain a tab stop each.
  it("uses the native attribute for a button that was not focused", async () => {
    const wrapper = mountAttached();

    await wrapper.setProps({ disabled: true });

    expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    expect(wrapper.find("button").attributes("aria-disabled")).toBeUndefined();
    wrapper.unmount();
  });

  it("goes back to the native attribute once focus moves away", async () => {
    const elsewhere = document.createElement("button");
    document.body.appendChild(elsewhere);
    const wrapper = mountAttached();
    (wrapper.find("button").element as HTMLButtonElement).focus();
    await wrapper.setProps({ disabled: true });

    elsewhere.focus();
    await wrapper.vm.$nextTick();

    expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    wrapper.unmount();
    elsewhere.remove();
  });
});
