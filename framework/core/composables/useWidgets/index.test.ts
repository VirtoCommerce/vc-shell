import { describe, it, expect, vi } from "vitest";
import { defineComponent, h, inject } from "vue";
import { mount } from "@vue/test-utils";
import { WidgetServiceKey } from "@framework/injection-keys";
import { provideWidgetService, useWidgets } from "@core/composables/useWidgets";
import { createWidgetService } from "@core/services/widget-service";

describe("useWidgets", () => {
  it("throws InjectionError when no service is provided", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const TestComp = defineComponent({
      setup() {
        expect(() => useWidgets()).toThrow("WidgetService");
        return () => h("div");
      },
    });

    mount(TestComp);
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("returns injected service", () => {
    const service = createWidgetService();

    const TestComp = defineComponent({
      setup() {
        const result = useWidgets();
        expect(result).toBe(service);
        return () => h("div");
      },
    });

    mount(TestComp, {
      global: {
        provide: { [WidgetServiceKey as symbol]: service },
      },
    });
  });
});

describe("provideWidgetService", () => {
  it("creates and provides a service", () => {
    let providedService: any;
    let injectedService: any;

    const Parent = defineComponent({
      setup() {
        providedService = provideWidgetService();
        return () => h(Child);
      },
    });

    const Child = defineComponent({
      setup() {
        injectedService = inject(WidgetServiceKey);
        return () => h("div");
      },
    });

    mount(Parent);

    expect(providedService).toBeDefined();
    expect(injectedService).toBe(providedService);
  });

  it("is idempotent — returns existing service if already provided", () => {
    let firstResult: any;
    let secondResult: any;

    const GrandParent = defineComponent({
      setup() {
        firstResult = provideWidgetService();
        return () => h(Parent);
      },
    });

    const Parent = defineComponent({
      setup() {
        secondResult = provideWidgetService();
        return () => h("div");
      },
    });

    mount(GrandParent);

    expect(firstResult).toBe(secondResult);
  });
});
