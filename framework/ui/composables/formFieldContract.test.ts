import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * The invariant `VcEditor` broke: a control that shows an error message must
 * connect that message to the control, or a screen reader announces the field
 * as invalid and never says why.
 *
 * This reads sources rather than mounting a dozen components. Mount tests assert
 * the rendered result more directly, but each control needs its own props, stubs
 * and providers — and the drift being guarded against is exactly the kind a
 * per-component suite misses, because nobody writes the test for the control
 * they forgot. A source check cannot be forgotten: a new control either
 * satisfies it or fails here.
 *
 * Scope is the controls that own their own field chrome, meaning the ones that
 * call `useFormField`. Composites that wrap a compliant child (`VcInputCurrency`
 * → `VcInputDropdown` → `VcInput`) inherit the behaviour, and group wrappers
 * (`VcCheckboxGroup`, `VcRadioGroup`) provide the context rather than consume it.
 */

const COMPONENTS_DIR = join(__dirname, "..", "components");

function findVueFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return findVueFiles(full);
    return full.endsWith(".vue") ? [full] : [];
  });
}

const controls = findVueFiles(COMPONENTS_DIR)
  .map((path) => ({ name: path.split("/").pop()!, source: readFileSync(path, "utf8") }))
  .filter(({ source }) => source.includes("useFormField"));

const cases = controls.map((c) => [c.name, c] as const);

describe("form control accessibility contract", () => {
  it("finds the controls to check", () => {
    // A rename or a move should fail loudly here rather than quietly reduce the
    // suite to nothing.
    expect(controls.length).toBeGreaterThanOrEqual(11);
  });

  // VcEditor generated no ids and never set aria-describedby: the message was on
  // screen and unreachable. Either spelling counts — controls that delegate to a
  // child pass it as the `:aria-described-by` prop.
  it.each(cases)("%s references its description from the control", (_name, control) => {
    expect(control.source).toMatch(/aria-describedby|aria-described-by/);
  });

  it.each(cases)("%s puts an id on the element carrying the error", (_name, control) => {
    expect(control.source).toMatch(/errorId|error-id/);
  });

  // The local `!!errorMessage` check VcEditor used could not see a group's
  // invalid state, so a field inside an invalid group looked valid to assistive
  // technology. `useFormField`'s `invalid` folds both in.
  it.each(cases)("%s takes invalid state from the shared computed", (_name, control) => {
    expect(control.source).not.toMatch(/!!errorMessage/);
  });
});
