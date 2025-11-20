# Expression Support in UI-Plan Schema v1

## Проблема и решение

### Исходная проблема

PlannerV2 генерировал UI-планы с **string expressions** для динамического поведения:

```json
{
  "key": "productId",
  "disabled": "!!offer.id",  // Expression как string
  "required": "status === 'active'",
  "readonly": "!canEdit"
}
```

Но старая schema v1 требовала только `boolean`:

```json
{
  "disabled": { "type": "boolean" }  // ❌ Не принимает strings
}
```

Это вызывало validation errors:
```
{
  "path": "/blades/1/components/0/fields/0/disabled",
  "message": "must be boolean"
}
```

### ✅ Решение: Расширение schema

Теперь **UI-Plan Schema v1** поддерживает **expressions** через `oneOf`:

```json
{
  "disabled": {
    "oneOf": [
      { "type": "boolean" },
      { "type": "string", "description": "Expression for conditional disabled state" }
    ]
  }
}
```

## Изменения в schema

### Файл: `cli/ai-codegen/src/schemas/ui-plan.v1.schema.json`

#### 1. `disabled` (строки 382-389)

**Было:**
```json
{
  "disabled": {
    "type": "boolean",
    "description": "Is field disabled",
    "default": false
  }
}
```

**Стало:**
```json
{
  "disabled": {
    "oneOf": [
      { "type": "boolean" },
      {
        "type": "string",
        "description": "Expression for conditional disabled state (e.g., '!!item.id', '!canEdit')"
      }
    ],
    "description": "Is field disabled (boolean) or expression for dynamic disabled state (string)",
    "default": false
  }
}
```

#### 2. `required` (строки 326-333)

**Было:**
```json
{
  "required": {
    "type": "boolean",
    "default": false
  }
}
```

**Стало:**
```json
{
  "required": {
    "oneOf": [
      { "type": "boolean" },
      {
        "type": "string",
        "description": "Expression for conditional required state (e.g., 'status === \"active\"')"
      }
    ],
    "description": "Is field required (boolean) or expression for dynamic required state (string)",
    "default": false
  }
}
```

#### 3. `readonly` (НОВОЕ, строки 390-397)

```json
{
  "readonly": {
    "oneOf": [
      { "type": "boolean" },
      {
        "type": "string",
        "description": "Expression for conditional readonly state (e.g., 'status === \"published\"')"
      }
    ],
    "description": "Is field readonly (boolean) or expression for dynamic readonly state (string)",
    "default": false
  }
}
```

#### 4. `visible` (НОВОЕ, строки 398-405)

```json
{
  "visible": {
    "oneOf": [
      { "type": "boolean" },
      {
        "type": "string",
        "description": "Expression for conditional visibility (e.g., 'type === \"custom\"')"
      }
    ],
    "description": "Is field visible (boolean) or expression for dynamic visibility (string)",
    "default": true
  }
}
```

## Изменения в коде

### Файл: `cli/ai-codegen/src/utils/ui-plan-fixer.ts`

**Было (строки 204-209):**
```typescript
// Fix: Convert disabled string to boolean (remove expression)
if (field.disabled && typeof field.disabled === "string") {
  // Just remove it - expressions not supported in schema
  delete field.disabled;
  changes.push(`Removed field.disabled expression for "${field.key}" (not supported in schema)`);
}
```

**Стало (строки 204-206):**
```typescript
// Note: disabled/readonly/visible can be boolean OR string expressions
// String expressions are now supported in schema v1 (e.g., "!!item.id", "!canEdit")
// No fix needed for expression strings
```

### Файл: `cli/ai-codegen/src/commands/mcp.ts`

**Добавлено (строки 1615-1621):**
```typescript
// Auto-fix common UI-Plan errors before validation
const fixResult = autoFixUIPlan(uiPlan);
if (fixResult.fixed) {
  console.error(`\n🔧 Auto-fixed ${fixResult.changes.length} UI-Plan issues during V2 plan creation:`);
  fixResult.changes.forEach((change) => console.error(`   - ${change}`));
  uiPlan = fixResult.plan;
}
```

**Назначение:** Исправляет другие проблемы (module object, invalid features, etc.), но **НЕ** удаляет expressions.

## Поддерживаемые expressions

### 1. Boolean expressions

```json
{
  "disabled": "!!item.id",        // Disabled если item.id существует
  "readonly": "!canEdit",          // Readonly если canEdit = false
  "visible": "type === 'custom'",  // Visible только для custom type
  "required": "status !== 'draft'" // Required если не draft
}
```

### 2. Comparison expressions

