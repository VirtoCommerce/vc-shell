# Рефакторинг AI Generation Guide: Внешние файлы правил

## Проблема

**Текущий подход:**
- Все правила hardcoded в `ai-generation-guide-builder.ts` (1500+ строк)
- Сложно поддерживать и кастомизировать
- Дублирование с `/examples` - примеры есть, но не используются
- Для добавления правила нужно менять код

**Примеры есть, но не используются:**
```
cli/ai-codegen/src/examples/
├── patterns/          ← Паттерны есть, но читаются только в composition
├── compositions/      ← Композиции для list/details
├── framework/         ← Framework API examples
└── capabilities/      ← Component capabilities
```

## Решение: Внешние YAML/JSON правила

### 1. Структура правил

```
cli/ai-codegen/src/rules/
├── critical/                    # Критические правила (ОБЯЗАТЕЛЬНЫЕ)
│   ├── 01-script-setup.yaml
│   ├── 02-imports.yaml
│   ├── 03-reactive-state.yaml
│   ├── 04-props-emits.yaml
│   ├── 05-composables.yaml
│   ├── 06-toolbar.yaml
│   ├── 07-event-handlers.yaml
│   ├── 08-template-refs.yaml
│   ├── 09-module-registration.yaml    # ← Fix #2
│   ├── 09a-menu-items.yaml            # ← Fix #3
│   ├── 10-watchers.yaml
│   ├── 11-lifecycle.yaml
│   ├── 12-i18n.yaml
│   ├── 13-browser-unload.yaml         # ← Fix #4a
│   └── 14-blade-close.yaml            # ← Fix #4b
│
├── constraints/                 # Ограничения (что НЕЛЬЗЯ)
│   ├── forbidden-patterns.yaml
│   ├── deprecated-apis.yaml
│   └── anti-patterns.yaml
│
├── best-practices/              # Лучшие практики (рекомендации)
│   ├── typescript.yaml
│   ├── performance.yaml
│   ├── accessibility.yaml
│   └── error-handling.yaml
│
└── custom/                      # Пользовательские правила (опционально)
    └── README.md                # Инструкция как добавлять свои правила
```

### 2. Формат файла правила (YAML)

**Пример: `rules/critical/13-browser-unload.yaml`**

```yaml
id: "13"
name: "Browser Unload Prevention"
category: "critical"
priority: 100
enabled: true
applies_to:
  - "details"
  - "edit"

# Описание правила
description: |
  Use framework composables for browser unload prevention.
  NEVER use window.onbeforeunload manually.

# Что НЕЛЬЗЯ делать
forbidden:
  - pattern: "window.onbeforeunload"
    reason: "Use useBeforeUnload(modifiedRef) instead"
    severity: "error"

  - pattern: "watch\\(modified.*window\\.onbeforeunload"
    reason: "Manual window.onbeforeunload causes memory leaks"
    severity: "error"

# Что НАДО делать
required:
  - pattern: "useBeforeUnload\\(.*\\)"
    when: "modified flag exists"
    severity: "warning"

# Правильный паттерн
correct_pattern:
  file: "examples/patterns/browser-unload-prevention.md"
  inline: |
    ```typescript
    import { ref } from 'vue';
    import { useBeforeUnload } from '@vc-shell/framework';

    const modified = ref(false);
    useBeforeUnload(modified); // ✅ Pass ref directly
    ```

# Неправильный паттерн
wrong_pattern:
  inline: |
    ```typescript
    // ❌ WRONG: Manual window.onbeforeunload
    watch(modified, (val) => {
      window.onbeforeunload = val ? () => message : null;
    });
    ```

# Примеры (ссылки на существующие файлы)
examples:
  - "examples/compositions/details/modified-tracking.md"
  - "examples/framework/composables/useBeforeUnload.md"

# Автоматические проверки
validations:
  - type: "regex"
    pattern: "window\\.onbeforeunload\\s*="
    message: "❌ FORBIDDEN: Use useBeforeUnload(modifiedRef) instead of window.onbeforeunload"

  - type: "required_import"
    import: "useBeforeUnload"
    from: "@vc-shell/framework"
    when: "modified ref exists"
    message: "⚠️ Import useBeforeUnload from @vc-shell/framework"

# Автоматические исправления (для submit_generated_code validator)
auto_fix:
  enabled: true
  transforms:
    - find: "window\\.onbeforeunload\\s*=\\s*.*"
      replace: "useBeforeUnload(modified)"
      add_import:
        name: "useBeforeUnload"
        from: "@vc-shell/framework"
```

**Пример: `rules/critical/09-module-registration.yaml`**

