import type { Decorator } from "@storybook/vue3-vite";
import type { GlobalTypes } from "storybook/internal/types";
import { useLanguages, useTheme } from "@vc-shell/framework";
import * as frameworkLocales from "@locales/index";

/**
 * Toolbar: theme, interface language, text direction.
 *
 * Language does two things, because vc-shell takes them from two places:
 * - texts and <html lang/dir> follow the app language (useLanguages().setLocale);
 * - dates, numbers and money follow the BROWSER locale (`navigator.language`), by design:
 *   regional format is the user's, not the app's. The story iframe pretends its browser
 *   is set to the chosen language, so a German preview shows German formats too.
 */

// Every language the framework ships texts for, labelled in its own language ("Deutsch", "العربية").
const localeItems = Object.keys(frameworkLocales)
  .sort()
  .map((code) => ({
    value: code,
    title: new Intl.DisplayNames([code], { type: "language" }).of(code) ?? code,
    right: code,
  }));

export const globalTypes: GlobalTypes = {
  theme: {
    description: "Global theme for components",
    toolbar: { title: "Theme", icon: "circlehollow", items: ["light", "dark"], dynamicTitle: true },
  },
  locale: {
    description: "Interface language and browser locale. Arabic and Hebrew also switch the page to right-to-left.",
    toolbar: { title: "Language", icon: "globe", items: localeItems, dynamicTitle: true },
  },
  direction: {
    description:
      "Text direction. Auto follows the language; LTR/RTL force it, e.g. to check an RTL layout with English text.",
    toolbar: {
      title: "Direction",
      icon: "transfer",
      items: [
        { value: "auto", title: "Direction: auto" },
        { value: "ltr", title: "Left to right" },
        { value: "rtl", title: "Right to left" },
      ],
      dynamicTitle: true,
    },
  },
};

export const initialGlobals = { theme: "light", locale: "en", direction: "auto" };

// --- Browser locale emulation -------------------------------------------------------------

let emulatedLocale: string | undefined;
if (typeof navigator !== "undefined") {
  const proto = Object.getPrototypeOf(navigator);
  const real = Object.getOwnPropertyDescriptor(proto, "language")?.get;
  const realList = Object.getOwnPropertyDescriptor(proto, "languages")?.get;
  Object.defineProperty(navigator, "language", {
    configurable: true,
    get: () => emulatedLocale ?? real?.call(navigator),
  });
  Object.defineProperty(navigator, "languages", {
    configurable: true,
    get: () => (emulatedLocale ? [emulatedLocale] : realList?.call(navigator)),
  });
}

// --- Stories rendered in their own iframe on a docs page ----------------------------------
// `docs.story.inline: false` (VcDataTable) puts each story in a nested iframe that has its own
// preview and never hears about toolbar changes. It reads the docs page's globals instead and
// reloads when they change. Storybook internals: if they move, nested stories fall back to defaults.

interface PreviewInternals {
  storyStoreValue?: { userGlobals?: { get(): Record<string, unknown> } };
}

function hostPreview(): PreviewInternals | undefined {
  try {
    if (typeof window === "undefined" || window.parent === window) return undefined;
    return (window.parent as unknown as { __STORYBOOK_PREVIEW__?: PreviewInternals }).__STORYBOOK_PREVIEW__;
  } catch {
    return undefined; // cross-origin parent
  }
}

const host = hostPreview();
if (host) {
  try {
    const channel = (
      window.parent as unknown as { __STORYBOOK_ADDONS_CHANNEL__?: { on(e: string, cb: () => void): void } }
    ).__STORYBOOK_ADDONS_CHANNEL__;
    // `updateGlobals` is what the manager sends when a toolbar value changes. Reload on the next
    // tick, once the docs page has applied it, so the reloaded story reads the new values.
    channel?.on("updateGlobals", () => setTimeout(() => window.location.reload(), 50));
  } catch {
    // no live updates; the iframe still picks up the globals on its next load
  }
}

function effectiveGlobals(own: Record<string, unknown>): Record<string, unknown> {
  try {
    return { ...own, ...(host?.storyStoreValue?.userGlobals?.get() ?? {}) };
  } catch {
    return own;
  }
}

// --- Decorator ----------------------------------------------------------------------------

export const withGlobals: Decorator = (story, context) => {
  const globals = effectiveGlobals(context.globals);
  const theme = (globals.theme as string) || "light";
  const locale = (globals.locale as string) || "en";
  const direction = (globals.direction as string) || "auto";

  // Before the story mounts: components read navigator.language in setup().
  emulatedLocale = locale;

  return {
    components: { story },
    template: "<div><story /></div>",
    setup() {
      useTheme().setTheme(theme);
      // setLocale also sets <html lang> and <html dir>, which vc-shell's styles and
      // useTextDirection follow. A forced direction is applied after it.
      useLanguages().setLocale(locale);
      if (direction !== "auto") document.documentElement.setAttribute("dir", direction);
    },
  };
};