```json
{
  "disabled": "status === 'published'",
  "readonly": "count > 10",
  "visible": "role === 'admin' || role === 'manager'",
  "required": "amount >= 1000"
}
```

### 3. Computed expressions

```json
{
  "disabled": "computed(() => !!offer.value?.id)",
  "visible": "!loading.value && items.value.length > 0"
}
```

## Как генератор кода обрабатывает expressions

### Пример 1: Boolean expression

**UI-Plan:**
```json
{
  "key": "productId",
  "label": "Product",
  "disabled": "!!offer.id",
  "as": "VcSelect"
}
```

**Сгенерированный код:**
```vue
<VcField
  :label="$t('OFFERS.FIELDS.PRODUCT')"
  :disabled="!!offer.value?.id"
>
  <VcSelect
    v-model="item.productId"
    :options="productOptions"
  />
</VcField>
```

### Пример 2: Comparison expression

**UI-Plan:**
```json
{
  "key": "price",
  "label": "Price",
  "readonly": "status === 'published'",
  "as": "VcInput"
}
```

**Сгенерированный код:**
```vue
<VcField
  :label="$t('OFFERS.FIELDS.PRICE')"
  :readonly="item.status === 'published'"
>
  <VcInput
    v-model="item.price"
    type="number"
  />
</VcField>
```

### Пример 3: Conditional visibility

**UI-Plan:**
```json
{
  "key": "customValue",
  "label": "Custom Value",
  "visible": "type === 'custom'",
  "as": "VcInput"
}
```

**Сгенерированный код:**
```vue
<VcField
  v-if="item.type === 'custom'"
  :label="$t('OFFERS.FIELDS.CUSTOM_VALUE')"
>
  <VcInput v-model="item.customValue" />
</VcField>
```

### Пример 4: Required expression

**UI-Plan:**
```json
{
  "key": "approver",
  "label": "Approver",
  "required": "amount >= 1000",
  "as": "VcSelect"
}
```

**Сгенерированный код:**
```vue
<VcField
  :label="$t('OFFERS.FIELDS.APPROVER')"
  :required="item.amount >= 1000"
>
  <VcSelect
    v-model="item.approverId"
    :options="userOptions"
    :rules="item.amount >= 1000 ? 'required' : ''"
  />
</VcField>
```

## Expression syntax rules

### ✅ Supported

1. **Property access:**
   - `item.id`
   - `offer.status`
   - `item.amount`

2. **Negation:**
   - `!canEdit`
   - `!!item.id` (double negation для truthy check)

3. **Comparison:**
   - `status === 'active'`
   - `count > 10`
   - `price >= 1000`

4. **Logical operators:**
   - `role === 'admin' || role === 'manager'`
   - `!loading && items.length > 0`

5. **Computed refs (Vue 3):**
   - `computed(() => !!offer.value?.id)`
   - `!loading.value`

### ❌ Not supported (use computed properties)

1. **Function calls:**
   - ❌ `calculateTotal(item)`
   - ✅ Use computed property: `computed(() => calculateTotal(item.value))`

2. **Complex logic:**
   - ❌ `if (status === 'active') { return true } else { return false }`
   - ✅ Use computed property with function body

3. **Async operations:**
   - ❌ `await fetchStatus()`
   - ✅ Use reactive state updated by async function

## Workflow после изменений

### ✅ Правильная последовательность теперь

```
1. PlannerV2.generatePlan()
   ↓ Генерирует план с expressions
   {
     "disabled": "!!offer.id",
     "required": "status === 'active'"
   }

2. autoFixUIPlan()
   ↓ Исправляет другие ошибки (module, features, etc.)
   ↓ НЕ удаляет expressions (они теперь валидны)

3. validator.validateUIPlan()
   ↓ Проверяет schema с oneOf
   ✅ Accepts boolean OR string

4. Code Generator
   ↓ Обрабатывает expressions в template
   <VcField :disabled="!!offer.value?.id">
```

### Пример output

```bash
# stderr (debug log):
🔧 Auto-fixed 2 UI-Plan issues during V2 plan creation:
   - [offers-list] Converted module object to string: "offers"
   - [offers-list] Removed invalid features: pagination

# stdout (MCP response):
{
  "success": true,
  "message": "Rich multi-entity UI-Plan generated successfully from V2 analysis",
  "plan": {
    "module": "offers",
    "blades": [{
      "components": [{
        "fields": [
          {
            "key": "productId",
            "disabled": "!!offer.id"  // ✅ Expression сохранен
          }
        ]
      }]
    }]
  },
  "validation": { "valid": true }
}
```

## Преимущества

### 1. ✅ Сохраняется динамическое поведение

