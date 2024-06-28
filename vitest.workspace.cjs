import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./apps/vendor-portal/src/modules/vite.config.mts",
  "./apps/vendor-portal/src/modules/dist/types/vite.config.d.mts",
  "./apps/vendor-portal/vitest.config.mts"
])
