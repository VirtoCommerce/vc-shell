import { describe, it, expect } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { useChipOverflow } from "./useChipOverflow";

function sized(width: number, attr: string): HTMLElement {
  const el = document.createElement("span");
  el.setAttribute(attr, "");
  el.getBoundingClientRect = () => ({ width }) as DOMRect;
  return el;
}

function layer(chips: number[], button = 80): HTMLElement {
  const el = document.createElement("div");
  chips.forEach((w) => el.append(sized(w, "data-chip")));
  el.append(sized(button, "data-fixed"));
  return el;
}

async function run(chips: number[], width: number, enabled = true) {
  const measure = ref<HTMLElement | undefined>(layer(chips));
  const w = ref(width);
  const scope = effectScope();
  const api = scope.run(() => useChipOverflow({ measure, width: w, enabled: () => enabled, keys: () => "k" }))!;
  await nextTick();
  await nextTick();
  return { ...api, w, scope };
}

describe("useChipOverflow", () => {
  // available at 1000: 1000 - 220 - 6 - 5 - 6 - (80 + 6) = 677
  it("shows every chip when all fit", async () => {
    const { visibleCount, scope } = await run([200, 200, 200], 1000);
    expect(visibleCount.value).toBe(3);
    scope.stop();
  });

  it("reserves room for +N when they do not all fit", async () => {
    // 4 x 160 + 3 gaps = 658 fits 677 only without +N: with +N (631) three fit
    const { visibleCount, scope } = await run([160, 160, 160, 160, 160], 1000);
    expect(visibleCount.value).toBe(3);
    scope.stop();
  });

  it("keeps at least 200px for the search in a narrow row", async () => {
    // 720: 720 - 200 - 103 = 417 for chips
    const { visibleCount, scope } = await run([200, 200, 200], 720);
    expect(visibleCount.value).toBe(1);
    scope.stop();
  });

  it("measures again when the width changes", async () => {
    const { visibleCount, w, scope } = await run([300, 300, 300], 800);
    expect(visibleCount.value).toBe(1);
    w.value = 2000;
    await nextTick();
    await nextTick();
    expect(visibleCount.value).toBe(3);
    scope.stop();
  });

  it("shows everything when disabled", async () => {
    const { visibleCount, scope } = await run([500, 500], 800, false);
    expect(visibleCount.value).toBe(Infinity);
    scope.stop();
  });
});
