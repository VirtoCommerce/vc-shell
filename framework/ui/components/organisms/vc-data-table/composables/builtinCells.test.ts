import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { defineComponent } from "vue";
import { useCellRegistry } from "./useCellRegistry";
import { registerBuiltinCells, BUILTIN_CELL_TYPES } from "./builtinCells";

const CustomCell = defineComponent({ template: "<em />" });

describe("registerBuiltinCells", () => {
  let registry: ReturnType<typeof useCellRegistry>;

  beforeEach(() => {
    registry = useCellRegistry();
    registry.clear();
  });

  it("built-in cell types are absent until registerBuiltinCells() is called", () => {
    expect(registry.getRegisteredTypes()).toHaveLength(0);
    expect(registry.has("money")).toBe(false);
  });

  it("registers exactly the 12 built-in cell types", () => {
    registerBuiltinCells();

    expect(registry.getRegisteredTypes()).toHaveLength(12);
    expect([...registry.getRegisteredTypes()].sort()).toEqual([...BUILTIN_CELL_TYPES].sort());
  });

  it("marks text, number and money as editable and the rest as read-only", () => {
    registerBuiltinCells();

    expect(registry.get("text")?.config?.editable).toBe(true);
    expect(registry.get("number")?.config?.editable).toBe(true);
    expect(registry.get("money")?.config?.editable).toBe(true);
    expect(registry.get("date")?.config?.editable).toBe(false);
    expect(registry.get("status-icon")?.config?.editable).toBe(false);
  });

  it("is a no-op on a second call, and does not undo an override made in between", () => {
    registerBuiltinCells();
    registry.register({ type: "text", component: CustomCell });

    registerBuiltinCells();

    expect(registry.getRegisteredTypes()).toHaveLength(12);
    expect(registry.get("text")?.component).toBe(CustomCell);
  });

  it("does not overwrite a user registration made before it", () => {
    registry.register({ type: "money", component: CustomCell, config: { editable: false } });

    registerBuiltinCells();

    expect(registry.get("money")?.component).toBe(CustomCell);
    expect(registry.get("money")?.config?.editable).toBe(false);
    expect(registry.getRegisteredTypes()).toHaveLength(12);
  });

  it("leaves a user registration for a non-built-in type untouched", () => {
    registry.register({ type: "rating", component: CustomCell });

    registerBuiltinCells();

    expect(registry.get("rating")?.component).toBe(CustomCell);
    expect(registry.getRegisteredTypes()).toHaveLength(13);
  });
});

describe("DynamicCellRenderer module side effect", () => {
  // vi.resetModules() below swaps the module graph for the whole worker; restore
  // it so anything appended after this block starts from a clean registry.
  afterEach(() => {
    vi.resetModules();
  });

  it("registers the built-ins when the component module is imported, with no mount", async () => {
    vi.resetModules();

    // Fresh module graph => fresh registry Map.
    const { useCellRegistry: freshUseCellRegistry } = await import("./useCellRegistry");
    const fresh = freshUseCellRegistry();
    expect(fresh.getRegisteredTypes()).toHaveLength(0);

    await import("../components/cells/DynamicCellRenderer.vue");

    expect(fresh.getRegisteredTypes()).toHaveLength(12);
    expect(fresh.has("money")).toBe(true);
  });
});
