import { describe, expect, it } from "vitest";
import {
  FrameworkError, ValidationError, ServiceError, InjectionError,
  RegistrationError, BladeError, ModuleLoadError, isFrameworkError, wrapError,
} from "./errorTypes";

describe("FrameworkError", () => {
  it("creates with message, code, context", () => {
    const err = new FrameworkError("fail", "CODE", { k: "v" });
    expect(err.message).toBe("fail");
    expect(err.code).toBe("CODE");
    expect(err.context).toEqual({ k: "v" });
    expect(err.name).toBe("FrameworkError");
  });

  it("serializes to JSON", () => {
    const json = new FrameworkError("m", "C", { a: 1 }).toJSON();
    expect(json.code).toBe("C");
    expect(json.message).toBe("m");
  });
});

describe("subclasses", () => {
  it("ValidationError", () => {
    const e = new ValidationError("bad");
    expect(e.code).toBe("VALIDATION_ERROR");
    expect(e).toBeInstanceOf(FrameworkError);
  });

  it("ServiceError", () => {
    expect(new ServiceError("x").code).toBe("SERVICE_ERROR");
  });

  it("InjectionError includes service name", () => {
    const e = new InjectionError("Svc");
    expect(e.message).toContain("Svc");
    expect(e.code).toBe("INJECTION_ERROR");
  });

  it("RegistrationError includes component + reason", () => {
    const e = new RegistrationError("Cmp", "dup");
    expect(e.message).toContain("Cmp");
    expect(e.message).toContain("dup");
  });

  it("BladeError includes bladeId", () => {
    expect(new BladeError("x", "b1").context?.bladeId).toBe("b1");
  });

  it("ModuleLoadError includes moduleId", () => {
    const e = new ModuleLoadError("mod", "timeout");
    expect(e.message).toContain("mod");
  });
});

describe("isFrameworkError", () => {
  it("true for FrameworkError", () => expect(isFrameworkError(new FrameworkError("x", "C"))).toBe(true));
  it("true for subclass", () => expect(isFrameworkError(new ValidationError("x"))).toBe(true));
  it("false for Error", () => expect(isFrameworkError(new Error())).toBe(false));
  it("false for null", () => expect(isFrameworkError(null)).toBe(false));
});

describe("wrapError", () => {
  it("returns FrameworkError as-is", () => {
    const e = new FrameworkError("x", "C");
    expect(wrapError(e)).toBe(e);
  });

  it("wraps Error", () => {
    const w = wrapError(new Error("plain"), "CUSTOM");
    expect(w.code).toBe("CUSTOM");
    expect(w.message).toBe("plain");
  });

  it("wraps string", () => {
    expect(wrapError("oops").code).toBe("UNKNOWN_ERROR");
  });
});
