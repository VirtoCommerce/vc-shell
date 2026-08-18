import { describe, expect, it } from "vitest";
import { TimelineDay, TimelineView } from "./vc-scheduler.stories";

describe("VcScheduler stories", () => {
  it("keeps TimelineView on the same stateful renderer as the interactive timeline stories", () => {
    expect(TimelineView.render).toBeTypeOf("function");
    expect(TimelineView.render).toBe(TimelineDay.render);
  });
});
