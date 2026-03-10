import { describe, it, expect, vi, beforeEach } from "vitest";
import { _warnStringKey, _warnedStringKeys } from "./index";

describe("warnStringKey()", () => {
  beforeEach(() => {
    // Reset warn-once set between tests
    _warnedStringKeys.clear();
    vi.restoreAllMocks();
  });

  it("logs a [vc-shell] deprecation warning containing the string key name", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    _warnStringKey("isMobile", "IsMobileKey");

    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("[vc-shell]"));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('inject("isMobile")'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("deprecated"));
  });

  it("only logs once when called multiple times with the same key (warn-once semantics)", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    _warnStringKey("isMobile", "IsMobileKey");
    _warnStringKey("isMobile", "IsMobileKey");
    _warnStringKey("isMobile", "IsMobileKey");

    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it("logs a separate warning for each distinct key", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    _warnStringKey("isMobile", "IsMobileKey");
    _warnStringKey("pages", "a typed injection key");

    expect(warnSpy).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenNthCalledWith(1, expect.stringContaining('inject("isMobile")'));
    expect(warnSpy).toHaveBeenNthCalledWith(2, expect.stringContaining('inject("pages")'));
  });
});
