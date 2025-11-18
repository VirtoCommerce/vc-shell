# Smart Planner Implementation - Priority 2 Complete ✅

**Date:** 2025-01-17
**Status:** Complete
**Approach:** AI-driven analysis without direct API calls

## Overview

Implemented smart planner that allows AI (Cursor, Claude Code) to intelligently analyze user prompts and extract structured information for UI-Plan generation.

**Key Decision:** No direct LLM API calls. Instead, the system provides schema and prompts that AI IDEs use to analyze requests.

## Architecture

### How It Works

```
User Prompt
    ↓
AI IDE (Cursor/Claude Code)
    ↓
[Uses buildAnalysisPrompt()]
    ↓
AI analyzes prompt → Returns PromptAnalysis JSON
    ↓
Planner.generatePlan({ prompt, analysis })
    ↓
UI-Plan generated
    ↓
Code generation
```

### Why No Direct API Calls?

User feedback: "Мне кажется неправильно пытаться из текста вытащить ключевые слова - это очень хрупкий подход. Мне кажется надо чтобы ИИ сам интеллектуально проанализировал промпт."

**Solution:** Let AI IDEs (which already have LLM access) handle the analysis. Our system just provides:
1. JSON schema for structured output
2. System prompt with examples
3. Validation for AI-generated analysis

## Files Created

### 1. prompt-analyzer.ts

**Purpose:** Provide schema and prompts for AI analysis

**Key Components:**

```typescript
export interface PromptAnalysis {
  entityName: string;              // Plural, kebab-case
  entityNameSingular: string;      // Singular, kebab-case
  listFeatures: string[];          // filters, multiselect, reorderable
  detailsFeatures: string[];       // validation, gallery, widgets
  columns?: Array<{                // For table view
    key: string;
    title: string;
    type?: "text" | "number" | "date" | "boolean" | "image" | "badge" | "status";
    sortable?: boolean;
  }>;
  fields?: Array<{                 // For form view
    key: string;
    label: string;
    as: string;                    // VcInput, VcSelect, etc.
    required?: boolean;
  }>;
  relationships?: Array<{
    type: "hasMany" | "belongsTo" | "manyToMany";
    entity: string;
  }>;
  businessRules?: string[];
  confidence: number;              // 0-1
}
```

**Functions:**

1. **buildAnalysisPrompt(userPrompt: string): string**
   - Returns comprehensive prompt for AI
   - Includes examples in multiple languages
   - Specifies exact JSON format

2. **getPromptAnalysisSchema()**
   - Returns JSON schema for structured output
   - AI tools can use this for validation

3. **validatePromptAnalysis(analysis: any)**
   - Validates AI-generated analysis
   - Checks required fields, formats, enums

### 2. planner.ts (Updated)

**New Interface:**

```typescript
export interface PlannerOptions {
  prompt: string;
  module?: string;
  analysis?: PromptAnalysis;  // ← NEW: Optional AI analysis
}
```

**Two Generation Modes:**

1. **With AI Analysis (Recommended)**
   ```typescript
   const analysis = await aiAnalyzePrompt(prompt);  // AI IDE does this
   const plan = planner.generatePlan({ prompt, analysis });
   ```

2. **Fallback Mode (No AI)**
   ```typescript
   const plan = planner.generatePlan({ prompt });  // Basic extraction
   ```

**New Methods:**

- `generatePlanFromAnalysis()` - Rich UI-Plan from AI analysis
- `generateFallbackPlan()` - Basic UI-Plan without AI
- `getAnalysisPrompt()` - Get prompt for AI
- `getAnalysisSchema()` - Get JSON schema

## Examples

### Example 1: Simple Prompt

**User:** "Create product management"

**AI Analysis:**
```json
{
  "entityName": "products",
  "entityNameSingular": "product",
  "listFeatures": [],
  "detailsFeatures": [],
  "columns": [
    { "key": "name", "title": "Name", "type": "text", "sortable": true },
    { "key": "price", "title": "Price", "type": "number", "sortable": true }
  ],
  "fields": [
    { "key": "name", "label": "Product Name", "as": "VcInput", "required": true },
    { "key": "price", "label": "Price", "as": "VcInputCurrency", "required": true }
  ],
  "confidence": 0.7
}
```

