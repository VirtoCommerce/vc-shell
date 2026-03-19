import { describe, expect, it } from "vitest";
import { DisplayableError, parseError } from "./error";

describe("DisplayableError", () => {
  it("creates with message, details, and original error", () => {
    const orig = new Error("orig");
    const err = new DisplayableError("short", "detailed", orig);
    expect(err.message).toBe("short");
    expect(err.details).toBe("detailed");
    expect(err.originalError).toBe(orig);
    expect(err.name).toBe("DisplayableError");
  });

  it("is an instance of Error", () => {
    expect(new DisplayableError("m", "d", null)).toBeInstanceOf(Error);
  });
});

describe("parseError", () => {
  it("returns DisplayableError as-is", () => {
    const err = new DisplayableError("a", "b", null);
    expect(parseError(err)).toBe(err);
  });

  it("parses a standard Error", () => {
    const err = new Error("failed");
    const result = parseError(err);
    expect(result).toBeInstanceOf(DisplayableError);
    expect(result.message).toBe("failed");
  });

  it("parses Axios-style error with response", () => {
    const axiosError = Object.assign(new Error("Request failed"), {
      response: { status: 404, statusText: "Not Found", data: { message: "not found" } },
    });
    const result = parseError(axiosError);
    expect(result.message).toBe("404: Not Found");
    expect(result.details).toBe("not found");
  });

  it("parses a plain string", () => {
    const result = parseError("oops");
    expect(result.message).toBe("oops");
  });

  it("parses JSON string", () => {
    const result = parseError(JSON.stringify({ message: "from json" }));
    expect(result.message).toBe("from json");
  });

  it("parses API response with exceptionMessage", () => {
    const result = parseError({ status: 500, data: { exceptionMessage: "DB failed" } });
    expect(result.message).toContain("500");
    expect(result.details).toBe("DB failed");
  });

  it("parses API response with errors array", () => {
    const result = parseError({ status: 400, data: { errors: ["e1", "e2"] } });
    expect(result.details).toBe("e1\ne2");
  });

  it("parses API response with string data", () => {
    const result = parseError({ status: 503, statusText: "Down", data: "offline" });
    expect(result.details).toBe("offline");
  });

  it("handles null", () => {
    const result = parseError(null);
    expect(result).toBeInstanceOf(DisplayableError);
  });

  it("handles number", () => {
    const result = parseError(42);
    expect(result.details).toBe("42");
  });

  it("parses object with message property", () => {
    const result = parseError({ message: "custom" });
    expect(result.message).toBe("custom");
  });
});
