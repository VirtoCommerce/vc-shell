import { expect } from "vitest";
import type { AxeResults } from "axe-core";

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
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
  interface Assertion {
    toHaveNoViolations(): void;
  }
}
