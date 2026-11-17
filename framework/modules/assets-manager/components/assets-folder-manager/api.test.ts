import { describe, it, expect, vi, beforeEach } from "vitest";
import { listFolder, createFolder, uploadFile, uploadFromUrl, deleteEntries, AssetsRequestError } from "./api";

const fetchMock = vi.fn();

function respond(status: number, body: unknown = {}) {
  fetchMock.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  });
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("listFolder", () => {
  it("encodes folderUrl and keyword", async () => {
    respond(200, { results: [] });
    await listFolder("/stores/a b#c", "x&y");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/assets?folderUrl=%2Fstores%2Fa%20b%23c&keyword=x%26y");
    expect(init?.method ?? "GET").toBe("GET");
  });

  it("omits keyword when undefined or blank", async () => {
    respond(200, { results: [] });
    respond(200, { results: [] });
    await listFolder("/s");
    await listFolder("/s", "  ");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/assets?folderUrl=%2Fs");
    expect(fetchMock.mock.calls[1][0]).toBe("/api/assets?folderUrl=%2Fs");
  });

  it("returns mapped results", async () => {
    const entry = { type: "blob", name: "a.png", url: "/s/a.png" };
    respond(200, { results: [entry] });
    expect(await listFolder("/s")).toEqual([entry]);
  });

  it("returns [] for 404", async () => {
    respond(404);
    expect(await listFolder("/missing")).toEqual([]);
  });

  it("returns [] when results are absent", async () => {
    respond(200, {});
    expect(await listFolder("/missing")).toEqual([]);
  });

  it("rejects other errors with status", async () => {
    respond(500);
    await expect(listFolder("/s")).rejects.toMatchObject({ name: "AssetsRequestError", status: 500 });
  });
});

describe("deleteEntries", () => {
  it("sends repeated urls params", async () => {
    respond(204);
    await deleteEntries(["u 1", "u&2"]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/assets?urls=u%201&urls=u%262");
    expect(init.method).toBe("DELETE");
  });
});

describe("createFolder", () => {
  it("posts a JSON body", async () => {
    respond(204);
    await createFolder("/stores/1", "new");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/assets/folder");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({ name: "new", parentUrl: "/stores/1" });
  });
});

describe("uploadFile", () => {
  const file = new File(["x"], "a.txt");

  it("sends FormData with overwrite flag", async () => {
    respond(200, []);
    await uploadFile("/stores/1", file, { overwrite: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/assets?folderUrl=%2Fstores%2F1&forceFileOverwrite=true");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("file")).toBeInstanceOf(File);
  });

  it("omits forceFileOverwrite by default", async () => {
    respond(200, []);
    await uploadFile("/stores/1", file);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/assets?folderUrl=%2Fstores%2F1");
  });
});

describe("uploadFromUrl", () => {
  it("posts url and name in the query without a body", async () => {
    respond(200, []);
    await uploadFromUrl("/stores/1", "https://x/y.png", "y.png");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/assets?folderUrl=%2Fstores%2F1&url=https%3A%2F%2Fx%2Fy.png&name=y.png");
    expect(init.method).toBe("POST");
    expect(init.body).toBeUndefined();
  });

  it("omits name when undefined", async () => {
    respond(200, []);
    await uploadFromUrl("/stores/1", "https://x/y.png");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/assets?folderUrl=%2Fstores%2F1&url=https%3A%2F%2Fx%2Fy.png");
  });
});

describe("errors", () => {
  it("rejects non-2xx with AssetsRequestError", async () => {
    respond(403);
    const p = createFolder("/s", "n");
    await expect(p).rejects.toBeInstanceOf(AssetsRequestError);
    respond(409);
    await expect(deleteEntries(["a"])).rejects.toMatchObject({ status: 409 });
    respond(400);
    await expect(uploadFile("/s", new File(["x"], "a"))).rejects.toMatchObject({ status: 400 });
    respond(500);
    await expect(uploadFromUrl("/s", "u")).rejects.toMatchObject({ status: 500 });
  });
});
