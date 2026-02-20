import { describe, it, expect, vi } from "vitest";
import { useBreadcrumbs } from "@core/composables/useBreadcrumbs";

describe("useBreadcrumbs", () => {
  it("starts with empty breadcrumbs", () => {
    const { breadcrumbs } = useBreadcrumbs();
    expect(breadcrumbs.value).toEqual([]);
  });

  it("push adds a breadcrumb", () => {
    const { breadcrumbs, push } = useBreadcrumbs();
    push({ id: "home", title: "Home" });
    expect(breadcrumbs.value).toHaveLength(1);
    expect(breadcrumbs.value[0].id).toBe("home");
  });

  it("push multiple breadcrumbs builds a trail", () => {
    const { breadcrumbs, push } = useBreadcrumbs();
    push({ id: "home", title: "Home" });
    push({ id: "products", title: "Products" });
    push({ id: "electronics", title: "Electronics" });
    expect(breadcrumbs.value).toHaveLength(3);
    expect(breadcrumbs.value.map((b) => b.id)).toEqual(["home", "products", "electronics"]);
  });

  it("push deduplicates by id — updates existing instead of adding duplicate", () => {
    const { breadcrumbs, push } = useBreadcrumbs();
    push({ id: "home", title: "Home" });
    push({ id: "products", title: "Products" });
    push({ id: "home", title: "Home Updated" });
    // Should NOT create a duplicate — update in place
    expect(breadcrumbs.value).toHaveLength(2);
    expect(breadcrumbs.value[0].id).toBe("home");
    expect(breadcrumbs.value[1].id).toBe("products");
  });

  it("remove filters out breadcrumbs by ids", () => {
    const { breadcrumbs, push, remove } = useBreadcrumbs();
    push({ id: "home", title: "Home" });
    push({ id: "products", title: "Products" });
    push({ id: "electronics", title: "Electronics" });
    remove(["products"]);
    expect(breadcrumbs.value.map((b) => b.id)).toEqual(["home", "electronics"]);
  });

  it("remove all clears breadcrumbs", () => {
    const { breadcrumbs, push, remove } = useBreadcrumbs();
    push({ id: "home", title: "Home" });
    push({ id: "products", title: "Products" });
    remove(["home", "products"]);
    expect(breadcrumbs.value).toHaveLength(0);
  });

  it("remove non-existent id is a no-op", () => {
    const { breadcrumbs, push, remove } = useBreadcrumbs();
    push({ id: "home", title: "Home" });
    remove(["nonexistent"]);
    expect(breadcrumbs.value).toHaveLength(1);
  });

  it("clickHandler trims trail after clicked breadcrumb", async () => {
    const handler = vi.fn().mockResolvedValue(true);
    const { breadcrumbs, push } = useBreadcrumbs();
    push({ id: "home", title: "Home", clickHandler: handler });
    push({ id: "products", title: "Products" });
    push({ id: "electronics", title: "Electronics" });

    expect(breadcrumbs.value).toHaveLength(3);

    // Click on "home" — should trim everything after it
    await breadcrumbs.value[0].clickHandler!("home");

    expect(handler).toHaveBeenCalledWith("home");
    expect(breadcrumbs.value.map((b) => b.id)).toEqual(["home"]);
  });

  it("clickHandler returning void (undefined) trims trail", async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const { breadcrumbs, push } = useBreadcrumbs();
    push({ id: "home", title: "Home", clickHandler: handler });
    push({ id: "products", title: "Products" });

    await breadcrumbs.value[0].clickHandler!("home");

    expect(breadcrumbs.value.map((b) => b.id)).toEqual(["home"]);
  });

  it("clickHandler returning false prevents trail trimming", async () => {
    const handler = vi.fn().mockResolvedValue(false);
    const { breadcrumbs, push } = useBreadcrumbs();
    push({ id: "home", title: "Home", clickHandler: handler });
    push({ id: "products", title: "Products" });

    await breadcrumbs.value[0].clickHandler!("home");

    // Trail should NOT be trimmed
    expect(breadcrumbs.value).toHaveLength(2);
  });

  it("clickHandler error is caught and trail is not trimmed", async () => {
    const handler = vi.fn().mockRejectedValue(new Error("fail"));
    const { breadcrumbs, push } = useBreadcrumbs();
    push({ id: "home", title: "Home", clickHandler: handler });
    push({ id: "products", title: "Products" });

    // Should not throw
    await breadcrumbs.value[0].clickHandler!("home");

    // Trail should NOT be trimmed on error
    expect(breadcrumbs.value).toHaveLength(2);
  });

  it("breadcrumb without clickHandler has no wrapper", () => {
    const { breadcrumbs, push } = useBreadcrumbs();
    push({ id: "home", title: "Home" });
    expect(breadcrumbs.value[0].clickHandler).toBeUndefined();
  });

  it("clicking middle breadcrumb trims only items after it", async () => {
    const handler = vi.fn().mockResolvedValue(true);
    const { breadcrumbs, push } = useBreadcrumbs();
    push({ id: "home", title: "Home" });
    push({ id: "products", title: "Products", clickHandler: handler });
    push({ id: "electronics", title: "Electronics" });
    push({ id: "laptops", title: "Laptops" });

    await breadcrumbs.value[1].clickHandler!("products");

    expect(breadcrumbs.value.map((b) => b.id)).toEqual(["home", "products"]);
  });

  it("each useBreadcrumbs call creates an independent instance", () => {
    const instance1 = useBreadcrumbs();
    const instance2 = useBreadcrumbs();
    instance1.push({ id: "a", title: "A" });
    expect(instance1.breadcrumbs.value).toHaveLength(1);
    expect(instance2.breadcrumbs.value).toHaveLength(0);
  });
});
