// useColumnWidthEngine.ts

/**
 * Weight-based column width engine.
 *
 * Pure functions — no Vue reactivity. Fully deterministic:
 * same input always produces same output with exact integer sum.
 */

export interface ColumnSpec {
  weight: number;
  minPx: number;
  maxPx: number;
}

export interface EngineInput {
  availableWidth: number;
  columns: { id: string; spec: ColumnSpec }[];
  mode: "fit" | "gap";
}

export interface EngineOutput {
  widths: Record<string, number>;
  fillerWidth: number;
}

export type ParsedWidth =
  | { type: "px"; desiredPx: number }
  | { type: "percent"; desiredPx: number }
  | { type: "auto"; desiredPx: null };

// ============================================================================
// Core engine
// ============================================================================

export function computeColumnWidths(input: EngineInput): EngineOutput {
  const { availableWidth, columns, mode } = input;

  // Edge cases
  if (availableWidth <= 0 || columns.length === 0) {
    const widths: Record<string, number> = {};
    for (const col of columns) widths[col.id] = 0;
    return { widths, fillerWidth: columns.length === 0 ? Math.max(0, availableWidth) : 0 };
  }

  // Step 1: Desired px from weights
  const desired = columns.map((col) => col.spec.weight * availableWidth);

  // Step 2: Clamp pass
  const clamped = columns.map((col, i) => Math.max(col.spec.minPx, Math.min(desired[i], col.spec.maxPx)));

  // Step 3: Delta
  let delta = availableWidth - clamped.reduce((s, w) => s + w, 0);

  // Step 4: Gap mode — positive delta becomes filler
  if (mode === "gap" && delta >= 0) {
    return finalize(columns, clamped, delta, availableWidth);
  }

  // Step 5: Grow pass (fit mode, delta > 0)
  if (delta > 0) {
    distributeGrow(columns, clamped, delta);
    delta = availableWidth - clamped.reduce((s, w) => s + w, 0);
  }

  // Step 6: Shrink pass (delta < 0)
  if (delta < 0) {
    distributeShrink(columns, clamped, delta);
    delta = availableWidth - clamped.reduce((s, w) => s + w, 0);
  }

  // Step 7: Crisis — sum(minPx) > available
  if (delta < -0.5) {
    crisisSqueeze(columns, clamped, availableWidth);
    delta = 0;
  }

  return finalize(columns, clamped, 0, availableWidth);
}

function distributeGrow(columns: EngineInput["columns"], clamped: number[], surplus: number): void {
  let remaining = surplus;
  const maxIters = columns.length;

  for (let iter = 0; iter < maxIters && remaining > 0.5; iter++) {
    // Eligible: columns not yet at maxPx
    const eligible: number[] = [];
    let totalCapacity = 0;

    for (let i = 0; i < columns.length; i++) {
      const capacity = columns[i].spec.maxPx - clamped[i];
      if (capacity > 0.5) {
        eligible.push(i);
        totalCapacity += capacity;
      }
    }

    if (eligible.length === 0 || totalCapacity <= 0) break;

    const hasInfinite = !isFinite(totalCapacity);
    let distributed = 0;

    if (hasInfinite) {
      // When some columns have infinite capacity, distribute by weight
      const totalWeight = eligible.reduce((s, idx) => s + columns[idx].spec.weight, 0) || eligible.length;
      for (const idx of eligible) {
        const w = totalWeight > 0 ? columns[idx].spec.weight / totalWeight : 1 / eligible.length;
        const share = w * remaining;
        const capacity = columns[idx].spec.maxPx - clamped[idx];
        const actual = Math.min(share, capacity);
        clamped[idx] += actual;
        distributed += actual;
      }
    } else {
      for (const idx of eligible) {
        const capacity = columns[idx].spec.maxPx - clamped[idx];
        const share = (capacity / totalCapacity) * remaining;
        const actual = Math.min(share, capacity);
        clamped[idx] += actual;
        distributed += actual;
      }
    }
    remaining -= distributed;
  }
}

function distributeShrink(columns: EngineInput["columns"], clamped: number[], deficit: number): void {
  let remaining = Math.abs(deficit);
  const maxIters = columns.length;

  for (let iter = 0; iter < maxIters && remaining > 0.5; iter++) {
    const eligible: number[] = [];
    let totalCapacity = 0;

    for (let i = 0; i < columns.length; i++) {
      const capacity = clamped[i] - columns[i].spec.minPx;
      if (capacity > 0.5) {
        eligible.push(i);
        totalCapacity += capacity;
      }
    }

    if (eligible.length === 0 || totalCapacity <= 0) break;

    let distributed = 0;
    for (const idx of eligible) {
      const capacity = clamped[idx] - columns[idx].spec.minPx;
      const share = (capacity / totalCapacity) * remaining;
      const actual = Math.min(share, capacity);
      clamped[idx] -= actual;
      distributed += actual;
    }
    remaining -= distributed;
  }
}

