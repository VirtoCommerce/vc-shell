import { describe, it, expect, afterEach } from "vitest";
import { nextTick } from "vue";
import { focusIfLoose } from "./focus";

describe("focusIfLoose", () => {
  const created: HTMLElement[] = [];

  const makeTarget = (tag = "div") => {
    const el = document.createElement(tag);
    if (tag === "div") el.tabIndex = -1;
    document.body.appendChild(el);
    created.push(el);
    return el;
  };

  afterEach(() => {
    created.splice(0).forEach((el) => el.remove());
  });

  it("focuses the target when focus is loose", async () => {
    const target = makeTarget();

    focusIfLoose(() => target);
    await nextTick();

    expect(document.activeElement).toBe(target);
  });

  it("declines when something already holds focus", async () => {
    const target = makeTarget();
    const holder = makeTarget("button");
    holder.focus();

    focusIfLoose(() => target);
    await nextTick();

    expect(document.activeElement).toBe(holder);
  });

  // The reason this is a helper: the target is resolved after the DOM settles, so a
  // node that is about to be rendered is a valid target.
  it("resolves the target after the DOM settles", async () => {
    let target: HTMLElement | null = null;

    focusIfLoose(() => target);
    target = makeTarget();
    await nextTick();

    expect(document.activeElement).toBe(target);
  });

  it("does nothing when the target disappeared before it ran", async () => {
    const target = makeTarget();

    focusIfLoose(() => target);
    target.remove();
    await nextTick();

    expect(document.activeElement).not.toBe(target);
  });

  it("survives a target that resolves to null", async () => {
    focusIfLoose(() => null);
    await expect(nextTick()).resolves.toBeUndefined();
  });
});