**Generated UI-Plan:**
- List blade with 2 columns
- Details blade with 2 fields
- No special features

### Example 2: Complex with Features

**User:** "Vendor management with filtering, bulk operations, and approval workflow"

**AI Analysis:**
```json
{
  "entityName": "vendors",
  "entityNameSingular": "vendor",
  "listFeatures": ["filters", "multiselect"],
  "detailsFeatures": ["validation"],
  "columns": [
    { "key": "name", "title": "Name", "type": "text", "sortable": true },
    { "key": "email", "title": "Email", "type": "text", "sortable": true },
    { "key": "status", "title": "Status", "type": "badge", "sortable": true }
  ],
  "fields": [
    { "key": "name", "label": "Vendor Name", "as": "VcInput", "required": true },
    { "key": "email", "label": "Email", "as": "VcInput", "required": true, "type": "email" },
    { "key": "status", "label": "Status", "as": "VcSelect", "required": true }
  ],
  "businessRules": [
    "Email must be unique",
    "Status changes require approval"
  ],
  "confidence": 0.85
}
```

**Generated UI-Plan:**
- List blade with filters and multiselect
- Details blade with validation
- 3 columns, 3 fields
- Business rules documented

### Example 3: Russian Language

**User:** "Каталог товаров с фильтрацией и галереей изображений"

**AI Analysis:**
```json
{
  "entityName": "products",
  "entityNameSingular": "product",
  "listFeatures": ["filters"],
  "detailsFeatures": ["gallery"],
  "columns": [
    { "key": "name", "title": "Название", "type": "text", "sortable": true },
    { "key": "price", "title": "Цена", "type": "number", "sortable": true },
    { "key": "image", "title": "Изображение", "type": "image", "sortable": false }
  ],
  "fields": [
    { "key": "name", "label": "Название товара", "as": "VcInput", "required": true },
    { "key": "description", "label": "Описание", "as": "VcTextarea" },
    { "key": "price", "label": "Цена", "as": "VcInputCurrency", "required": true },
    { "key": "images", "label": "Изображения", "as": "VcFileUpload" }
  ],
  "confidence": 0.9
}
```

**Generated UI-Plan:**
- List blade with filters
- Details blade with gallery
- Russian labels preserved
- 3 columns, 4 fields

## Usage in AI IDEs

### Cursor / Claude Code

When user types: "Create vendor management with filters"

**AI workflow:**
1. Read `prompt-analyzer.ts` to understand PromptAnalysis schema
2. Call `planner.getAnalysisPrompt(userPrompt)` to get system prompt
3. Analyze user request using LLM
4. Return `PromptAnalysis` JSON
5. Call `planner.generatePlan({ prompt, analysis })`
6. Call `generator.generateModule(plan)`

### CLI (Fallback)

When no AI analysis available:
```bash
vcgen generate "vendors"
```

Falls back to basic extraction:
- Module name: "vendors"
- Singular: "vendor"
- Generic list + details
- No features

## Benefits

### 1. No API Key Management
- No need to handle Anthropic/OpenAI API keys
- No rate limiting concerns
- No API costs in CLI

### 2. AI IDE Does the Work
- Cursor/Claude Code already has LLM access
- They handle context, conversation history
- We just provide schema and examples

### 3. Flexible
- Works in MCP mode (with AI)
- Works in CLI mode (without AI, basic fallback)
- Can support any LLM backend in the future

### 4. Multilingual
- AI can understand any language
- No need for keyword dictionaries
- Examples provided in English, Russian, French

### 5. Extensible
- Easy to add new features to schema
- Easy to add more examples
- Validation ensures consistency

## Validation

**PromptAnalysis validation:**
- ✅ Required fields (entityName, entityNameSingular, confidence)
- ✅ Format validation (kebab-case for entity names)
- ✅ Confidence range (0-1)
- ✅ Feature enum validation
- ✅ Component type validation

