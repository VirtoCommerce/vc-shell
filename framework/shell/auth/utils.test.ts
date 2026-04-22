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
  it("returns incorrect credentials message for 401 status", () => {
    expect(formatSignInError({ status: 401 })).toBe("The login or password is incorrect.");
  });

  it("returns generic auth error with status code for non-401 status", () => {
    expect(formatSignInError({ status: 500 })).toBe("Authentication error (code: 500).");
  });

  it("includes error text when no status is present", () => {
    expect(formatSignInError({ error: "Account locked" })).toBe("Authentication error: Account locked");
  });

  it("returns default incorrect credentials message for empty result", () => {
    expect(formatSignInError({})).toBe("The login or password is incorrect.");
  });

  it("prioritizes status over error text (401 wins)", () => {
    expect(formatSignInError({ status: 401, error: "wrong" })).toBe("The login or password is incorrect.");
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
