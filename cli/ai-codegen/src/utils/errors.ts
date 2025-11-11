export type ErrorCode =
  | "VALIDATION_ERROR"
  | "COMPONENT_NOT_FOUND"
  | "FILE_NOT_FOUND"
  | "GENERATION_ERROR"
  | "REGISTRY_ERROR"
  | "MCP_ERROR"
  | "NETWORK_ERROR"
  | "CONFIG_ERROR"
  | "UNKNOWN_ERROR";

export interface CodegenErrorOptions {
  code: ErrorCode;
  message: string;
  context?: Record<string, unknown>;
  suggestion?: string;
  cause?: Error;
}

export class CodegenError extends Error {
  public readonly code: ErrorCode;
  public readonly context?: Record<string, unknown>;
  public readonly suggestion?: string;
  public readonly cause?: Error;

  constructor(options: CodegenErrorOptions) {
    super(options.message);
    this.name = "CodegenError";
    this.code = options.code;
    this.context = options.context;
    this.suggestion = options.suggestion;
    this.cause = options.cause;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CodegenError);
    }
  }

  toString(): string {
    let errorMessage = `${this.name} (${this.code}): ${this.message}`;

    if (this.suggestion) {
      errorMessage += `\n\n💡 Suggestion: ${this.suggestion}`;
    }

    if (this.context) {
      errorMessage += `\n\nContext: ${JSON.stringify(this.context, null, 2)}`;
    }

    if (this.cause) {
      errorMessage += `\n\nCaused by: ${this.cause.message}`;
    }

    return errorMessage;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      suggestion: this.suggestion,
      cause: this.cause?.message,
      stack: this.stack,
    };
  }
}

// Helper functions for common error scenarios
export function componentNotFoundError(componentName: string, availableComponents?: string[]): CodegenError {
  return new CodegenError({
    code: "COMPONENT_NOT_FOUND",
    message: `Component "${componentName}" not found in Component Registry`,
    context: { componentName, availableComponents },
    suggestion: availableComponents?.length
      ? `Available components: ${availableComponents.slice(0, 5).join(", ")}${availableComponents.length > 5 ? "..." : ""}`
      : "Check the component name and try again",
  });
}

export function validationError(message: string, errors?: unknown[]): CodegenError {
  return new CodegenError({
    code: "VALIDATION_ERROR",
    message,
    context: { errors },
    suggestion: "Review the validation errors and fix the issues in your UI-Plan",
  });
}

export function fileNotFoundError(filePath: string, suggestion?: string): CodegenError {
  return new CodegenError({
    code: "FILE_NOT_FOUND",
    message: `File not found: ${filePath}`,
    context: { filePath },
    suggestion: suggestion || "Make sure the file path is correct and the file exists",
  });
}

export function generationError(message: string, context?: Record<string, unknown>): CodegenError {
  return new CodegenError({
    code: "GENERATION_ERROR",
    message,
    context,
    suggestion: "Check the UI-Plan structure and component configuration",
  });
}

export function registryError(message: string, context?: Record<string, unknown>): CodegenError {
  return new CodegenError({
    code: "REGISTRY_ERROR",
    message,
    context,
    suggestion: "Check the Component Registry configuration and try again",
  });
}

export function mcpError(message: string, context?: Record<string, unknown>): CodegenError {
  return new CodegenError({
    code: "MCP_ERROR",
    message,
    context,
    suggestion: "Check the MCP server configuration and connection",
  });
}

export function configError(message: string, suggestion?: string): CodegenError {
  return new CodegenError({
    code: "CONFIG_ERROR",
    message,
    suggestion: suggestion || "Check your configuration file and try again",
  });
}

