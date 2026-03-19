import { describe, it, expect } from "vitest";
import { createAppBarMobileButtonsService } from "./app-bar-mobile-buttons-service";
import { ref } from "vue";

describe("createAppBarMobileButtonsService", () => {
  it("registers and retrieves buttons", () => {
    const svc = createAppBarMobileButtonsService();
    svc.register({ id: "btn1", icon: "menu" });
    expect(svc.registeredButtons.value).toHaveLength(1);
    expect(svc.getButton("btn1")?.id).toBe("btn1");
  });

  it("replaces existing button on re-register", () => {
    const svc = createAppBarMobileButtonsService();
    svc.register({ id: "btn1", icon: "a" });
    svc.register({ id: "btn1", icon: "b" });
    expect(svc.registeredButtons.value).toHaveLength(1);
  });

  it("unregisters buttons", () => {
    const svc = createAppBarMobileButtonsService();
    svc.register({ id: "btn1" });
    svc.unregister("btn1");
    expect(svc.registeredButtons.value).toHaveLength(0);
  });

  it("filters invisible buttons in getButtons", () => {
    const svc = createAppBarMobileButtonsService();
    svc.register({ id: "vis", isVisible: true });
    svc.register({ id: "invis", isVisible: false });
    expect(svc.getButtons.value).toHaveLength(1);
    expect(svc.getButtons.value[0].id).toBe("vis");
  });

  it("sorts getButtons by order", () => {
    const svc = createAppBarMobileButtonsService();
    svc.register({ id: "b", order: 2 });
    svc.register({ id: "a", order: 1 });
    expect(svc.getButtons.value[0].id).toBe("a");
  });

  it("supports reactive isVisible", () => {
    const svc = createAppBarMobileButtonsService();
    const visible = ref(true);
    svc.register({ id: "reactive", isVisible: visible });
    expect(svc.getButtons.value).toHaveLength(1);
    visible.value = false;
    expect(svc.getButtons.value).toHaveLength(0);
  });
});
