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

  // Handle Axios-style errors, which are instances of Error but have a `response` property.
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

  // Handle plain objects, which are likely API responses.
  if (typeof errorToParse === "object" && errorToParse !== null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorObject = errorToParse as Record<string, any>;

    // Check if it conforms to the expected API error response structure.
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
