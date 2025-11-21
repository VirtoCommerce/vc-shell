# Payload Size Comparison: V1 vs V2

## V1 (Embedded Guide) - Response Structure

```json
{
  "success": true,
  "strategy": "CREATE_VC_APP_TEMPLATES",
  "session_id": "offers_1732123456_abc",
  "message": "✅ Base blades generated...",
  "generated_files": [
    "src/modules/offers/pages/offers-list.vue",
    "src/modules/offers/composables/useOffersList.ts",
    "src/modules/offers/pages/offer-details.vue",
    "src/modules/offers/composables/useOfferDetails.ts"
  ],
  "workflow_started": {
    "workflow_state": "GENERATING_BLADE_1_OF_2",
    "session_id": "offers_1732123456_abc",
    "current_task": {
      "blade_index": 1,
      "total_blades": 2,
      "blade_id": "offers-list",
      "blade_type": "list",
      "status": "WAITING_FOR_CODE_GENERATION"
    },
    "IMMEDIATE_ACTION_REQUIRED": {
      "step_1": "READ_FILE",
      "step_1_details": {
        "tool": "Read",
        "file_path": "/path/src/modules/offers/pages/offers-list.vue",
        "purpose": "Understand the base blade structure"
      },
      "step_2": "GENERATE_CODE",
      "step_2_details": {
        "source": "guide.instructions",
        "requirements": [
          "Follow ALL steps in guide.instructions.steps",
          "Implement ALL features listed in guide.context.features",
          "PRESERVE existing defineOptions() from base file",
          "Generate COMPLETE Vue SFC code (no TODOs, no placeholders)",
          "Use TypeScript with proper interfaces",
          "All text must use i18n: $t('MODULE.KEY')"
        ]
      },
      "step_3": "CALL_TOOL",
      "step_3_details": {
        "tool": "submit_generated_code",
        "args_template": {
          "bladeId": "offers-list",
          "code": "<YOUR_COMPLETE_VUE_SFC_CODE_HERE>",
          "cwd": "/path",
          "context": {
            "module": "offers",
            "layout": "grid",
            "strategy": "AI_FULL",
            "features": ["filters", "multiselect", "sorting"]
          }
        }
      }
    },
    "guide": {
      // ❌ MASSIVE OBJECT (15-25K tokens)
      "task": "Generate a list blade with VcTable for Offer",
      "context": {
        "blade": {...},
        "entity": "Offer",
        "module": "offers",
        "features": ["filters", "multiselect", "sorting"],
        "columns": [...],
        "complexity": 7
      },
      "instructions": {
        "summary": "...",
        "steps": [
          {
            "step": 1,
            "title": "Setup component structure",
            "description": "...",
            "explanation": "...",
            "requirements": [...],
            "patternReferences": [...],
            "componentsDocs": "...",  // Hundreds of lines
            "warnings": [...]
          },
          // ... 8-10 more steps
        ],
        "examples": {
          "similar": [...],
          "templateReference": "..."
        },
        "constraints": [
          // 100+ constraints
          "Use vee-validate Field component for all form inputs",
          "Validation rules go in rules= prop",
          "Filters go in <template #filters> slot",
          // ... 97+ more constraints
        ],
        "patterns": [
          {
            "name": "VcTable Setup",
            "description": "...",
            "code": "... hundreds of lines of example code ..."
          },
          {
            "name": "Filters Implementation",
            "description": "...",
            "code": "... hundreds of lines ..."
          },
          // ... 20-30 more patterns
        ]
      },
      "verification": {
        "checklist": [...],
        "mustHave": [...],
        "mustNotHave": [...]
      },
      "rules": {
        // All YAML rules embedded
        "workspace-blade": "...",
        "api-client": "...",
        "filters-usage": "...",
        // ... 20+ rule files
      }
    },
    "FORBIDDEN_ACTIONS": [...],
    "EXPECTED_RESPONSE": "..."
  }
}
```

**Estimated size**: **25-35K tokens**

### Breakdown:
- `message` + `generated_files`: ~500 tokens
- `IMMEDIATE_ACTION_REQUIRED`: ~800 tokens
- **`guide` object**: **20-30K tokens** ⚠️
  - `instructions.steps`: ~5-7K tokens
  - `instructions.constraints`: ~3-4K tokens
  - `instructions.patterns`: ~8-12K tokens
  - `rules`: ~4-6K tokens
- `FORBIDDEN_ACTIONS` + other: ~300 tokens

