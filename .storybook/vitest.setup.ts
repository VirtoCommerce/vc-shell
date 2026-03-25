import { afterEach, beforeAll, beforeEach, vi } from "vitest";
import { setProjectAnnotations } from '@storybook/vue3-vite';
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import * as projectAnnotations from './preview';

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
const project = setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);

beforeAll(project.beforeAll);

const RUNTIME_ERROR_PATTERNS = [
  /Unhandled Vue error/i,
  /Unhandled error during execution/i,
  /Unhandled promise rejection/i,
  /Uncaught \(in promise\)/i,
];

function stringifyErrorArg(arg: unknown): string {
  if (arg instanceof Error) {
    return arg.stack ?? arg.message;
  }

  if (typeof arg === "string") {
    return arg;
  }

  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

function shouldFailFromMessage(message: string): boolean {
  return RUNTIME_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

const originalConsoleError = console.error.bind(console);
let consoleErrorSpy: ReturnType<typeof vi.spyOn> | undefined;
let runtimeErrors: string[] = [];
let unhandledRejectionHandler: ((event: PromiseRejectionEvent) => void) | undefined;

beforeEach(() => {
  runtimeErrors = [];

  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    originalConsoleError(...args);
    const message = args.map(stringifyErrorArg).join(" ");

    if (shouldFailFromMessage(message)) {
      runtimeErrors.push(message);
    }
  });

  if (typeof window !== "undefined") {
    unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = stringifyErrorArg(event.reason);
      runtimeErrors.push(`[unhandledrejection] ${reason}`);
    };

    window.addEventListener("unhandledrejection", unhandledRejectionHandler);
  }
});

afterEach(() => {
  if (typeof window !== "undefined" && unhandledRejectionHandler) {
    window.removeEventListener("unhandledrejection", unhandledRejectionHandler);
    unhandledRejectionHandler = undefined;
  }

  consoleErrorSpy?.mockRestore();
  consoleErrorSpy = undefined;

  if (runtimeErrors.length > 0) {
    throw new Error(`[storybook] Runtime errors detected:\n${runtimeErrors.join("\n\n")}`);
  }
});
