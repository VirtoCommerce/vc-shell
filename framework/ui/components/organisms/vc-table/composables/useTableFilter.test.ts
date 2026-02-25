import { describe, expect, it, vi } from "vitest";
import { useFilterState } from "@ui/components/organisms/vc-table/composables/useTableFilter";

describe("useFilterState", () => {
  it("calls onFilterChange with flat payload after every mutation", () => {
    const onFilterChange = vi.fn();
    const { updateFilter, updateRangeFilter, clearFilter, clearAllFilters } = useFilterState({
      onFilterChange,
    });

    updateFilter("name", "Alice");
    expect(onFilterChange).toHaveBeenLastCalledWith({ name: "Alice" });

    updateRangeFilter(["createdFrom", "createdTo"], {
      start: "2026-01-01",
      end: "2026-01-31",
    });
    expect(onFilterChange).toHaveBeenLastCalledWith({
      name: "Alice",
      createdFrom: "2026-01-01",
      createdTo: "2026-01-31",
    });

    clearFilter("name");
    expect(onFilterChange).toHaveBeenLastCalledWith({
      createdFrom: "2026-01-01",
      createdTo: "2026-01-31",
    });

    clearAllFilters();
    expect(onFilterChange).toHaveBeenLastCalledWith({});
  });

  it("clears composite range values when clearing either range field", () => {
    const onFilterChange = vi.fn();
    const { updateRangeFilter, clearFilter } = useFilterState({ onFilterChange });

    updateRangeFilter(["from", "to"], { start: "2026-02-01", end: "2026-02-28" });
    clearFilter("from");

    expect(onFilterChange).toHaveBeenLastCalledWith({});
  });
});