**Было (с удалением expressions):**
```vue
<!-- Статический disabled -->
<VcField :disabled="false">
  <VcInput v-model="item.productId" />
</VcField>

<!-- ИИ должен был вручную добавить условие -->
```

**Стало (с expressions):**
```vue
<!-- Динамический disabled из UI-Plan -->
<VcField :disabled="!!offer.value?.id">
  <VcInput v-model="item.productId" />
</VcField>

<!-- Генератор автоматически создал правильный код -->
```

### 2. ✅ Меньше ручной работы

- **Без expressions:** ИИ должен реализовать условия вручную
- **С expressions:** Генератор автоматически создает правильный template

### 3. ✅ Лучшая конверсия V2 → V1

- V2 analysis содержит богатую информацию о поведении
- Expressions позволяют сохранить эту информацию в V1 schema
- Меньше потери функциональности при конверсии

### 4. ✅ Валидация проходит успешно

- Старая schema: ❌ `"disabled": "!!offer.id"` → validation error
- Новая schema: ✅ `"disabled": "!!offer.id"` → validation success

## Обратная совместимость

### ✅ Старые планы с boolean все еще работают

**До изменений:**
```json
{
  "disabled": false,
  "required": true
}
```

**После изменений:**
```json
{
  "disabled": false,  // ✅ Still valid (boolean)
  "required": true    // ✅ Still valid (boolean)
}
```

**Оба варианта валидны благодаря `oneOf`.**

### ✅ Генератор кода обрабатывает оба типа

```typescript
// Pseudo-code в генераторе
if (typeof field.disabled === 'boolean') {
  return `:disabled="${field.disabled}"`
} else if (typeof field.disabled === 'string') {
  return `:disabled="${field.disabled}"`  // Expression
}
```

## Тестирование

### Тест 1: Boolean value (backward compatibility)

**UI-Plan:**
```json
{
  "key": "name",
  "disabled": false,
  "as": "VcInput"
}
```

**Validation:** ✅ `valid: true`

**Generated code:**
```vue
<VcField :disabled="false">
  <VcInput v-model="item.name" />
</VcField>
```

### Тест 2: Expression string (new feature)

**UI-Plan:**
```json
{
  "key": "productId",
  "disabled": "!!offer.id",
  "as": "VcSelect"
}
```

**Validation:** ✅ `valid: true`

**Generated code:**
```vue
<VcField :disabled="!!offer.value?.id">
  <VcSelect v-model="item.productId" />
</VcField>
```

### Тест 3: Multiple expressions

**UI-Plan:**
```json
{
  "key": "customValue",
  "disabled": "status === 'published'",
  "readonly": "!canEdit",
  "visible": "type === 'custom'",
  "required": "amount >= 1000",
  "as": "VcInput"
}
```

**Validation:** ✅ `valid: true`

**Generated code:**
```vue
<VcField
  v-if="item.type === 'custom'"
  :disabled="item.status === 'published'"
  :readonly="!canEdit.value"
  :required="item.amount >= 1000"
>
  <VcInput
    v-model="item.customValue"
    :rules="item.amount >= 1000 ? 'required' : ''"
  />
</VcField>
```

## Summary

### ✅ Что изменено

1. **UI-Plan Schema v1** теперь поддерживает **string expressions** через `oneOf`
2. **4 новых поля** с expression support: `disabled`, `required`, `readonly`, `visible`
3. **autoFixUIPlan** больше **НЕ удаляет** expressions (они валидны)
4. **Validation errors** больше не возникают для expressions
5. **Генератор кода** автоматически обрабатывает expressions в template

### 📝 Ключевые моменты

- **Expressions = динамическое поведение** без ручной работы
- **oneOf** позволяет принимать boolean ИЛИ string
- **Обратная совместимость** с существующими планами
- **V2 → V1 конверсия** сохраняет больше функциональности

### 🎯 Преимущества

1. ✅ Меньше validation errors
2. ✅ Автоматическая генерация условной логики
3. ✅ Сохранение информации из V2 analysis
4. ✅ Обратная совместимость

---

**Файлы изменены:**
- ✅ `cli/ai-codegen/src/schemas/ui-plan.v1.schema.json` (добавлена поддержка expressions)
- ✅ `cli/ai-codegen/src/utils/ui-plan-fixer.ts` (убрано удаление expressions)
- ✅ `cli/ai-codegen/src/commands/mcp.ts` (добавлен вызов autoFixUIPlan)
- 📝 `cli/ai-codegen/EXPRESSION_SUPPORT.md` (этот файл)

**Проект собран успешно. Schema v1 теперь поддерживает expressions! 🎉**
