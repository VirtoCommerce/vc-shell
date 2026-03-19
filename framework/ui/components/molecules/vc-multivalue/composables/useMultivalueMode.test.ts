import { describe, it, expect } from "vitest";
import { mountWithSetup } from "@framework/test-helpers";
import { useMultivalueMode } from "./useMultivalueMode";

describe("useMultivalueMode", () => {
  it("isDictionaryMode is true when multivalue is true", () => {
    const { result } = mountWithSetup(() =>
      useMultivalueMode({ multivalue: () => true, type: () => "text" }),
    );
    expect(result.isDictionaryMode.value).toBe(true);
  });

  it("isDictionaryMode is false when multivalue is false", () => {
    const { result } = mountWithSetup(() =>
      useMultivalueMode({ multivalue: () => false, type: () => "text" }),
    );
    expect(result.isDictionaryMode.value).toBe(false);
  });

  it("isDictionaryMode is false when multivalue is undefined", () => {
    const { result } = mountWithSetup(() =>
      useMultivalueMode({ multivalue: () => undefined, type: () => "text" }),
    );
    expect(result.isDictionaryMode.value).toBe(false);
  });

  it("htmlInputType returns 'text' for text type", () => {
    const { result } = mountWithSetup(() =>
      useMultivalueMode({ multivalue: () => false, type: () => "text" }),
    );
    expect(result.htmlInputType.value).toBe("text");
  });

  it("htmlInputType returns 'number' for number type", () => {
    const { result } = mountWithSetup(() =>
      useMultivalueMode({ multivalue: () => false, type: () => "number" }),
    );
    expect(result.htmlInputType.value).toBe("number");
  });

  it("htmlInputType returns 'number' for integer type", () => {
    const { result } = mountWithSetup(() =>
      useMultivalueMode({ multivalue: () => false, type: () => "integer" }),
    );
    expect(result.htmlInputType.value).toBe("number");
  });

  it("htmlInputType returns 'text' for color type", () => {
    const { result } = mountWithSetup(() =>
      useMultivalueMode({ multivalue: () => false, type: () => "color" }),
    );
    expect(result.htmlInputType.value).toBe("text");
  });
});
