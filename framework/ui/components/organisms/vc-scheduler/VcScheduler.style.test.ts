import { afterEach, describe, expect, it } from "vitest";
import { compileString } from "sass";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import schedulerSource from "./VcScheduler.vue?raw";

const colorsSource = readFileSync(resolve(process.cwd(), "assets/styles/theme/colors.scss"), "utf8");

function componentScss(source: string): string {
  const match = source.match(/<style lang="scss">([\s\S]*?)<\/style>/);
  if (!match) throw new Error("VcScheduler SCSS block was not found");
  return match[1];
}

describe("VcScheduler surface styles", () => {
  afterEach(() => {
    document.querySelector("style[data-test='vc-scheduler-surface']")?.remove();
    document.documentElement.style.removeProperty("--additional-50");
    document.body.replaceChildren();
  });

  it("paints the scheduler with the dark-theme additional-50 surface token", () => {
    const style = document.createElement("style");
    style.dataset.test = "vc-scheduler-surface";
    style.textContent = compileString(componentScss(schedulerSource)).css;
    document.head.appendChild(style);
    const sheet = style.sheet as CSSStyleSheet;
    const schedulerRule = Array.from(sheet.cssRules)
      .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
      .find((rule) => rule.selectorText === ".vc-scheduler");

    // jsdom preserves custom-property references instead of resolving them in
    // getComputedStyle, so pin both ends of the compiled contract: the component
    // paints its surface with the token, and dark theme defines that token as #242a2e.
    expect(schedulerRule?.style.getPropertyValue("--scheduler-surface-color").trim()).toBe(
      "var(--additional-50, #fff)",
    );
    expect(schedulerRule?.style.getPropertyValue("background").trim()).toBe("var(--scheduler-surface-color)");
    expect(colorsSource).toMatch(/\[data-theme=["']dark["']\][\s\S]*?--additional-50:\s*#242a2e;/);
  });
});
