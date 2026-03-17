/**
 * Wraps a click handler to prevent re-entry while active.
 * The handler receives a `release` callback to unlock — typically called on blade close.
 *
 * Uses a plain boolean (not ref()) because the lock state is purely internal
 * and never bound to reactive templates.
 *
 * @example
 * ```ts
 * onClick: guarded((release) =>
 *   openBlade({ name: "Offers", onClose: release })
 * )
 * ```
 */
export function guarded(handler: (release: () => void) => void): () => void {
  let locked = false;

  return () => {
    if (locked) return;
    locked = true;
    handler(() => {
      if (!locked) return;
      locked = false;
    });
  };
}
