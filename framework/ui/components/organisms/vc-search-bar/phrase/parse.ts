export interface PhraseRange {
  lo?: string;
  hi?: string;
  loInc: boolean;
  hiInc: boolean;
  single?: boolean;
}
export type PhraseCond =
  | { neg: boolean; field: string; kind: "values"; values: string[]; pos: number }
  | { neg: boolean; field: string; kind: "range"; ranges: PhraseRange[]; pos: number };
export type PhraseNode =
  | { k: "and" | "or"; items: PhraseNode[]; paren?: boolean }
  | { k: "cond"; c: PhraseCond }
  | { k: "word"; v: string; pos: number; quoted?: boolean };

export class PhraseError extends Error {
  constructor(
    message: string,
    public pos: number,
  ) {
    super(message);
  }
}

const SIMPLE = /[\p{L}\p{N}_\-./@+'&]/u;

export function parsePhrase(src: string): PhraseNode | null {
  let i = 0;
  const fail = (msg: string, at = i): never => {
    throw new PhraseError(msg, at);
  };
  const skipWs = () => {
    while (i < src.length && /[ \t]/.test(src[i])) i++;
  };
  // DL in the grammar also eats commas between phrases.
  const skipDl = () => {
    while (i < src.length && /[ \t,]/.test(src[i])) i++;
  };
  const atWord = (w: string) => src.startsWith(w, i) && !(i + w.length < src.length && SIMPLE.test(src[i + w.length]));

  function str(): string | null {
    if (src[i] === '"') {
      const start = i;
      let out = "";
      i++;
      while (i < src.length && src[i] !== '"') {
        if (src[i] === "\\") {
          i++;
          out += ({ n: "\n", r: "\r", t: "\t" } as Record<string, string>)[src[i]] ?? src[i];
        } else out += src[i];
        i++;
      }
      if (i >= src.length) fail("Unclosed quote", start);
      i++;
      return out;
    }
    const s = i;
    while (i < src.length && SIMPLE.test(src[i])) i++;
    return i > s ? src.slice(s, i) : null;
  }
  // VD is a bare comma; ", " is a delimiter (the lexer prefers the longer DL match).
  const atValueComma = () => src[i] === "," && i + 1 < src.length && /["[(\p{L}\p{N}_\-./@+'&]/u.test(src[i + 1]);

  function range(): PhraseRange {
    const loInc = src[i] === "[";
    i++;
    skipWs();
    let lo: string | undefined;
    if (!atWord("TO") && !atWord("to")) lo = str() ?? undefined;
    skipWs();
    let hi: string | undefined;
    let single = false;
    if (atWord("TO") || atWord("to")) {
      i += 2;
      skipWs();
      if (src[i] !== "]" && src[i] !== ")") hi = str() ?? undefined;
      skipWs();
    } else {
      single = true;
      hi = lo;
    }
    if (src[i] !== "]" && src[i] !== ")") fail('Expected "]" or ")" to close the range');
    const hiInc = src[i] === "]";
    i++;
    if (lo === undefined && hi === undefined) fail("Empty range", i - 1);
    return { lo, hi, loInc, hiInc, single };
  }

  function phrase(): PhraseNode {
    const pos = i;
    const neg = src[i] === "!";
    if (neg) i++;
    const quoted = src[i] === '"';
    const name = str();
    if (name === null) fail(src[i] ? `Unexpected "${src[i]}"` : "Unexpected end of query");
    if (src[i] !== ":") {
      if (neg) fail('"!" must be followed by field:value', pos);
      return { k: "word", v: name!, pos, quoted };
    }
    i++;
    if (src[i] === "[" || src[i] === "(") {
      const ranges = [range()];
      while (atValueComma()) {
        i++;
        if (src[i] !== "[" && src[i] !== "(") fail("Expected another range after the comma");
        ranges.push(range());
      }
      return { k: "cond", c: { neg, field: name!, kind: "range", ranges, pos } };
    }
    const first = str();
    if (first === null) fail(`Missing value after "${name}:"`);
    const values = [first!];
    while (atValueComma()) {
      i++;
      values.push(str()!);
    }
    return { k: "cond", c: { neg, field: name!, kind: "values", values, pos } };
  }

  function unit(): PhraseNode {
    if (src[i] === "(") {
      const at = i;
      i++;
      skipDl();
      const inner = orExpr();
      skipDl();
      if (src[i] !== ")") fail('Missing ")"', at);
      i++;
      return inner.k === "and" || inner.k === "or"
        ? { ...inner, paren: true }
        : { k: "and", items: [inner], paren: true };
    }
    return phrase();
  }

  function andExpr(): PhraseNode {
    const items: PhraseNode[] = [];
    for (;;) {
      skipDl();
      if (i >= src.length || src[i] === ")" || atWord("OR")) break;
      if (atWord("AND")) {
        if (!items.length) fail('"AND" needs something on the left');
        i += 3;
        skipDl();
      }
      items.push(unit());
    }
    if (!items.length) fail(i < src.length ? `Unexpected "${src[i]}"` : "Unexpected end of query");
    return items.length === 1 ? items[0] : { k: "and", items };
  }

  function orExpr(): PhraseNode {
    const items = [andExpr()];
    while (atWord("OR")) {
      i += 2;
      items.push(andExpr());
    }
    return items.length === 1 ? items[0] : { k: "or", items };
  }

  skipDl();
  if (i >= src.length) return null;
  const node = orExpr();
  skipDl();
  if (i < src.length) fail(`Unexpected "${src[i]}"`);
  return node;
}

/** Quote a value only when the grammar needs it. */
export const quote = (v: string) =>
  /^[\p{L}\p{N}_\-./@+'&]+$/u.test(v) && !/^(AND|OR|TO|to)$/.test(v) ? v : `"${v.replace(/["\\]/g, "\\$&")}"`;
