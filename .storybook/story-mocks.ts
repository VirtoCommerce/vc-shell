import { computed, onBeforeUnmount, ref } from "vue";
import { useUserManagement } from "../framework/core/composables/useUserManagement";

/**
 * Mocks for stories that talk to the platform API. Docs pages render their stories side by side in
 * one app, so a story never replaces a global: it adds what it needs while it is mounted and the
 * shared piece is restored when the last story using it leaves.
 */

export type FetchHandler = (url: URL, init: RequestInit | undefined) => Promise<Response> | Response | undefined;

const handlers: FetchHandler[] = [];
let realFetch: typeof window.fetch | undefined;

/** Serves the requests `handler` answers (non-undefined) while the calling story is mounted; the newest handler wins. */
export function useStoryFetch(handler: FetchHandler): void {
  if (!realFetch) {
    const real = window.fetch;
    realFetch = real;
    window.fetch = async (input, init) => {
      const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const url = new URL(raw, window.location.origin);
      for (let i = handlers.length - 1; i >= 0; i--) {
        const response = handlers[i](url, init);
        if (response) return response;
      }
      return real(input, init);
    };
  }
  handlers.push(handler);
  onBeforeUnmount(() => {
    handlers.splice(handlers.indexOf(handler), 1);
    if (!handlers.length && realFetch) {
      window.fetch = realFetch;
      realFetch = undefined;
    }
  });
}

export const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/**
 * Signs in a mock user with `permissions` and resolves `ready` once it is loaded.
 * The user is an app-wide singleton: stories shown together on a docs page must ask for the same permissions.
 */
export function useStoryUser(permissions: string[]) {
  useStoryFetch((url) =>
    url.pathname === "/api/platform/security/currentuser"
      ? jsonResponse({ id: "story-user", userName: "story-user", isAdministrator: false, permissions })
      : undefined,
  );
  const ready = ref(false);
  void useUserManagement()
    .loadUser()
    .finally(() => {
      ready.value = true;
    });
  return ready;
}

const popupOwners = ref<symbol[]>([]);

/** True for one mounted story at a time: a popup container per story would show every popup once per story. */
export function useSharedPopupContainer() {
  const token = Symbol("popup-container");
  popupOwners.value = [...popupOwners.value, token];
  onBeforeUnmount(() => {
    popupOwners.value = popupOwners.value.filter((owner) => owner !== token);
  });
  return computed(() => popupOwners.value[0] === token);
}
