/**
 * Pattern Validator
 *
 * Validation rules and patterns for ensuring generated code follows VC-Shell standards.
 * These rules are used during code generation and validation to enforce best practices.
 */

export interface ValidationRule {
  id: string;
  category: string;
  severity: 'error' | 'warning';
  description: string;
  pattern?: RegExp;
  examples?: {
    correct: string;
    incorrect: string;
  };
}

/**
 * Pattern validation rules for VC-Shell code generation
 */
export const PATTERN_RULES = {
  // ======================
  // 1. BLADE STRUCTURE
  // ======================
  bladePropsEmits: {
    requiredProps: ['expanded', 'closable', 'param', 'options'],
    requiredEmits: ['close:blade', 'parent:call', 'expand:blade', 'collapse:blade'],
    description: 'Blade components must have standard props and emits structure',
    examples: {
      correct: `
export interface Props {
  expanded?: boolean;
  closable?: boolean;
  param?: string;
  options?: Record<string, unknown>;
}

export interface Emits {
  (event: "parent:call", args: IParentCallArgs): void;
  (event: "close:blade"): void;
  (event: "expand:blade"): void;
  (event: "collapse:blade"): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  closable: true,
});

const emit = defineEmits<Emits>();
`,
      incorrect: `
// Missing standard props/emits
const props = defineProps({
  id: String,
  data: Object
});
`,
    },
  },

  // ======================
  // 2. API CLIENT USAGE
  // ======================
  apiClientPattern: {
    required: ['useApiClient(ClientClass)', 'getApiClient()', 'new CommandObject()'],
    forbidden: ['apiClient.method({ ... })'], // Direct calls forbidden
    description: 'API calls must use useApiClient with proper client instantiation and command objects',
    examples: {
      correct: `
import { useApiClient } from '@vc-shell/framework';
import { VcmpSellerCatalogClient } from '@vcmp-vendor-portal/api/marketplacevendor';

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

async function loadOffers(query: ISearchOffersQuery) {
  const client = await getApiClient();
  const result = await client.searchOffers(new SearchOffersQuery(query));
  return result;
}
`,
      incorrect: `
import { useApiClient } from '@vc-shell/framework';

const apiClient = useApiClient(); // WRONG: Missing client class
const response = await apiClient.searchOffers({ ... }); // WRONG: Direct call without command
`,
    },
  },

  // ======================
  // 3. ASYNC OPERATIONS
  // ======================
  asyncPattern: {
    required: ['useAsync', 'action', 'loading'],
    forbidden: ['loading.value = true', 'loading.value = false'],
    description: 'ALL async operations must use useAsync wrapper, never manual loading state management',
    examples: {
      correct: `
import { useAsync } from '@vc-shell/framework';

const { action: loadOffers, loading: loadOffersLoading } = useAsync<ISearchOffersQuery>(
  async (query) => {
    const client = await getApiClient();
    searchResult.value = await client.searchOffers(new SearchOffersQuery(query));
  }
);

// Use combined loading
const loading = useLoading(loadOffersLoading, deleteOffersLoading);
`,
      incorrect: `
const loading = ref(false); // WRONG: Manual loading state

async function loadOffers(query) {
  loading.value = true; // WRONG: Manual state management
  try {
    const response = await client.search(query);
  } finally {
    loading.value = false; // WRONG
  }
}
`,
    },
  },

  // ======================
  // 4. MODIFICATION TRACKING
  // ======================
  modificationTracking: {
    required: ['useModificationTracker', 'currentValue', 'isModified', 'resetModificationState'],
    description: 'Entity forms must use useModificationTracker for modification state management',
    examples: {
      correct: `
import { useModificationTracker } from '@vc-shell/framework';

const offer = ref<IOffer>(new Offer());

const { currentValue, pristineValue, isModified, resetModificationState } =
  useModificationTracker(offer);

const { action: updateOffer } = useAsync<IOffer>(
  async (details) => {
    const client = await getApiClient();
    currentValue.value = await client.updateOffer(command);
    resetModificationState(); // REQUIRED after save
  }
);

return {
  offer: currentValue, // Return currentValue, not original ref
  modified: isModified, // Return isModified, not manual ref
  resetModificationState,
};
`,
      incorrect: `
const offer = ref<IOffer>({});
const modified = ref(false); // WRONG: Manual modification tracking

async function updateOffer(details) {
  await client.updateOffer(details);
  modified.value = false; // WRONG: Manual reset
}
`,
    },
  },

  // ======================
  // 5. FORM VALIDATION
  // ======================
  formValidation: {
    when: 'input has validation rules',
    required: ['<Field>', 'v-slot="{ errorMessage, handleChange, errors }"', '@update:model-value="handleChange"'],
    optional: 'inputs without validation do NOT need Field wrapper',
    description: 'Form inputs WITH VALIDATION must be wrapped in Field component from vee-validate',
    examples: {
      correct: `
import { Field, useForm } from 'vee-validate';

// ✅ WITH VALIDATION: Use Field wrapper
<Field
  v-slot="{ errorMessage, handleChange, errors }"
  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.NAME.TITLE')"
  :model-value="offer.name"
  name="name"
  rules="required"
>
  <VcInput
    v-model="offer.name"
    required
    :error="!!errors.length"
    :error-message="errorMessage"
    @update:model-value="handleChange"
  />
</Field>

// ✅ WITHOUT VALIDATION: No Field wrapper needed
<VcInput
  v-model="offer.description"
  :label="$t('OFFERS.PAGES.DETAILS.FIELDS.DESCRIPTION.TITLE')"
  :placeholder="$t('OFFERS.PAGES.DETAILS.FIELDS.DESCRIPTION.PLACEHOLDER')"
/>
`,
      incorrect: `
// ❌ WRONG: Field wrapper for non-validated input (unnecessary)
<Field v-slot="{ errorMessage }">
  <VcInput v-model="offer.description" />
</Field>

// ❌ WRONG: Validated input without Field wrapper
<VcInput
  v-model="offer.name"
  required
  rules="required"
/>
`,
    },
  },

  // ======================
  // 6. ICON PREFIXES
  // ======================
  iconPrefixes: {
    validPrefixes: ['material-', 'bi-', 'lucide-', 'svg:'],
    forbiddenPrefixes: ['fas fa-', 'far fa-', 'fab fa-', 'fa-'],
    description: 'VcIcon supports multiple icon libraries. Font Awesome is FORBIDDEN (legacy).',
    examples: {
      correct: `
// ✅ Material Symbols (PREFERRED - use this!)
icon: "material-save"
icon: "material-refresh"
icon: "material-add"
icon: "material-delete"
icon: "material-edit"
icon: "material-home"
icon: "material-settings"
icon: "material-person"
icon: "material-store"

// ✅ Bootstrap Icons
icon: "bi-house"
icon: "bi-gear"

// ✅ Lucide Icons
icon: "lucide-home"
icon: "lucide-settings"

// ✅ SVG Icons
icon: "svg:/assets/icons/custom.svg"
`,
      incorrect: `
// ❌ Font Awesome is FORBIDDEN (legacy)
// icon: "fas fa-home"    // DON'T USE!
// icon: "far fa-star"    // DON'T USE!
// icon: "fab fa-github"  // DON'T USE!
`,
    },
  },

  // ======================
  // 7. BLADE CLOSE PATTERN
  // ======================
  bladeClosePattern: {
    selfClose: 'emit("close:blade")',
    otherClose: 'closeBlade(index)',
    description: 'Use emit for self-close, closeBlade for closing other blades',
    examples: {
      correct: `
// ✅ Close self (current blade)
async function save() {
  await saveOffer();
  emit("close:blade");
}

// ✅ Close other blade by index
import { useBladeNavigation } from '@vc-shell/framework';
const { closeBlade } = useBladeNavigation();

closeBlade(someIndex);
`,
      incorrect: `
// ❌ WRONG: Using closeBlade for self
import { useBladeNavigation } from '@vc-shell/framework';
const { closeBlade, currentBladeNavigationData } = useBladeNavigation();

closeBlade(currentBladeNavigationData.value.idx); // WRONG!
// Should use: emit("close:blade")
`,
    },
  },

  // ======================
  // 8. PARENT-CHILD COMMUNICATION
  // ======================
  parentChildCommunication: {
    rule: 'parent:call actions must match defineExpose methods',
    description: 'When child emits parent:call with action, parent must expose that method',
    examples: {
      correct: `
// Child blade (offer-details.vue)
if (created && created.id) {
  emit("parent:call", { action: "openDetails", id: created.id });
}

// Parent blade (offers-list.vue)
function openDetails(id: string) {
  openBlade({
    blade: { name: "OfferDetails" },
    param: id,
  });
}

defineExpose({
  reload,
  openDetails, // ✅ Must expose this!
  title: bladeTitle,
});
`,
      incorrect: `
// Child emits
emit("parent:call", { action: "openDetails", id: created.id });

// Parent defineExpose
defineExpose({
  reload,
  title: bladeTitle,
  // ❌ MISSING: openDetails function!
});
`,
    },
  },

  // ======================
  // 9. DOMAIN EVENTS
  // ======================
  domainEvents: {
    forbidden: ['window.addEventListener', 'window.dispatchEvent'],
    correct: ['useNotifications', 'setNotificationHandler', 'defineOptions({ notifyType })'],
    description: 'NEVER use window events for domain notifications. Use VC-Shell notification system.',
    examples: {
      correct: `
// ✅ Global subscription (notification center)
defineOptions({
  name: "Offers",
  url: "/offers",
  notifyType: "OfferDeletedDomainEvent",
  isWorkspace: true,
});

// ✅ Local subscription (blade-specific toasts)
import { useNotifications, notification } from '@vc-shell/framework';

const { setNotificationHandler, markAsRead } = useNotifications("OfferDeletedDomainEvent");

setNotificationHandler((notif: PushNotification) => {
  notification.info(t('OFFERS.DELETED'));
  removeOffer(notif.id);
  markAsRead(notif);
});
`,
      incorrect: `
// ❌ WRONG: Custom window events
window.addEventListener('OfferCreatedDomainEvent', (event) => {
  // This won't work with SignalR!
});

// ❌ WRONG: This is NOT how VC-Shell works
window.dispatchEvent(new CustomEvent('OfferDeleted'));
`,
    },
  },

  // ======================
  // 10. MODULE REGISTRATION
  // ======================
  moduleRegistration: {
    correct: 'createAppModule',
    incorrect: 'createDynamicAppModule',
    signature: 'createAppModule(pages, locales, notificationTemplates)',
    description: 'ALWAYS use createAppModule, NOT createDynamicAppModule',
    examples: {
      correct: `
// ✅ CORRECT module registration
import * as pages from './pages';
import * as locales from './locales';
import * as notificationTemplates from './components/notifications';
import { createAppModule } from '@vc-shell/framework';

export default createAppModule(pages, locales, notificationTemplates);

export * from './pages';
export * from './composables';
`,
      incorrect: `
// ❌ WRONG: Using createDynamicAppModule
import { createDynamicAppModule } from '@vc-shell/framework';

export default createDynamicAppModule({
  schema: import('./module.schema.json'),
  pages,
  locales,
}); // WRONG!
`,
    },
  },

  // ======================
  // 11. VCTABLE GENERIC SFC
  // ======================
  vcTableGeneric: {
    required: '<!-- @vue-generic {Type} --> comment on first line',
    description: 'VcTable is a generic SFC and REQUIRES type annotation',
    examples: {
      correct: `
<!-- @vue-generic {IOffer} -->
<template>
  <VcBlade>
    <VcTable
      :items="offers"
      :columns="columns"
    />
  </VcBlade>
</template>
`,
      incorrect: `
<template>
  <!-- ❌ MISSING @vue-generic comment! -->
  <VcBlade>
    <VcTable
      :items="offers"
      :columns="columns"
    />
  </VcBlade>
</template>
`,
    },
  },

  // ======================
  // 12. VCSELECT SLOT SCOPE
  // ======================
  vcSelectSlot: {
    slotScope: '{ opt, index, selected, toggleOption }',
    incorrect: '{ option }',
    description: 'VcSelect #option slot provides opt (NOT option)',
    examples: {
      correct: `
<VcSelect v-model="status" :options="statusOptions">
  <template #option="{ opt, selected }">
    <VcIcon :icon="opt.icon" />
    {{ opt.label }}
  </template>
</VcSelect>
`,
      incorrect: `
<VcSelect v-model="status" :options="statusOptions">
  <template #option="{ option, selected }">
    {{ option.label }}  <!-- ❌ WRONG: 'option' doesn't exist! -->
  </template>
</VcSelect>
`,
    },
  },

  // ======================
  // 13. COMPOSABLE RETURN PATTERN
  // ======================
  composableReturn: {
    listReturns: ['computed properties for derived data', 'useLoading for combined states'],
    description: 'List composables should return computed properties, not plain refs',
    examples: {
      correct: `
export default (options?: IUseOffersOptions): IUseOffers => {
  const searchResult = ref<SearchOffersResult>();

  const { action: loadOffers, loading: loadOffersLoading } = useAsync(...);
  const { action: deleteOffers, loading: deleteOffersLoading } = useAsync(...);

  return {
    offers: computed(() => searchResult.value?.results || []), // ✅ Computed
    totalCount: computed(() => searchResult.value?.totalCount || 0), // ✅ Computed
    pages: computed(() => Math.ceil((searchResult.value?.totalCount || 0) / pageSize)), // ✅ Computed
    currentPage: computed(() => Math.floor((searchQuery.value.skip || 0) / pageSize) + 1), // ✅ Computed
    loading: useLoading(loadOffersLoading, deleteOffersLoading), // ✅ Combined
    searchQuery, // Ref for state
    loadOffers,
    deleteOffers,
  };
};
`,
      incorrect: `
export default function useOffersList() {
  const items = ref<Offer[]>([]); // ❌ Plain ref
  const loading = ref(false); // ❌ Manual loading
  const totalCount = ref(0); // ❌ Plain ref

  return {
    items, // ❌ Should be computed from search result
    loading, // ❌ Should use useLoading
    totalCount, // ❌ Should be computed
  };
}
`,
    },
  },

  // ======================
  // 14. USEBEFOREUNLOAD USAGE
  // ======================
  useBeforeUnloadPattern: {
    correct: 'useBeforeUnload(modifiedRef)',
    incorrect: 'useBeforeUnload(() => modified.value)',
    description: 'Pass the ref directly to useBeforeUnload, not a callback',
    examples: {
      correct: `
import { useBeforeUnload } from '@vc-shell/framework';

const { modified } = useModificationTracker(offer);

// ✅ CORRECT: Pass ref directly
useBeforeUnload(modified);
`,
      incorrect: `
// ❌ WRONG: Don't pass callback
useBeforeUnload(() => modified.value);

// ❌ WRONG: Don't pass value
useBeforeUnload(modified.value);
`,
    },
  },
};

