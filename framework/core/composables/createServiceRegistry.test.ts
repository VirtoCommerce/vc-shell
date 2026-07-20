import { describe, it, expect, vi } from "vitest";
import { defineComponent, h, inject, provide, type InjectionKey } from "vue";
import { mount } from "@vue/test-utils";
import { InjectionError } from "@core/utilities";
import { createServiceRegistry } from "@core/composables/createServiceRegistry";

interface TestService {
  id: number;
}

const TestServiceKey: InjectionKey<TestService> = Symbol("TestService");

function createTestRegistry(overrides?: {
  dispose?: (service: TestService) => void;
  create?: () => TestService;
  onMissing?: () => void;
}) {
  return createServiceRegistry<TestService>({
    key: TestServiceKey,
    create: overrides?.create ?? (() => ({ id: 1 })),
    bus: { dispose: overrides?.dispose ?? vi.fn() },
    name: "TestService",
    onMissing: overrides?.onMissing,
  });
}

describe("createServiceRegistry", () => {
  describe("provide", () => {
    it("creates and provides a service", () => {
      const registry = createTestRegistry();
      let providedService: TestService | undefined;
      let injectedService: TestService | undefined;

      const Parent = defineComponent({
        setup() {
          providedService = registry.provide();
          return () => h(Child);
        },
      });
      const Child = defineComponent({
        setup() {
          injectedService = inject(TestServiceKey);
          return () => h("div");
        },
      });

      mount(Parent);

      expect(providedService).toBeDefined();
      expect(injectedService).toBe(providedService);
    });

    it("is idempotent — returns existing service if already provided", () => {
      const create = vi.fn(() => ({ id: Math.random() }));
      const registry = createTestRegistry({ create });
      let firstResult: TestService | undefined;
      let secondResult: TestService | undefined;

      const GrandParent = defineComponent({
        setup() {
          firstResult = registry.provide();
          return () => h(Parent);
        },
      });
      const Parent = defineComponent({
        setup() {
          secondResult = registry.provide();
          return () => h("div");
        },
      });

      mount(GrandParent);

      expect(firstResult).toBe(secondResult);
      expect(create).toHaveBeenCalledTimes(1);
    });

    it("disposes the service via the bus on scope teardown", () => {
      const dispose = vi.fn();
      const registry = createTestRegistry({ dispose });
      let providedService: TestService | undefined;

      const Comp = defineComponent({
        setup() {
          providedService = registry.provide();
          return () => h("div");
        },
      });

      const wrapper = mount(Comp);
      expect(dispose).not.toHaveBeenCalled();

      wrapper.unmount();
      expect(dispose).toHaveBeenCalledWith(providedService);
    });
  });

  describe("use", () => {
    it("returns the provided service", () => {
      const registry = createTestRegistry();
      let providedService: TestService | undefined;
      let usedService: TestService | undefined;

      const Parent = defineComponent({
        setup() {
          providedService = registry.provide();
          return () => h(Child);
        },
      });
      const Child = defineComponent({
        setup() {
          usedService = registry.use();
          return () => h("div");
        },
      });

      mount(Parent);

      expect(usedService).toBe(providedService);
    });

    it("throws InjectionError when no service is provided", () => {
      const registry = createTestRegistry();

      const Comp = defineComponent({
        setup() {
          expect(() => registry.use()).toThrow(InjectionError);
          expect(() => registry.use()).toThrow("TestService");
          return () => h("div");
        },
      });

      mount(Comp);
    });

    it("invokes onMissing before throwing", () => {
      const onMissing = vi.fn();
      const registry = createTestRegistry({ onMissing });

      const Comp = defineComponent({
        setup() {
          expect(() => registry.use()).toThrow(InjectionError);
          return () => h("div");
        },
      });

      mount(Comp);

      expect(onMissing).toHaveBeenCalledTimes(1);
    });

    it("does not throw for an externally provided service", () => {
      const registry = createTestRegistry();
      const external: TestService = { id: 42 };
      let usedService: TestService | undefined;

      const Comp = defineComponent({
        setup() {
          usedService = registry.use();
          return () => h("div");
        },
      });

      const Outer = defineComponent({
        setup() {
          provide(TestServiceKey, external);
          return () => h(Comp);
        },
      });

      mount(Outer);

      expect(usedService).toBe(external);
    });
  });
});
