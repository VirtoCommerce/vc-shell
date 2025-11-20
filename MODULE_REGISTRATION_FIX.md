# Module Registration Fix for AI_FULL Strategy

## Проблема

ИИ получал неправильные инструкции и делал **две ошибки**:

1. **Пытался создать `bootstrap.ts`** и вручную регистрировать модуль через `registerModule()`
2. **Пытался добавить пункты меню** через `addMenuItem()` в `bootstrap.ts`

Обе практики неправильны для AI_FULL стратегии.

### Что делал ИИ (неправильно):

```typescript
// ❌ НЕПРАВИЛЬНО #1: ИИ пытался создать bootstrap.ts
export function bootstrap(app: App) {
  // ❌ Пытался добавить пункт меню в bootstrap.ts
  addMenuItem({
    title: "OFFERS.MENU.TITLE",
    icon: "fas fa-box",
    url: "/offers",
  });

  // ❌ Пытался вручную регистрировать модуль
  registerModule(OffersModule);
}
```

### Как должно быть:

**1. Регистрация модуля - автоматически в main.ts:**
```typescript
// ✅ ПРАВИЛЬНО: src/main.ts (обновляется автоматически)
import OffersModule from "./modules/offers";

const app = createApp(RouterView)
  .use(VirtoShellFramework, { router, i18n })
  .use(OffersModule, { router })  // ← Автоматически добавляется системой
  .use(router);
```

**2. Пункт меню - в defineOptions workspace-блейда:**
```typescript
// ✅ ПРАВИЛЬНО: src/modules/offers/pages/offers-list.vue
defineOptions({
  name: "OffersList",
  url: "/offers",
  isWorkspace: true,  // ← Workspace blade
  menuItem: {         // ← Пункт меню определяется ЗДЕСЬ
    title: "OFFERS.MENU.TITLE",
    icon: "fas fa-tags",
    priority: 10,
  },
});
```

## Решение

Обновлены инструкции в AI generation guide, чтобы явно запретить ИИ создавать bootstrap.ts и регистрировать модуль вручную.

### Файл: `cli/ai-codegen/src/core/ai-generation-guide-builder.ts`

#### 1. Добавлено правило #9 в CRITICAL_PATTERN_RULES про регистрацию (строки 1346-1358)

#### 2. Добавлено новое правило #9a про пункты меню (строки 1360-1377)

```typescript
## 9. MAIN.TS REGISTRATION (MANDATORY - AI_FULL ONLY)
⚠️ **FOR AI_FULL STRATEGY**: Module registration is AUTOMATED by the system.
✅ **DO NOT** tell AI to modify bootstrap.ts or use registerModule()
✅ **DO NOT** tell AI to use addMenuItem() directly
✅ System automatically adds to main.ts:
\`\`\`typescript
import {ModuleName}Module from "./modules/{module}";

const app = createApp(RouterView)
  .use(VirtoShellFramework, { router, i18n })
  .use({ModuleName}Module, { router })  // ← Automatically added
  .use(router);
\`\`\`
```

#### 3. Добавлены constraints про регистрацию модуля (строки 1039-1043)

#### 4. Добавлены constraints про пункты меню (строки 1045-1050)

```typescript
"⚠️ MODULE REGISTRATION (AI_FULL STRATEGY ONLY):",
"❌ NEVER create or modify bootstrap.ts - module registration is automated",
"❌ NEVER use registerModule() or addMenuItem() manually",
"✅ System automatically registers module in main.ts using .use(ModuleName, { router })",
"✅ Focus ONLY on creating blade components and module index.ts file",
```

#### 5. Добавлены запреты про регистрацию в mustNotHave (строки 1135-1139)

#### 6. Добавлены запреты про меню в mustNotHave (строки 1141-1144)

```typescript
"FORBIDDEN: MODULE REGISTRATION (AI_FULL ONLY):",
"❌ Creating bootstrap.ts file - Registration is automated",
"❌ Calling registerModule() function - System handles this",
"❌ Using addMenuItem() directly - System adds to main.ts automatically",
"❌ Modifying main.ts manually - System uses ModuleRegistrar class",
```

## Как это работает

### 1. ИИ генерирует код модуля

ИИ создает только:
- Blade компоненты (`src/modules/{module}/views/*.vue`)
- Composables (`src/modules/{module}/composables/*.ts`)
- Module index file (`src/modules/{module}/index.ts`)
- Locales (`src/modules/{module}/locales/*.ts`)

### 2. Система автоматически регистрирует модуль

Класс `ModuleRegistrar` ([module-registrar.ts](/Users/symbot/DEV/vc-shell/cli/ai-codegen/src/core/module-registrar.ts)):
- Парсит `main.ts` с помощью Babel
- Добавляет `import {ModuleName}Module from "./modules/{module}"`
- Вставляет `.use({ModuleName}Module, { router })` перед `.use(router)`
- Сохраняет обновленный файл

### 3. Результат

```typescript
// main.ts (автоматически обновлен)
import { createApp } from "vue";
import { RouterView } from "vue-router";
import { VirtoShellFramework } from "@vc-shell/framework";
import OffersModule from "./modules/offers"; // ← Добавлено автоматически

const app = createApp(RouterView)
  .use(VirtoShellFramework, {
    router,
    i18n: {
      locale: import.meta.env.APP_I18N_LOCALE,
      fallbackLocale: import.meta.env.APP_I18N_FALLBACK_LOCALE,
    },
  })
  .use(OffersModule, { router }) // ← Добавлено автоматически
  .use(router);

await router.isReady();
app.mount("#app");
```

