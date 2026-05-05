const RE = /<!--\s*internal:start\s*-->([\s\S]*?)<!--\s*internal:end\s*-->/g;

export function stripInternalBlocks(body: string): string {
  return body.replace(RE, "");
}
