import { computed } from "vue";
import { mountWithSetup } from "@framework/test-helpers";
import { useBladeError } from "./useBladeError";

describe("useBladeError", () => {
  it("returns the expected API shape", () => {
    const blade = computed(() => ({ error: undefined }) as any);
    const { result } = mountWithSetup(() => useBladeError(blade));

    expect(result).toHaveProperty("hasError");
    expect(result).toHaveProperty("shortErrorMessage");
    expect(result).toHaveProperty("errorDetails");
    expect(result).toHaveProperty("copyError");
  });

  it("hasError is false when no error", () => {
    const blade = computed(() => ({ error: undefined }) as any);
    const { result } = mountWithSetup(() => useBladeError(blade));

    expect(result.hasError.value).toBe(false);
    expect(result.shortErrorMessage.value).toBe("");
    expect(result.errorDetails.value).toBe("");
  });

  it("hasError is true when error is present", () => {
    const blade = computed(() => ({ error: new Error("boom") }) as any);
    const { result } = mountWithSetup(() => useBladeError(blade));

    expect(result.hasError.value).toBe(true);
  });

  it("shortErrorMessage returns Error.message", () => {
    const blade = computed(() => ({ error: new Error("something broke") }) as any);
    const { result } = mountWithSetup(() => useBladeError(blade));

    expect(result.shortErrorMessage.value).toBe("something broke");
  });

  it("shortErrorMessage stringifies non-Error values", () => {
    const blade = computed(() => ({ error: "string error" }) as any);
    const { result } = mountWithSetup(() => useBladeError(blade));

    expect(result.shortErrorMessage.value).toBe("string error");
  });

  it("errorDetails returns stack for Error", () => {
    const err = new Error("test");
    err.stack = "Error: test\n    at Something";
    const blade = computed(() => ({ error: err }) as any);
    const { result } = mountWithSetup(() => useBladeError(blade));

    expect(result.errorDetails.value).toContain("Error: test");
  });

  it("errorDetails returns .details if present", () => {
    const err = Object.assign(new Error("test"), { details: "Detailed info" });
    const blade = computed(() => ({ error: err }) as any);
    const { result } = mountWithSetup(() => useBladeError(blade));

    expect(result.errorDetails.value).toBe("Detailed info");
  });

  it("errorDetails stringifies non-Error values", () => {
    const blade = computed(() => ({ error: 42 }) as any);
    const { result } = mountWithSetup(() => useBladeError(blade));

    expect(result.errorDetails.value).toBe("42");
  });

  it("copyError copies text to clipboard and returns true", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText: writeTextMock } });

    const blade = computed(() => ({ error: new Error("copy me") }) as any);
    const { result } = mountWithSetup(() => useBladeError(blade));

    const success = await result.copyError();
    expect(success).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining("copy me"));
  });

  it("copyError returns false when clipboard fails", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });

    const blade = computed(() => ({ error: new Error("err") }) as any);
    const { result } = mountWithSetup(() => useBladeError(blade));

    const success = await result.copyError();
    expect(success).toBe(false);
  });
});
