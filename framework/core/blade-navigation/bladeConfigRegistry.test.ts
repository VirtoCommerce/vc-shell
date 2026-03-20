import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  __registerBladeConfig,
  getBladeConfig,
  getAllBladeConfigs,
  __clearBladeConfigRegistry,
} from "./bladeConfigRegistry";
import type { BladeConfig } from "./types";

const sampleConfig: BladeConfig = {
  url: "/orders",
  isWorkspace: true,
  permissions: ["seller:orders:view"],
  menuItem: {
    title: "ORDERS.MENU.TITLE",
    icon: "lucide-shopping-cart",
    priority: 1,
  },
};

describe("bladeConfigRegistry", () => {
  beforeEach(() => {
    __clearBladeConfigRegistry();
  });

  it("registers and retrieves a blade config", () => {
    __registerBladeConfig("Orders", sampleConfig);
    expect(getBladeConfig("Orders")).toEqual(sampleConfig);
  });

  it("returns undefined for unregistered blade", () => {
    expect(getBladeConfig("Unknown")).toBeUndefined();
  });

  it("getAllBladeConfigs returns all registered configs", () => {
    __registerBladeConfig("Orders", sampleConfig);
    __registerBladeConfig("Products", { url: "/products" });

    const all = getAllBladeConfigs();
    expect(all.size).toBe(2);
    expect(all.get("Orders")).toEqual(sampleConfig);
  });

  it("warns on duplicate registration", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    __registerBladeConfig("Orders", sampleConfig);
    __registerBladeConfig("Orders", { url: "/orders-v2" });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Duplicate blade name"),
    );
    expect(getBladeConfig("Orders")?.url).toBe("/orders-v2");

    warnSpy.mockRestore();
  });

  it("clear removes all entries", () => {
    __registerBladeConfig("Orders", sampleConfig);
    __clearBladeConfigRegistry();
    expect(getBladeConfig("Orders")).toBeUndefined();
    expect(getAllBladeConfigs().size).toBe(0);
  });
});
