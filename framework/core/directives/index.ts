export * from "@core/directives/autofocus";
export * from "@core/directives/loading";

// Vue auto-register aliases: `const vLoading = ...` in <script setup> → `v-loading` in templates
export { autofocus as vAutofocus } from "@core/directives/autofocus";
export { loading as vLoading } from "@core/directives/loading";