function crisisSqueeze(columns: EngineInput["columns"], clamped: number[], availableWidth: number): void {
  console.warn(
    `[VcDataTable] Column width crisis: sum(minPx)=${columns.reduce((s, c) => s + c.spec.minPx, 0)}px > availableWidth=${availableWidth}px. Columns will be squeezed below their minimum widths.`,
  );

  // Proportional distribution of available space, ignoring minPx
  const totalWeight = columns.reduce((s, c) => s + c.spec.weight, 0) || columns.length;
  for (let i = 0; i < columns.length; i++) {
    const w = totalWeight > 0 ? columns[i].spec.weight / totalWeight : 1 / columns.length;
    clamped[i] = Math.max(0, w * availableWidth);
  }
}

/**
 * Integer rounding via largest-remainder method.
 * Deterministic tie-break by column order index (lower index wins).
 */
function finalize(
  columns: EngineInput["columns"],
  floats: number[],
  fillerFloat: number,
  availableWidth: number,
): EngineOutput {
  const widths: Record<string, number> = {};

  // Floor all values
  const floored = floats.map((f) => Math.floor(f));
  const remainders = floats.map((f, i) => f - floored[i]);
  const flooredFiller = Math.floor(fillerFloat);

  const total = floored.reduce((s, w) => s + w, 0) + flooredFiller;
  let shortage = availableWidth - total;

  // Build priority list: highest remainder first, ties broken by index (stable)
  const indices = floats.map((_, i) => i);
  indices.sort((a, b) => remainders[b] - remainders[a] || a - b);

  // Also consider filler remainder
  const fillerRemainder = fillerFloat - flooredFiller;
  let fillerWidth = flooredFiller;

  // Distribute remaining pixels, respecting maxPx
  let idxPointer = 0;
  while (shortage > 0) {
    let assigned = false;
    // Try columns in remainder-priority order
    while (idxPointer < indices.length) {
      const ci = indices[idxPointer];
      if (fillerRemainder > remainders[ci] && fillerFloat > 0) break; // filler has higher priority
      // Skip if adding 1px would exceed maxPx
      if (floored[ci] + 1 > columns[ci].spec.maxPx) {
        idxPointer++;
        continue;
      }
      floored[ci] += 1;
      idxPointer++;
      assigned = true;
      break;
    }
    if (!assigned) {
      fillerWidth += 1;
    }
    shortage--;
  }

  for (let i = 0; i < columns.length; i++) {
    widths[columns[i].id] = floored[i];
  }

  return { widths, fillerWidth };
}

// ============================================================================
// Initialization helpers
// ============================================================================

export function parseColumnWidth(value: string | number | undefined, availableWidth: number): ParsedWidth {
  if (value === undefined || value === null || value === "") {
    return { type: "auto", desiredPx: null };
  }

  if (typeof value === "number") {
    return { type: "px", desiredPx: value };
  }

  const trimmed = value.trim();

  // Percentage: "20%"
  if (trimmed.endsWith("%")) {
    const pct = parseFloat(trimmed) / 100;
    return { type: "percent", desiredPx: pct * availableWidth };
  }

  // Pixel: "200px" or "200"
  const pxMatch = trimmed.match(/^(\d+(?:\.\d+)?)(px)?$/);
  if (pxMatch) {
    return { type: "px", desiredPx: parseFloat(pxMatch[1]) };
  }

  // Unrecognized CSS value (e.g. "10rem") — treat as auto
  return { type: "auto", desiredPx: null };
}

export function buildInitialWeights(
  parsed: { id: string; parsed: ParsedWidth }[],
  availableWidth: number,
): Record<string, number> {
  if (availableWidth <= 0 || parsed.length === 0) {
    const weights: Record<string, number> = {};
    const equal = parsed.length > 0 ? 1 / parsed.length : 0;
    for (const p of parsed) weights[p.id] = equal;
    return weights;
  }

  // Compute desired px for each column
  let fixedSum = 0;
  const autoIds: string[] = [];
  const desiredMap: Record<string, number> = {};

  for (const { id, parsed: p } of parsed) {
    if (p.desiredPx !== null) {
      desiredMap[id] = p.desiredPx;
      fixedSum += p.desiredPx;
    } else {
      autoIds.push(id);
    }
  }

  // Auto columns split the remaining space equally
  const remaining = Math.max(0, availableWidth - fixedSum);
  const autoShare = autoIds.length > 0 ? remaining / autoIds.length : 0;
  for (const id of autoIds) {
    desiredMap[id] = autoShare;
  }

  // Convert to weights (normalize to sum=1)
  const total = Object.values(desiredMap).reduce((s, v) => s + v, 0);
  const weights: Record<string, number> = {};
  for (const { id } of parsed) {
    weights[id] = total > 0 ? desiredMap[id] / total : 1 / parsed.length;
  }

  return weights;
}

export function normalizeWeights(specs: Record<string, ColumnSpec>, visibleIds: string[]): void {
  const total = visibleIds.reduce((s, id) => s + (specs[id]?.weight ?? 0), 0);
  if (total <= 0) {
    const equal = 1 / visibleIds.length;
    for (const id of visibleIds) {
      if (specs[id]) specs[id].weight = equal;
    }
    return;
  }
  for (const id of visibleIds) {
    if (specs[id]) specs[id].weight = specs[id].weight / total;
  }
}
