import { describe, it, expect } from "vitest";
import { resolveSafeRedirectPath, formatSignInError, validatePasswordChange } from "./utils";

describe("resolveSafeRedirectPath", () => {
  it("returns '/' for null", () => {
    expect(resolveSafeRedirectPath(null)).toBe("/");
  });

  it("returns '/' for empty string", () => {
    expect(resolveSafeRedirectPath("")).toBe("/");
  });

  it("returns '/' for whitespace-only string", () => {
    expect(resolveSafeRedirectPath("  ")).toBe("/");
  });

  it("returns valid internal path as-is", () => {
    expect(resolveSafeRedirectPath("/orders/123")).toBe("/orders/123");
  });

  it("preserves query parameters on valid paths", () => {
    expect(resolveSafeRedirectPath("/orders/123?tab=details")).toBe("/orders/123?tab=details");
  });

  it("rejects absolute URL (https)", () => {
    expect(resolveSafeRedirectPath("https://evil.example/phishing")).toBe("/");
  });

  it("rejects protocol-relative URL (//)", () => {
    expect(resolveSafeRedirectPath("//evil.example")).toBe("/");
  });

  it("rejects absolute URL (http)", () => {
    expect(resolveSafeRedirectPath("http://evil.example")).toBe("/");
  });

  it("trims whitespace from valid path", () => {
    expect(resolveSafeRedirectPath(" /orders/123 ")).toBe("/orders/123");
  });
});

describe("formatSignInError", () => {
  // Fake translate function: echoes the key and interpolation params so the
  // tests assert key selection + params, not English wording.
  const t = (key: string, named?: Record<string, unknown>) => (named ? `${key}:${JSON.stringify(named)}` : key);

  it("returns invalid-credentials key for 401 status", () => {
    expect(formatSignInError({ status: 401 }, t)).toBe("LOGIN.ERRORS.INVALID_CREDENTIALS");
  });

  it("returns auth-with-code key and passes the status code for non-401 status", () => {
    expect(formatSignInError({ status: 500 }, t)).toBe('LOGIN.ERRORS.AUTH_WITH_CODE:{"code":500}');
  });

  it("returns auth-generic key and passes the error detail when no status is present", () => {
    expect(formatSignInError({ error: "Account locked" }, t)).toBe(
      'LOGIN.ERRORS.AUTH_GENERIC:{"detail":"Account locked"}',
    );
  });

  it("returns invalid-credentials key for empty result", () => {
    expect(formatSignInError({}, t)).toBe("LOGIN.ERRORS.INVALID_CREDENTIALS");
  });

  it("prioritizes status over error text (401 wins)", () => {
    expect(formatSignInError({ status: 401, error: "wrong" }, t)).toBe("LOGIN.ERRORS.INVALID_CREDENTIALS");
  });
});

describe("validatePasswordChange", () => {
  it("returns no errors when passwords match and differ from current", () => {
    expect(
      validatePasswordChange({
        password: "NewPass123!",
        confirmPassword: "NewPass123!",
        currentPassword: "OldPass456!",
      }),
    ).toEqual([]);
  });

  it("returns Repeat-password error when confirmPassword differs from password", () => {
    expect(
      validatePasswordChange({
        password: "NewPass123!",
        confirmPassword: "Mismatch999!",
        currentPassword: "OldPass456!",
      }),
    ).toEqual([{ code: "Repeat-password" }]);
  });

  it("returns Equal-passwords error when all three fields are identical", () => {
    expect(
      validatePasswordChange({
        password: "SamePass!",
        confirmPassword: "SamePass!",
        currentPassword: "SamePass!",
      }),
    ).toEqual([{ code: "Equal-passwords" }]);
  });

  it("returns both errors when confirmPassword differs and both equal current", () => {
    expect(
      validatePasswordChange({
        password: "OldPass!",
        confirmPassword: "Different!",
        currentPassword: "OldPass!",
      }),
    ).toEqual([{ code: "Repeat-password" }]);
  });

  it("returns Equal-passwords error when all fields are empty strings", () => {
    expect(
      validatePasswordChange({
        password: "",
        confirmPassword: "",
        currentPassword: "",
      }),
    ).toEqual([{ code: "Equal-passwords" }]);
  });
});