## V2 (Lazy-Loading) - Response Structure

```json
{
  "success": true,
  "strategy": "CREATE_VC_APP_TEMPLATES",
  "session_id": "offers_1732123456_abc",
  "message": "✅ Base blades generated...",
  "generated_files": [
    "src/modules/offers/pages/offers-list.vue",
    "src/modules/offers/composables/useOffersList.ts",
    "src/modules/offers/pages/offer-details.vue",
    "src/modules/offers/composables/useOfferDetails.ts"
  ],
  "workflow_started": {
    "workflow_state": "GENERATING_BLADE_1_OF_2",
    "session_id": "offers_1732123456_abc",
    "current_task": {
      "blade_index": 1,
      "total_blades": 2,
      "blade_id": "offers-list",
      "blade_type": "list",
      "status": "WAITING_FOR_CODE_GENERATION"
    },
    "IMMEDIATE_ACTION_REQUIRED": {
      "step_1": "FETCH_RULES",
      "step_1_details": {
        "tool": "mcp__vcshell-codegen__get_applicable_rules",
        "args_template": {
          "bladeType": "list",
          "features": ["filters", "multiselect", "sorting"],
          "isWorkspace": true,
          "strategy": "AI_FULL"
        },
        "purpose": "Get critical rules: workspace blade patterns, module registration, validation, filters, etc."
      },
      "step_2": "FETCH_TEMPLATE",
      "step_2_details": {
        "tool": "mcp__vcshell-codegen__get_best_template",
        "args_template": {
          "bladeType": "list",
          "features": ["filters", "multiselect", "sorting"],
          "complexity": "complex"
        },
        "purpose": "Get production-ready Vue SFC template matching your features and complexity"
      },
      "step_3": "READ_BASE_FILE",
      "step_3_details": {
        "tool": "Read",
        "file_path": "/path/src/modules/offers/pages/offers-list.vue",
        "purpose": "Read base blade file created by create-vc-app (contains defineOptions, route config)"
      },
      "step_4": "GENERATE_CODE",
      "step_4_details": {
        "source": "template + rules + base_file",
        "requirements": [
          "Use template from step_2 as starting point",
          "Apply rules from step_1 (especially workspace blade menu items if isWorkspace=true)",
          "PRESERVE defineOptions() from base_file (step_3)",
          "Implement ALL features from context.features",
          "Generate COMPLETE Vue SFC code (no TODOs, no placeholders)",
          "Use TypeScript with proper interfaces",
          "All text must use i18n: $t('MODULE.KEY')"
        ]
      },
      "step_5": "CALL_TOOL",
      "step_5_details": {
        "tool": "submit_generated_code",
        "args_template": {
          "bladeId": "offers-list",
          "code": "<YOUR_COMPLETE_VUE_SFC_CODE_HERE>",
          "cwd": "/path",
          "context": {
            "module": "offers",
            "layout": "grid",
            "strategy": "AI_FULL",
            "features": ["filters", "multiselect", "sorting"]
          }
        }
      }
    },
    "context": {
      "module": "offers",
      "entity": "Offer",
      "features": ["filters", "multiselect", "sorting"],
      "isWorkspace": true,
      "columns": [
        { "id": "name", "title": "Name", "type": "string" },
        { "id": "status", "title": "Status", "type": "string" },
        { "id": "price", "title": "Price", "type": "number" }
      ]
    },
    "FORBIDDEN_ACTIONS": [
      "❌ NEVER ask \"Should I proceed?\" or \"Would you like me to...\"",
      "❌ NEVER say \"Let me generate...\" - JUST DO IT",
      "❌ NEVER skip steps 1-2 (fetching rules/template) - they are MANDATORY",
      "❌ NEVER skip features or use placeholder comments",
      "❌ NEVER add duplicate defineOptions() - it EXISTS in base file",
      "❌ NEVER stop after reading files - steps 1-3 are preparation, step 4 is generation"
    ],
    "EXPECTED_RESPONSE": "✅ Your NEXT message must:\n1. Call mcp__vcshell-codegen__get_applicable_rules\n2. Call mcp__vcshell-codegen__get_best_template\n3. Call Read tool for base file\n4. Generate complete Vue SFC code\n5. Call submit_generated_code with complete code\nNO explanatory text between steps, NO confirmation questions."
  }
}
```

**Estimated size**: **3-4K tokens**

