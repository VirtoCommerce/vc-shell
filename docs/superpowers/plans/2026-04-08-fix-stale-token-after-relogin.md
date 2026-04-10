# Fix Stale Token After Logout/Re-Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the bug where, after a user logs out and logs back in with a different account, the embedded OZ chatbot iframe continues using the previous user's access token.

**Architecture:** The fix is a single-watcher expansion in `ai-agent-service.ts`. The existing watcher tracks blade/items changes to send `UPDATE_CONTEXT` to the iframe. It must also track user changes to send `INIT_CONTEXT` (full re-initialization with fresh token and userId). A `lastUserId` ref avoids reliance on Vue's `oldVal` behavior with deep watchers.

**Tech Stack:** Vue 3.4, TypeScript, Vitest

---

## Research & Root Cause

### Token Flow (normal operation)

```
vendor-portal (Vue host app)
  └─ @vc-shell/framework
       └─ VcAiAgentPanel (component)
            └─ createAiAgentService() ← orchestrates everything
                 ├─ contextManager.buildInitPayload()   ← calls tokenGetter() to get fresh token
                 ├─ contextManager.buildUpdatePayload()  ← calls tokenGetter() to get fresh token
                 └─ transport.sendToIframe({ type: "INIT_CONTEXT" | "UPDATE_CONTEXT", payload })
                      └─ iframe postMessage
                           └─ virto-oz-assistant (React)
                                └─ usePostMessage → useChatContext → accessTokenRef.current = token
```

### How tokens reach the chatbot

1. **On iframe load**: Chat sends `CHAT_READY` → host responds with `INIT_CONTEXT` containing `accessToken` (fetched fresh via `tokenGetter()`).
2. **On blade/items change**: Vue watcher fires → host sends `UPDATE_CONTEXT` containing `accessToken` (fetched fresh via `tokenGetter()`).
3. **On every API call**: OZ frontend reads `accessTokenRef.current` and passes it as `Authorization: Bearer` header.

### The bug

**File:** `framework/core/plugins/ai-agent/services/ai-agent-service.ts`, line 140.

The Vue watcher that sends `UPDATE_CONTEXT` only watches `currentBlade` and `items`:

```typescript
// Line 138-153 (CURRENT — BUGGY)
watch(
  () => ({ currentBlade: context.value.currentBlade, items: context.value.items }),
  //       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //       Missing: context.value.user — user changes don't trigger the watcher
  async () => {
    // ...sends UPDATE_CONTEXT with fresh token from tokenGetter()...
  },
  { deep: true },
);
```

The `context` computed (line 102-106) includes `user`, `currentBlade`, and `items` — but the watcher destructures only two of three:

```typescript
const context = computed<IAiAgentContext>(() => ({
  user: userGetter(),           // ← present in computed
  currentBlade: bladeGetter(),  // ← watched
  items: contextManager.contextItems.value,  // ← watched
}));
```

**After logout + re-login with different account:**
1. `userGetter()` returns new user (different `id`, and `tokenGetter()` would return new token)
2. The `context` computed updates (user property changes)
3. **The watcher does NOT fire** (it only watches `currentBlade` + `items`)
4. No `UPDATE_CONTEXT` is sent → iframe keeps old token in `accessTokenRef`
5. All subsequent API calls use the stale token

### Why INIT_CONTEXT (not UPDATE_CONTEXT) on user change

When the user changes, a full re-initialization is appropriate:
- `IInitContextPayload` includes `userId` — the chatbot needs the new user identity
- `IUpdateContextPayload` does NOT include `userId` — it's designed for incremental context changes
- The OZ frontend `initContext()` resets all state including userId, locale, blade
- A user change is a session-level event, not an incremental context update

### Behavior matrix after fix

| Change | Panel open | Panel closed (initialized) | Panel closed (not initialized) |
|--------|-----------|---------------------------|-------------------------------|
| User changes | Send `INIT_CONTEXT` | Send `INIT_CONTEXT` | No-op (INIT_CONTEXT will be sent on next CHAT_READY) |
| Blade/items change | Send `UPDATE_CONTEXT` | No-op (current behavior) | No-op |

User change sends `INIT_CONTEXT` regardless of panel visibility because:
- The iframe persists when panel is closed (just hidden via CSS)
- Token staleness is a security concern that must be resolved immediately
- When panel re-opens, user expects it to work with current account

---

## File Structure

```
framework/core/plugins/ai-agent/services/
  ai-agent-service.ts       # MODIFY — expand watcher to include user, add lastUserId tracking
  ai-agent-service.test.ts  # MODIFY — add tests for user change scenarios
```

---

### Task 1: Write failing tests for user change scenarios

**Files:**
- Modify: `framework/core/plugins/ai-agent/services/ai-agent-service.test.ts`

The existing test setup uses a static `userGetter` — 3 surgical edits make it mutable so we can simulate user changes.

- [ ] **Step 1: Make `userGetter` mutable (line 16)**

Replace the static getter with a `let` variable + dynamic getter:

```typescript
// BEFORE (line 16):
  const userGetter = () => ({ id: "user-1", userName: "admin" });

// AFTER:
  let currentUser: { id: string; userName: string } | undefined = { id: "user-1", userName: "admin" };
  const userGetter = () => currentUser;
```

- [ ] **Step 2: Reset `currentUser` in `beforeEach` (line 26, inside the existing `beforeEach`)**

