import {
  useDynamicProperties,
  IBaseProperty,
  IBasePropertyValue,
  IBasePropertyDictionaryItem,
  IBasePropertyDictionaryItemSearchCriteria,
} from "./index";

// Simple constructors for test
class TestPropertyValue implements IBasePropertyValue {
  propertyName?: string | null;
  propertyId?: string | null;
  languageCode?: string | null;
  alias?: string | null;
  valueType?: string | null;
  value?: any;
  valueId?: string | null;
  isInherited?: boolean;
  unitOfMeasureId?: string | null;
  colorCode?: string | null;

  constructor(data?: Partial<IBasePropertyValue>) {
    Object.assign(this, data);
  }
}

class TestDictionaryItem implements IBasePropertyDictionaryItem {
  id?: string | null;
  propertyId?: string | null;
  alias?: string | null;
  localizedValues?: { languageCode?: string | null; value?: string | null }[] | null;
  value?: string;
  colorCode?: string | null;

  constructor(data?: Partial<IBasePropertyDictionaryItem>) {
    Object.assign(this, data);
  }
}

type TestProperty = IBaseProperty<TestPropertyValue>;

function createComposable(
  searchFn = vi.fn().mockResolvedValue([]),
  measureFn?: (measureId: string, locale?: string) => Promise<any>,
) {
  return useDynamicProperties<
    TestProperty,
    TestPropertyValue,
    TestDictionaryItem,
    IBasePropertyDictionaryItemSearchCriteria,
    any
  >(searchFn, TestPropertyValue, TestDictionaryItem, measureFn);
}