### Breakdown:
- `message` + `generated_files`: ~500 tokens
- `IMMEDIATE_ACTION_REQUIRED`: **~1.5K tokens** (5 steps with MCP tool details)
- **`context` object**: **~500 tokens** ✅ (minimal data)
- `FORBIDDEN_ACTIONS` + `EXPECTED_RESPONSE`: ~500 tokens

### AI Then Fetches On-Demand:

**Step 1 Call**: `get_applicable_rules`
```json
{
  "critical_rules": [
    {
      "id": "workspace-blade-menu",
      "priority": "CRITICAL",
      "content": "... ~2K tokens ..."
    },
    {
      "id": "filters-usage",
      "priority": "HIGH",
      "content": "... ~1.5K tokens ..."
    }
  ]
}
```
**Size**: ~5K tokens (only relevant rules)

**Step 2 Call**: `get_best_template`
```json
{
  "template": {
    "path": "examples/templates/list-filters-multiselect.vue",
    "content": "... complete Vue SFC ~300 lines ...",
    "features": ["filters", "multiselect", "sorting"],
    "complexity": "complex"
  }
}
```
**Size**: ~4K tokens (ready-to-use template)

**Step 3 Call**: `Read` (base file)
**Size**: ~300 tokens (defineOptions + imports)

**Total with MCP calls**: ~3-4K (initial) + 5K (rules) + 4K (template) + 0.3K (base) = **~12-13K tokens**

## Comparison Table

| Metric | V1 (Embedded) | V2 (Lazy-Loading) | Improvement |
|--------|---------------|-------------------|-------------|
| **Initial response size** | 25-35K tokens | 3-4K tokens | **85-90% smaller** ⚡ |
| **Total tokens (with fetches)** | 25-35K tokens | 12-13K tokens | **50-60% smaller** |
| **Response time** | Slow (large JSON) | Fast (small JSON) | **3-5x faster** |
| **Duplication** | High (every blade) | None (shared cache) | **0% duplication** |
| **Relevance** | 100% (всё подряд) | 90% (только нужное) | **Better signal/noise** |
| **Update latency** | Rebuild required | Immediate | **Instant updates** |

## Real-World Example

### Scenario: 2 blades (offers-list, offer-details)

**V1 Total**:
- Blade 1: 30K tokens
- Blade 2: 28K tokens (similar structure)
- **Total**: **58K tokens**

**V2 Total**:
- Initial (blade 1): 4K tokens
- MCP calls (blade 1):
  - get_applicable_rules: 5K tokens
  - get_best_template: 4K tokens
  - Read base: 0.3K tokens
- **Subtotal blade 1**: **13.3K tokens**

- Initial (blade 2): 4K tokens
- MCP calls (blade 2):
  - get_applicable_rules: 4K tokens (some overlap with blade 1)
  - get_best_template: 3K tokens (details template smaller)
  - Read base: 0.3K tokens
- **Subtotal blade 2**: **11.3K tokens**

- **Total**: **24.6K tokens**

**Improvement**: **58K → 24.6K = 58% reduction** 🎯

## Performance Impact

### V1 (Embedded)
```
generate_with_composition (blade 1) → 30K tokens → AI processes 30K
submit_generated_code → next blade
generate_with_composition (blade 2) → 28K tokens → AI processes 28K

Total processing: 58K tokens
```

### V2 (Lazy-Loading)
```
generate_with_composition (blade 1) → 4K tokens → AI processes 4K
  ↓
AI calls get_applicable_rules → 5K tokens → AI processes 5K
  ↓
AI calls get_best_template → 4K tokens → AI processes 4K
  ↓
AI calls Read → 0.3K tokens → AI processes 0.3K
  ↓
AI generates code → submit_generated_code → next blade
  ↓
generate_with_composition (blade 2) → 4K tokens → AI processes 4K
  ↓
AI calls get_applicable_rules → 4K tokens → AI processes 4K (cached)
  ↓
AI calls get_best_template → 3K tokens → AI processes 3K
  ↓
AI calls Read → 0.3K tokens → AI processes 0.3K
  ↓
AI generates code → submit_generated_code → completion

Total processing: 24.6K tokens
```

## Заключение

Lazy-Loading архитектура значительно уменьшает payload size через:
- ✅ **Minimal initial context** вместо full guide
- ✅ **On-demand fetching** через MCP tools
- ✅ **No duplication** между blade'ами
- ✅ **Better relevance** (только нужные rules)

**Ожидаемое улучшение**:
- Initial response: **85-90% меньше**
- Total tokens: **50-60% меньше**
- Response time: **3-5x быстрее**
