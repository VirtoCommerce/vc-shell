import { useFunctions } from "./index";

describe("useFunctions", () => {
  it("returns debounce, delay, once, and throttle", () => {
    const fns = useFunctions();
    expect(fns.debounce).toBeTypeOf("function");
    expect(fns.delay).toBeTypeOf("function");
    expect(fns.once).toBeTypeOf("function");
    expect(fns.throttle).toBeTypeOf("function");
  });

  describe("debounce", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("delays function execution", () => {
      const { debounce } = useFunctions();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("resets timer on subsequent calls", () => {
      const { debounce } = useFunctions();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("passes arguments to the debounced function", () => {
      const { debounce } = useFunctions();
      const fn = vi.fn();
      const debounced = debounce(fn, 50);

      debounced("arg1", "arg2");
      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledWith("arg1", "arg2");
    });
  });

  describe("delay", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("calls function after specified delay", () => {
      const { delay } = useFunctions();
      const fn = vi.fn();

      delay(fn, 200);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(200);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("calls function immediately when delay is 0", () => {
      const { delay } = useFunctions();
      const fn = vi.fn();

      delay(fn, 0);
      vi.advanceTimersByTime(0);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("defaults to 0 delay", () => {
      const { delay } = useFunctions();
      const fn = vi.fn();

      delay(fn);
      vi.advanceTimersByTime(0);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe("once", () => {
    it("calls function only once", () => {
      const { once } = useFunctions();
      const fn = vi.fn().mockReturnValue("result");
      const onceFn = once(fn);

      onceFn();
      onceFn();
      onceFn();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("returns the same result on subsequent calls", () => {
      const { once } = useFunctions();
      const fn = vi.fn().mockReturnValue(42);
      const onceFn = once(fn);

      expect(onceFn()).toBe(42);
      expect(onceFn()).toBe(42);
    });

    it("passes arguments only on first call", () => {
      const { once } = useFunctions();
      const fn = vi.fn((...args: unknown[]) => args[0]);
      const onceFn = once(fn);

      expect(onceFn("first")).toBe("first");
      expect(onceFn("second")).toBe("first");
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe("throttle", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("executes function immediately on first call", () => {
      const { throttle } = useFunctions();
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("blocks subsequent calls within delay period", () => {
      const { throttle } = useFunctions();
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("allows calls again after delay period", () => {
      const { throttle } = useFunctions();
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("passes arguments to throttled function", () => {
      const { throttle } = useFunctions();
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled("arg1");
      expect(fn).toHaveBeenCalledWith("arg1");
    });
  });
});
