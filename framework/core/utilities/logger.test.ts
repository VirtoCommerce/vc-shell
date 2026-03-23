import { describe, expect, it, vi, beforeEach } from "vitest";
import { createLogger, logger, loggers } from "./logger";

describe("createLogger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates logger with all methods", () => {
    const log = createLogger("test");
    expect(typeof log.debug).toBe("function");
    expect(typeof log.info).toBe("function");
    expect(typeof log.warn).toBe("function");
    expect(typeof log.error).toBe("function");
    expect(typeof log.child).toBe("function");
  });

  it("logs error with context prefix", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const log = createLogger("ctx");
    log.setLevel("error");
    log.error("test");
    expect(spy).toHaveBeenCalledWith("[@vc-shell/framework#ctx]", "test");
  });

  it("respects log level filtering", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const log = createLogger();
    log.setLevel("error");
    log.debug("hidden");
    expect(spy).not.toHaveBeenCalled();
  });

  it("can be disabled", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const log = createLogger();
    log.setLevel("error");
    log.setEnabled(false);
    log.error("disabled");
    expect(spy).not.toHaveBeenCalled();
  });

  it("creates child with nested context", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const child = createLogger("parent").child("child");
    child.setLevel("error");
    child.error("msg");
    expect(spy).toHaveBeenCalledWith("[@vc-shell/framework#parent:child]", "msg");
  });
});

describe("default exports", () => {
  it("exports default logger", () => {
    expect(typeof logger.error).toBe("function");
  });
  it("exports named loggers", () => {
    expect(loggers.core).toBeDefined();
    expect(loggers.ui).toBeDefined();
    expect(loggers.shared).toBeDefined();
  });
});
