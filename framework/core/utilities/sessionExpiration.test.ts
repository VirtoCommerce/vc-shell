import { describe, it, expect, beforeEach } from "vitest";
import { markSessionExpired, isSessionExpired, resetSessionExpired } from "./sessionExpiration";

describe("sessionExpiration", () => {
  beforeEach(() => {
    resetSessionExpired();
  });

  it("is not expired by default", () => {
    expect(isSessionExpired()).toBe(false);
  });

  it("becomes expired after markSessionExpired", () => {
    markSessionExpired();
    expect(isSessionExpired()).toBe(true);
  });

  it("mark is idempotent", () => {
    markSessionExpired();
    markSessionExpired();
    expect(isSessionExpired()).toBe(true);
  });

  it("resets back to not expired", () => {
    markSessionExpired();
    resetSessionExpired();
    expect(isSessionExpired()).toBe(false);
  });
});
