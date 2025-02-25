export const template = `
<page :args="args" :context="context" :additionalSource="additionalSource" @update:modelValue="(val) => Object.assign(context.item, val)" />
`;

export const templateWithVisibilityToggle = `
<VcButton @click="toggle" class="tw-mb-4" outline small variant="danger">Toggle visibility</VcButton>
${template}
`;
