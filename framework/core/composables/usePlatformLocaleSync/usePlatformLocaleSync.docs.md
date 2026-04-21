# usePlatformLocaleSync

One-way reactive bridge from the VirtoCommerce platform's locale storage key (`NG_TRANSLATE_LANG_KEY`, set by AngularJS + angular-translate) to the shell's language service.

Call this composable only when the shell runs embedded inside the platform — `useShellBootstrap` invokes it automatically when `options.isEmbedded === true`. In standalone mode the shell owns its own locale via `VC_LANGUAGE_SETTINGS`, and this composable should not be used.

## When to Use

- Never call directly from feature code. This is a framework-internal sync primitive.
- It is invoked once per `VcApp` mount from `useShellBootstrap`.

## Behaviour

- Reads `localStorage["NG_TRANSLATE_LANG_KEY"]` via VueUse's `useLocalStorage`, which subscribes to `storage` events for cross-tab reactivity.
- On setup, if the value is non-empty, calls `LanguageService.setLocale(value)`. `setLocale` normalises the value (e.g. `en-US` → `en-us`), falls back to `en` for unsupported locales, updates `vue-i18n`, reconfigures `vee-validate`, and persists to `VC_LANGUAGE_SETTINGS`.
- On subsequent changes of the platform key, re-applies the value.
- Skips empty strings (platform clearing the key does not blank the shell locale).
- Skips values equal to `currentLocale` to avoid redundant re-configuration.

## How It Works

`useLocalStorage("NG_TRANSLATE_LANG_KEY", "")` returns a `Ref<string>` that VueUse keeps in sync with `localStorage` and the DOM `storage` event (which fires in tabs other than the writer). The composable applies the current ref value once synchronously and then registers a `watch` on it; any cross-tab mutation flows through the ref into `setLocale`.

The watcher is bound to the active effect scope (typically `VcApp`'s setup). When `VcApp` unmounts, the watcher stops; `useLocalStorage` cleans up its own `storage` listener.

## Relationship to `VC_LANGUAGE_SETTINGS`

The sync is strictly one-directional. `setLocale` writes to `VC_LANGUAGE_SETTINGS` as a side effect, but this composable never writes to `NG_TRANSLATE_LANG_KEY`. In embedded mode the in-shell `LanguageSelector` is unreachable (it lives inside `UserDropdownButton`, which is hidden when `isEmbedded` is `true`), so there is no competing writer from the shell side.
