export class CLIError extends Error {
  public readonly exitCode: number;

  constructor(message: string, exitCode = 1) {
    super(message);
    this.name = "CLIError";
    this.exitCode = exitCode;
  }
}

export class ValidationError extends CLIError {
  public readonly issues: string[];

  constructor(issues: string[]) {
    super("Validation failed", 1);
    this.name = "ValidationError";
    this.issues = issues;
  }
}

export class UserCancelledError extends CLIError {
  constructor() {
    super("Operation cancelled by user", 0);
    this.name = "UserCancelledError";
  }
}

