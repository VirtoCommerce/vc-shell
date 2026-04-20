/**
 * Mirror of configs/peer-versions.json's `versions` map.
 *
 * Why a mirror, not a direct import: the migrator is a published npm package
 * (@vc-shell/migrate) and its dist/ must be self-contained. The published
 * artifact does not have access to configs/peer-versions.json.
 *
 * Maintenance: when configs/peer-versions.json changes, copy the same keys
 * and values here in the same commit. See spec section "Migration guidance".
 */
export const BASELINE_VERSIONS: Record<string, string> = {
  "@commitlint/cli": "^20.4.1",
  "@commitlint/config-conventional": "^20.4.1",
  "@release-it/conventional-changelog": "^10.0.5",
  "@rollup/plugin-typescript": "^11.1.5",
  "@types/lodash-es": "^4.17.12",
  "@types/node": "^20.10.5",
  "@vitejs/plugin-vue": "^5.2.3",
  "@vue/eslint-config-prettier": "^10.2.0",
  "@vue/eslint-config-typescript": "^14.6.0",
  "@vue/test-utils": "^2.4.6",
  "@vueuse/core": "^10.7.1",
  "@vueuse/integrations": "^10.7.1",
  autoprefixer: "^10.4.16",
  "baseline-browser-mapping": "^2.9.11",
  "conventional-changelog-cli": "^5.0.0",
  "cross-env": "^7.0.3",
  "cypress-signalr-mock": "^1.5.0",
  eslint: "^9.35.0",
  "eslint-plugin-vue": "^10.4.0",
  husky: "^8.0.3",
  jsdom: "^24.1.0",
  "lint-staged": "^15.2.0",
  "lodash-es": "^4.17.21",
  postcss: "^8.4.32",
  prettier: "^3.1.1",
  "release-it": "^19.0.4",
  sass: "^1.87.0",
  semver: "^7.7.4",
  tailwindcss: "^3.4.0",
  typescript: "^5.8.3",
  "vee-validate": "^4.12.4",
  vite: "^6.3.3",
  "vite-plugin-checker": "^0.9.1",
  "vite-plugin-mkcert": "^1.17.1",
  vitest: "^1.6.0",
  vue: "^3.5.30",
  "vue-router": "^5.0.3",
  "vue-router-mock": "^1.1.0",
  "vue-tsc": "^3.2.5",
};
