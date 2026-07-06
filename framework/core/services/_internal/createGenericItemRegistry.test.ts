import { describe, it, expect, vi } from "vitest";
import { createGenericItemRegistry, type GenericItemService } from "@core/services/_internal/createGenericItemRegistry";
import { createPreregistrationBus } from "@core/services/_internal/createPreregistrationBus";

interface TestItem {
  id: string;
  order?: number;
  label: string;
}

interface TestOptions {
  id?: string;
  order?: number;
  label: string;
}

function createTestBus() {
  return createPreregistrationBus<TestOptions, GenericItemService<TestItem, TestOptions>>({
    name: "test-generic-item",
    getKey: (item) => item.id || crypto.randomUUID(),
    registerIntoService: (service, item) => service.register(item),
    unregisterFromService: (service, id) => service.unregister(id),
  });
}

function createTestRegistry(bus: ReturnType<typeof createTestBus>): GenericItemService<TestItem, TestOptions> {
  return createGenericItemRegistry<TestItem, TestOptions>({
    bus,
    createItem: (opts, currentSize) => ({
      id: opts.id || "",
      order: opts.order ?? currentSize,
      label: opts.label,
    }),
    getId: (opts) => opts.id || "",
  });
}

describe("createGenericItemRegistry", () => {
  it("registers items and returns them sorted by order", () => {
    const service = createTestRegistry(createTestBus());
    service.register({ id: "b", order: 2, label: "B" });
    service.register({ id: "a", order: 1, label: "A" });

    expect(service.items.value.map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("unregister removes the item", () => {
    const service = createTestRegistry(createTestBus());
    service.register({ id: "x", label: "X" });
    expect(service.items.value).toHaveLength(1);

    service.unregister("x");
    expect(service.items.value).toHaveLength(0);
  });

  it("replays preregistered items from the bus on creation", () => {
    const bus = createTestBus();
    bus.preregister({ id: "pre", label: "Pre" });

    const service = createTestRegistry(bus);

    expect(service.items.value.map((i) => i.id)).toEqual(["pre"]);
  });

  it("passes createItem and getId through to the underlying map registry", () => {
    const createItem = vi.fn((opts: TestOptions, currentSize: number) => ({
      id: opts.id || "",
      order: opts.order ?? currentSize,
      label: opts.label,
    }));
    const service = createGenericItemRegistry<TestItem, TestOptions>({
      bus: createTestBus(),
      createItem,
      getId: (opts) => opts.id || "",
    });

    service.register({ id: "a", label: "A" });
    expect(createItem).toHaveBeenCalledWith({ id: "a", label: "A" }, 0);
  });
});
