import { describe, it, expect } from "vitest";
import { encodeQueryState, decodeQueryState } from "./serialization";

describe("encodeQueryState", () => {
  it("namespaces keys and stringifies the page", () => {
    expect(encodeQueryState("offers", { sort: "name:DESC", search: "foo", page: 2 })).toEqual({
      offers_sort: "name:DESC",
      offers_search: "foo",
      offers_page: "2",
    });
  });

  it("only emits keys present in the patch", () => {
    expect(encodeQueryState("offers", { page: 3 })).toEqual({ offers_page: "3" });
  });

  it("emits empty string for cleared values", () => {
    expect(encodeQueryState("offers", { sort: undefined, search: "", page: undefined })).toEqual({
      offers_sort: "",
      offers_search: "",
      offers_page: "",
    });
  });
});

describe("decodeQueryState", () => {
  it("reads namespaced values back", () => {
    const q = { offers_sort: "name:DESC", offers_search: "foo", offers_page: "2" };
    expect(decodeQueryState("offers", q)).toEqual({ sort: "name:DESC", search: "foo", page: 2 });
  });

  it("ignores invalid sort and non-positive / non-integer page", () => {
    expect(decodeQueryState("offers", { offers_sort: "name", offers_page: "0" })).toEqual({});
    expect(decodeQueryState("offers", { offers_page: "abc" })).toEqual({});
    expect(decodeQueryState("offers", { offers_page: "1.5" })).toEqual({});
  });

  it("ignores empty search and array/null router values", () => {
    expect(decodeQueryState("offers", { offers_search: "" })).toEqual({});
    expect(decodeQueryState("offers", { offers_sort: ["a:ASC"], offers_page: null } as never)).toEqual({});
  });

  it("returns empty object when no namespaced keys present", () => {
    expect(decodeQueryState("offers", { other_sort: "x:ASC" })).toEqual({});
  });
});
