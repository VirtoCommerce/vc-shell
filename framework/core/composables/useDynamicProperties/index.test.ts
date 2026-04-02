import {
  useDynamicProperties,
  type IBaseProperty,
  type IBasePropertyValue,
  type IBasePropertyDictionaryItem,
} from "./index";

function createComposable(
  searchFn = vi.fn().mockResolvedValue([]),
  measureFn?: (measureId: string, locale?: string) => Promise<any>,
) {
  return useDynamicProperties({
    searchDictionary: searchFn,
    searchMeasurements: measureFn,
  });
}

function val(data?: Partial<IBasePropertyValue>): IBasePropertyValue {
  return { isInherited: false, ...data };
}

function dictItem(data?: Partial<IBasePropertyDictionaryItem>): IBasePropertyDictionaryItem {
  return { ...data };
}

describe("useDynamicProperties", () => {
  describe("getPropertyValue", () => {
    it("returns empty string for property with no values", () => {
      const { getPropertyValue } = createComposable();
      const prop: IBaseProperty = { id: "1", name: "test", values: [] };
      expect(getPropertyValue(prop, "en")).toBe("");
    });

    it("returns false for Boolean property with no values", () => {
      const { getPropertyValue } = createComposable();
      const prop: IBaseProperty = { id: "1", name: "test", values: [], valueType: "Boolean" };
      expect(getPropertyValue(prop, "en")).toBe(false);
    });

    it("returns first value for single-language property", () => {
      const { getPropertyValue } = createComposable();
      const prop: IBaseProperty = { id: "1", name: "test", values: [val({ value: "hello" })] };
      expect(getPropertyValue(prop, "en")).toBe("hello");
    });

    it("returns valueId for dictionary property", () => {
      const { getPropertyValue } = createComposable();
      const prop: IBaseProperty = {
        id: "1",
        name: "test",
        dictionary: true,
        values: [val({ valueId: "dict-1", value: "Label" })],
      };
      expect(getPropertyValue(prop, "en")).toBe("dict-1");
    });

    it("returns values array for multivalue property", () => {
      const { getPropertyValue } = createComposable();
      const prop: IBaseProperty = {
        id: "1",
        name: "test",
        multivalue: true,
        values: [val({ value: "a" }), val({ value: "b" })],
      };
      const result = getPropertyValue(prop, "en");
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it("returns locale-specific value for multilanguage property", () => {
      const { getPropertyValue } = createComposable();
      const prop: IBaseProperty = {
        id: "1",
        name: "test",
        multilanguage: true,
        values: [val({ value: "english", languageCode: "en" }), val({ value: "french", languageCode: "fr" })],
      };
      expect(getPropertyValue(prop, "fr")).toBe("french");
    });

    it("returns false for multilanguage Boolean with no matching locale", () => {
      const { getPropertyValue } = createComposable();
      const prop: IBaseProperty = { id: "1", name: "test", multilanguage: true, valueType: "Boolean", values: [] };
      expect(getPropertyValue(prop, "en")).toBe(false);
    });

    it("does NOT mutate property.values when reading (no side-effects)", () => {
      const { getPropertyValue } = createComposable();
      const prop: IBaseProperty = { id: "1", name: "test", multilanguage: true, values: [] };
      getPropertyValue(prop, "en");
      expect(prop.values).toHaveLength(0);
    });
  });

  describe("setPropertyValue", () => {
    it("sets a simple string value", () => {
      const { setPropertyValue } = createComposable();
      const prop: IBaseProperty = { id: "1", name: "test", values: [] };
      setPropertyValue({ property: prop, value: "new value" });
      expect(prop.values).toHaveLength(1);
      expect(prop.values![0].value).toBe("new value");
    });

    it("updates existing value in place", () => {
      const { setPropertyValue } = createComposable();
      const prop: IBaseProperty = { id: "1", name: "test", values: [val({ value: "old" })] };
      setPropertyValue({ property: prop, value: "updated" });
      expect(prop.values![0].value).toBe("updated");
    });

    it("sets boolean value", () => {
      const { setPropertyValue } = createComposable();
      const prop: IBaseProperty = { id: "1", name: "test", valueType: "Boolean", values: [] };
      setPropertyValue({ property: prop, value: true as any });
      expect(prop.values).toHaveLength(1);
      expect(prop.values![0].value).toBe(true);
    });

    it("sets measure property value with unit", () => {
      const { setPropertyValue } = createComposable();
      const prop: IBaseProperty = { id: "1", name: "weight", valueType: "Measure", values: [] };
      setPropertyValue({ property: prop, value: "42", unitOfMeasureId: "kg" });
      expect(prop.values).toHaveLength(1);
      expect(prop.values![0].value).toBe("42");
      expect(prop.values![0].unitOfMeasureId).toBe("kg");
    });

    it("sets color property value with colorCode", () => {
      const { setPropertyValue } = createComposable();
      const prop: IBaseProperty = { id: "1", name: "color", valueType: "Color", values: [] };
      setPropertyValue({ property: prop, value: "Red", colorCode: "#FF0000" });
      expect(prop.values).toHaveLength(1);
      expect(prop.values![0].value).toBe("Red");
      expect(prop.values![0].colorCode).toBe("#FF0000");
    });

    it("sets dictionary value for single-language property", () => {
      const { setPropertyValue } = createComposable();
      const prop: IBaseProperty = { id: "1", name: "test", dictionary: true, values: [] };
      const dictionary = [dictItem({ id: "d1", alias: "Option1", propertyId: "1" })];
      setPropertyValue({ property: prop, value: "d1", dictionary });
      expect(prop.values).toHaveLength(1);
      expect(prop.values![0].valueId).toBe("d1");
    });

    it("sets multivalue array", () => {
      const { setPropertyValue } = createComposable();
      const prop: IBaseProperty = { id: "1", name: "test", multivalue: true, values: [] };
      const vals = [val({ value: "a" }), val({ value: "b" })];
      setPropertyValue({ property: prop, value: vals });
      expect(prop.values).toHaveLength(2);
    });

    it("sets multilanguage value for specific locale", () => {
      const { setPropertyValue } = createComposable();
      const prop: IBaseProperty = {
        id: "1",
        name: "test",
        multilanguage: true,
        values: [val({ value: "hello", languageCode: "en" })],
      };
      setPropertyValue({ property: prop, value: "bonjour", locale: "fr" });
      expect(prop.values!.some((v) => v.languageCode === "fr" && v.value === "bonjour")).toBe(true);
    });
  });

  describe("reverse transformation", () => {
    it("clears values when empty string is set", () => {
      const { setPropertyValue } = createComposable();
      const prop: IBaseProperty = { id: "1", name: "test", values: [val({ value: "existing" })] };
      setPropertyValue({ property: prop, value: "" });
      expect(prop.values).toHaveLength(0);
    });

    it("clears values when undefined is set", () => {
      const { setPropertyValue } = createComposable();
      const prop: IBaseProperty = { id: "1", name: "test", values: [val({ value: "existing" })] };
      setPropertyValue({ property: prop, value: undefined as any });
      expect(prop.values).toHaveLength(0);
    });

    it("clears only current locale for multilanguage on empty", () => {
      const { setPropertyValue } = createComposable();
      const prop: IBaseProperty = {
        id: "1",
        name: "test",
        multilanguage: true,
        values: [val({ value: "english", languageCode: "en" }), val({ value: "french", languageCode: "fr" })],
      };
      setPropertyValue({ property: prop, value: "", locale: "fr" });
      expect(prop.values).toHaveLength(1);
      expect(prop.values![0].languageCode).toBe("en");
    });

    it("clears measure when empty", () => {
      const { setPropertyValue } = createComposable();
      const prop: IBaseProperty = {
        id: "1",
        name: "weight",
        valueType: "Measure",
        values: [val({ value: "42", unitOfMeasureId: "kg" })],
      };
      setPropertyValue({ property: prop, value: "" });
      expect(prop.values).toHaveLength(0);
    });

    it("full cycle: set → clear → values is empty array", () => {
      const { setPropertyValue } = createComposable();
      const prop: IBaseProperty = { id: "1", name: "test", values: [] };
      setPropertyValue({ property: prop, value: "hello" });
      expect(prop.values).toHaveLength(1);
      setPropertyValue({ property: prop, value: "" });
      expect(prop.values).toHaveLength(0);
    });
  });

  describe("loadDictionaries", () => {
    it("returns undefined for empty propertyId", async () => {
      const { loadDictionaries } = createComposable();
      const result = await loadDictionaries("");
      expect(result).toBeUndefined();
    });

    it("calls search function with correct criteria", async () => {
      const searchFn = vi.fn().mockResolvedValue([]);
      const { loadDictionaries } = createComposable(searchFn);
      await loadDictionaries("prop-1", "keyword");
      expect(searchFn).toHaveBeenCalledWith(
        expect.objectContaining({ propertyIds: ["prop-1"], keyword: "keyword", skip: 0 }),
      );
    });

    it("localizes dictionary items when locale is provided", async () => {
      const items = [
        dictItem({
          id: "d1",
          alias: "fallback",
          localizedValues: [{ languageCode: "fr", value: "French Label" }],
        }),
      ];
      const searchFn = vi.fn().mockResolvedValue(items);
      const { loadDictionaries } = createComposable(searchFn);
      const result = await loadDictionaries("prop-1", undefined, "fr");
      expect(result![0].value).toBe("French Label");
    });

    it("uses alias when no localized value matches", async () => {
      const items = [
        dictItem({
          id: "d1",
          alias: "AliasValue",
          localizedValues: [{ languageCode: "de", value: "German" }],
        }),
      ];
      const searchFn = vi.fn().mockResolvedValue(items);
      const { loadDictionaries } = createComposable(searchFn);
      const result = await loadDictionaries("prop-1", undefined, "fr");
      expect(result![0].value).toBe("AliasValue");
    });
  });

  describe("loadMeasurements", () => {
    it("returns undefined when no measureFn provided", async () => {
      const { loadMeasurements } = createComposable();
      const result = await loadMeasurements("m1");
      expect(result).toBeUndefined();
    });

    it("returns undefined for empty measureId", async () => {
      const measureFn = vi.fn().mockResolvedValue([]);
      const { loadMeasurements } = createComposable(vi.fn(), measureFn);
      const result = await loadMeasurements("");
      expect(result).toBeUndefined();
      expect(measureFn).not.toHaveBeenCalled();
    });

    it("calls measurement function when provided", async () => {
      const measurements = [{ id: "m1", code: "kg", name: "Kilogram" }];
      const measureFn = vi.fn().mockResolvedValue(measurements);
      const { loadMeasurements } = createComposable(vi.fn(), measureFn);
      const result = await loadMeasurements("m1", undefined, "en");
      expect(measureFn).toHaveBeenCalledWith("m1", "en");
      expect(result).toEqual(measurements);
    });
  });

  describe("loading state", () => {
    it("loading is a computed ref that starts as false", () => {
      const { loading } = createComposable();
      expect(loading.value).toBe(false);
    });
  });
});
