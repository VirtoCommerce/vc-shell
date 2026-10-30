export type Severity = "info" | "warning" | "error" | "critical";

export const SEVERITY_DOT_VARIANT: Record<Severity, "danger" | "warning" | "info"> = {
  info: "info",
  warning: "warning",
  error: "danger",
  critical: "danger",
};
