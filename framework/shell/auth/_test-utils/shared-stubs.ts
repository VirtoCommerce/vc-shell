/**
 * Shared component stubs for auth page tests.
 * Each auth page can spread these and add page-specific stubs.
 */
export const authBaseStubs = {
  VcAuthLayout: { template: "<div><slot /></div>" },
  VcForm: { template: "<div><slot /></div>" },
  VcInput: { template: "<input />" },
  VcButton: { template: "<button @click='$emit(\"click\")'><slot /></button>" },
  VcHint: { template: "<span><slot /></span>" },
  Field: {
    template: '<div><slot v-bind="slotProps" /></div>',
    computed: {
      slotProps() {
        return { field: {}, errorMessage: "", handleChange: () => {}, errors: [] };
      },
    },
  },
};
