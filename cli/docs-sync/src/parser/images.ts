const RE = /!\[[^\]]*\]\((\.\.?\/[^)]+)\)/g;

export function findRelativeImageRefs(body: string): string[] {
  const refs: string[] = [];
  for (const match of body.matchAll(RE)) {
    refs.push(match[1]);
  }
  return refs;
}
