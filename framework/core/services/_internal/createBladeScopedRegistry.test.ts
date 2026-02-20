import { describe, it, expect, beforeEach } from "vitest";
import { createBladeScopedRegistry, type BladeScopedRegistry } from "@core/services/_internal/createBladeScopedRegistry";

interface TestItem {
  id: string;
  bladeId?: string;
  label?: string;
}

interface TestRegistration {
  bladeId: string;
  item: TestItem;
}

function createTestRegistry(): BladeScopedRegistry<TestItem, TestRegistration> {
  return createBladeScopedRegistry<TestItem, TestRegistration>({
    createRegistration: (bladeId, item) => ({ bladeId, item }),
    getRegistrationBladeId: (r) => r.bladeId,
    getRegistrationItemId: (r) => r.item.id,
  });
}

describe("createBladeScopedRegistry", () => {
  let registry: BladeScopedRegistry<TestItem, TestRegistration>;

  beforeEach(() => {
    registry = createTestRegistry();
  });

  it("registers and retrieves items by bladeId", () => {
    registry.register({ id: "a", label: "A" }, "blade-1");
    registry.register({ id: "b", label: "B" }, "blade-1");

    const items = registry.get("blade-1");
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("normalizes bladeId to lowercase", () => {
    registry.register({ id: "a" }, "Blade-1");
    expect(registry.get("blade-1")).toHaveLength(1);
    expect(registry.get("BLADE-1")).toHaveLength(1);
  });

  it("returns empty array for unknown bladeId", () => {
    expect(registry.get("nonexistent")).toEqual([]);
  });

  it("returns defensive copy from get()", () => {
    registry.register({ id: "a" }, "blade-1");
    const copy = registry.get("blade-1");
    copy.push({ id: "fake" });
    expect(registry.get("blade-1")).toHaveLength(1);
  });

  it("upserts existing items instead of duplicating", () => {
    registry.register({ id: "a", label: "original" }, "blade-1");
    registry.register({ id: "a", label: "updated" }, "blade-1");

    const items = registry.get("blade-1");
    expect(items).toHaveLength(1);
    expect(items[0].label).toBe("updated");
  });

  it("tracks registrations in the registrations array", () => {
    registry.register({ id: "a" }, "blade-1");
    registry.register({ id: "b" }, "blade-2");

    expect(registry.registrations).toHaveLength(2);
  });

  it("unregister removes item and registration", () => {
    registry.register({ id: "a" }, "blade-1");
    registry.register({ id: "b" }, "blade-1");

    registry.unregister("a", "blade-1");

    expect(registry.get("blade-1")).toHaveLength(1);
    expect(registry.get("blade-1")[0].id).toBe("b");
    expect(registry.registrations).toHaveLength(1);
  });

  it("clear removes all items for a blade", () => {
    registry.register({ id: "a" }, "blade-1");
    registry.register({ id: "b" }, "blade-1");
    registry.register({ id: "c" }, "blade-2");

    registry.clear("blade-1");

    expect(registry.get("blade-1")).toHaveLength(0);
    expect(registry.get("blade-2")).toHaveLength(1);
    expect(registry.registrations).toHaveLength(1);
  });

  it("update modifies an existing item in-place", () => {
    registry.register({ id: "a", label: "original" }, "blade-1");
    registry.update("a", "blade-1", { label: "modified" });

    expect(registry.get("blade-1")[0].label).toBe("modified");
  });

  it("update is a no-op for non-existent item", () => {
    registry.update("nonexistent", "blade-1", { label: "x" });
    expect(registry.get("blade-1")).toHaveLength(0);
  });

  it("isRegistered tracks cross-blade registration count", () => {
    registry.register({ id: "dup" }, "blade-a");
    registry.register({ id: "dup" }, "blade-b");

    expect(registry.isRegistered("dup")).toBe(true);

    registry.unregister("dup", "blade-a");
    expect(registry.isRegistered("dup")).toBe(true);

    registry.unregister("dup", "blade-b");
    expect(registry.isRegistered("dup")).toBe(false);
  });

  it("clear decrements registration counts", () => {
    registry.register({ id: "a" }, "blade-1");
    registry.register({ id: "a" }, "blade-2");

    registry.clear("blade-1");
    expect(registry.isRegistered("a")).toBe(true);

    registry.clear("blade-2");
    expect(registry.isRegistered("a")).toBe(false);
  });
});
