import { defineComponent, h, provide } from "vue";
import { mount } from "@vue/test-utils";
import { mountWithSetup } from "@framework/test-helpers";
import { vi } from "vitest";
import { AppBarMobileButtonsServiceKey } from "@framework/injection-keys";
import { createAppBarMobileButtonsService } from "@core/services/app-bar-mobile-buttons-service";
import { provideAppBarMobileButtonsService, useAppBarMobileButtons } from "./index";
import { InjectionError } from "@core/utilities";

describe("useAppBarMobileButtons", () => {
  describe("without provider", () => {
    it("throws InjectionError when no service is provided", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => {
        mountWithSetup(() => useAppBarMobileButtons());
      }).toThrow(InjectionError);
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it("error message mentions AppBarMobileButtonsService", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => {
        mountWithSetup(() => useAppBarMobileButtons());
      }).toThrow(/AppBarMobileButtonsService/);
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  describe("with provider", () => {
    function mountWithProvider<T>(setupFn: () => T) {
      let result: T;
      const Inner = defineComponent({
        setup() {
          result = setupFn();
          return () => h("div");
        },
      });
      const Outer = defineComponent({
        setup() {
          const service = createAppBarMobileButtonsService();
          provide(AppBarMobileButtonsServiceKey, service);
          return () => h(Inner);
        },
      });
      const wrapper = mount(Outer);
      return { result: result!, wrapper };
    }

    it("returns the service when provided", () => {
      const { result } = mountWithProvider(() => useAppBarMobileButtons());
      expect(result).toBeDefined();
      expect(result.registeredButtons).toBeDefined();
      expect(result.register).toBeTypeOf("function");
      expect(result.unregister).toBeTypeOf("function");
      expect(result.getButton).toBeTypeOf("function");
      expect(result.getButtons).toBeDefined();
    });

    it("register and getButton work through the service", () => {
      const { result } = mountWithProvider(() => useAppBarMobileButtons());
      result.register({ id: "btn-1", order: 1 });
      expect(result.getButton("btn-1")).toBeDefined();
      expect(result.getButton("btn-1")!.id).toBe("btn-1");
    });

    it("unregister removes button", () => {
      const { result } = mountWithProvider(() => useAppBarMobileButtons());
      result.register({ id: "btn-2", order: 1 });
      expect(result.getButton("btn-2")).toBeDefined();
      result.unregister("btn-2");
      expect(result.getButton("btn-2")).toBeUndefined();
    });
  });

  describe("provideAppBarMobileButtonsService", () => {
    it("creates and returns a service", () => {
      const { result } = mountWithSetup(() => provideAppBarMobileButtonsService());
      expect(result).toBeDefined();
      expect(result.register).toBeTypeOf("function");
    });

    it("returns existing service if already provided", () => {
      let first: ReturnType<typeof provideAppBarMobileButtonsService>;
      let second: ReturnType<typeof provideAppBarMobileButtonsService>;

      const Inner = defineComponent({
        setup() {
          second = provideAppBarMobileButtonsService();
          return () => h("div");
        },
      });
      const Outer = defineComponent({
        setup() {
          first = provideAppBarMobileButtonsService();
          return () => h(Inner);
        },
      });
      mount(Outer);
      expect(first!).toBe(second!);
    });
  });
});
