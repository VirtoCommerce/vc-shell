import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref, effectScope, nextTick, type EffectScope } from "vue";

// Module-scope mocks. vi.mock factories are lazy: they execute on first import
// resolution of the mocked module, by which point these consts are initialized.
// Real refs are required because the composable calls `watch(platformLocale, …)`
// — a plain `{ value }` object would not trigger the watcher.
const platformLocaleRef = ref<string>("");
const currentLocaleRef = ref<string>("en");
const setLocaleSpy = vi.fn();

vi.mock("@vueuse/core", () => ({
  useLocalStorage: vi.fn((key: string) => {
    if (key === "NG_TRANSLATE_LANG_KEY") return platformLocaleRef;
    throw new Error(`Unexpected useLocalStorage key: ${key}`);
  }),
}));

vi.mock("@core/composables/useLanguages", () => ({
  useLanguages: () => ({
    setLocale: setLocaleSpy,
    currentLocale: currentLocaleRef,
  }),
}));

import { usePlatformLocaleSync } from "./index";

const activeScopes = new Set<EffectScope>();

function runInScope(fn: () => void) {
  const scope = effectScope();
  activeScopes.add(scope);
  scope.run(fn);
  return scope;
}

describe("usePlatformLocaleSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    platformLocaleRef.value = "";
    currentLocaleRef.value = "en";
  });

  afterEach(() => {
    // Stop all scopes created in the test so their watchers don't leak into
    // subsequent tests via the shared module-scope refs.
    for (const scope of activeScopes) scope.stop();
    activeScopes.clear();
  });

  it("applies the initial NG_TRANSLATE_LANG_KEY value on setup", () => {
    platformLocaleRef.value = "ru";

    runInScope(() => usePlatformLocaleSync());

    expect(setLocaleSpy).toHaveBeenCalledTimes(1);
    expect(setLocaleSpy).toHaveBeenCalledWith("ru");
  });

  it("is a no-op when the initial NG_TRANSLATE_LANG_KEY is empty", () => {
    platformLocaleRef.value = "";

    runInScope(() => usePlatformLocaleSync());

    expect(setLocaleSpy).not.toHaveBeenCalled();
  });

  it("applies a new NG_TRANSLATE_LANG_KEY value when the ref updates", async () => {
    platformLocaleRef.value = "";
    runInScope(() => usePlatformLocaleSync());
    expect(setLocaleSpy).not.toHaveBeenCalled();

    platformLocaleRef.value = "de-de";
    await nextTick();

    expect(setLocaleSpy).toHaveBeenCalledTimes(1);
    expect(setLocaleSpy).toHaveBeenCalledWith("de-de");
  });

  it("skips redundant setLocale when the new value equals currentLocale", () => {
    currentLocaleRef.value = "ru";
    platformLocaleRef.value = "ru";

    runInScope(() => usePlatformLocaleSync());

    expect(setLocaleSpy).not.toHaveBeenCalled();
  });

  it("does not call setLocale when the platform clears NG_TRANSLATE_LANG_KEY", async () => {
    platformLocaleRef.value = "fr";
    runInScope(() => usePlatformLocaleSync());
    expect(setLocaleSpy).toHaveBeenCalledWith("fr");
    setLocaleSpy.mockClear();

    platformLocaleRef.value = "";
    await nextTick();

    expect(setLocaleSpy).not.toHaveBeenCalled();
  });
});