```yaml
id: "09"
name: "Module Registration"
category: "critical"
priority: 100
enabled: true
strategy: "AI_FULL"  # Только для AI_FULL стратегии

description: |
  Module registration is AUTOMATED by the system.
  DO NOT create bootstrap.ts for module registration.

forbidden:
  - pattern: "registerModule\\("
    reason: "System automatically registers modules in main.ts"
    severity: "error"
    strategy: "AI_FULL"

  - file: "bootstrap.ts"
    reason: "bootstrap.ts is ONLY for dashboard widgets, NOT module registration"
    severity: "error"
    strategy: "AI_FULL"
    exception: "Dashboard widgets registration"

correct_pattern:
  description: "System automatically updates main.ts"
  file: "examples/patterns/module-registration.md"
  inline: |
    ```typescript
    // ✅ AUTOMATIC: System updates main.ts
    import {ModuleName}Module from "./modules/{module}";

    const app = createApp(RouterView)
      .use(VirtoShellFramework, { router, i18n })
      .use({ModuleName}Module, { router })  // ← Added automatically
      .use(router);
    ```

instructions: |
  1. Create blade components (*.vue)
  2. Create composables (*.ts)
  3. Create module index (index.ts)
  4. Submit code via submit_generated_code
  5. System automatically registers module in main.ts

examples:
  - "examples/patterns/module-registration.md"
  - "examples/pages/README.md"

validations:
  - type: "forbidden_file"
    file: "src/modules/*/bootstrap.ts"
    message: "❌ FORBIDDEN: Do not create bootstrap.ts for module registration"
    strategy: "AI_FULL"
```

### 3. Загрузчик правил

**Новый файл: `src/core/rules-loader.ts`**

