import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import CellMoney from "./CellMoney.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

const text = (value: unknown) => mount(CellMoney, { props: { value, currency: "USD" } }).text();

describe("CellMoney", () => {
  it("shows a zero amount as money, not as Not set", () => {
    expect(text(0)).not.toContain("NOT_SET");
    expect(text(0)).toMatch(/0/);
  });

  it("shows Not set when there is no value", () => {
    expect(text(undefined)).toContain("NOT_SET");
    expect(text(null)).toContain("NOT_SET");
    expect(text("")).toContain("NOT_SET");
  });
});
