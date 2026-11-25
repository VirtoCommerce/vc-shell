/**
 * Thrown by `useBlade().closeChildren()` when the user keeps a child blade open
 * (it has unsaved changes and the user answered "Cancel").
 *
 * The code after `await closeChildren()` usually deletes, moves or reloads the record the
 * child edits, so stopping it is the point: the rejection ends the caller without a check.
 * vc-shell treats it as a cancellation, not a failure: its error handlers show no toast,
 * no blade error banner and log nothing. Catch it with `isBladeCloseCancelled` only to do
 * something on cancel. New code passes the action instead, `closeChildren(action)`, which skips
 * the action without throwing.
 */
export class BladeCloseCancelledError extends Error {
  constructor() {
    super("A child blade was kept open");
    this.name = "BladeCloseCancelledError";
  }
}

/** True for the cancellation `closeChildren()` throws when the user keeps a child blade open. */
export function isBladeCloseCancelled(err: unknown): err is BladeCloseCancelledError {
  return (
    err instanceof BladeCloseCancelledError || (err as { name?: unknown } | null)?.name === "BladeCloseCancelledError"
  );
}
