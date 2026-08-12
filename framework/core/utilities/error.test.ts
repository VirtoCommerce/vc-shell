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

  // NSwag clients throw ApiException, where `response` is the raw body as a STRING. A body that
  // is not JSON used to become the whole short message, and modules render that straight to the
  // user — so a 500 returning an HTML error page put the document in the toast (VCST-5663).
  describe("NSwag ApiException (response is a raw string body)", () => {
    const apiException = (status: number, body: string, message = "An unexpected server error occurred.") =>
      Object.assign(new Error(message), { status, response: body });

    it("keeps an HTML error page out of the short message", () => {
      const html = "<html><body><h1>500 Internal Server Error</h1></body></html>";
      const result = parseError(apiException(500, html));

      expect(result.message).toBe("500: An unexpected server error occurred.");
      expect(result.message).not.toContain("<html>");
      expect(result.details).toBe(html);
    });

    // The dedup id in useAsync is message.slice(0, 80). Two different markup bodies used to share
    // their first 80 characters and collapse into one notification; short status lines do not.
    it("gives different statuses different short messages", () => {
      const body = "<!DOCTYPE html><html><head><title>Error</title></head><body>...</body></html>";
      const a = parseError(apiException(500, body));
      const b = parseError(apiException(502, body, "Bad gateway"));

      expect(a.message.slice(0, 80)).not.toBe(b.message.slice(0, 80));
    });

    it("still uses the platform's own message when the body is JSON", () => {
      const result = parseError(apiException(400, JSON.stringify({ message: "Name is required" })));
      expect(result.message).toBe("Name is required");
    });

    it("falls back to the exception's message when the body is empty", () => {
      const result = parseError(apiException(503, ""));
      expect(result.message).toBe("503: An unexpected server error occurred.");
      expect(result.details).toBe("An unexpected server error occurred.");
    });
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
