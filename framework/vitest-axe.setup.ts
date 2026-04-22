import { expect } from "vitest";
import type { AxeResults } from "axe-core";

if (typeof HTMLCanvasElement !== "undefined") {
  try {
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: () => ({
        fillRect: () => undefined,
        clearRect: () => undefined,
        getImageData: () => ({ data: [] }),
        putImageData: () => undefined,
        createImageData: () => [],
        setTransform: () => undefined,
        drawImage: () => undefined,
        save: () => undefined,
        fillText: () => undefined,
        restore: () => undefined,
        beginPath: () => undefined,
        moveTo: () => undefined,
        lineTo: () => undefined,
        closePath: () => undefined,
        stroke: () => undefined,
        translate: () => undefined,
        scale: () => undefined,
        rotate: () => undefined,
        arc: () => undefined,
        fill: () => undefined,
        measureText: () => ({ width: 0 }),
        transform: () => undefined,
        rect: () => undefined,
        clip: () => undefined,
      }),
    });
  } catch {
    // noop
  }
}

if (typeof window !== "undefined" && typeof window.getComputedStyle === "function") {
  const originalGetComputedStyle = window.getComputedStyle.bind(window);
  window.getComputedStyle = ((element: Element, _pseudoElement?: string): CSSStyleDeclaration => {
    return originalGetComputedStyle(element);
  }) as typeof window.getComputedStyle;
}

// Custom matcher: expect(results).toHaveNoViolations()
expect.extend({
  toHaveNoViolations(received: AxeResults) {
    const violations = received.violations ?? [];
    const pass = violations.length === 0;

    const message = pass
      ? () => "Expected accessibility violations but found none"
      : () => {
          const details = violations
            .map(
              (v) =>
                `  - [${v.impact}] ${v.id}: ${v.description}\n` +
                v.nodes.map((n) => `    ${n.failureSummary}`).join("\n"),
            )
            .join("\n");
          return `Expected no accessibility violations but found ${violations.length}:\n${details}`;
        };

    return { pass, message };
  },
});

// Type augmentation for the custom matcher
declare module "vitest" {
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
  interface Assertion {
    toHaveNoViolations(): void;
  }
}
