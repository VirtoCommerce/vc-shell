import { describe, it, expect } from "vitest";
import { defineComponent, h, inject } from "vue";
import { mount } from "@vue/test-utils";
import { SettingsMenuServiceKey } from "../../../injection-keys";
import { provideSettingsMenu, useSettingsMenu } from "./index";
import { createSettingsMenuService } from "../../services/settings-menu-service";

describe("useSettingsMenu", () => {
  it("throws InjectionError when no service is provided", () => {
    const TestComp = defineComponent({
      setup() {
        expect(() => useSettingsMenu()).toThrow("SettingsMenuService");
        return () => h("div");
      },
    });

    mount(TestComp);
  });

  it("returns injected service", () => {
    const service = createSettingsMenuService();

    const TestComp = defineComponent({
      setup() {
        const result = useSettingsMenu();
        expect(result).toBe(service);
        return () => h("div");
      },
    });

    mount(TestComp, {
      global: {
        provide: { [SettingsMenuServiceKey as symbol]: service },
      },
    });
  });
});

describe("provideSettingsMenu", () => {
  it("creates and provides a service", () => {
    let providedService: any;
    let injectedService: any;

    const Parent = defineComponent({
      setup() {
        providedService = provideSettingsMenu();
        return () => h(Child);
      },
    });

    const Child = defineComponent({
      setup() {
        injectedService = inject(SettingsMenuServiceKey);
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
        firstResult = provideSettingsMenu();
        return () => h(Parent);
      },
    });

    const Parent = defineComponent({
      setup() {
        secondResult = provideSettingsMenu();
        return () => h("div");
      },
    });

    mount(GrandParent);

    expect(firstResult).toBe(secondResult);
  });
});