## Различие между стратегиями

### AI_FULL Strategy (используется в MCP)
```
ИИ пишет код → submit_generated_code → Система регистрирует модуль автоматически
                                       ↓
                                   ModuleRegistrar обновляет main.ts
```

**ИИ НЕ должен:**
- ❌ Создавать bootstrap.ts
- ❌ Вызывать registerModule()
- ❌ Использовать addMenuItem()

### Template/Composition Strategy (legacy)
```
Система генерирует код → Система регистрирует модуль автоматически
```

## Правильный подход к пунктам меню

### Неправильно (что делал ИИ):

```typescript
// ❌ src/bootstrap.ts - НЕПРАВИЛЬНО!
import { addMenuItem } from "@vc-shell/framework";

export function bootstrap(app: App) {
  // ❌ Добавление пункта меню в bootstrap.ts
  addMenuItem({
    title: "Offers",
    icon: "fas fa-tags",
    priority: 10,
    url: "/offers",
  });
}
```

### Правильно (как должно быть):

```vue
<!-- ✅ src/modules/offers/pages/offers-list.vue -->
<template>
  <VcBlade>
    <!-- ... -->
  </VcBlade>
</template>

<script setup lang="ts">
defineOptions({
  name: "OffersList",
  url: "/offers",
  isWorkspace: true,  // ← ОБЯЗАТЕЛЬНО для workspace blade!
  menuItem: {         // ← Пункт меню определяется ЗДЕСЬ
    title: "OFFERS.MENU.TITLE",  // Используйте i18n ключи
    icon: "fas fa-tags",
    priority: 10,
    // Опционально: groupConfig для группировки
    groupConfig: {
      id: "management-group",
      title: "COMMON.GROUPS.MANAGEMENT"
    }
  },
  permissions: ["offers:manage"],  // Опционально: права доступа
});
</script>
```

**Почему так:**
- Framework автоматически регистрирует пункты меню из workspace-блейдов
- `isWorkspace: true` говорит, что это главный блейд модуля
- `menuItem` интегрируется с системой навигации и разрешениями
- Все в одном месте - проще поддерживать

## Когда bootstrap.ts используется

`bootstrap.ts` используется **ТОЛЬКО** для:
1. **Dashboard widgets** - регистрация виджетов дашборда
2. **Custom initialization** - кастомная инициализация приложения

**НЕ** для регистрации модулей!

### Пример правильного использования bootstrap.ts:

```typescript
// src/bootstrap.ts (создается вручную, не ИИ)
import { addMenuItem, registerDashboardWidget } from "@vc-shell/framework";
import { markRaw } from "vue";
import WelcomeWidget from "./components/dashboard-widgets/WelcomeWidget.vue";

export function bootstrap(app: App) {
  // Регистрация dashboard виджетов
  registerDashboardWidget({
    id: "welcome-widget",
    name: "Welcome",
    component: markRaw(WelcomeWidget),
    size: { width: 6, height: 6 },
    position: { x: 0, y: 0 },
  });

  // Добавление пунктов меню (опционально)
  addMenuItem({
    title: "DASHBOARD.MENU.TITLE",
    icon: "lucide-home",
    priority: 0,
    url: "/",
  });
}
```

## Проверка работы

После исправления ИИ больше не должен:
1. ❌ Создавать файл `bootstrap.ts` в модуле
2. ❌ Пытаться использовать `registerModule()`
3. ❌ Пытаться использовать `addMenuItem()` для регистрации модуля
4. ❌ Модифицировать `main.ts` вручную

ИИ должен:
1. ✅ Создать blade компоненты
2. ✅ Создать composables
3. ✅ Создать module index.ts с `createAppModule()`
4. ✅ Создать locales
5. ✅ Отправить код через `submit_generated_code`
6. ✅ Система автоматически обновит main.ts

## Связанные файлы

- [ai-generation-guide-builder.ts](/Users/symbot/DEV/vc-shell/cli/ai-codegen/src/core/ai-generation-guide-builder.ts) - Generation guide с инструкциями
- [module-registrar.ts](/Users/symbot/DEV/vc-shell/cli/ai-codegen/src/core/module-registrar.ts) - Автоматическая регистрация
- [unified-generator.ts](/Users/symbot/DEV/vc-shell/cli/ai-codegen/src/core/unified-generator.ts) - Вызывает ModuleRegistrar
- [bootstrap.example.ts](/Users/symbot/DEV/vc-shell/cli/ai-codegen/src/examples/pages/bootstrap.example.ts) - Пример bootstrap для dashboard
- [README.md](/Users/symbot/DEV/vc-shell/cli/ai-codegen/src/examples/pages/README.md) - Документация по dashboard

## Итого

**Правило простое:**
- **AI_FULL стратегия**: ИИ создает только код компонентов, система регистрирует модуль автоматически в `main.ts` через `.use()`
- **bootstrap.ts**: используется ТОЛЬКО для dashboard widgets, НЕ для модулей
