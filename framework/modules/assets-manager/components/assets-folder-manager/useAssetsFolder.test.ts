import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BlobEntry } from "./types";

vi.mock("./api", () => ({
  listFolder: vi.fn(),
  createFolder: vi.fn(),
  uploadFile: vi.fn(),
  uploadFromUrl: vi.fn(),
  deleteEntries: vi.fn(),
}));

import { listFolder, createFolder, uploadFile, uploadFromUrl, deleteEntries } from "./api";
import type { CollisionDecision } from "./collisions";
import { useAssetsFolder, folderUrlOf } from "./useAssetsFolder";

const list = vi.mocked(listFolder);
const folder = (name: string): BlobEntry => ({ type: "folder", name, url: `/root/${name}` });
const blob = (name: string): BlobEntry => ({ type: "blob", name, url: `/root/${name}` });

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useAssetsFolder", () => {
  beforeEach(() => {
    list.mockReset();
    vi.mocked(createFolder).mockReset().mockResolvedValue();
    vi.mocked(uploadFile).mockReset().mockResolvedValue();
    vi.mocked(uploadFromUrl).mockReset().mockResolvedValue();
    vi.mocked(deleteEntries).mockReset().mockResolvedValue();
  });

  it("sorts folders first, then files, each by name", async () => {
    list.mockResolvedValue([blob("b.png"), folder("Zeta"), blob("A.png"), folder("alpha")]);
    const { load, entries } = useAssetsFolder("/root", "Root");
    await load();
    expect(entries.value.map((e) => e.name)).toEqual(["alpha", "Zeta", "A.png", "b.png"]);
  });

  it("keeps loading and the old listing until prepare settles", async () => {
    const ready = deferred<void>();
    const prepare = vi.fn(() => ready.promise);
    list.mockResolvedValue([blob("b.png"), blob("a.png")]);
    const { load, entries, loading } = useAssetsFolder("/root", "Root", { prepare });
    const pending = load();
    await vi.waitFor(() => expect(prepare).toHaveBeenCalled());
    expect(prepare.mock.calls[0]).toEqual([[blob("a.png"), blob("b.png")]]);
    expect(loading.value).toBe(true);
    expect(entries.value).toEqual([]);
    ready.resolve();
    await pending;
    expect(loading.value).toBe(false);
    expect(entries.value.map((e) => e.name)).toEqual(["a.png", "b.png"]);
  });

  it("commits the listing when prepare fails", async () => {
    list.mockResolvedValue([blob("a.png")]);
    const { load, entries } = useAssetsFolder("/root", "Root", { prepare: () => Promise.reject(new Error("x")) });
    await load();
    expect(entries.value.map((e) => e.name)).toEqual(["a.png"]);
  });

  it("drops a listing superseded while it was being prepared", async () => {
    const first = deferred<void>();
    const prepare = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(undefined);
    list.mockResolvedValueOnce([blob("old.png")]).mockResolvedValueOnce([blob("new.png")]);
    const { load, search, entries } = useAssetsFolder("/root", "Root", { prepare });
    const stale = load();
    await vi.waitFor(() => expect(prepare).toHaveBeenCalledTimes(1));
    await search("new");
    first.resolve();
    await stale;
    expect(entries.value.map((e) => e.name)).toEqual(["new.png"]);
  });

  it("builds breadcrumbs as a stack", async () => {
    const a = folder("a");
    list.mockResolvedValueOnce([a]).mockResolvedValueOnce([]);
    const { load, open, goTo, breadcrumbs, currentUrl } = useAssetsFolder("/root", "Root");
    expect(breadcrumbs.value).toEqual([{ url: "/root", name: "Root" }]);
    await load();
    await open(a);
    expect(breadcrumbs.value).toEqual([
      { url: "/root", name: "Root" },
      { url: folderUrlOf(a), name: "a" },
    ]);
    expect(currentUrl.value).toBe(folderUrlOf(a));
    list.mockResolvedValueOnce([a]);
    await goTo("/root");
    expect(breadcrumbs.value).toHaveLength(1);
    expect(currentUrl.value).toBe("/root");
  });

  it("ignores blobs, unknown folders and non-crumb urls", async () => {
    const f = blob("f.png");
    list.mockResolvedValue([f]);
    const { load, open, goTo, breadcrumbs } = useAssetsFolder("/root", "Root");
    await load();
    list.mockClear();
    await open(f);
    await open(folder("ghost"));
    await goTo("/elsewhere");
    expect(list).not.toHaveBeenCalled();
    expect(breadcrumbs.value).toHaveLength(1);
  });

  it("latest request wins over a stale one", async () => {
    const a = folder("a");
    const b = folder("b");
    list.mockResolvedValueOnce([a, b]);
    const { load, open, entries, breadcrumbs } = useAssetsFolder("/root", "Root");
    await load();

    const pendingA = deferred<BlobEntry[]>();
    list.mockReturnValueOnce(pendingA.promise).mockResolvedValueOnce([blob("in-b.png")]);
    const openA = open(a);
    await open(b);
    expect(entries.value.map((e) => e.name)).toEqual(["in-b.png"]);
    expect(breadcrumbs.value.at(-1)?.name).toBe("b");

    pendingA.resolve([blob("in-a.png")]);
    await openA;
    expect(entries.value.map((e) => e.name)).toEqual(["in-b.png"]);
    expect(breadcrumbs.value.at(-1)?.name).toBe("b");
  });

  it("a superseded load that fails resolves silently", async () => {
    const a = folder("a");
    const b = folder("b");
    list.mockResolvedValueOnce([a, b]);
    const { load, open, entries, loading } = useAssetsFolder("/root", "Root");
    await load();

    const pendingA = deferred<BlobEntry[]>();
    list.mockReturnValueOnce(pendingA.promise).mockResolvedValueOnce([blob("in-b.png")]);
    const openA = open(a);
    await open(b);
    pendingA.reject(new Error("boom"));
    await expect(openA).resolves.toBeUndefined();
    expect(entries.value.map((e) => e.name)).toEqual(["in-b.png"]);
    expect(loading.value).toBe(false);
  });

  it("search passes the keyword; open and goTo reset it", async () => {
    const a = folder("a");
    list.mockResolvedValue([a]);
    const { load, search, open, goTo, keyword } = useAssetsFolder("/root", "Root");
    await load();
    await search("abc");
    expect(list).toHaveBeenLastCalledWith("/root", "abc");
    expect(keyword.value).toBe("abc");
    await open(a);
    expect(keyword.value).toBeUndefined();
    expect(list).toHaveBeenLastCalledWith(folderUrlOf(a), undefined);
    await search("x");
    await goTo("/root");
    expect(keyword.value).toBeUndefined();
  });

  it("toggles loading and rethrows on failure", async () => {
    const d = deferred<BlobEntry[]>();
    list.mockReturnValueOnce(d.promise);
    const { load, loading } = useAssetsFolder("/root", "Root");
    const p = load();
    expect(loading.value).toBe(true);
    d.reject(new Error("boom"));
    await expect(p).rejects.toThrow("boom");
    expect(loading.value).toBe(false);
  });

  it("a failed open leaves entries, currentUrl and breadcrumbs untouched", async () => {
    const a = folder("a");
    list.mockResolvedValueOnce([a]);
    const { load, open, entries, currentUrl, breadcrumbs } = useAssetsFolder("/root", "Root");
    await load();
    list.mockRejectedValueOnce(new Error("boom"));
    await expect(open(a)).rejects.toThrow("boom");
    expect(entries.value.map((e) => e.name)).toEqual(["a"]);
    expect(currentUrl.value).toBe("/root");
    expect(breadcrumbs.value).toHaveLength(1);
  });

  describe("mutations", () => {
    const file = (name: string) => new File(["x"], name);
    const setup = async (existing: BlobEntry[] = []) => {
      list.mockResolvedValue(existing);
      const api = useAssetsFolder("/root", "Root");
      await api.load();
      list.mockClear();
      return api;
    };
    const decide = (d: CollisionDecision) => vi.fn().mockResolvedValue(d);

    it("upload re-lists first; no collision uploads without overwrite and skips resolve", async () => {
      const { upload } = await setup();
      const resolve = decide({ action: "skip" });
      const res = await upload([file("a.md")], resolve);
      expect(list.mock.calls.length).toBeGreaterThanOrEqual(1);
      expect(vi.mocked(uploadFile).mock.calls[0][2]).toBeUndefined();
      expect(vi.mocked(uploadFile).mock.calls[0][0]).toBe("/root");
      expect(resolve).not.toHaveBeenCalled();
      expect(res).toEqual({ uploaded: 1, failed: 0, skipped: 0 });
    });

    it("upload into a target folder lists it, uploads there and reloads the current level once", async () => {
      const { upload } = await setup();
      list.mockResolvedValue([]);
      const res = await upload([file("a.md")], decide({ action: "skip" }), "/root/a");
      expect(list.mock.calls[0]).toEqual(["/root/a"]);
      expect(vi.mocked(uploadFile).mock.calls[0][0]).toBe("/root/a");
      expect(list.mock.calls.filter((c) => c[0] === "/root")).toHaveLength(1);
      expect(res).toEqual({ uploaded: 1, failed: 0, skipped: 0 });
    });

    it("a failing listing of the target folder rejects with nothing uploaded", async () => {
      const { upload } = await setup();
      list.mockRejectedValueOnce(new Error("boom"));
      await expect(upload([file("a.md")], decide({ action: "skip" }), "/root/a")).rejects.toThrow("boom");
      expect(uploadFile).not.toHaveBeenCalled();
    });

    it("re-list happens before deciding (server state wins over stale entries)", async () => {
      const { upload } = await setup();
      list.mockResolvedValue([blob("a.md")]);
      const resolve = decide({ action: "skip" });
      await upload([file("a.md")], resolve);
      expect(resolve).toHaveBeenCalledWith(expect.any(File), "a.md");
    });

    it("collision check ignores the active search keyword", async () => {
      const { upload, search, keyword, entries } = await setup();
      list.mockImplementation(async (_url, kw) => (kw ? [] : [blob("a.md")]));
      await search("x");
      list.mockClear();
      const resolve = decide({ action: "skip" });
      await upload([file("a.md")], resolve);
      expect(list.mock.calls[0]).toEqual(["/root"]);
      expect(resolve).toHaveBeenCalledWith(expect.any(File), "a.md");
      expect(uploadFile).not.toHaveBeenCalled();
      expect(keyword.value).toBe("x");
      expect(entries.value).toEqual([]);
    });

    it("overwrite passes overwrite: true", async () => {
      const { upload } = await setup([blob("a.md")]);
      const f = file("a.md");
      await upload([f], decide({ action: "overwrite" }));
      expect(uploadFile).toHaveBeenCalledWith("/root", f, { overwrite: true });
    });

    it("rename uploads a renamed File and re-resolves when the new name collides", async () => {
      const { upload } = await setup([blob("a.md"), blob("b.md")]);
      const resolve = vi
        .fn()
        .mockResolvedValueOnce({ action: "rename", name: "b.md" })
        .mockResolvedValueOnce({ action: "rename", name: "c.md" });
      await upload([file("a.md")], resolve);
      expect(resolve).toHaveBeenNthCalledWith(2, expect.any(File), "b.md");
      const uploaded = vi.mocked(uploadFile).mock.calls[0][1];
      expect(uploaded.name).toBe("c.md");
    });

    it("an unusable rename name asks again instead of uploading it", async () => {
      const { upload } = await setup([blob("a.md")]);
      const resolve = vi
        .fn()
        .mockResolvedValueOnce({ action: "rename", name: "../escape.md" })
        .mockResolvedValueOnce({ action: "skip" });
      const result = await upload([file("a.md")], resolve);
      expect(resolve).toHaveBeenCalledTimes(2);
      expect(resolve).toHaveBeenNthCalledWith(2, expect.any(File), "a.md");
      expect(uploadFile).not.toHaveBeenCalled();
      expect(result.skipped).toBe(1);
    });

    it("names renamed earlier in the batch count as taken", async () => {
      const { upload } = await setup([blob("a.md"), blob("b.md")]);
      const resolve = vi
        .fn()
        .mockResolvedValueOnce({ action: "rename", name: "c.md" })
        .mockResolvedValueOnce({ action: "rename", name: "c.md" })
        .mockResolvedValueOnce({ action: "rename", name: "d.md" });
      await upload([file("a.md"), file("b.md")], resolve);
      expect(resolve).toHaveBeenCalledTimes(3);
      expect(resolve).toHaveBeenNthCalledWith(3, expect.any(File), "c.md");
      expect(vi.mocked(uploadFile).mock.calls.map((c) => c[1].name)).toEqual(["c.md", "d.md"]);
    });

    it("skip is not uploaded and counted", async () => {
      const { upload } = await setup([blob("a.md")]);
      const res = await upload([file("a.md")], decide({ action: "skip" }));
      expect(uploadFile).not.toHaveBeenCalled();
      expect(res).toEqual({ uploaded: 0, failed: 0, skipped: 1 });
    });

    it("counts failures without throwing and reloads once at the end", async () => {
      const { upload } = await setup();
      vi.mocked(uploadFile).mockResolvedValueOnce().mockRejectedValueOnce(new Error("x")).mockResolvedValueOnce();
      list.mockClear();
      const res = await upload([file("a"), file("b"), file("c")], decide({ action: "skip" }));
      expect(res).toEqual({ uploaded: 2, failed: 1, skipped: 0 });
      // one re-list before deciding, one reload at the end
      expect(list).toHaveBeenCalledTimes(2);
    });

    it("reports loading while an upload is in flight, but not while it waits on the user", async () => {
      const { upload, loading } = await setup([blob("a.md")]);
      const decision = deferred<CollisionDecision>();
      const sending = deferred<void>();
      vi.mocked(uploadFile).mockReturnValueOnce(sending.promise);
      const resolve = vi.fn().mockReturnValue(decision.promise);

      const pending = upload([file("a.md")], resolve);
      expect(loading.value).toBe(true);
      await vi.waitFor(() => expect(resolve).toHaveBeenCalled());
      expect(loading.value).toBe(false);

      decision.resolve({ action: "overwrite" });
      await vi.waitFor(() => expect(uploadFile).toHaveBeenCalled());
      expect(loading.value).toBe(true);

      sending.resolve();
      await pending;
      expect(loading.value).toBe(false);
    });

    it("reports loading for the whole of a mutation", async () => {
      const { createFolder: create, loading } = await setup();
      const request = deferred<void>();
      vi.mocked(createFolder).mockReturnValueOnce(request.promise);
      const pending = create("new");
      expect(loading.value).toBe(true);
      request.resolve();
      await pending;
      expect(loading.value).toBe(false);
    });

    it("createFolder calls the api with currentUrl and reloads", async () => {
      const { createFolder: create } = await setup();
      await create(" docs ");
      expect(createFolder).toHaveBeenCalledWith("/root", "docs");
      expect(list).toHaveBeenCalledTimes(1);
    });

    it.each(["", "  ", "a/b", "a\\b", ".", ".."])("createFolder rejects invalid name %j", async (name) => {
      const { createFolder: create } = await setup();
      await expect(create(name)).rejects.toThrow("invalid-name");
      expect(createFolder).not.toHaveBeenCalled();
    });

    it("uploadFromUrl derives the name from the last path segment", async () => {
      const { uploadFromUrl: fromUrl } = await setup();
      await fromUrl("https://h.com/a/My%20Pic.png?x=1");
      expect(uploadFromUrl).toHaveBeenCalledWith("/root", "https://h.com/a/My%20Pic.png?x=1", "My Pic.png");
      expect(list).toHaveBeenCalledTimes(1);
    });

    it("uploadFromUrl omits the name when the path is empty", async () => {
      const { uploadFromUrl: fromUrl } = await setup();
      await fromUrl("https://h.com/");
      expect(uploadFromUrl).toHaveBeenCalledWith("/root", "https://h.com/", undefined);
    });

    it("remove deletes by url and reloads", async () => {
      const { remove } = await setup();
      await remove([blob("a"), folder("b")]);
      expect(deleteEntries).toHaveBeenCalledWith(["/root/a", "/root/b"]);
      expect(list).toHaveBeenCalledTimes(1);
    });

    it("still reloads and rethrows when a mutation rejects", async () => {
      const { remove, createFolder: create, uploadFromUrl: fromUrl } = await setup();
      vi.mocked(deleteEntries).mockRejectedValueOnce(new Error("d"));
      await expect(remove([blob("a")])).rejects.toThrow("d");
      vi.mocked(createFolder).mockRejectedValueOnce(new Error("c"));
      await expect(create("x")).rejects.toThrow("c");
      vi.mocked(uploadFromUrl).mockRejectedValueOnce(new Error("u"));
      await expect(fromUrl("https://h.com/a.png")).rejects.toThrow("u");
      expect(list).toHaveBeenCalledTimes(3);
    });
  });
});
