import { describe, it, expect } from "vitest";
import { defineComponent, h, inject } from "vue";
import { mount } from "@vue/test-utils";
import { MenuServiceKey } from "@framework/injection-keys";
import { provideMenuService, useMenuService } from "@core/composables/useMenuService";
import { createMenuService } from "@core/services/menu-service";

describe("useMenuService", () => {
  it("throws InjectionError when no service is provided", () => {
    const TestComp = defineComponent({
      setup() {
        expect(() => useMenuService()).toThrow("MenuService");
        return () => h("div");
      },
    });

    mount(TestComp);
  });

  it("returns injected service", () => {
    const service = createMenuService();

    const TestComp = defineComponent({
      setup() {
        const result = useMenuService();
        expect(result).toBe(service);
        return () => h("div");
      },
    });

    mount(TestComp, {
      global: {
        provide: { [MenuServiceKey as symbol]: service },
      },
    });
  });
});

describe("provideMenuService", () => {
  it("creates and provides a service", () => {
    let providedService: any;
    let injectedService: any;

    const Parent = defineComponent({
      setup() {
        providedService = provideMenuService();
        return () => h(Child);
      },
    });

    const Child = defineComponent({
      setup() {
        injectedService = inject(MenuServiceKey);
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
        firstResult = provideMenuService();
        return () => h(Parent);
      },
    });

    const Parent = defineComponent({
      setup() {
        secondResult = provideMenuService();
        return () => h("div");
      },
    });

    mount(GrandParent);

    expect(firstResult).toBe(secondResult);
  });
});
