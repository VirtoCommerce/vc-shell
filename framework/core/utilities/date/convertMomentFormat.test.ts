import { describe, it, expect } from "vitest";
import { convertMomentFormat } from "./convertMomentFormat";

describe("convertMomentFormat", () => {
  describe("locale shortcuts", () => {
    it("converts L to P", () => {
      expect(convertMomentFormat("L")).toBe("P");
    });

    it("converts LT to p", () => {
      expect(convertMomentFormat("LT")).toBe("p");
    });

    it("converts LTS to pp", () => {
      expect(convertMomentFormat("LTS")).toBe("pp");
    });

    it("converts LL to PP", () => {
      expect(convertMomentFormat("LL")).toBe("PP");
    });

    it("converts LLL to PPp", () => {
      expect(convertMomentFormat("LLL")).toBe("PPp");
    });

    it("converts LLLL to PPPp", () => {
      expect(convertMomentFormat("LLLL")).toBe("PPPp");
    });

    it("converts combined 'L LT' to 'P p'", () => {
      expect(convertMomentFormat("L LT")).toBe("P p");
    });
  });

  describe("token conversions", () => {
    it("converts 'YYYY-MM-DD' to 'yyyy-MM-dd'", () => {
      expect(convertMomentFormat("YYYY-MM-DD")).toBe("yyyy-MM-dd");
    });

    it("converts 'DD.MM.YYYY HH:mm' to 'dd.MM.yyyy HH:mm'", () => {
      expect(convertMomentFormat("DD.MM.YYYY HH:mm")).toBe("dd.MM.yyyy HH:mm");
    });

    it("converts 'DD/MM/YY' to 'dd/MM/yy'", () => {
      expect(convertMomentFormat("DD/MM/YY")).toBe("dd/MM/yy");
    });

    it("converts 'ddd, MMM Do YYYY' to 'EEE, MMM do yyyy'", () => {
      expect(convertMomentFormat("ddd, MMM Do YYYY")).toBe("EEE, MMM do yyyy");
    });

    it("converts 'dddd' to 'EEEE'", () => {
      expect(convertMomentFormat("dddd")).toBe("EEEE");
    });

    it("converts 'hh:mm A' to 'hh:mm a'", () => {
      expect(convertMomentFormat("hh:mm A")).toBe("hh:mm a");
    });
  });
});
