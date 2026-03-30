import { describe, it, expect } from "vitest";
import { getThumbnailUrl, getBestThumbnailSize } from "./index";

describe("getThumbnailUrl", () => {
  it("appends preset suffix before extension", () => {
    expect(getThumbnailUrl("https://cdn.example.com/photo.jpg", "sm")).toBe(
      "https://cdn.example.com/photo_sm.jpg",
    );
  });

  it("appends pixel size suffix", () => {
    expect(getThumbnailUrl("https://cdn.example.com/photo.jpg", "128x128")).toBe(
      "https://cdn.example.com/photo_128x128.jpg",
    );
  });

  it("returns original URL when no size specified", () => {
    expect(getThumbnailUrl("https://cdn.example.com/photo.jpg")).toBe(
      "https://cdn.example.com/photo.jpg",
    );
  });

  it("returns undefined for undefined URL", () => {
    expect(getThumbnailUrl(undefined, "sm")).toBeUndefined();
  });

  it("handles URL with query string", () => {
    expect(getThumbnailUrl("https://cdn.example.com/photo.jpg?v=123", "md")).toBe(
      "https://cdn.example.com/photo_md.jpg?v=123",
    );
  });

  it("does not double-apply suffix", () => {
    expect(getThumbnailUrl("https://cdn.example.com/photo_sm.jpg", "sm")).toBe(
      "https://cdn.example.com/photo_sm.jpg",
    );
  });

  it("returns as-is when no extension found", () => {
    expect(getThumbnailUrl("https://cdn.example.com/photo", "sm")).toBe(
      "https://cdn.example.com/photo",
    );
  });

  it("handles relative URLs", () => {
    expect(getThumbnailUrl("/assets/images/logo.png", "64x64")).toBe(
      "/assets/images/logo_64x64.png",
    );
  });

  it("handles multiple dots in path", () => {
    expect(getThumbnailUrl("https://cdn.example.com/my.product.photo.jpg", "lg")).toBe(
      "https://cdn.example.com/my.product.photo_lg.jpg",
    );
  });
});

describe("getBestThumbnailSize", () => {
  it("returns 64x64 for small sizes", () => {
    expect(getBestThumbnailSize(32)).toBe("64x64");
    expect(getBestThumbnailSize(48)).toBe("64x64");
    expect(getBestThumbnailSize(64)).toBe("64x64");
  });

  it("returns 128x128 for medium-small sizes", () => {
    expect(getBestThumbnailSize(96)).toBe("128x128");
    expect(getBestThumbnailSize(128)).toBe("128x128");
  });

  it("returns 216x216 for medium sizes", () => {
    expect(getBestThumbnailSize(200)).toBe("216x216");
  });

  it("returns 348x348 for large sizes", () => {
    expect(getBestThumbnailSize(300)).toBe("348x348");
  });

  it("returns lg for very large sizes", () => {
    expect(getBestThumbnailSize(500)).toBe("lg");
  });
});
