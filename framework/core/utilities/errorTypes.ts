/**
 * Base error class for VC-Shell framework
 * Provides structured error handling with error codes and context
 */
export class FrameworkError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "FrameworkError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FrameworkError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends FrameworkError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", context);
    this.name = "ValidationError";
  }
}

/**
 * Error thrown when a service operation fails
 */
export class ServiceError extends FrameworkError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "SERVICE_ERROR", context);
    this.name = "ServiceError";
  }
}

/**
 * Error thrown when a required dependency is not provided
 */
export class InjectionError extends FrameworkError {
  constructor(serviceName: string, context?: Record<string, unknown>) {
    super(`${serviceName} not provided. Make sure to call the corresponding 'provide' function.`, "INJECTION_ERROR", {
      serviceName,
      ...context,
    });
    this.name = "InjectionError";
  }
}

/**
 * Error thrown when component registration fails
 */
export class RegistrationError extends FrameworkError {
  constructor(componentName: string, reason: string, context?: Record<string, unknown>) {
    super(`Failed to register '${componentName}': ${reason}`, "REGISTRATION_ERROR", {
      componentName,
      ...context,
    });
    this.name = "RegistrationError";
  }
}

/**
 * Error thrown when a blade operation fails
 */
export class BladeError extends FrameworkError {
  constructor(message: string, bladeId?: string, context?: Record<string, unknown>) {
    super(message, "BLADE_ERROR", {
      bladeId,
      ...context,
    });
    this.name = "BladeError";
  }
}

/**
 * Error thrown when module loading fails
 */
export class ModuleLoadError extends FrameworkError {
  constructor(moduleId: string, reason: string, context?: Record<string, unknown>) {
    super(`Failed to load module '${moduleId}': ${reason}`, "MODULE_LOAD_ERROR", {
      moduleId,
      ...context,
    });
    this.name = "ModuleLoadError";
  }
}

/**
 * Type guard to check if an error is a FrameworkError
 */
export function isFrameworkError(error: unknown): error is FrameworkError {
  return error instanceof FrameworkError;
}

/**
 * Wraps an unknown error into a FrameworkError
 */
export function wrapError(error: unknown, code = "UNKNOWN_ERROR"): FrameworkError {
  if (isFrameworkError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new FrameworkError(error.message, code, {
      originalError: error.name,
      stack: error.stack,
    });
  }

  return new FrameworkError(String(error), code);
}