Add as the first line inside `beforeEach`:

```typescript
  beforeEach(() => {
    vi.useFakeTimers();
    currentUser = { id: "user-1", userName: "admin" };  // ← ADD THIS LINE
```

This ensures each test starts with a known user, even after tests that mutate `currentUser`.

- [ ] **Step 3: Append 2 new tests (after the last `it` block, before the closing `});`)**

```typescript
  it("sends INIT_CONTEXT when user changes while panel is open", async () => {
    // Initialize: trigger CHAT_READY
    window.dispatchEvent(new MessageEvent("message", { data: { type: "CHAT_READY" } }));
    await flushPromises();

    service.openPanel();
    await nextTick();
    postMessageSpy.mockClear();

    // Simulate logout + re-login with different user
    currentUser = { id: "user-2", userName: "other-seller" };
    await nextTick();
    await flushPromises();

    const initCall = postMessageSpy.mock.calls.find((call) => call[0]?.type === "INIT_CONTEXT");
    expect(initCall).toBeDefined();
    expect(initCall![0].payload).toEqual(
      expect.objectContaining({
        userId: "user-2",
        accessToken: "token-123",
      }),
    );
  });

  it("sends INIT_CONTEXT when user changes even if panel is closed", async () => {
    // Initialize: trigger CHAT_READY (sets isInitialized)
    window.dispatchEvent(new MessageEvent("message", { data: { type: "CHAT_READY" } }));
    await flushPromises();
    // Panel stays closed
    postMessageSpy.mockClear();

    // Simulate logout + re-login with different user
    currentUser = { id: "user-2", userName: "other-seller" };
    await nextTick();
    await flushPromises();

    const initCall = postMessageSpy.mock.calls.find((call) => call[0]?.type === "INIT_CONTEXT");
    expect(initCall).toBeDefined();
    expect(initCall![0].payload.userId).toBe("user-2");
  });
```

- [ ] **Step 2: Run tests to verify the new tests fail**

Run: `cd /mnt/Programming/Marketplace/vc-shell && yarn test:unit -- --run framework/core/plugins/ai-agent/services/ai-agent-service.test.ts`

Expected: The two new tests fail (watcher doesn't detect user changes). The four existing tests pass.

---

### Task 2: Fix the watcher to detect user changes

**Files:**
- Modify: `framework/core/plugins/ai-agent/services/ai-agent-service.ts`

2 surgical edits. The callback body for the embedded path stays untouched.

`context` is a computed that returns a fresh `{}` each time, so `oldValue`/`newValue` are distinct references — safe to compare `user?.id` directly. No extra ref needed.

- [ ] **Step 1: Simplify watcher source (line 139-140)**

Vue watches computed refs directly — no getter wrapper needed. `context` already includes `user`, `currentBlade`, and `items`.

```typescript
// BEFORE (lines 139-140):
  watch(
    () => ({ currentBlade: context.value.currentBlade, items: context.value.items }),
    async () => {

// AFTER:
  watch(
    context,
    async (newContext, oldContext) => {
```

- [ ] **Step 2: Replace the normal-mode condition in the callback (lines 147-150)**

```typescript
// BEFORE (line 147):
      if (panel.isOpen.value && panel.isInitialized.value && transport.iframeRef.value?.contentWindow) {

// AFTER:
      if (!panel.isInitialized.value || !transport.iframeRef.value?.contentWindow) {
        return;
      }

      if (newContext.user?.id !== oldContext?.user?.id) {
        const payload = await contextManager.buildInitPayload();
        transport.sendToIframe({ type: "INIT_CONTEXT", payload });
      } else if (panel.isOpen.value) {
```

The existing `buildUpdatePayload` + `sendToIframe(UPDATE_CONTEXT)` lines inside the `if` stay as-is.

- [ ] **Step 2: Run tests to verify all pass**

Run: `cd /mnt/Programming/Marketplace/vc-shell && yarn test:unit -- --run framework/core/plugins/ai-agent/services/ai-agent-service.test.ts`

Expected: All 6 tests pass.

- [ ] **Step 3: Run full AI agent test suite**

Run: `cd /mnt/Programming/Marketplace/vc-shell && yarn test:unit -- --run framework/core/plugins/ai-agent/`

Expected: All tests pass (including `useAiAgent.test.ts` and `useAiAgentContext.test.ts`).

---

### Task 3: Lint check and commit

- [ ] **Step 1: Run lint on changed files**

Run: `cd /mnt/Programming/Marketplace/vc-shell && yarn lint -- 'framework/core/plugins/ai-agent/services/ai-agent-service.ts' 'framework/core/plugins/ai-agent/services/ai-agent-service.test.ts'`

Expected: No errors.

- [ ] **Step 2: Commit**

```bash
cd /mnt/Programming/Marketplace/vc-shell
git add framework/core/plugins/ai-agent/services/ai-agent-service.ts framework/core/plugins/ai-agent/services/ai-agent-service.test.ts
git commit -m "fix(ai-agent): send INIT_CONTEXT on user change to prevent stale token after re-login

The context change watcher only tracked blade/items, not user changes.
After logout + re-login with a different account, the iframe kept
the previous user's token because no UPDATE_CONTEXT was sent.

Now the watcher also tracks user identity. When the user changes,
it sends INIT_CONTEXT (full re-init with userId + fresh token)
regardless of panel visibility."
```
