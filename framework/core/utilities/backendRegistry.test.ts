import { describe, it, expect, vi } from "vitest";
import { createBackendRegistry, createKeyedBackendRegistry } from "./backendRegistry";

describe("createBackendRegistry", () => {
  it("returns null before anything is registered", () => {
    const reg = createBackendRegistry<{ x: number }>();
    expect(reg.get()).toBeNull();
  });

  it("register then get returns the implementation", () => {
    const reg = createBackendRegistry<{ x: number }>();
    const impl = { x: 1 };
    reg.register(impl);
    expect(reg.get()).toBe(impl);
  });

  it("register replaces the previous implementation", () => {
    const reg = createBackendRegistry<{ x: number }>();
    reg.register({ x: 1 });
    const second = { x: 2 };
    reg.register(second);
    expect(reg.get()).toBe(second);
  });

  it("reset clears the implementation back to null", () => {
    const reg = createBackendRegistry<{ x: number }>();
    reg.register({ x: 1 });
    reg.reset();
    expect(reg.get()).toBeNull();
  });

  it("fires onChange on register and reset", () => {
    const onChange = vi.fn();
    const reg = createBackendRegistry<{ x: number }>(onChange);
    const impl = { x: 1 };

    reg.register(impl);
    expect(onChange).toHaveBeenNthCalledWith(1, impl);

    reg.reset();
    expect(onChange).toHaveBeenNthCalledWith(2, null);
  });
});

describe("createKeyedBackendRegistry", () => {
  it("returns undefined for an unregistered key", () => {
    const reg = createKeyedBackendRegistry<string, number>();
    expect(reg.get("missing")).toBeUndefined();
  });

  it("register then get by key", () => {
    const reg = createKeyedBackendRegistry<string, number>();
    reg.register("a", 1);
    reg.register("b", 2);
    expect(reg.get("a")).toBe(1);
    expect(reg.get("b")).toBe(2);
  });

  it("register replaces the value for an existing key", () => {
    const reg = createKeyedBackendRegistry<string, number>();
    reg.register("a", 1);
    reg.register("a", 9);
    expect(reg.get("a")).toBe(9);
  });

  it("reset clears all keys", () => {
    const reg = createKeyedBackendRegistry<string, number>();
    reg.register("a", 1);
    reg.register("b", 2);
    reg.reset();
    expect(reg.get("a")).toBeUndefined();
    expect(reg.get("b")).toBeUndefined();
  });
});