```typescript
import fs from "fs-extra";
import path from "path";
import yaml from "js-yaml";
import { glob } from "glob";

export interface Rule {
  id: string;
  name: string;
  category: "critical" | "constraint" | "best-practice" | "custom";
  priority: number;
  enabled: boolean;
  strategy?: "AI_FULL" | "COMPOSITION" | "TEMPLATE" | "ALL";
  applies_to?: Array<"list" | "details" | "edit" | "all">;
  description: string;
  forbidden?: ForbiddenPattern[];
  required?: RequiredPattern[];
  correct_pattern?: Pattern;
  wrong_pattern?: Pattern;
  examples?: string[];
  validations?: Validation[];
  auto_fix?: AutoFix;
  instructions?: string;
}

interface ForbiddenPattern {
  pattern?: string;
  file?: string;
  reason: string;
  severity: "error" | "warning";
  strategy?: string;
  exception?: string;
}

interface RequiredPattern {
  pattern: string;
  when?: string;
  severity: "error" | "warning";
}

interface Pattern {
  file?: string;
  inline?: string;
  description?: string;
}

interface Validation {
  type: "regex" | "required_import" | "forbidden_file" | "custom";
  pattern?: string;
  file?: string;
  import?: string;
  from?: string;
  when?: string;
  message: string;
  strategy?: string;
}

interface AutoFix {
  enabled: boolean;
  transforms?: Transform[];
}

interface Transform {
  find: string;
  replace: string;
  add_import?: {
    name: string;
    from: string;
  };
}

export class RulesLoader {
  private rulesDir: string;
  private examplesDir: string;
  private cache: Map<string, Rule[]> = new Map();

  constructor(baseDir?: string) {
    this.rulesDir = baseDir
      ? path.join(baseDir, "rules")
      : path.join(__dirname, "../rules");
    this.examplesDir = baseDir
      ? path.join(baseDir, "examples")
      : path.join(__dirname, "../examples");
  }

  /**
   * Загрузить все правила
   */
  async loadAllRules(): Promise<Rule[]> {
    const cacheKey = "all";
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const categories = ["critical", "constraints", "best-practices", "custom"];
    const allRules: Rule[] = [];

    for (const category of categories) {
      const categoryPath = path.join(this.rulesDir, category);
      if (!(await fs.pathExists(categoryPath))) continue;

      const files = await glob("**/*.{yaml,yml}", { cwd: categoryPath });

      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const rule = await this.loadRule(filePath);
        if (rule && rule.enabled) {
          allRules.push(rule);
        }
      }
    }

    // Сортировка по priority (больше = важнее)
    allRules.sort((a, b) => b.priority - a.priority);

    this.cache.set(cacheKey, allRules);
    return allRules;
  }

  /**
   * Загрузить правило из файла
   */
  private async loadRule(filePath: string): Promise<Rule | null> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const rule = yaml.load(content) as Rule;

      // Резолвим пути к примерам
      if (rule.examples) {
        rule.examples = rule.examples.map((ex) =>
          path.join(this.examplesDir, ex)
        );
      }

      if (rule.correct_pattern?.file) {
        rule.correct_pattern.file = path.join(
          this.examplesDir,
          rule.correct_pattern.file
        );
      }

      return rule;
    } catch (error) {
      console.warn(`Failed to load rule from ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Загрузить правила по категории
   */
  async loadByCategory(
    category: "critical" | "constraint" | "best-practice" | "custom"
  ): Promise<Rule[]> {
    const cacheKey = `category:${category}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const allRules = await this.loadAllRules();
    const filtered = allRules.filter((r) => r.category === category);

    this.cache.set(cacheKey, filtered);
    return filtered;
  }

  /**
   * Загрузить правила для стратегии
   */
  async loadForStrategy(
    strategy: "AI_FULL" | "COMPOSITION" | "TEMPLATE"
  ): Promise<Rule[]> {
    const cacheKey = `strategy:${strategy}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const allRules = await this.loadAllRules();
    const filtered = allRules.filter(
      (r) => !r.strategy || r.strategy === "ALL" || r.strategy === strategy
    );

    this.cache.set(cacheKey, filtered);
    return filtered;
  }

  /**
   * Загрузить правила для blade type
   */
  async loadForBladeType(bladeType: "list" | "details" | "edit"): Promise<Rule[]> {
    const cacheKey = `blade:${bladeType}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const allRules = await this.loadAllRules();
    const filtered = allRules.filter(
      (r) =>
        !r.applies_to ||
        r.applies_to.includes("all") ||
        r.applies_to.includes(bladeType)
    );

    this.cache.set(cacheKey, filtered);
    return filtered;
  }

  /**
   * Загрузить содержимое примера
   */
  async loadExample(examplePath: string): Promise<string> {
    const fullPath = path.join(this.examplesDir, examplePath);
    if (await fs.pathExists(fullPath)) {
      return await fs.readFile(fullPath, "utf-8");
    }
    return "";
  }

  /**
   * Очистить кеш
   */
  clearCache(): void {
    this.cache.clear();
  }
}
```

### 4. Обновленный AI Generation Guide Builder

**Изменения в `ai-generation-guide-builder.ts`:**

```typescript
import { RulesLoader } from "./rules-loader";

export class AIGenerationGuideBuilder {
  private rulesLoader: RulesLoader;

  constructor() {
    this.rulesLoader = new RulesLoader();
  }

  async buildGuide(
    bladeId: string,
    bladeType: "list" | "details",
    features: string[],
    plan: UIPlan
  ): Promise<string> {
    const sections: string[] = [];

    // 1. Header (как раньше)
    sections.push(this.buildHeader(bladeId, bladeType));

    // 2. Requirements (как раньше)
    sections.push(this.buildRequirements(bladeType, features));

    // 3. CRITICAL PATTERN RULES - Загружаем из файлов!
    sections.push(await this.buildCriticalRules(bladeType));

    // 4. Constraints - Загружаем из файлов!
    sections.push(await this.buildConstraints(bladeType));

    // 5. Forbidden patterns - Загружаем из файлов!
    sections.push(await this.buildForbiddenPatterns(bladeType));

    // 6. Examples - Загружаем из файлов!
    sections.push(await this.buildExamples(bladeType, features));

    // 7. Validation rules - Загружаем из файлов!
    sections.push(await this.buildValidations(bladeType));

    return sections.join("\n\n");
  }

  /**
   * Построить секцию CRITICAL_PATTERN_RULES из файлов
   */
  private async buildCriticalRules(bladeType: "list" | "details"): Promise<string> {
    const rules = await this.rulesLoader.loadByCategory("critical");
    const applicableRules = rules.filter(
      (r) =>
        !r.applies_to ||
        r.applies_to.includes("all") ||
        r.applies_to.includes(bladeType)
    );

    const lines: string[] = [
      "# CRITICAL PATTERN RULES (MANDATORY)",
      "",
      "⚠️ **THESE RULES ARE MANDATORY AND WILL BE VALIDATED**",
      "",
    ];

    for (const rule of applicableRules) {
      lines.push(`## ${rule.id}. ${rule.name.toUpperCase()} (MANDATORY)`);
      lines.push("");

      if (rule.description) {
        lines.push(rule.description);
        lines.push("");
      }

      // Wrong patterns
      if (rule.wrong_pattern) {
        lines.push("❌ **WRONG:**");
        if (rule.wrong_pattern.inline) {
          lines.push(rule.wrong_pattern.inline);
        }
        lines.push("");
      }

      // Correct patterns
      if (rule.correct_pattern) {
        lines.push("✅ **CORRECT:**");
        if (rule.correct_pattern.inline) {
          lines.push(rule.correct_pattern.inline);
        } else if (rule.correct_pattern.file) {
          const example = await this.rulesLoader.loadExample(rule.correct_pattern.file);
          lines.push(example);
        }
        lines.push("");
      }

      // Instructions
      if (rule.instructions) {
        lines.push("**Instructions:**");
        lines.push(rule.instructions);
        lines.push("");
      }

      lines.push("---");
      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * Построить секцию Constraints из файлов
   */
  private async buildConstraints(bladeType: "list" | "details"): Promise<string> {
    const rules = await this.rulesLoader.loadForBladeType(bladeType);
    const lines: string[] = ["# CONSTRAINTS (DO NOT VIOLATE)", ""];

    for (const rule of rules) {
      if (!rule.forbidden || rule.forbidden.length === 0) continue;

      lines.push(`⚠️ ${rule.name.toUpperCase()}:`);
      for (const forbidden of rule.forbidden) {
        lines.push(`❌ NEVER ${forbidden.pattern || forbidden.file} - ${forbidden.reason}`);
      }

      if (rule.required && rule.required.length > 0) {
        for (const required of rule.required) {
          lines.push(`✅ ALWAYS use: ${required.pattern}`);
        }
      }

      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * Построить секцию Forbidden Patterns из файлов
   */
  private async buildForbiddenPatterns(bladeType: "list" | "details"): Promise<string> {
    const rules = await this.rulesLoader.loadForBladeType(bladeType);
    const lines: string[] = ["# FORBIDDEN PATTERNS (MUST NOT HAVE)", ""];

    for (const rule of rules) {
      if (!rule.forbidden || rule.forbidden.length === 0) continue;

      lines.push(`FORBIDDEN: ${rule.name.toUpperCase()}:`);
      for (const forbidden of rule.forbidden) {
        const severity = forbidden.severity === "error" ? "❌" : "⚠️";
        lines.push(`${severity} ${forbidden.pattern || forbidden.file} - ${forbidden.reason}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * Построить секцию Examples из файлов
   */
  private async buildExamples(bladeType: "list" | "details", features: string[]): Promise<string> {
    const rules = await this.rulesLoader.loadForBladeType(bladeType);
    const lines: string[] = ["# CODE EXAMPLES", ""];

    for (const rule of rules) {
      if (!rule.examples || rule.examples.length === 0) continue;

      lines.push(`## ${rule.name}`);
      lines.push("");

      for (const examplePath of rule.examples) {
        const example = await this.rulesLoader.loadExample(examplePath);
        if (example) {
          lines.push(example);
          lines.push("");
        }
      }
    }

    return lines.join("\n");
  }

  /**
   * Построить секцию Validations из файлов
   */
  private async buildValidations(bladeType: "list" | "details"): Promise<string> {
    const rules = await this.rulesLoader.loadForBladeType(bladeType);
    const lines: string[] = ["# VALIDATION RULES", ""];

    for (const rule of rules) {
      if (!rule.validations || rule.validations.length === 0) continue;

      lines.push(`## ${rule.name}`);
      for (const validation of rule.validations) {
        lines.push(`- ${validation.message}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }
}
```

### 5. Валидатор кода с правилами

**Обновленный `pattern-validator.ts`:**

```typescript
import { RulesLoader, Rule } from "./rules-loader";

export class PatternValidator {
  private rulesLoader: RulesLoader;

  constructor() {
    this.rulesLoader = new RulesLoader();
  }

  async validateCode(
    code: string,
    bladeType: "list" | "details",
    strategy: "AI_FULL" | "COMPOSITION"
  ): Promise<ValidationResult> {
    const rules = await this.rulesLoader.loadForBladeType(bladeType);
    const strategyRules = rules.filter(
      (r) => !r.strategy || r.strategy === "ALL" || r.strategy === strategy
    );

    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    for (const rule of strategyRules) {
      if (!rule.validations) continue;

      for (const validation of rule.validations) {
        const result = this.runValidation(code, validation, rule);
        if (result) {
          if (validation.severity === "error") {
            errors.push(result);
          } else {
            warnings.push(result);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      autoFixes: await this.generateAutoFixes(code, strategyRules),
    };
  }

  private runValidation(
    code: string,
    validation: Validation,
    rule: Rule
  ): ValidationError | null {
    switch (validation.type) {
      case "regex":
        if (validation.pattern && new RegExp(validation.pattern).test(code)) {
          return {
            rule: rule.name,
            message: validation.message,
            line: this.findLineNumber(code, validation.pattern),
          };
        }
        break;

      case "required_import":
        if (validation.import && !this.hasImport(code, validation.import, validation.from)) {
          // Check if condition is met
          if (!validation.when || this.checkCondition(code, validation.when)) {
            return {
              rule: rule.name,
              message: validation.message,
            };
          }
        }
        break;

      case "forbidden_file":
        // This would be checked by file path, not code content
        break;
    }

    return null;
  }

  private async generateAutoFixes(code: string, rules: Rule[]): Promise<AutoFixSuggestion[]> {
    const fixes: AutoFixSuggestion[] = [];

    for (const rule of rules) {
      if (!rule.auto_fix?.enabled || !rule.auto_fix.transforms) continue;

      for (const transform of rule.auto_fix.transforms) {
        const regex = new RegExp(transform.find, "g");
        if (regex.test(code)) {
          fixes.push({
            rule: rule.name,
            description: `Replace ${transform.find} with ${transform.replace}`,
            transform,
          });
        }
      }
    }

    return fixes;
  }

  private hasImport(code: string, name: string, from?: string): boolean {
    const importRegex = from
      ? new RegExp(`import\\s+.*${name}.*from\\s+["']${from}["']`)
      : new RegExp(`import\\s+.*${name}`);
    return importRegex.test(code);
  }

  private checkCondition(code: string, condition: string): boolean {
    // Simple condition checking (can be extended)
    return code.includes(condition);
  }

  private findLineNumber(code: string, pattern: string): number {
    const lines = code.split("\n");
    const regex = new RegExp(pattern);
    return lines.findIndex((line) => regex.test(line)) + 1;
  }
}
```

### 6. Преимущества нового подхода

#### ✅ Для разработчиков:
1. **Легко добавлять правила** - просто создать YAML файл
2. **Легко редактировать** - изменения в YAML, не в коде
3. **Переиспользование примеров** - ссылки на `/examples`
4. **Версионирование** - можно коммитить правила отдельно
5. **Тестирование** - каждое правило можно тестировать независимо

#### ✅ Для пользователей:
1. **Кастомные правила** - добавить в `rules/custom/`
2. **Отключение правил** - `enabled: false` в YAML
3. **Переопределение** - свои правила приоритетнее
4. **Прозрачность** - видно какие правила применяются

#### ✅ Для ИИ:
1. **Меньше токенов** - загружаются только нужные правила
2. **Релевантность** - фильтрация по blade type, strategy, features
3. **Структура** - четкий формат правил
4. **Примеры** - inline code examples

### 7. Миграция

**Этап 1: Создать структуру**
```bash
mkdir -p cli/ai-codegen/src/rules/{critical,constraints,best-practices,custom}
```

**Этап 2: Перенести правила из кода в YAML**
- Правило #9 → `rules/critical/09-module-registration.yaml`
- Правило #9a → `rules/critical/09a-menu-items.yaml`
- Правило #13 → `rules/critical/13-browser-unload.yaml`
- Правило #14 → `rules/critical/14-blade-close.yaml`
- И так далее...

**Этап 3: Обновить builder**
- Заменить hardcoded rules на `rulesLoader.loadAllRules()`
- Сохранить обратную совместимость

**Этап 4: Добавить валидацию**
- Использовать правила в `pattern-validator.ts`
- Auto-fix поддержка

**Этап 5: Документация**
- README в `rules/custom/` как добавлять свои правила
- Примеры кастомных правил

### 8. Размер файла после рефакторинга

**Было:**
```
ai-generation-guide-builder.ts: 1500+ строк
```

**Станет:**
```
ai-generation-guide-builder.ts: ~300 строк (только логика построения)
rules-loader.ts: ~200 строк (загрузчик)
rules/critical/*.yaml: ~50-100 строк каждый файл
```

**Итого:** Вместо одного огромного файла - структура из маленьких файлов, легко поддерживаемых.

---

## Резюме

**Предложение:**
1. Создать `/rules` с YAML файлами правил
2. Создать `RulesLoader` для загрузки правил
3. Обновить `AIGenerationGuideBuilder` для использования загрузчика
4. Добавить `PatternValidator` с поддержкой правил и auto-fix
5. Мигрировать существующие правила в YAML

**Результат:**
- ✅ Маленькие файлы вместо одного огромного
- ✅ Легко добавлять/редактировать правила
- ✅ Кастомизация без изменения кода
- ✅ Переиспользование существующих примеров
- ✅ Автоматическая валидация и исправление кода
