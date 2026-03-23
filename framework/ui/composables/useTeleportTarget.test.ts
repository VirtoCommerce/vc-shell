import { describe, it, expect, vi } from "vitest";
import { defineComponent, h, provide, ref } from "vue";
import { mount } from "@vue/test-utils";
import { AppRootElementKey } from "@framework/injection-keys";
import { useTeleportTarget } from "./useTeleportTarget";

function mountWithProvider<T>(setupFn: () => T, providerSetup?: () => void) {
  let result: T;
  const Inner = defineComponent({
    setup() {
      result = setupFn();
      return () => h("div");
    },
  });
  const Outer = defineComponent({
    setup() {
      providerSetup?.();
      return () => h(Inner);
    },
  });
  const wrapper = mount(Outer);
  return { result: result!, wrapper };
}

describe("useTeleportTarget", () => {
  it("defaults to 'body' when no app root and no explicit target", () => {
    const { result } = mountWithProvider(() => useTeleportTarget());
    expect(result.teleportTarget.value).toBe("body");
  });

  it("uses explicit string target", () => {
    const { result } = mountWithProvider(() => useTeleportTarget({ to: "#my-portal" }));
    expect(result.teleportTarget.value).toBe("#my-portal");
  });

  it("uses explicit HTMLElement target", () => {
    const el = document.createElement("div");
    const { result } = mountWithProvider(() => useTeleportTarget({ to: el }));
    expect(result.teleportTarget.value).toBe(el);
  });

  it("uses app root element when injected and no explicit target", () => {
    const appRoot = document.createElement("div");
    const appRootRef = ref<HTMLElement | undefined>(appRoot);

    const { result } = mountWithProvider(
      () => useTeleportTarget(),
      () => provide(AppRootElementKey, appRootRef),
    );

    expect(result.teleportTarget.value).toBe(appRoot);
  });

  it("prefers explicit target over app root", () => {
    const appRoot = document.createElement("div");
    const appRootRef = ref<HTMLElement | undefined>(appRoot);

    const { result } = mountWithProvider(
      () => useTeleportTarget({ to: "#explicit" }),
      () => provide(AppRootElementKey, appRootRef),
    );

    expect(result.teleportTarget.value).toBe("#explicit");
  });

  it("returns undefined when fallbackToBody is false and no target/root", () => {
    const { result } = mountWithProvider(() => useTeleportTarget({ fallbackToBody: false }));
    expect(result.teleportTarget.value).toBeUndefined();
  });

  it("falls back to body when app root ref value is undefined", () => {
    const appRootRef = ref<HTMLElement | undefined>(undefined);

    const { result } = mountWithProvider(
      () => useTeleportTarget(),
      () => provide(AppRootElementKey, appRootRef),
    );

    expect(result.teleportTarget.value).toBe("body");
  });

  it("supports reactive MaybeRefOrGetter for to option", async () => {
    const target = ref<string | null>(null);

    const { result } = mountWithProvider(() => useTeleportTarget({ to: () => target.value }));

    expect(result.teleportTarget.value).toBe("body");

    target.value = "#dynamic";
    expect(result.teleportTarget.value).toBe("#dynamic");
  });
});
