import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import { IsMobileKey, IsDesktopKey, IsPhoneKey, IsTabletKey, IsTouchKey } from "@framework/injection-keys";
import { useResponsive } from "./index";

function mountWithProvide(provided: Record<symbol, any>) {
  let result: ReturnType<typeof useResponsive> | undefined;
  const Comp = defineComponent({
    setup() {
      result = useResponsive();
      return () => null;
    },
  });
  mount(Comp, { global: { provide: provided } });
  return result!;
}

describe("useResponsive", () => {
  it("returns injected breakpoint refs", () => {
    const isMobile = ref(true);
    const isDesktop = ref(false);
    const isPhone = ref(false);
    const isTablet = ref(true);

    const result = mountWithProvide({
      [IsMobileKey as symbol]: isMobile,
      [IsDesktopKey as symbol]: isDesktop,
      [IsPhoneKey as symbol]: isPhone,
      [IsTabletKey as symbol]: isTablet,
      [IsTouchKey as symbol]: true,
    });

    expect(result.isMobile.value).toBe(true);
    expect(result.isDesktop.value).toBe(false);
    expect(result.isPhone.value).toBe(false);
    expect(result.isTablet.value).toBe(true);
    expect(result.isTouch).toBe(true);
  });

  it("returns defaults when no provider exists", () => {
    const result = mountWithProvide({});

    expect(result.isMobile.value).toBe(false);
    expect(result.isDesktop.value).toBe(true);
    expect(result.isPhone.value).toBe(false);
    expect(result.isTablet.value).toBe(false);
    expect(result.isTouch).toBe(false);
  });

  it("returns reactive refs that update", () => {
    const isMobile = ref(false);
    const result = mountWithProvide({
      [IsMobileKey as symbol]: isMobile,
      [IsDesktopKey as symbol]: ref(true),
      [IsPhoneKey as symbol]: ref(false),
      [IsTabletKey as symbol]: ref(false),
      [IsTouchKey as symbol]: false,
    });

    expect(result.isMobile.value).toBe(false);
    isMobile.value = true;
    expect(result.isMobile.value).toBe(true);
  });
});
