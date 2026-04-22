import { ref } from "vue";
import { vi } from "vitest";

export const sharedRouterPushMock = vi.fn();
export const sharedRouteQuery = ref<Record<string, unknown>>({});
export const sharedFormIsValid = ref(true);
export const sharedFormIsDirty = ref(false);
export const sharedValidateFieldMock = vi.fn();
export const sharedDefineRuleMock = vi.fn();

vi.mock("@core/composables", () => ({
  useSettings: () => ({
    uiSettings: ref({}),
    loading: ref(false),
  }),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: sharedRouterPushMock }),
  useRoute: () => ({ query: sharedRouteQuery.value }),
}));

vi.mock("vee-validate", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vee-validate")>();
  return {
    ...actual,
    defineRule: sharedDefineRuleMock,
    useIsFormValid: () => sharedFormIsValid,
    useIsFormDirty: () => sharedFormIsDirty,
    useForm: () => ({
      validateField: sharedValidateFieldMock,
      errors: ref({}),
    }),
    Field: {
      template: "<div><slot v-bind=\"{ field: {}, errorMessage: '', handleChange: () => {}, errors: [] }\" /></div>",
    },
  };
});

export function resetSharedAuthDependencyMocks() {
  sharedRouterPushMock.mockReset();
  sharedRouteQuery.value = {};
  sharedFormIsValid.value = true;
  sharedFormIsDirty.value = false;
  sharedValidateFieldMock.mockReset();
  sharedDefineRuleMock.mockReset();
}
