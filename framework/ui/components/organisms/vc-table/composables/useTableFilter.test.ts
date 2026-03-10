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

  it("updateFilter with empty string clears the field from the payload (empty values excluded)", () => {
    const onFilterChange = vi.fn();
    const { updateFilter } = useFilterState({ onFilterChange });

    updateFilter("name", "Alice");
    expect(onFilterChange).toHaveBeenLastCalledWith({ name: "Alice" });

    // Setting to empty string — isValueEmpty() returns true, field excluded from payload
    updateFilter("name", "");
    expect(onFilterChange).toHaveBeenLastCalledWith({});
  });

  it("multiple updateFilter calls accumulate all fields in the payload", () => {
    const onFilterChange = vi.fn();
    const { updateFilter } = useFilterState({ onFilterChange });

    updateFilter("name", "Alice");
    updateFilter("status", "active");
    updateFilter("email", "alice@example.com");

    expect(onFilterChange).toHaveBeenLastCalledWith({
      name: "Alice",
      status: "active",
      email: "alice@example.com",
    });
    expect(onFilterChange).toHaveBeenCalledTimes(3);
  });

  it("clearFilter on a non-existent key is a no-op and does not throw", () => {
    const onFilterChange = vi.fn();
    const { updateFilter, clearFilter } = useFilterState({ onFilterChange });

    updateFilter("name", "Alice");
    onFilterChange.mockClear();

    // Clear a key that was never set — should not throw
    expect(() => clearFilter("nonExistentKey")).not.toThrow();

    // onFilterChange still called with current state (unchanged)
    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onFilterChange).toHaveBeenLastCalledWith({ name: "Alice" });
  });
});
