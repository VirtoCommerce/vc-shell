import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CellImage from "./CellImage.vue";

const image = (value: unknown) =>
  mount(CellImage, { props: { value }, global: { stubs: { VcImage: true } } }).findComponent({ name: "VcImage" });

describe("CellImage", () => {
  it("shows a thumbnail for a URL", () => {
    const img = image("https://shop.test/cms-content/assets/catalog/a.jpg");
    expect(img.props("src")).toBe("https://shop.test/cms-content/assets/catalog/a.jpg");
    expect(img.props("thumbnailSize")).toBe("sm");
  });

  it("shows a thumbnail for an image object the platform stores", () => {
    const img = image({ url: "https://shop.test/cms-content/assets/catalog/a.jpg", relativeUrl: "/catalog/a.jpg" });
    expect(img.props("src")).toBe("https://shop.test/cms-content/assets/catalog/a.jpg");
    expect(img.props("thumbnailSize")).toBe("sm");
  });

  it("shows the original of an image object linked from another host", () => {
    const url = "https://i.etsystatic.com/1/r/il/a.jpg";
    const img = image({ url, relativeUrl: url });
    expect(img.props("src")).toBe(url);
    expect(img.props("thumbnailSize")).toBeUndefined();
  });
});
