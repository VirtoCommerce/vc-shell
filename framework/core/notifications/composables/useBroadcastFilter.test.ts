import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSetBroadcastFilter = vi.fn();
const mockClearBroadcastFilter = vi.fn();

vi.mock("./useNotificationStore", () => ({
  useNotificationStore: () => ({
    setBroadcastFilter: mockSetBroadcastFilter,
    clearBroadcastFilter: mockClearBroadcastFilter,
  }),
}));

import { useBroadcastFilter } from "./useBroadcastFilter";

describe("useBroadcastFilter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns setBroadcastFilter and clearBroadcastFilter", () => {
    const result = useBroadcastFilter();
    expect(result).toHaveProperty("setBroadcastFilter");
    expect(result).toHaveProperty("clearBroadcastFilter");
  });

  it("delegates setBroadcastFilter to store", () => {
    const { setBroadcastFilter } = useBroadcastFilter();
    const filter = (msg: any) => msg.creator === "test";
    setBroadcastFilter(filter);
    expect(mockSetBroadcastFilter).toHaveBeenCalledWith(filter);
  });

  it("delegates clearBroadcastFilter to store", () => {
    const { clearBroadcastFilter } = useBroadcastFilter();
    clearBroadcastFilter();
    expect(mockClearBroadcastFilter).toHaveBeenCalled();
  });
});