/**
 * Validation rules as array for iteration
 */
export const VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'blade-props-emits',
    category: 'Blade Structure',
    severity: 'error',
    description: 'Blade must have standard props (expanded, closable, param, options) and emits (close:blade, parent:call, expand:blade, collapse:blade)',
  },
  {
    id: 'api-client-pattern',
    category: 'API Integration',
    severity: 'error',
    description: 'Must use useApiClient(ClientClass) -> getApiClient() -> new CommandObject()',
  },
  {
    id: 'async-operations',
    category: 'Async Handling',
    severity: 'error',
    description: 'ALL async operations must use useAsync wrapper',
  },
  {
    id: 'modification-tracking',
    category: 'State Management',
    severity: 'error',
    description: 'Entity forms must use useModificationTracker',
  },
  {
    id: 'form-validation',
    category: 'Form Handling',
    severity: 'warning',
    description: 'Validated inputs must use Field wrapper (non-validated inputs do not need it)',
  },
  {
    id: 'blade-close',
    category: 'Blade Navigation',
    severity: 'error',
    description: 'Use emit("close:blade") for self-close, closeBlade(idx) for others',
  },
  {
    id: 'parent-child-communication',
    category: 'Component Communication',
    severity: 'error',
    description: 'parent:call actions must match parent defineExpose methods',
  },
  {
    id: 'domain-events',
    category: 'Notifications',
    severity: 'error',
    description: 'NEVER use window.addEventListener for domain events. Use useNotifications.',
  },
  {
    id: 'module-registration',
    category: 'Module Setup',
    severity: 'error',
    description: 'ALWAYS use createAppModule, NOT createDynamicAppModule',
  },
  {
    id: 'vctable-generic',
    category: 'Component Usage',
    severity: 'error',
    description: 'VcTable requires <!-- @vue-generic {Type} --> comment on first line',
  },
  {
    id: 'vcselect-slot-scope',
    category: 'Component Usage',
    severity: 'error',
    description: 'VcSelect #option slot uses { opt }, not { option }',
  },
  {
    id: 'usebeforeunload-usage',
    category: 'Composable Usage',
    severity: 'error',
    description: 'useBeforeUnload takes a ref, not a callback',
  },
];

