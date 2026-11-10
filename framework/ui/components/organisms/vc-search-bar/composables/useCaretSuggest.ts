import { nextTick, reactive, type Ref } from "vue";
import type { BarField } from "../lib/fields";
import { RELATIVE_DATES, resolveRelative } from "../lib/values";
import { quote } from "../phrase/parse";

export interface Suggestion {
  label: string;
  insert: string;
  hint?: string;
}

export interface SuggestOptions {
  /** Offer field keys even when no word is typed (Ctrl+Space) */
  force?: boolean;
  t?: (key: string) => string;
  today?: Date;
}

const P = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.ADVANCED";
const MAX_ITEMS = 8;

/** Number templates put the caret where the bound is typed */
const CARET_OFFSET: Record<string, number> = { "[ TO]": 1, "[ TO ]": 1, "[TO ]": 4 };

export function suggestionsAt(
  text: string,
  caret: number,
  fields: BarField[],
  opts: SuggestOptions = {},
): { items: Suggestion[]; from: number; to: number } {
  const t = opts.t ?? ((k: string) => k);
  const before = text.slice(0, caret);
  const none = { items: [], from: caret, to: caret };
  if ((before.match(/"/g)?.length ?? 0) % 2) return none;

  // A word ends at a space, newline or bracket that is outside quotes
  let start = 0;
  let quoted = false;
  for (let i = 0; i < before.length; i++) {
    const c = before[i];
    if (c === "\\") i++;
    else if (c === '"') quoted = !quoted;
    else if (!quoted && (c === " " || c === "(" || c === "\n")) start = i + 1;
  }
  let tok = before.slice(start);
  let from = start;
  const neg = tok.startsWith("!");
  if (neg) {
    tok = tok.slice(1);
    from++;
  }

  const items: Suggestion[] = [];
  const colon = tok.indexOf(":");
  if (colon < 0) {
    if (tok || opts.force) {
      const q = tok.toLowerCase();
      for (const f of fields)
        if (f.key.toLowerCase().startsWith(q) && f.key !== tok)
          items.push({ label: `${f.key}:`, insert: `${f.key}:`, hint: f.label });
    }
    return { items: items.slice(0, MAX_ITEMS), from, to: caret };
  }

  const field = fields.find((f) => f.key.toLowerCase() === tok.slice(0, colon).toLowerCase());
  const valPart = tok.slice(colon + 1);
  const comma = valPart.lastIndexOf(",");
  const prefix = valPart.slice(comma + 1).toLowerCase();
  from = from + colon + 1 + comma + 1;
  if (!field) return none;

  if (field.kind === "select" || field.kind === "multiselect") {
    if (comma >= 0 && field.kind === "select" && !neg) return none;
    const unquote = (x: string) =>
      x
        .trim()
        .replace(/^"(.*)"$/, "$1")
        .toLowerCase();
    const used = valPart.split(",").slice(0, -1).map(unquote);
    for (const o of field.options) {
      const v = String(o.value);
      if (!v.toLowerCase().startsWith(prefix) || v.toLowerCase() === prefix || used.includes(v.toLowerCase())) continue;
      items.push({ label: v, insert: quote(v), hint: o.count !== undefined ? String(o.count) : undefined });
    }
  } else if (field.kind === "dateRange" && comma < 0) {
    for (const { id: relative, key } of RELATIVE_DATES) {
      const d = resolveRelative({ relative }, opts.today ?? new Date());
      const range = `[${d.start} TO ${d.end}]`;
      if (range.startsWith(valPart)) items.push({ label: range, insert: range, hint: t(`${P}.DATE_${key}`) });
    }
  } else if (field.kind === "toggle" && !valPart) {
    items.push({ label: "true", insert: "true", hint: t(`${P}.IS_ON`) });
  } else if (field.kind === "number" && !valPart) {
    items.push(
      { label: "[N TO]", insert: "[ TO]", hint: t(`${P}.NUM_FROM`) },
      { label: "[TO N]", insert: "[TO ]", hint: t(`${P}.NUM_UPTO`) },
      { label: "[A TO B]", insert: "[ TO ]", hint: t(`${P}.NUM_BETWEEN`) },
    );
  }
  return { items: items.slice(0, MAX_ITEMS), from, to: caret };
}

// Browsers do not expose caret coordinates in a textarea: copy its text box into a hidden div and measure a marker
const MIRRORED = [
  "boxSizing",
  "width",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontSize",
  "lineHeight",
  "fontFamily",
  "letterSpacing",
  "wordSpacing",
  "tabSize",
  "textIndent",
] as const;

/** Caret position relative to the textarea box, `top` is the line below the caret */
export function caretPoint(ta: HTMLTextAreaElement, pos: number): { left: number; top: number; lineHeight: number } {
  const cs = getComputedStyle(ta);
  const div = document.createElement("div");
  MIRRORED.forEach((k) => (div.style[k] = cs[k]));
  Object.assign(div.style, {
    position: "absolute",
    visibility: "hidden",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    top: "0",
    left: "-9999px",
  });
  div.textContent = ta.value.slice(0, pos);
  const mark = document.createElement("span");
  mark.textContent = "​";
  div.appendChild(mark);
  document.body.appendChild(div);
  const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
  const point = { left: mark.offsetLeft - ta.scrollLeft, top: mark.offsetTop + lineHeight - ta.scrollTop, lineHeight };
  div.remove();
  return point;
}

export const LIST_WIDTH = 260;
const LIST_MAX_HEIGHT = 240;
const EDGE = 8;

export function useCaretSuggest(opts: {
  fields: () => BarField[];
  wrap: Ref<HTMLElement | undefined>;
  t: (key: string) => string;
  /** Called with the new text when a suggestion is accepted */
  setText: (v: string) => void;
}) {
  // left/top/bottom are viewport coordinates: the list is teleported so it never widens or scrolls the panel
  const suggest = reactive({
    items: [] as Suggestion[],
    active: 0,
    from: 0,
    to: 0,
    typed: "",
    left: 0,
    top: 0 as number | undefined,
    bottom: undefined as number | undefined,
  });
  const textarea = () => opts.wrap.value?.querySelector("textarea") ?? null;

  const close = () => {
    suggest.items = [];
  };
  const matchLen = (it: Suggestion) =>
    suggest.typed && it.label.toLowerCase().startsWith(suggest.typed.toLowerCase()) ? suggest.typed.length : 0;

  // Under the caret line, or above it when the viewport has no room below; clamped to the viewport sideways
  function place(ta: HTMLTextAreaElement) {
    const { left, top, lineHeight } = caretPoint(ta, suggest.from);
    const r = ta.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    suggest.left = Math.max(EDGE, Math.min(r.left + left, vw - LIST_WIDTH - EDGE));
    const below = r.top + top + 4;
    const lineTop = r.top + top - lineHeight;
    if (below + LIST_MAX_HEIGHT > vh - EDGE && lineTop - 4 - LIST_MAX_HEIGHT >= EDGE) {
      suggest.top = undefined;
      suggest.bottom = vh - lineTop + 4;
    } else {
      suggest.top = below;
      suggest.bottom = undefined;
    }
  }

  function update(force = false) {
    const ta = textarea();
    if (!ta) return;
    // The textarea is the live value; the bound text lags one keystroke behind
    const live = ta.value;
    const caret = ta.selectionStart ?? live.length;
    const r = suggestionsAt(live, caret, opts.fields(), { force, t: opts.t });
    Object.assign(suggest, {
      items: r.items,
      active: 0,
      from: r.from,
      to: r.to,
      typed: live.slice(r.from, r.to),
    });
    if (r.items.length) place(ta);
  }

  function accept(i: number) {
    const it = suggest.items[i];
    const ta = textarea();
    if (!it || !ta) return;
    const v = ta.value;
    opts.setText(v.slice(0, suggest.from) + it.insert + v.slice(suggest.to));
    const pos = suggest.from + (CARET_OFFSET[it.insert] ?? it.insert.length);
    close();
    nextTick(() => {
      ta.focus();
      ta.setSelectionRange(pos, pos);
      if (it.insert.endsWith(":")) update();
    });
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.code === "Space") {
      e.preventDefault();
      update(true);
      return;
    }
    if (!suggest.items.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = suggest.items.length;
      suggest.active = (suggest.active + (e.key === "ArrowDown" ? 1 : n - 1)) % n;
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      accept(suggest.active);
    } else if (e.key === "Escape") {
      e.stopPropagation();
      close();
    }
  }

  /** Focus leaving the wrapper closes the list; focus moving inside it keeps it */
  function onFocusout(e: FocusEvent) {
    const next = e.relatedTarget as Node | null;
    if (!next || !opts.wrap.value?.contains(next)) close();
  }

  function onKeyup(e: KeyboardEvent) {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) update();
  }

  return { suggest, update, accept, close, matchLen, onKeydown, onKeyup, onFocusout };
}
