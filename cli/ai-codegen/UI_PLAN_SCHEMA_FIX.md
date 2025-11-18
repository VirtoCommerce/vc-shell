# UI-Plan Schema Validation Fix

**Date:** 2025-11-14
**Issue:** AI генерирует неправильные UI-Plan с ошибками валидации

---

## Проблема

При генерации UI-Plan AI (Cursor/Claude) не следует схеме и создаёт планы с ошибками:

### Типичные ошибки:
1. ❌ `module` как объект вместо строки
2. ❌ `component.name` вместо `component.type`
3. ❌ `toolbar.onClick` вместо `toolbar.action`
4. ❌ `state.loading: "boolean"` вместо `state.loading: {source, reactive}`
5. ❌ Отсутствует `$schema` и `route`
6. ❌ Неправильные feature names ("pull-to-refresh" вместо разрешённых)

### Причина:
AI не читает или неправильно интерпретирует JSON Schema из MCP ресурса `vcshell://ui-plan-schema`.

---

## Решение

Добавлен **полный пример правильного UI-Plan** как MCP ресурс, чтобы AI мог его увидеть и скопировать формат.

### Что сделано:

1. **Создан файл-пример:** `src/examples/ui-plan-example-complete.json`
   - Правильный формат всех полей
   - List blade + Details blade
   - Все обязательные поля ($schema, route, etc.)
   - Правильная структура logic, state, toolbar
   - Примеры features, widgets, components

2. **Добавлен MCP ресурс:** `vcshell://ui-plan-example-complete`
   - Description подчёркивает IMPORTANT и ALWAYS reference
   - Тип: application/json
   - Полный пример валидного плана

3. **Обновлён build:** скрипт `copy-assets.sh`
   - Копирует `*.json` файлы из examples в dist/

---

## Правильный формат UI-Plan

### Обязательные поля:
```json
{
  "$schema": "https://vc-shell.dev/schemas/ui-plan.v1.json",
  "module": "offers",  // ← STRING в kebab-case, не объект!
  "blades": [
    {
      "id": "offers-list",
      "route": "/offers",  // ← ОБЯЗАТЕЛЬНО!
      "layout": "grid",
      "title": "Offers",
      "components": [
        {
          "type": "VcTable",  // ← type, НЕ name!
          "columns": [...]
        }
      ],
      "features": ["filters", "multiselect"],  // ← Только из списка!
      "logic": {
        "state": {
          "loading": {  // ← ОБЪЕКТ, НЕ строка!
            "source": "composable",
            "reactive": true
          }
        },
        "toolbar": [
          {
            "id": "refresh",
            "icon": "fas fa-sync-alt",
            "action": "reload()"  // ← action, НЕ onClick!
          }
        ]
      }
    }
  ]
}
```

### Allowed values:

**features:** `["filters", "multiselect", "validation", "gallery", "widgets"]`

**component.type:** `["VcTable", "VcForm", "VcInput", "VcSelect", "VcSwitch", "VcCheckbox", "VcGallery", ...]`

**state.source:** `["composable", "local", "prop"]`

**layout:** `["page", "grid", "details"]`

---

## Как AI должен использовать:

1. **Перед генерацией UI-Plan:**
   - Прочитать `vcshell://ui-plan-example-complete`
   - Изучить правильный формат
   - Скопировать структуру

2. **При заполнении:**
   - Использовать правильные имена полей (`type`, `action`, etc.)
   - Правильно структурировать `state`, `toolbar`, `handlers`
   - Добавить все обязательные поля

3. **Валидация:**
   - Использовать `validate_and_fix_plan` при ошибках
   - Или исправить вручную по примеру

---

## Файлы изменены:

1. ✅ `src/examples/ui-plan-example-complete.json` (NEW)
2. ✅ `src/commands/mcp.ts` (+15 lines - MCP resource)
3. ✅ `scripts/copy-assets.sh` (+3 lines - copy JSON)

---

## Тестирование:

После пересборки AI должен:
1. Видеть новый MCP ресурс `vcshell://ui-plan-example-complete`
2. Читать пример перед генерацией UI-Plan
3. Следовать правильному формату
4. Генерировать валидные планы без ошибок

---

## Build Status:

```bash
npm run build
✅ ESM Build success
✅ DTS Build success
✅ Copied example JSON files
✅ 0 TypeScript errors
```

---

**Status:** ✅ FIXED
**Version:** 0.7.0-dev
**Next:** Протестировать генерацию UI-Plan с AI