/**
 * Get validation rule by ID
 */
export function getValidationRule(id: string): ValidationRule | undefined {
  return VALIDATION_RULES.find((rule) => rule.id === id);
}

/**
 * Get all validation rules for a category
 */
export function getValidationRulesByCategory(category: string): ValidationRule[] {
  return VALIDATION_RULES.filter((rule) => rule.category === category);
}

/**
 * Format validation rules as markdown for AI instructions
 */
export function formatRulesAsMarkdown(): string {
  let markdown = '# VC-Shell Code Generation Pattern Rules\n\n';

  const categories = [...new Set(VALIDATION_RULES.map((r) => r.category))];

  for (const category of categories) {
    markdown += `## ${category}\n\n`;
    const rules = getValidationRulesByCategory(category);

    for (const rule of rules) {
      markdown += `### ${rule.id}\n\n`;
      markdown += `**Severity:** ${rule.severity.toUpperCase()}\n\n`;
      markdown += `${rule.description}\n\n`;

      const pattern = PATTERN_RULES[rule.id as keyof typeof PATTERN_RULES];
      if (pattern && 'examples' in pattern) {
        markdown += `#### ✅ Correct:\n\`\`\`typescript\n${pattern.examples.correct.trim()}\n\`\`\`\n\n`;
        markdown += `#### ❌ Incorrect:\n\`\`\`typescript\n${pattern.examples.incorrect.trim()}\n\`\`\`\n\n`;
      }
    }
  }

  return markdown;
}
