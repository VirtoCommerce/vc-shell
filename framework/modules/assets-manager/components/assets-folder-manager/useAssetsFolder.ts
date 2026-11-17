import { computed, readonly, ref, toValue, type MaybeRefOrGetter } from "vue";
import * as api from "./api";
import { hasNameCollision, isValidEntryName, type CollisionDecision, type UploadResult } from "./collisions";
import type { BlobEntry } from "./types";

export interface Breadcrumb {
  url: string;
  name: string;
}

// The url the platform lists a folder by; kept in one place in case the field changes.
export function folderUrlOf(entry: BlobEntry): string {
  return entry.url;
}

const byName = (a: BlobEntry, b: BlobEntry) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

function sortEntries(items: BlobEntry[]): BlobEntry[] {
  const folders = items.filter((e) => e.type === "folder").sort(byName);
  const files = items.filter((e) => e.type !== "folder").sort(byName);
  return [...folders, ...files];
}

export interface AssetsFolderOptions {
  /** Runs on a fresh listing before it is shown; loading stays on until it settles. Failures are ignored. */
  prepare?: (entries: BlobEntry[]) => Promise<unknown>;
}

export function useAssetsFolder(
  rootUrl: string,
  rootName: MaybeRefOrGetter<string>,
  { prepare }: AssetsFolderOptions = {},
) {
  const currentUrl = ref(rootUrl);
  const entries = ref<BlobEntry[]>([]);
  const fetching = ref(false);
  // Mutations in flight; not counted while an upload waits on the user, so the overlay never hides a popup.
  const busy = ref(0);
  const loading = computed(() => fetching.value || busy.value > 0);
  const keyword = ref<string | undefined>();
  // Folders below the root; the root crumb is derived so the name stays reactive.
  const trail = ref<Breadcrumb[]>([]);

  const breadcrumbs = computed<Breadcrumb[]>(() => [{ url: rootUrl, name: toValue(rootName) }, ...trail.value]);

  let requestId = 0;

  // Latest request wins; state is committed only when the list succeeds.
  // A superseded request resolves silently, even on failure: the user already left that folder.
  async function fetchFolder(url: string, kw: string | undefined, nextTrail: Breadcrumb[]): Promise<void> {
    const id = ++requestId;
    fetching.value = true;
    let result: BlobEntry[];
    try {
      result = sortEntries(await api.listFolder(url, kw));
      if (prepare && id === requestId) await prepare(result).catch(() => {});
    } catch (e) {
      if (id !== requestId) return;
      throw e;
    } finally {
      if (id === requestId) fetching.value = false;
    }
    if (id !== requestId) return;
    entries.value = result;
    currentUrl.value = url;
    keyword.value = kw;
    trail.value = nextTrail;
  }

  const load = () => fetchFolder(currentUrl.value, keyword.value, trail.value);

  async function open(folder: BlobEntry): Promise<void> {
    if (
      folder.type !== "folder" ||
      !entries.value.some((e) => e.type === "folder" && folderUrlOf(e) === folderUrlOf(folder))
    )
      return;
    await fetchFolder(folderUrlOf(folder), undefined, [
      ...trail.value,
      { url: folderUrlOf(folder), name: folder.name },
    ]);
  }

  async function goTo(url: string): Promise<void> {
    const index = breadcrumbs.value.findIndex((c) => c.url === url);
    if (index === -1) return;
    await fetchFolder(url, undefined, trail.value.slice(0, index));
  }

  const search = (kw?: string) => fetchFolder(currentUrl.value, kw, trail.value);

  // Runs a mutation, then reloads; a failed mutation still reloads and rethrows its own error.
  async function mutate(fn: () => Promise<void>): Promise<void> {
    busy.value++;
    try {
      try {
        await fn();
      } catch (e) {
        await load().catch(() => {});
        throw e;
      }
      await load();
    } finally {
      busy.value--;
    }
  }

  async function createFolder(name: string): Promise<void> {
    const trimmed = name.trim();
    if (!isValidEntryName(trimmed)) throw new Error("invalid-name");
    await mutate(() => api.createFolder(currentUrl.value, trimmed));
  }

  async function upload(
    files: File[],
    resolve: (file: File, name: string) => Promise<CollisionDecision>,
    targetUrl: string = currentUrl.value,
  ): Promise<UploadResult> {
    busy.value++;
    try {
      return await uploadTo(targetUrl, files, resolve);
    } finally {
      busy.value--;
    }
  }

  async function askUser<T>(question: () => Promise<T>): Promise<T> {
    busy.value--;
    try {
      return await question();
    } finally {
      busy.value++;
    }
  }

  async function uploadTo(
    folderUrl: string,
    files: File[],
    resolve: (file: File, name: string) => Promise<CollisionDecision>,
  ): Promise<UploadResult> {
    // Unfiltered listing: an active search must not hide colliding entries. Visible state is left alone.
    const taken = new Set((await api.listFolder(folderUrl)).map((e) => e.name));
    const plan: { file: File; overwrite: boolean }[] = [];
    let skipped = 0;

    // Decisions are interactive and collected up front, in dialog order.
    for (const original of files) {
      let name = original.name;
      let overwrite = false;
      let skip = false;
      while (hasNameCollision(name, taken)) {
        const decision = await askUser(() => resolve(original, name));
        if (decision.action === "skip") {
          skip = true;
          break;
        }
        if (decision.action === "overwrite") {
          overwrite = true;
          break;
        }
        // An unusable name keeps the collision, so the user is asked again.
        if (isValidEntryName(decision.name)) name = decision.name;
      }
      if (skip) {
        skipped++;
        continue;
      }
      taken.add(name);
      const file = name === original.name ? original : new File([original], name, { type: original.type });
      plan.push({ file, overwrite });
    }

    let uploaded = 0;
    let failed = 0;
    for (const { file, overwrite } of plan) {
      try {
        await api.uploadFile(folderUrl, file, overwrite ? { overwrite: true } : undefined);
        uploaded++;
      } catch {
        failed++;
      }
    }
    await load().catch(() => {});
    return { uploaded, failed, skipped };
  }

  async function uploadFromUrl(url: string): Promise<void> {
    let name: string | undefined;
    try {
      const segment = new URL(url).pathname.split("/").filter(Boolean).pop();
      name = segment ? decodeURIComponent(segment) : undefined;
    } catch {
      name = undefined;
    }
    await mutate(() => api.uploadFromUrl(currentUrl.value, url, name));
  }

  const remove = (items: BlobEntry[]) => mutate(() => api.deleteEntries(items.map(folderUrlOf)));

  return {
    currentUrl: readonly(currentUrl),
    entries: readonly(entries),
    loading,
    keyword: readonly(keyword),
    breadcrumbs,
    load,
    open,
    goTo,
    search,
    createFolder,
    upload,
    uploadFromUrl,
    remove,
  };
}