describe("useDynamicProperties", () => {
  describe("getPropertyValue", () => {
    it("returns empty string for property with no values", () => {
      const { getPropertyValue } = createComposable();
      const prop: TestProperty = { id: "1", name: "test", values: [] };
      expect(getPropertyValue(prop, "en")).toBe("");
    });

    it("returns false for Boolean property with no values", () => {
      const { getPropertyValue } = createComposable();
      const prop: TestProperty = { id: "1", name: "test", values: [], valueType: "Boolean" };
      expect(getPropertyValue(prop, "en")).toBe(false);
    });

    it("returns first value for single-language property", () => {
      const { getPropertyValue } = createComposable();
      const prop: TestProperty = {
        id: "1",
        name: "test",
        values: [new TestPropertyValue({ value: "hello" })],
      };
      expect(getPropertyValue(prop, "en")).toBe("hello");
    });

    it("returns valueId for dictionary property", () => {
      const { getPropertyValue } = createComposable();
      const prop: TestProperty = {
        id: "1",
        name: "test",
        dictionary: true,
        values: [new TestPropertyValue({ valueId: "dict-1", value: "Label" })],
      };
      expect(getPropertyValue(prop, "en")).toBe("dict-1");
    });

    it("returns values array for multivalue property", () => {
      const { getPropertyValue } = createComposable();
      const val1 = new TestPropertyValue({ value: "a" });
      const val2 = new TestPropertyValue({ value: "b" });
      const prop: TestProperty = {
        id: "1",
        name: "test",
        multivalue: true,
        values: [val1, val2],
      };
      const result = getPropertyValue(prop, "en");
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it("returns locale-specific value for multilanguage property", () => {
      const { getPropertyValue } = createComposable();
      const prop: TestProperty = {
        id: "1",
        name: "test",
        multilanguage: true,
        values: [
          new TestPropertyValue({ value: "english", languageCode: "en" }),
          new TestPropertyValue({ value: "french", languageCode: "fr" }),
        ],
      };
      expect(getPropertyValue(prop, "fr")).toBe("french");
    });

    it("returns false for multilanguage Boolean with no matching locale", () => {
      const { getPropertyValue } = createComposable();
      const prop: TestProperty = {
        id: "1",
        name: "test",
        multilanguage: true,
        valueType: "Boolean",
        values: [],
      };
      expect(getPropertyValue(prop, "en")).toBe(false);
    });
  });

  describe("setPropertyValue", () => {
    it("sets a simple string value", () => {
      const { setPropertyValue } = createComposable();
      const prop: TestProperty = { id: "1", name: "test", values: [] };
      setPropertyValue({ property: prop, value: "new value" });
      expect(prop.values).toHaveLength(1);
      expect(prop.values![0].value).toBe("new value");
    });

    it("updates existing value in place", () => {
      const { setPropertyValue } = createComposable();
      const existing = new TestPropertyValue({ value: "old" });
      const prop: TestProperty = { id: "1", name: "test", values: [existing] };
      setPropertyValue({ property: prop, value: "updated" });
      expect(prop.values![0].value).toBe("updated");
    });

    it("sets boolean value", () => {
      const { setPropertyValue } = createComposable();
      const prop: TestProperty = { id: "1", name: "test", valueType: "Boolean", values: [] };
      setPropertyValue({ property: prop, value: true as any });
      expect(prop.values).toHaveLength(1);
      expect(prop.values![0].value).toBe(true);
    });

    it("sets measure property value with unit", () => {
      const { setPropertyValue } = createComposable();
      const prop: TestProperty = { id: "1", name: "weight", valueType: "Measure", values: [] };
      setPropertyValue({ property: prop, value: "42", unitOfMeasureId: "kg" });
      expect(prop.values).toHaveLength(1);
      expect(prop.values![0].value).toBe("42");
      expect(prop.values![0].unitOfMeasureId).toBe("kg");
    });

    it("sets color property value with colorCode", () => {
      const { setPropertyValue } = createComposable();
      const prop: TestProperty = { id: "1", name: "color", valueType: "Color", values: [] };
      setPropertyValue({ property: prop, value: "Red", colorCode: "#FF0000" });
      expect(prop.values).toHaveLength(1);
      expect(prop.values![0].value).toBe("Red");
      expect(prop.values![0].colorCode).toBe("#FF0000");
    });

    it("sets dictionary value for single-language property", () => {
      const { setPropertyValue } = createComposable();
      const prop: TestProperty = { id: "1", name: "test", dictionary: true, values: [] };
      const dictionary = [new TestDictionaryItem({ id: "d1", alias: "Option1", propertyId: "1" })];
      setPropertyValue({ property: prop, value: "d1", dictionary });
      expect(prop.values).toHaveLength(1);
      expect(prop.values![0].valueId).toBe("d1");
    });

    it("clears values when empty value is set and original had a value", () => {
      const { setPropertyValue } = createComposable();
      const prop: TestProperty = {
        id: "1",
        name: "test",
        values: [new TestPropertyValue({ value: "existing" })],
      };
      const initialProp: TestProperty = {
        id: "1",
        name: "test",
        values: [new TestPropertyValue({ value: "existing" })],
      };
      setPropertyValue({ property: prop, value: "", initialProp });
      expect(prop.values).toHaveLength(0);
    });

    it("sets multivalue array", () => {
      const { setPropertyValue } = createComposable();
      const prop: TestProperty = { id: "1", name: "test", multivalue: true, values: [] };
      const vals = [
        new TestPropertyValue({ value: "a" }),
        new TestPropertyValue({ value: "b" }),
      ];
      setPropertyValue({ property: prop, value: vals });
      expect(prop.values).toHaveLength(2);
    });

    it("sets multilanguage value for specific locale", () => {
      const { setPropertyValue } = createComposable();
      const existing = new TestPropertyValue({ value: "hello", languageCode: "en" });
      const prop: TestProperty = { id: "1", name: "test", multilanguage: true, values: [existing] };
      setPropertyValue({ property: prop, value: "bonjour", locale: "fr" });
      // Should have both en and fr values
      expect(prop.values!.some((v) => v.languageCode === "fr" && v.value === "bonjour")).toBe(true);
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
        expect.objectContaining({
          propertyIds: ["prop-1"],
          keyword: "keyword",
          skip: 0,
        }),
      );
    });

    it("localizes dictionary items when locale is provided", async () => {
      const items = [
        new TestDictionaryItem({
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
        new TestDictionaryItem({
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
      const result = await loadMeasurements("m1", "en");
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
