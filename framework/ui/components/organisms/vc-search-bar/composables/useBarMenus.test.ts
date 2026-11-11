import { describe, expect, it } from "vitest";
import { effectScope, nextTick } from "vue";
import { normalizeField } from "../lib/fields";
import { useBarMenus } from "./useBarMenus";

const fields = [
  normalizeField({ id: "status", label: "Status", filter: { options: [{ value: "a", label: "A" }] } }),
  normalizeField({ id: "total", label: "Total", filter: { number: true } }),
];

describe("useBarMenus", () => {
  it("keeps showing a closing menu, and shows the next one once it opens", async () => {
    const scope = effectScope();
    const menus = scope.run(() => useBarMenus({ fields: () => fields }))!;
    const a = document.createElement("button");
    const b = document.createElement("button");

    menus.openEditor("status", a);
    await nextTick();
    expect(menus.shown.value.field?.id).toBe("status");

    menus.closeEditor();
    await nextTick();
    expect(menus.hostOpen.value).toBe(false);
    // the host is fading out: it still shows the editor that closed
    expect(menus.shown.value.field?.id).toBe("status");

    menus.openEditor("total", b);
    await nextTick();
    expect(menus.shown.value.field?.id).toBe("total");

    menus.closeEditor();
    menus.openList("filters", b);
    await nextTick();
    expect(menus.shown.value).toEqual({ field: undefined, list: "filters" });
    scope.stop();
  });
});