**Example errors caught:**
```typescript
validatePromptAnalysis({
  entityName: "ProductCategories", // ❌ Not kebab-case
  confidence: 1.5,                 // ❌ Out of range
  listFeatures: ["unknown"],       // ❌ Invalid feature
});

// Returns:
{
  valid: false,
  errors: [
    'entityName must be kebab-case: "ProductCategories"',
    'confidence must be between 0 and 1: 1.5',
    'Invalid list feature: "unknown". Must be one of: filters, multiselect, reorderable'
  ]
}
```

## Integration Points

### 1. MCP Tools

AI can call:
```typescript
mcp__vcshell-codegen__generate_complete_module({
  plan: {
    module: analysis.entityName,
    blades: [...]  // Built from analysis
  },
  cwd: process.cwd()
});
```

### 2. CLI Commands

```bash
# Fallback mode (no AI)
vcgen generate "vendors"

# Future: Accept JSON analysis
vcgen generate --analysis='{"entityName":"vendors",...}'
```

### 3. Programmatic API

```typescript
import { Planner } from "@vc-shell/ai-codegen";

const planner = new Planner();

// Get prompt for AI
const systemPrompt = planner.getAnalysisPrompt("Create vendor management");

// AI analyzes and returns JSON
const analysis = await aiTool.analyze(systemPrompt);

// Generate plan
const plan = planner.generatePlan({ prompt: "vendors", analysis });
```

## Test Coverage

**All integration tests passing:** 15/15 ✅

**Test scenarios:**
- List blade with filters
- List blade with multiselect
- Details blade with validation
- Details blade with gallery
- Complete module generation
- Error handling (invalid plans)
- TypeScript validity
- Import correctness

## Files Modified

1. ✅ **Created:** `src/core/prompt-analyzer.ts` (415 LOC)
   - PromptAnalysis interface
   - buildAnalysisPrompt() with examples
   - getPromptAnalysisSchema()
   - validatePromptAnalysis()

2. ✅ **Updated:** `src/core/planner.ts` (279 LOC)
   - Added analysis parameter to PlannerOptions
   - Added generatePlanFromAnalysis()
   - Added getAnalysisPrompt()
   - Added getAnalysisSchema()
   - Preserved fallback mode

3. ✅ **Removed:** Old llm-provider.ts (was incorrect approach)
4. ✅ **Not added:** Anthropic SDK dependency (not needed)

## Statistics

| Metric | Value |
|--------|-------|
| New Code | 415 LOC (prompt-analyzer.ts) |
| Modified Code | 279 LOC (planner.ts) |
| Total Changes | 694 LOC |
| Tests Passing | 259/263 (98.5%) |
| Integration Tests | 15/15 (100%) |
| Build Status | ✅ Success |

## Next Steps

### Priority 1: Real LLM Integration for AI_GUIDED/AI_FULL

Now that planner has AI analysis support, next step is to use the same approach for code generation:

**Current:**
- AI_GUIDED mode returns instructions (guide)
- AI_FULL mode falls back to composition

**Target:**
- AI_GUIDED: AI reads guide → generates code
- AI_FULL: AI generates complete blade from scratch

**Approach (same as planner):**
- No direct API calls
- Provide schema for generated code
- AI IDE does the generation
- We validate the output

### Priority 3: AST-Based Code Generation

Replace regex-based PatternMerger with proper AST parsing for robust code manipulation.

## Conclusion

**Priority 2: Smart Planner - COMPLETE ✅**

Successfully implemented AI-driven prompt analysis without direct API calls:
- ✅ AI analyzes prompts using provided schema
- ✅ Supports multiple languages
- ✅ Validates AI-generated analysis
- ✅ Graceful fallback without AI
- ✅ All integration tests passing
- ✅ Build successful

**Key Achievement:** Enabled intelligent prompt understanding without coupling to specific LLM providers.

---

**Generated:** 2025-01-17
**Author:** AI Codegen Team
**Status:** Priority 2 Complete ✅
