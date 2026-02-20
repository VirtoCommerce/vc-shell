import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPreregistrationBus, type PreregistrationBus } from "@core/services/_internal/createPreregistrationBus";

interface TestItem {
  id: string;
  value: number;
}

interface TestService {
  items: TestItem[];
  register(item: TestItem): void;
  unregister?(id: string): void;
}

function createTestService(): TestService {
  const items: TestItem[] = [];
  return {
    items,
    register(item: TestItem) {
      items.push(item);
    },
  };
}

function createTestBus(): PreregistrationBus<TestItem, TestService> {
  return createPreregistrationBus<TestItem, TestService>({
    name: "test",
    getKey: (item) => item.id,
    registerIntoService: (service, item) => service.register(item),
  });
}

describe("createPreregistrationBus", () => {
  let bus: PreregistrationBus<TestItem, TestService>;

  beforeEach(() => {
    bus = createTestBus();
  });

  it("stores preregistered items before any service exists", () => {
    bus.preregister({ id: "a", value: 1 });
    bus.preregister({ id: "b", value: 2 });

    expect(bus.getPreregistered()).toHaveLength(2);
  });

  it("deduplicates items with the same key", () => {
    bus.preregister({ id: "a", value: 1 });
    bus.preregister({ id: "a", value: 2 });

    const items = bus.getPreregistered();
    expect(items).toHaveLength(1);
    expect(items[0].value).toBe(2);
  });

  it("replays all preregistered items into a service", () => {
    bus.preregister({ id: "a", value: 1 });
    bus.preregister({ id: "b", value: 2 });

    const service = createTestService();
    bus.replayInto(service);

    expect(service.items).toHaveLength(2);
    expect(service.items.map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("live-broadcasts to existing instances when preregistering after service creation", () => {
    const service = createTestService();
    bus.replayInto(service);

    bus.preregister({ id: "late", value: 99 });

    expect(service.items).toHaveLength(1);
    expect(service.items[0].id).toBe("late");
  });

  it("broadcasts to multiple instances", () => {
    const service1 = createTestService();
    const service2 = createTestService();
    bus.replayInto(service1);
    bus.replayInto(service2);

    bus.preregister({ id: "multi", value: 42 });

    expect(service1.items).toHaveLength(1);
    expect(service2.items).toHaveLength(1);
  });

  it("dispose removes service from instance tracking", () => {
    const service = createTestService();
    bus.replayInto(service);
    expect(bus.instanceCount).toBe(1);

    bus.dispose(service);
    expect(bus.instanceCount).toBe(0);

    // Items preregistered after dispose should not reach disposed service
    bus.preregister({ id: "after-dispose", value: 0 });
    expect(service.items).toHaveLength(0);
  });

  it("getFirstInstance returns the first tracked instance", () => {
    expect(bus.getFirstInstance()).toBeUndefined();

    const service = createTestService();
    bus.replayInto(service);

    expect(bus.getFirstInstance()).toBe(service);
  });

  it("removePreregistered removes matching items from store", () => {
    bus.preregister({ id: "keep", value: 1 });
    bus.preregister({ id: "remove", value: 2 });

    bus.removePreregistered((item) => item.id === "remove");

    expect(bus.getPreregistered()).toHaveLength(1);
    expect(bus.getPreregistered()[0].id).toBe("keep");
  });

  it("handles registration errors gracefully during replay", () => {
    bus.preregister({ id: "bad", value: -1 });

    const brokenService: TestService = {
      items: [],
      register() {
        throw new Error("boom");
      },
    };

    // Should not throw
    expect(() => bus.replayInto(brokenService)).not.toThrow();
  });

  it("handles registration errors gracefully during live broadcast", () => {
    const brokenService: TestService = {
      items: [],
      register() {
        throw new Error("boom");
      },
    };
    bus.replayInto(brokenService);

    // Should not throw
    expect(() => bus.preregister({ id: "late", value: 1 })).not.toThrow();
  });

  it("broadcast calls callback on all tracked instances", () => {
    const service1 = createTestService();
    const service2 = createTestService();
    bus.replayInto(service1);
    bus.replayInto(service2);

    const cb = vi.fn();
    bus.broadcast(cb);

    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenCalledWith(service1);
    expect(cb).toHaveBeenCalledWith(service2);
  });

  it("instanceCount reflects current number of tracked instances", () => {
    expect(bus.instanceCount).toBe(0);

    const s1 = createTestService();
    const s2 = createTestService();
    bus.replayInto(s1);
    expect(bus.instanceCount).toBe(1);

    bus.replayInto(s2);
    expect(bus.instanceCount).toBe(2);

    bus.dispose(s1);
    expect(bus.instanceCount).toBe(1);
  });

  describe("unregister", () => {
    it("removes item from store by id", () => {
      bus.preregister({ id: "a", value: 1 });
      bus.preregister({ id: "b", value: 2 });

      bus.unregister("a");

      expect(bus.getPreregistered()).toHaveLength(1);
      expect(bus.getPreregistered()[0].id).toBe("b");
    });

    it("is a no-op for non-existent id", () => {
      bus.preregister({ id: "a", value: 1 });

      bus.unregister("does-not-exist");

      expect(bus.getPreregistered()).toHaveLength(1);
    });

    it("works without unregisterFromService callback (store-only)", () => {
      bus.preregister({ id: "a", value: 1 });
      const service = createTestService();
      bus.replayInto(service);

      // Bus without unregisterFromService — only removes from store
      bus.unregister("a");

      expect(bus.getPreregistered()).toHaveLength(0);
    });

    it("broadcasts removal to live service instances when unregisterFromService is provided", () => {
      const busWithUnregister = createPreregistrationBus<TestItem, TestService>({
        name: "test-with-unregister",
        getKey: (item) => item.id,
        registerIntoService: (service, item) => service.register(item),
        unregisterFromService: (service, id) => service.unregister?.(id),
      });

      const unregisterSpy = vi.fn();
      const service = createTestService();
      service.unregister = unregisterSpy;
      busWithUnregister.replayInto(service);
      busWithUnregister.preregister({ id: "a", value: 1 });

      busWithUnregister.unregister("a");

      expect(unregisterSpy).toHaveBeenCalledWith("a");
      expect(busWithUnregister.getPreregistered()).toHaveLength(0);
    });
  });
});
