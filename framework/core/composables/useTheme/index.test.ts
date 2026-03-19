import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock i18n before importing the composable
vi.mock("@core/plugins/i18n", () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

vi.mock("@core/utilities", () => ({
  createLogger: () => ({
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

// Must import after mocks
import { useTheme } from "./index";

describe("useTheme", () => {
  // The theme registry is module-level state, so tests may affect each other.
  // We test the API surface returned by useTheme().

  it("returns the expected API shape", () => {
    const theme = useTheme();
    expect(theme).toHaveProperty("themes");
    expect(theme).toHaveProperty("currentThemeKey");
    expect(theme).toHaveProperty("currentLocalizedName");
    expect(theme).toHaveProperty("next");
    expect(theme).toHaveProperty("register");
    expect(theme).toHaveProperty("unregister");
    expect(theme).toHaveProperty("setTheme");
  });

  it("has light theme registered by default", () => {
    const theme = useTheme();
    const keys = theme.themes.value.map((t) => t.key);
    expect(keys).toContain("light");
  });

  it("register adds a new theme", () => {
    const theme = useTheme();
    theme.register({ key: "ocean", localizationKey: "CORE.THEMES.OCEAN" });
    const keys = theme.themes.value.map((t) => t.key);
    expect(keys).toContain("ocean");
  });

  it("register is idempotent for same key", () => {
    const theme = useTheme();
    const before = theme.themes.value.length;
    theme.register({ key: "ocean" });
    expect(theme.themes.value.length).toBe(before);
  });

  it("unregister removes a theme", () => {
    const theme = useTheme();
    theme.register({ key: "toremove" });
    expect(theme.themes.value.map((t) => t.key)).toContain("toremove");
    theme.unregister("toremove");
    expect(theme.themes.value.map((t) => t.key)).not.toContain("toremove");
  });

  it("setTheme changes currentThemeKey", () => {
    const theme = useTheme();
    theme.register({ key: "dark", localizationKey: "CORE.THEMES.DARK" });
    theme.setTheme("dark");
    expect(theme.currentThemeKey.value).toBe("dark");
  });

  it("setTheme ignores unregistered theme key", () => {
    const theme = useTheme();
    const before = theme.currentThemeKey.value;
    theme.setTheme("nonexistent");
    expect(theme.currentThemeKey.value).toBe(before);
  });

  it("next cycles to the next theme", () => {
    const theme = useTheme();
    const initial = theme.currentThemeKey.value;
    theme.next();
    // After cycling, it should be a different theme (if >1 registered)
    if (theme.themes.value.length > 1) {
      expect(theme.currentThemeKey.value).not.toBe(initial);
    }
  });

  it("currentLocalizedName returns localization key via t()", () => {
    const theme = useTheme();
    theme.setTheme("light");
    // Our mock t() returns the key as-is
    expect(theme.currentLocalizedName.value).toBe("CORE.THEMES.LIGHT");
  });

  it("register accepts array of themes", () => {
    const theme = useTheme();
    theme.register([
      { key: "sunset" },
      { key: "forest" },
    ]);
    const keys = theme.themes.value.map((t) => t.key);
    expect(keys).toContain("sunset");
    expect(keys).toContain("forest");
  });

  it("unregister accepts array of keys", () => {
    const theme = useTheme();
    theme.register([{ key: "a1" }, { key: "b1" }]);
    theme.unregister(["a1", "b1"]);
    const keys = theme.themes.value.map((t) => t.key);
    expect(keys).not.toContain("a1");
    expect(keys).not.toContain("b1");
  });
});
