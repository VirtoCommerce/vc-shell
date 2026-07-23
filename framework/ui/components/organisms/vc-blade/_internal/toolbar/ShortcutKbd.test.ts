import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ShortcutKbd from "./ShortcutKbd.vue";

describe("ShortcutKbd", () => {
  it("renders one kbd per part", () => {
    const wrapper = mount(ShortcutKbd, { props: { parts: ["Ctrl", "S"] } });
    const kbds = wrapper.findAll("kbd");
    expect(kbds).toHaveLength(2);
    expect(kbds[0].text()).toBe("Ctrl");
    expect(kbds[1].text()).toBe("S");
  });

  it("shows + separators when separated", () => {
    const wrapper = mount(ShortcutKbd, { props: { parts: ["Ctrl", "S"], separated: true } });
    const text = wrapper.text();
    expect(text).toContain("+");
    expect(text.trim()).not.toMatch(/^\+/);
    expect(text.match(/\+/g)).toHaveLength(1);
  });

  it("no separators when not separated (mac glyphs)", () => {
    const wrapper = mount(ShortcutKbd, { props: { parts: ["⌘", "S"], separated: false } });
    expect(wrapper.text()).not.toContain("+");
  });
});
