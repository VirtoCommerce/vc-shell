interface IndexEntry {
  id: string;
  type: string;
}

interface IndexJson {
  v?: number;
  entries: Record<string, IndexEntry>;
}

export async function fetchStorybookIds(storybookUrl: string): Promise<Set<string>> {
  const url = `${storybookUrl}/index.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch Storybook index from ${url}: HTTP ${res.status}`);
  }
  const data = (await res.json()) as IndexJson;
  const ids = new Set<string>();
  for (const entry of Object.values(data.entries ?? {})) {
    if (entry.type === "story") ids.add(entry.id);
  }
  return ids;
}
