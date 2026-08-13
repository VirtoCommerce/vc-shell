// A custom error class to normalize different error types for display.
export class DisplayableError extends Error {
  details: string;
  originalError: unknown;

  constructor(shortMessage: string, details: string, originalError: unknown) {
    super(shortMessage);
    this.name = "DisplayableError";
    this.details = details;
    this.originalError = originalError;
  }
}
/**
 * An NSwag `ApiException`: an `Error` carrying the HTTP status plus the raw body as a string.
 * Matched structurally rather than by class, since the class lives in each generated client.
 */
type ApiExceptionLike = Error & { status: number; response: string };

function isApiExceptionWithStringBody(e: unknown): e is ApiExceptionLike {
  return (
    e instanceof Error &&
    typeof (e as { status?: unknown }).status === "number" &&
    typeof (e as { response?: unknown }).response === "string"
  );
}

// TODO: add to docs?
/**
 * Parses an unknown error type into a standardized DisplayableError.
 * This function handles nested errors, API responses, and various error formats.
 * @param errorToParse The error to analyze.
 * @returns A DisplayableError instance.
 */
export function parseError(errorToParse: unknown): DisplayableError {
  if (errorToParse instanceof DisplayableError) {
    return errorToParse;
  }

  // This is the ONLY error shape this framework's own API layer produces — see `ApiException`
  // in core/api/platform.ts. It must therefore be matched before the generic `response` branch
  // below, which handled it wrongly: `response` is a raw body STRING, so that branch recursed
  // into the string branch and a body that is not JSON (an ASP.NET developer exception page, an
  // HTML error page from a proxy) became the entire short `message` — which modules and
  // `useAsync` render straight to the user (VCST-5663).
  //
  // A JSON body is delegated unchanged, so the platform's own message still wins.
  if (isApiExceptionWithStringBody(errorToParse)) {
    const { status, response } = errorToParse;
    try {
      return parseError(JSON.parse(response));
    } catch {
      const statusLine = `${status}: ${errorToParse.message || "Error"}`; // TODO: i18n
      return new DisplayableError(statusLine, response || errorToParse.message, errorToParse);
    }
  }

  // An Error wrapping a response OBJECT. Nothing in this repo produces that shape — it was
  // written for Axios, which is not a dependency here and is imported nowhere (it reaches
  // yarn.lock only transitively, via @module-federation/dts-plugin and @vueuse/integrations).
  // Believing otherwise is what let the real shape above fall through for so long.
  //
  // Kept because `parseError` is public API and a consuming module may use its own HTTP client.
  // Do not treat it as the path our own API errors take.
  if (errorToParse instanceof Error && "response" in errorToParse && errorToParse.response) {
    // Delegate to parse the nested response object.
    return parseError(errorToParse.response);
  }

  // Handle standard Error objects.
  if (errorToParse instanceof Error) {
    return new DisplayableError(errorToParse.message, errorToParse.stack || String(errorToParse), errorToParse);
  }

  // Handle strings, which might be JSON.
  if (typeof errorToParse === "string") {
    try {
      const parsed = JSON.parse(errorToParse);
      return parseError(parsed);
    } catch {
      // Not a JSON string, treat as a plain message.
      return new DisplayableError(errorToParse, errorToParse, errorToParse);
    }
  }

  // Handle plain objects.
  if (typeof errorToParse === "object" && errorToParse !== null) {
    const errorObject = errorToParse as Record<string, any>;

    // `{ status, statusText, data }` — also not a shape this repo produces (same Axios
    // assumption as the `response` branch above); reachable only when a caller hands
    // `parseError` such an object itself. Our own API errors are handled at the top.
    if ("status" in errorObject && "data" in errorObject) {
      const status = errorObject.status;
      const statusText = errorObject.statusText || "Error"; // TODO: i18n
      const shortMessage = `${status}: ${statusText}`;

      const data = errorObject.data;
      let details = "";

      if (data) {
        if (typeof data.exceptionMessage === "string") {
          details = data.exceptionMessage;
        } else if (typeof data.message === "string") {
          details = data.message;
        } else if (Array.isArray(data.errors)) {
          details = data.errors.join("\n");
        } else if (typeof data === "string") {
          details = data;
        } else {
          details = JSON.stringify(data, null, 2);
        }
      } else {
        // Fallback if data is null/undefined.
        details = JSON.stringify(errorObject, null, 2);
      }

      return new DisplayableError(shortMessage, details, errorToParse);
    }

    // Fallback for other object structures.
    const shortMessage = (errorObject.message as string) || "An unexpected error occurred.";
    const details = (errorObject.stack as string) || JSON.stringify(errorObject, null, 2);
    return new DisplayableError(shortMessage, details, errorToParse);
  }

  // Fallback for any other type (null, number, etc.).
  return new DisplayableError("An unknown error occurred.", String(errorToParse), errorToParse);
}
