import { describe, it, expect } from "vitest";
import { defineComponent, h, inject } from "vue";
import { mount } from "@vue/test-utils";
import { DashboardServiceKey } from "../../../injection-keys";
import { provideDashboardService, useDashboard } from "./index";
import { createDashboardService } from "../../services/dashboard-service";

describe("useDashboard", () => {
  it("throws InjectionError when no service is provided", () => {
    const TestComp = defineComponent({
      setup() {
        expect(() => useDashboard()).toThrow("DashboardService");
        return () => h("div");
      },
    });

    mount(TestComp);
  });

  it("returns injected service", () => {
    const service = createDashboardService();

    const TestComp = defineComponent({
      setup() {
        const result = useDashboard();
        expect(result).toBe(service);
        return () => h("div");
      },
    });

    mount(TestComp, {
      global: {
        provide: { [DashboardServiceKey as symbol]: service },
      },
    });
  });
});

describe("provideDashboardService", () => {
  it("creates and provides a service", () => {
    let providedService: any;
    let injectedService: any;

    const Parent = defineComponent({
      setup() {
        providedService = provideDashboardService();
        return () => h(Child);
      },
    });

    const Child = defineComponent({
      setup() {
        injectedService = inject(DashboardServiceKey);
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
        firstResult = provideDashboardService();
        return () => h(Parent);
      },
    });

    const Parent = defineComponent({
      setup() {
        secondResult = provideDashboardService();
        return () => h("div");
      },
    });

    mount(GrandParent);

    expect(firstResult).toBe(secondResult);
  });
});
