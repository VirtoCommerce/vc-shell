import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { uploadAssets } from "./uploadAssets";

interface TestAsset {
  url?: string;
  size?: number;
  sortOrder?: number;
  createdDate?: Date;
  name?: string;
}

function file(name: string, size = 10): File {
  const f = new File(["x".repeat(size)], name);
  return f;
}

/** Answers every POST with one asset echoing the uploaded file's name. */
function respondWithAsset(urlFor: (call: number) => string = (n) => `/a/file-${n}.png`) {
  let call = 0;
  return vi.fn(async () => {
    const url = urlFor(call++);
    return { json: async () => [{ url, name: url }] } as unknown as Response;
  });
}

let fetchMock: ReturnType<typeof respondWithAsset>;

beforeEach(() => {
  fetchMock = respondWithAsset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("uploadAssets", () => {
  it("posts every file to the folder and returns them in order", async () => {
    const result = await uploadAssets<TestAsset>([file("a.png"), file("b.png")], { uploadPath: "catalog" });

    expect(result).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/assets?folderUrl=/catalog");
    expect(result.map((a) => a.url)).toEqual(["/a/file-0.png", "/a/file-1.png"]);
  });

  // The path is interpolated after a slash, so an unnormalised leading slash
  // used to produce `folderUrl=//catalog` — useAssets did exactly that.
  it("tolerates a leading slash in the upload path", async () => {
    await uploadAssets<TestAsset>([file("a.png")], { uploadPath: "/catalog" });

    expect(fetchMock.mock.calls[0][0]).toBe("/api/assets?folderUrl=/catalog");
  });

  it("continues sortOrder from the last existing item", async () => {
    const result = await uploadAssets<TestAsset>([file("a.png"), file("b.png"), file("c.png")], {
      uploadPath: "catalog",
      startingSortOrder: 4,
    });

    expect(result.map((a) => a.sortOrder)).toEqual([5, 6, 7]);
  });

  it("assigns sortOrder 0 when there is no starting point", async () => {
    const result = await uploadAssets<TestAsset>([file("a.png"), file("b.png")], { uploadPath: "catalog" });

    expect(result.map((a) => a.sortOrder)).toEqual([0, 0]);
  });

  it("decodes the URL the endpoint returns", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ json: async () => [{ url: "/a/my%20file%20(1).png" }] }) as unknown as Response),
    );

    const [asset] = await uploadAssets<TestAsset>([file("a.png")], { uploadPath: "catalog" });

    expect(asset.url).toBe("/a/my file (1).png");
  });

  it("reports the local file size rather than the endpoint's", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ json: async () => [{ url: "/a.png", size: 999 }] }) as unknown as Response),
    );

    const [asset] = await uploadAssets<TestAsset>([file("a.png", 42)], { uploadPath: "catalog" });

    expect(asset.size).toBe(42);
  });

  it("keeps at most `concurrency` requests in flight", async () => {
    let inFlight = 0;
    let peak = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        inFlight++;
        peak = Math.max(peak, inFlight);
        await new Promise((r) => setTimeout(r, 5));
        inFlight--;
        return { json: async () => [{ url: "/a.png" }] } as unknown as Response;
      }),
    );

    await uploadAssets<TestAsset>([file("1"), file("2"), file("3"), file("4"), file("5")], {
      uploadPath: "catalog",
      concurrency: 2,
    });

    expect(peak).toBe(2);
  });

  it("drops a file the endpoint answers with nothing, keeping the rest", async () => {
    let call = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        const empty = call++ === 1;
        return { json: async () => (empty ? [] : [{ url: `/a/${call}.png` }]) } as unknown as Response;
      }),
    );

    const result = await uploadAssets<TestAsset>([file("a"), file("b"), file("c")], { uploadPath: "catalog" });

    expect(result).toHaveLength(2);
  });

  it("returns nothing for an empty file list without calling the endpoint", async () => {
    const result = await uploadAssets<TestAsset>([], { uploadPath: "catalog" });

    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
