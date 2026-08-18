import { afterEach, describe, expect, it } from "vitest";
import { compileString } from "sass";
import bladeSource from "./vc-blade.vue?raw";
import bladeHeaderSource from "./_internal/BladeHeader.vue?raw";

function componentScss(source: string): string {
  const match = source.match(/<style lang="scss">([\s\S]*?)<\/style>/);
  if (!match) throw new Error("Component SCSS block was not found");
  return match[1];
}

describe("VcBlade breadcrumb target size", () => {
  afterEach(() => {
    document.querySelector("style[data-test='vc-blade-target-size']")?.remove();
    document.body.replaceChildren();
  });

  it("computes a minimum 24 by 24 CSS-pixel target for the overflow button", () => {
    const style = document.createElement("style");
    style.dataset.test = "vc-blade-target-size";
    style.textContent = compileString(`${componentScss(bladeHeaderSource)}\n${componentScss(bladeSource)}`).css;
    document.head.appendChild(style);

    const sheet = style.sheet as CSSStyleSheet;
    const rules = Array.from(sheet.cssRules).filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule);
    const rootRule = rules.find((rule) => rule.selectorText === ":root");
    const triggerRule = rules.find((rule) => rule.selectorText === ".vc-blade__breadcrumbs-button");

    // jsdom does not resolve var() inside min-width/min-height. Checking the
    // compiled consumer and the exact token value still guards the 24px hit box,
    // and either half fails if the target-size fix is reverted.
    expect(rootRule?.style.getPropertyValue("--blade-header-button-target-size").trim()).toBe("24px");
    expect(triggerRule?.style.getPropertyValue("min-width").trim()).toBe("var(--blade-header-button-target-size)");
    expect(triggerRule?.style.getPropertyValue("min-height").trim()).toBe("var(--blade-header-button-target-size)");
  });
});
