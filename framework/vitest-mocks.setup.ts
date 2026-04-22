/**
 * Global mock setup for all framework tests.
 *
 * Centralizes frequently-mocked dependencies so that changing a mock strategy
 * (e.g. vue-i18n async importOriginal pattern) requires editing ONE file
 * instead of 45+.
 *
 * Individual test files can still override these mocks with their own
 * vi.mock() — per-file mocks take precedence over setup-file mocks.
 */
import { vi } from "vitest";
import { ref } from "vue";

// ── vue-i18n ────────────────────────────────────────────────────────────────
// Provides useI18n with identity `t()`, createI18n stub, and locale ref.
// Tests needing custom `t()` behavior (e.g. `te`, `getLocaleMessage`)
// should override with their own vi.mock("vue-i18n", ...).

vi.mock("vue-i18n", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-i18n")>();
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => key,
      locale: ref("en"),
    }),
  };
});

// ── @core/utilities ─────────────────────────────────────────────────────────
// Preserves all real exports but replaces createLogger with a silent stub.
// Tests needing custom utility mocks (e.g. generateId, convertColorNameToHex)
// should override with their own vi.mock("@core/utilities", ...).

vi.mock("@core/utilities", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@core/utilities")>();
  return {
    ...actual,
    createLogger: () => ({
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    }),
  };
});
