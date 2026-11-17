import { describe, it, expect } from "vitest";
import { readWidthTransition } from "./width-transition";

function blade(frames: Record<string, unknown>[] | undefined, parentWidth = 1000) {
  const parent = document.createElement("div");
  Object.defineProperty(parent, "clientWidth", { value: parentWidth });
  const el = document.createElement("div");
  parent.append(el);
  const effect = {
    getKeyframes: () => frames ?? [],
    getTiming: () => ({ duration: 300, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }),
  };
  el.getAnimations = () => (frames ? [{ transitionProperty: "width", effect } as unknown as Animation] : []);
  return el;
}

describe("readWidthTransition", () => {
  it("resolves percentages against the parent", () => {
    expect(readWidthTransition(blade([{ width: "100%" }, { width: "70%" }]))).toEqual({
      delta: -300,
      duration: 300,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    });
  });

  it("reads pixel widths", () => {
    expect(readWidthTransition(blade([{ width: "400px" }, { width: "640px" }]))?.delta).toBe(240);
  });

  it("gives up on values it cannot resolve", () => {
    expect(readWidthTransition(blade([{ width: "calc(50% - 10px)" }, { width: "70%" }]))).toBeUndefined();
  });

  it("is undefined without a width transition", () => {
    expect(readWidthTransition(blade(undefined))).toBeUndefined();
  });
});
