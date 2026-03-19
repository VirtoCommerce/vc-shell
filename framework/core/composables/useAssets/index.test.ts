import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@core/utilities", () => ({
  createLogger: () => ({
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { useAssets } from "./index";
import type { ICommonAsset } from "@core/types";

describe("useAssets", () => {
  it("returns the expected API shape", () => {
    const assets = useAssets();
    expect(assets).toHaveProperty("upload");
    expect(assets).toHaveProperty("remove");
    expect(assets).toHaveProperty("edit");
    expect(assets).toHaveProperty("loading");
    expect(typeof assets.upload).toBe("function");
    expect(typeof assets.remove).toBe("function");
    expect(typeof assets.edit).toBe("function");
  });

  it("loading starts as false", () => {
    const { loading } = useAssets();
    expect(loading.value).toBe(false);
  });

  describe("remove", () => {
    it("removes matching assets by url", () => {
      const { remove } = useAssets();
      const initial: ICommonAsset[] = [
        { url: "a.jpg", name: "a" } as ICommonAsset,
        { url: "b.jpg", name: "b" } as ICommonAsset,
        { url: "c.jpg", name: "c" } as ICommonAsset,
      ];
      const toDelete: ICommonAsset[] = [
        { url: "b.jpg", name: "b" } as ICommonAsset,
      ];
      const result = remove(toDelete, initial);
      expect(result).toHaveLength(2);
      expect(result.map((a) => a.url)).toEqual(["a.jpg", "c.jpg"]);
    });

    it("returns clone, does not mutate original", () => {
      const { remove } = useAssets();
      const initial: ICommonAsset[] = [
        { url: "a.jpg", name: "a" } as ICommonAsset,
      ];
      const result = remove([], initial);
      expect(result).not.toBe(initial);
      expect(result).toHaveLength(1);
    });

    it("returns empty array when initial is empty", () => {
      const { remove } = useAssets();
      const result = remove([{ url: "a.jpg" } as ICommonAsset], []);
      expect(result).toHaveLength(0);
    });
  });

  describe("edit", () => {
    it("updates asset in place when subset is passed", () => {
      const { edit } = useAssets();
      const initial: ICommonAsset[] = [
        { url: "a.jpg", name: "a", sortOrder: 0 } as ICommonAsset,
        { url: "b.jpg", name: "b", sortOrder: 1 } as ICommonAsset,
      ];
      const updated: ICommonAsset[] = [
        { url: "a.jpg", name: "updated-a", sortOrder: 5 } as ICommonAsset,
      ];
      const result = edit(updated, initial);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("updated-a");
      expect(result[0].sortOrder).toBe(5);
      expect(result[1].name).toBe("b");
    });

    it("preserves updatedFiles order when lengths match (reorder)", () => {
      const { edit } = useAssets();
      const initial: ICommonAsset[] = [
        { url: "a.jpg", name: "a" } as ICommonAsset,
        { url: "b.jpg", name: "b" } as ICommonAsset,
      ];
      const reordered: ICommonAsset[] = [
        { url: "b.jpg", name: "b" } as ICommonAsset,
        { url: "a.jpg", name: "a" } as ICommonAsset,
      ];
      const result = edit(reordered, initial);
      expect(result[0].url).toBe("b.jpg");
      expect(result[1].url).toBe("a.jpg");
    });
  });

  describe("upload", () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
        json: () => Promise.resolve([{ url: "uploaded.jpg", name: "uploaded" }]),
      } as Response);
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it("uploads files and returns assets", async () => {
      const { upload, loading } = useAssets();
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      const fileList = {
        [Symbol.iterator]: function* () { yield file; },
        length: 1,
        item: () => file,
        0: file,
      } as unknown as FileList;

      const result = await upload(fileList, "test-path");
      expect(result).toHaveLength(1);
      expect(result[0].url).toBe("uploaded.jpg");
      expect(loading.value).toBe(false);
    });

    it("sets loading to false after upload failure", async () => {
      fetchSpy.mockRejectedValueOnce(new Error("Network error"));
      const { upload, loading } = useAssets();
      const file = new File(["content"], "test.jpg");
      const fileList = {
        [Symbol.iterator]: function* () { yield file; },
        length: 1,
        item: () => file,
        0: file,
      } as unknown as FileList;

      await expect(upload(fileList, "test-path")).rejects.toThrow("Network error");
      expect(loading.value).toBe(false);
    });
  });
});
