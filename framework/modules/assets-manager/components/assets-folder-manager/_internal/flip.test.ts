import { describe, it, expect, vi, afterEach } from "vitest";
import { flip } from "./flip";

function element(rects: { left: number; top: number; width: number; height: number }[]) {
  const el = document.createElement("div");
  document.body.append(el);
  let call = 0;
  el.getBoundingClientRect = () => rects[Math.min(call++, rects.length - 1)] as DOMRect;
  const animation = { cancel: vi.fn() };
  el.animate = vi.fn(() => animation as unknown as Animation);
  return el;
}

describe("flip", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("animates a moved element from its old box to its new one", async () => {
    const el = element([
      { left: 200, top: 0, width: 180, height: 180 },
      { left: 0, top: 200, width: 90, height: 180 },
    ]);
    const change = vi.fn();
    await flip([el], change);
    expect(change).toHaveBeenCalled();
    expect(el.animate).toHaveBeenCalledWith(
      [
        { transformOrigin: "0 0", transform: "translate(200px, -200px) scale(2, 1)" },
        { transformOrigin: "0 0", transform: "none" },
      ],
      expect.objectContaining({ duration: 250 }),
    );
  });

  it("leaves an element that did not move alone", async () => {
    const box = { left: 10, top: 10, width: 100, height: 100 };
    const el = element([box, box]);
    await flip([el], () => {});
    expect(el.animate).not.toHaveBeenCalled();
  });

  it("only applies the change when the user prefers reduced motion", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const el = element([
      { left: 0, top: 0, width: 10, height: 10 },
      { left: 50, top: 0, width: 10, height: 10 },
    ]);
    const change = vi.fn();
    await flip([el], change);
    expect(change).toHaveBeenCalled();
    expect(el.animate).not.toHaveBeenCalled();
  });

  it("cancels a running move before starting the next", async () => {
    const el = element([
      { left: 0, top: 0, width: 10, height: 10 },
      { left: 50, top: 0, width: 10, height: 10 },
      { left: 50, top: 0, width: 10, height: 10 },
      { left: 0, top: 0, width: 10, height: 10 },
    ]);
    await flip([el], () => {});
    const first = vi.mocked(el.animate).mock.results[0].value as { cancel: ReturnType<typeof vi.fn> };
    await flip([el], () => {});
    expect(first.cancel).toHaveBeenCalled();
  });
});
