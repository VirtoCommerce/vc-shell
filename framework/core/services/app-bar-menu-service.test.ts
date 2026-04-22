import { describe, it, expect } from "vitest";
import { createAppBarWidgetService } from "@core/services/app-bar-menu-service";

describe("createAppBarWidgetService", () => {
  it("registers and lists items", () => {
    const svc = createAppBarWidgetService();
    svc.register({ id: "notif", title: "Notifications", icon: "bell" });
    expect(svc.items.value).toHaveLength(1);
    expect(svc.items.value[0].title).toBe("Notifications");
  });

  it("unregisters items", () => {
    const svc = createAppBarWidgetService();
    svc.register({ id: "x", title: "X" });
    svc.unregister("x");
    expect(svc.items.value).toHaveLength(0);
  });

  it("sorts by order", () => {
    const svc = createAppBarWidgetService();
    svc.register({ id: "b", order: 2, title: "B" });
    svc.register({ id: "a", order: 1, title: "A" });
    expect(svc.items.value[0].id).toBe("a");
  });
});
