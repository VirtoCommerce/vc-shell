import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@core/utilities", () => ({
  createLogger: () => ({
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { ref } from "vue";
import { useAssetsManager } from "./index";
import type { AssetLike } from "./index";

function createFileList(...files: File[]): FileList {
  return {
    [Symbol.iterator]: function* () {
      yield* files;
    },
    length: files.length,
    item: (i: number) => files[i] ?? null,
    ...Object.fromEntries(files.map((f, i) => [i, f])),
  } as unknown as FileList;
}

describe("useAssetsManager", () => {
  describe("API shape and basics", () => {
    it("returns the expected API shape", () => {
      const assets = ref<AssetLike[]>([]);
      const mgr = useAssetsManager(assets, { uploadPath: () => "catalog/images" });
      expect(mgr).toHaveProperty("items");
      expect(mgr).toHaveProperty("upload");
      expect(mgr).toHaveProperty("remove");
      expect(mgr).toHaveProperty("removeMany");
      expect(mgr).toHaveProperty("reorder");
      expect(mgr).toHaveProperty("updateItem");
      expect(mgr).toHaveProperty("loading");
      expect(typeof mgr.upload).toBe("function");
      expect(typeof mgr.remove).toBe("function");
      expect(typeof mgr.removeMany).toBe("function");
      expect(typeof mgr.reorder).toBe("function");
      expect(typeof mgr.updateItem).toBe("function");
    });

    it("items reflects the managed ref", () => {
      const assets = ref<AssetLike[]>([{ url: "a.jpg", name: "a" }]);
      const { items } = useAssetsManager(assets, { uploadPath: () => "path" });
      expect(items.value).toHaveLength(1);
      expect(items.value[0].url).toBe("a.jpg");
    });

    it("loading starts as false", () => {
      const assets = ref<AssetLike[]>([]);
      const { loading } = useAssetsManager(assets, { uploadPath: () => "path" });
      expect(loading.value).toBe(false);
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

    it("appends uploaded assets to the ref", async () => {
      const assets = ref<AssetLike[]>([{ url: "existing.jpg" }]);
      const { upload } = useAssetsManager(assets, { uploadPath: () => "catalog/images" });

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      await upload(createFileList(file));

      expect(assets.value).toHaveLength(2);
      expect(assets.value[0].url).toBe("existing.jpg");
      expect(assets.value[1].url).toBe("uploaded.jpg");
    });

    it("calls fetch with correct upload path", async () => {
      const assets = ref<AssetLike[]>([]);
      const { upload } = useAssetsManager(assets, { uploadPath: () => "my/path" });

      const file = new File(["x"], "f.jpg");
      await upload(createFileList(file));

      expect(fetchSpy).toHaveBeenCalledWith("/api/assets?folderUrl=/my/path", expect.objectContaining({ method: "POST" }));
    });

    it("sets sortOrder from startingSortOrder", async () => {
      const assets = ref<AssetLike[]>([]);
      const { upload } = useAssetsManager(assets, { uploadPath: () => "p" });

      const file = new File(["x"], "f.jpg");
      await upload(createFileList(file), 5);

      expect(assets.value[0].sortOrder).toBe(6); // startingSortOrder + index(0) + 1
    });

    it("sets loading during upload and resets after", async () => {
      const assets = ref<AssetLike[]>([]);
      const { upload, loading } = useAssetsManager(assets, { uploadPath: () => "p" });

      let loadingDuringUpload = false;
      fetchSpy.mockImplementation(() => {
        loadingDuringUpload = loading.value;
        return Promise.resolve({
          json: () => Promise.resolve([{ url: "x.jpg" }]),
        } as Response);
      });

      const file = new File(["x"], "f.jpg");
      await upload(createFileList(file));

      expect(loadingDuringUpload).toBe(true);
      expect(loading.value).toBe(false);
    });

    it("resets loading after upload failure", async () => {
      fetchSpy.mockRejectedValueOnce(new Error("Network error"));
      const assets = ref<AssetLike[]>([]);
      const { upload, loading } = useAssetsManager(assets, { uploadPath: () => "p" });

      const file = new File(["x"], "f.jpg");
      await expect(upload(createFileList(file))).rejects.toThrow("Network error");
      expect(loading.value).toBe(false);
    });

    it("respects concurrency option", async () => {
      let concurrentCalls = 0;
      let maxConcurrent = 0;

      fetchSpy.mockImplementation(() => {
        concurrentCalls++;
        maxConcurrent = Math.max(maxConcurrent, concurrentCalls);
        return new Promise((resolve) => {
          setTimeout(() => {
            concurrentCalls--;
            resolve({
              json: () => Promise.resolve([{ url: "x.jpg" }]),
            } as Response);
          }, 10);
        });
      });

      const assets = ref<AssetLike[]>([]);
      const { upload } = useAssetsManager(assets, { uploadPath: () => "p", concurrency: 2 });

      const files = Array.from({ length: 5 }, (_, i) => new File(["x"], `f${i}.jpg`));
      await upload(createFileList(...files));

      expect(maxConcurrent).toBeLessThanOrEqual(2);
    });

    it("decodes URL from response", async () => {
      fetchSpy.mockResolvedValueOnce({
        json: () => Promise.resolve([{ url: "path%20with%20spaces/file.jpg", name: "f" }]),
      } as Response);

      const assets = ref<AssetLike[]>([]);
      const { upload } = useAssetsManager(assets, { uploadPath: () => "p" });
      await upload(createFileList(new File(["x"], "f.jpg")));

      expect(assets.value[0].url).toBe("path with spaces/file.jpg");
    });

    it("sets file size from original File object", async () => {
      fetchSpy.mockResolvedValueOnce({
        json: () => Promise.resolve([{ url: "f.jpg", size: 0 }]),
      } as Response);

      const assets = ref<AssetLike[]>([]);
      const { upload } = useAssetsManager(assets, { uploadPath: () => "p" });

      const file = new File(["some content here"], "f.jpg");
      await upload(createFileList(file));

      expect(assets.value[0].size).toBe(file.size);
    });
  });

  describe("remove", () => {
    it("removes item by url (default assetKey)", async () => {
      const assets = ref<AssetLike[]>([
        { url: "a.jpg", name: "a" },
        { url: "b.jpg", name: "b" },
      ]);
      const { remove } = useAssetsManager(assets, { uploadPath: () => "p" });

      await remove({ url: "a.jpg" });

      expect(assets.value).toHaveLength(1);
      expect(assets.value[0].url).toBe("b.jpg");
    });

    it("calls confirmRemove and aborts if false", async () => {
      const confirmRemove = vi.fn().mockResolvedValue(false);
      const assets = ref<AssetLike[]>([{ url: "a.jpg" }]);
      const { remove } = useAssetsManager(assets, { uploadPath: () => "p", confirmRemove });

      await remove({ url: "a.jpg" });

      expect(confirmRemove).toHaveBeenCalledOnce();
      expect(assets.value).toHaveLength(1); // not removed
    });

    it("calls confirmRemove and proceeds if true", async () => {
      const confirmRemove = vi.fn().mockResolvedValue(true);
      const assets = ref<AssetLike[]>([{ url: "a.jpg" }]);
      const { remove } = useAssetsManager(assets, { uploadPath: () => "p", confirmRemove });

      await remove({ url: "a.jpg" });

      expect(confirmRemove).toHaveBeenCalledOnce();
      expect(assets.value).toHaveLength(0);
    });

    it("removes without confirmation when confirmRemove is not set", async () => {
      const assets = ref<AssetLike[]>([{ url: "a.jpg" }]);
      const { remove } = useAssetsManager(assets, { uploadPath: () => "p" });

      await remove({ url: "a.jpg" });
      expect(assets.value).toHaveLength(0);
    });

    it("uses custom assetKey for matching", async () => {
      const assets = ref<AssetLike[]>([
        { url: "a.jpg", name: "alpha" },
        { url: "b.jpg", name: "beta" },
      ]);
      const { remove } = useAssetsManager(assets, { uploadPath: () => "p", assetKey: "name" });

      await remove({ name: "alpha" });

      expect(assets.value).toHaveLength(1);
      expect(assets.value[0].name).toBe("beta");
    });
  });

  describe("removeMany", () => {
    it("removes multiple items in one call", async () => {
      const assets = ref<AssetLike[]>([
        { url: "a.jpg" },
        { url: "b.jpg" },
        { url: "c.jpg" },
      ]);
      const { removeMany } = useAssetsManager(assets, { uploadPath: () => "p" });

      await removeMany([{ url: "a.jpg" }, { url: "c.jpg" }]);

      expect(assets.value).toHaveLength(1);
      expect(assets.value[0].url).toBe("b.jpg");
    });

    it("calls confirmRemove only once for the batch", async () => {
      const confirmRemove = vi.fn().mockResolvedValue(true);
      const assets = ref<AssetLike[]>([{ url: "a.jpg" }, { url: "b.jpg" }]);
      const { removeMany } = useAssetsManager(assets, { uploadPath: () => "p", confirmRemove });

      await removeMany([{ url: "a.jpg" }, { url: "b.jpg" }]);

      expect(confirmRemove).toHaveBeenCalledOnce();
      expect(assets.value).toHaveLength(0);
    });

    it("aborts entire batch if confirmRemove returns false", async () => {
      const confirmRemove = vi.fn().mockResolvedValue(false);
      const assets = ref<AssetLike[]>([{ url: "a.jpg" }, { url: "b.jpg" }]);
      const { removeMany } = useAssetsManager(assets, { uploadPath: () => "p", confirmRemove });

      await removeMany([{ url: "a.jpg" }, { url: "b.jpg" }]);

      expect(assets.value).toHaveLength(2);
    });
  });

  describe("reorder", () => {
    it("replaces ref array with new order", () => {
      const assets = ref<AssetLike[]>([
        { url: "a.jpg", sortOrder: 0 },
        { url: "b.jpg", sortOrder: 1 },
      ]);
      const { reorder } = useAssetsManager(assets, { uploadPath: () => "p" });

      reorder([
        { url: "b.jpg", sortOrder: 1 },
        { url: "a.jpg", sortOrder: 0 },
      ]);

      expect(assets.value[0].url).toBe("b.jpg");
      expect(assets.value[1].url).toBe("a.jpg");
    });

    it("spread-copies each item (no shared references)", () => {
      const original = { url: "a.jpg", name: "a" };
      const assets = ref<AssetLike[]>([original]);
      const { reorder } = useAssetsManager(assets, { uploadPath: () => "p" });

      reorder([original]);

      expect(assets.value[0]).not.toBe(original);
      expect(assets.value[0]).toEqual(original);
    });
  });

  describe("updateItem", () => {
    it("merges updated properties into existing item", () => {
      const assets = ref<AssetLike[]>([
        { url: "a.jpg", name: "old-name", sortOrder: 0 },
      ]);
      const { updateItem } = useAssetsManager(assets, { uploadPath: () => "p" });

      updateItem({ url: "a.jpg", name: "new-name" });

      expect(assets.value[0].name).toBe("new-name");
      expect(assets.value[0].sortOrder).toBe(0); // preserved
    });

    it("does nothing when item is not found", () => {
      const assets = ref<AssetLike[]>([{ url: "a.jpg", name: "a" }]);
      const { updateItem } = useAssetsManager(assets, { uploadPath: () => "p" });

      updateItem({ url: "nonexistent.jpg", name: "x" });

      expect(assets.value).toHaveLength(1);
      expect(assets.value[0].name).toBe("a");
    });

    it("uses custom assetKey for matching", () => {
      const assets = ref<AssetLike[]>([
        { url: "a.jpg", name: "alpha", sortOrder: 0 },
      ]);
      const { updateItem } = useAssetsManager(assets, { uploadPath: () => "p", assetKey: "name" });

      updateItem({ name: "alpha", sortOrder: 5 });

      expect(assets.value[0].sortOrder).toBe(5);
    });
  });
});
