import { upperFirst, camelCase } from "lodash-es";
import type { NamingConfig } from "./code-generator.js";
import type { Column, Field } from "./template-adapter.js";

export interface ListComposableConfig {
  naming: NamingConfig;
  columns: Column[];
  features?: string[];
}

export interface DetailsComposableConfig {
  naming: NamingConfig;
  fields: Field[];
  features?: string[];
}

/**
 * ComposableGenerator generates composables with mock data
 *
 * All composables use mock data for immediate UI testing.
 * Real API integration is a separate task for later.
 */
export class ComposableGenerator {
  /**
   * Generate list composable (useEntityList)
   */
  generateListComposable(config: ListComposableConfig): string {
    const { naming, columns } = config;
    const entityType = naming.entitySingularPascal;
    const composableName = `use${entityType}List`;

    // Generate interface from columns
    const interfaceFields = this.generateInterfaceFromColumns(columns);

    // Generate mock data
    const mockData = this.generateMockListData(naming, columns);

    return `import { ref, computed } from "vue";

export interface ${entityType} {
${interfaceFields}
}

// Mock data for development
const MOCK_${naming.entityPluralCamel.toUpperCase()}: ${entityType}[] = [
${mockData}
];

export interface SearchQuery {
  skip?: number;
  take?: number;
  sort?: string;
  keyword?: string;
}

export default function ${composableName}() {
  const items = ref<${entityType}[]>([]);
  const loading = ref(false);
  const totalCount = ref(0);
  const currentPage = ref(1);
  const searchQuery = ref<SearchQuery>({ take: 20 });
  const pageSize = 20;

  const pages = computed(() => Math.ceil(totalCount.value / pageSize));

  async function load${naming.entityPluralPascal}(query?: SearchQuery) {
    loading.value = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Apply mock filtering
    let filtered = [...MOCK_${naming.entityPluralCamel.toUpperCase()}];

    if (query?.keyword) {
      const keyword = query.keyword.toLowerCase();
      filtered = filtered.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(keyword)
        )
      );
    }

    // Apply pagination
    const skip = query?.skip || 0;
    const take = query?.take || 20;
    items.value = filtered.slice(skip, skip + take);
    totalCount.value = filtered.length;

    if (query) {
      searchQuery.value = { ...searchQuery.value, ...query };
      currentPage.value = Math.floor(skip / pageSize) + 1;
    }

    loading.value = false;
  }

  async function delete${entityType}(id: string) {
    loading.value = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Remove from mock data
    const index = MOCK_${naming.entityPluralCamel.toUpperCase()}.findIndex(item => item.id === id);
    if (index !== -1) {
      MOCK_${naming.entityPluralCamel.toUpperCase()}.splice(index, 1);
    }

    // Reload list
    await load${naming.entityPluralPascal}(searchQuery.value);

    loading.value = false;
  }

  return {
    items: computed(() => items.value),
    loading: computed(() => loading.value),
    totalCount: computed(() => totalCount.value),
    currentPage: computed(() => currentPage.value),
    pages,
    searchQuery,
    load${naming.entityPluralPascal},
    delete${entityType},
  };
}
`;
  }

  /**
   * Generate details composable (useEntityDetails)
   */
  generateDetailsComposable(config: DetailsComposableConfig): string {
    const { naming, fields } = config;
    const entityType = naming.entitySingularPascal;
    const composableName = `use${entityType}Details`;

    // Generate interface from fields
    const interfaceFields = this.generateInterfaceFromFields(fields);

    // Generate empty entity factory
    const emptyEntity = this.generateEmptyEntity(fields);

    // Generate async selectors for VcSelect fields
    const asyncSelectorsCode = this.generateAsyncSelectors(fields, entityType);
    const asyncSelectorsReturn = this.generateAsyncSelectorsReturn(fields);

    return `import { ref, computed, watch } from "vue";

export interface ${entityType} {
${interfaceFields}
}

function createEmpty${entityType}(): ${entityType} {
  return {
${emptyEntity}
  };
}

export default function ${composableName}() {
  const item = ref<${entityType}>(createEmpty${entityType}());
  const loading = ref(false);
  const modified = ref(false);
  const originalItem = ref<${entityType}>(createEmpty${entityType}());

  // Track modifications
  watch(
    () => item.value,
    () => {
      modified.value = JSON.stringify(item.value) !== JSON.stringify(originalItem.value);
    },
    { deep: true }
  );

  async function load${entityType}(args: { id: string }) {
    loading.value = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock data for existing item
    item.value = {
      id: args.id,
      name: \`${entityType} \${args.id}\`,
${fields
  .filter(f => f.key !== "id" && f.key !== "name")
  .map(f => {
    if (f.type === "email") {
      return `      ${f.key}: \`${f.key}\${args.id}@example.com\`,`;
    } else if (f.type === "boolean") {
      return `      ${f.key}: true,`;
    } else if (f.type === "date") {
      return `      ${f.key}: new Date().toISOString(),`;
    } else {
      return `      ${f.key}: "Mock ${f.label || f.key}",`;
    }
  })
  .join("\n")}
    };

    originalItem.value = JSON.parse(JSON.stringify(item.value));
    loading.value = false;
  }

  async function create${entityType}(entity: Omit<${entityType}, "id">): Promise<${entityType}> {
    loading.value = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    // Mock create
    const newEntity: ${entityType} = {
      ...entity,
      id: \`mock-\${Date.now()}\`,
    } as ${entityType};

    item.value = newEntity;
    originalItem.value = JSON.parse(JSON.stringify(newEntity));
    modified.value = false;

    loading.value = false;
    return newEntity;
  }

  async function update${entityType}(entity: ${entityType} & { id: string }): Promise<${entityType}> {
    loading.value = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    // Mock update
    item.value = { ...entity };
    originalItem.value = JSON.parse(JSON.stringify(entity));
    modified.value = false;

    loading.value = false;
    return entity;
  }

  async function delete${entityType}(args: { id: string }) {
    loading.value = true;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock delete
    loading.value = false;
  }

  function resetModificationState() {
    originalItem.value = JSON.parse(JSON.stringify(item.value));
    modified.value = false;
  }

${asyncSelectorsCode}

  return {
    item,
    loading: computed(() => loading.value),
    isModified: computed(() => modified.value),
    load${entityType},
    create${entityType},
    update${entityType},
    delete${entityType},
    resetModificationState,${asyncSelectorsReturn}
  };
}
`;
  }

  /**
   * Generate interface fields from columns
   */
  private generateInterfaceFromColumns(columns: Column[]): string {
    const fields: string[] = [
      "  id: string;",
      "  name: string;",
    ];

    columns.forEach(col => {
      if (col.key === "id" || col.key === "name") return;

      let type = "string";
      if (col.type === "date" || col.type === "date-ago") {
        type = "Date | string";
      } else if (col.type === "number" || col.type === "money") {
        type = "number";
      } else if (col.type === "boolean") {
        type = "boolean";
      }

      fields.push(`  ${col.key}: ${type};`);
    });

    return fields.join("\n");
  }

  /**
   * Generate interface fields from form fields
   */
  private generateInterfaceFromFields(fields: Field[]): string {
    const interfaceFields: string[] = [
      "  id?: string;",
    ];

    fields.forEach(field => {
      if (field.key === "id") return;

      let type = "string";
      if (field.type === "email") {
        type = "string";
      } else if (field.type === "number") {
        type = "number";
      } else if (field.type === "boolean") {
        type = "boolean";
      } else if (field.type === "date") {
        type = "string | Date";
      }

      const optional = field.required ? "" : "?";
      interfaceFields.push(`  ${field.key}${optional}: ${type};`);
    });

    return interfaceFields.join("\n");
  }

  /**
   * Generate mock list data
   */
  private generateMockListData(naming: NamingConfig, columns: Column[]): string {
    const items: string[] = [];

    for (let i = 1; i <= 3; i++) {
      const fields: string[] = [
        `    id: "${i}"`,
        `    name: "${naming.entitySingularPascal} ${i}"`,
      ];

      columns.forEach(col => {
        if (col.key === "id" || col.key === "name") return;

        if (col.type === "email") {
          fields.push(`    ${col.key}: "${col.key}${i}@example.com"`);
        } else if (col.type === "status") {
          const statuses = ["active", "inactive", "pending"];
          fields.push(`    ${col.key}: "${statuses[i % 3]}"`);
        } else if (col.type === "date" || col.type === "date-ago") {
          fields.push(`    ${col.key}: new Date(Date.now() - ${i} * 86400000)`);
        } else if (col.type === "number" || col.type === "money") {
          fields.push(`    ${col.key}: ${i * 100}`);
        } else if (col.type === "boolean") {
          fields.push(`    ${col.key}: ${i % 2 === 0}`);
        } else {
          fields.push(`    ${col.key}: "Mock ${col.title || col.key} ${i}"`);
        }
      });

      items.push(`  {\n${fields.join(",\n")},\n  }`);
    }

    return items.join(",\n");
  }

  /**
   * Generate empty entity for details
   */
  private generateEmptyEntity(fields: Field[]): string {
    const fieldDefaults: string[] = [
      '    id: ""',
    ];

    fields.forEach(field => {
      if (field.key === "id") return;

      let defaultValue = '""';
      if (field.type === "number") {
        defaultValue = "0";
      } else if (field.type === "boolean") {
        defaultValue = "false";
      } else if (field.type === "date") {
        defaultValue = "new Date().toISOString()";
      }

      fieldDefaults.push(`    ${field.key}: ${defaultValue}`);
    });

    return fieldDefaults.join(",\n");
  }

  /**
   * Generate async selector functions for VcSelect fields
   * VcSelect expects: (keyword?: string, skip?: number, ids?: string[]) => Promise<{ results: T[], totalCount: number }>
   */
  private generateAsyncSelectors(fields: Field[], entityType: string): string {
    const asyncSelectors = fields
      .filter(field => field.as === "VcSelect")
      .map(field => {
        // Generate function name from field key (e.g., productId -> fetchProducts)
        const fieldName = field.key;
        const functionName = this.generateAsyncSelectorName(fieldName);
        const loadingName = `${functionName}Loading`;
        const resultType = this.generateSelectorResultType(fieldName);

        return `  const ${loadingName} = ref(false);

  async function ${functionName}(
    keyword?: string,
    skip?: number,
    ids?: string[]
  ): Promise<{ results: ${resultType}[]; totalCount: number }> {
    ${loadingName}.value = true;

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Mock data
      const allItems: ${resultType}[] = [
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
        { id: "3", name: "Item 3" },
      ];

      let filtered = allItems;

      // Filter by keyword
      if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        filtered = filtered.filter(item =>
          item.name?.toLowerCase().includes(lowerKeyword)
        );
      }

      // Filter by ids if provided
      if (ids && ids.length > 0) {
        filtered = filtered.filter(item => ids.includes(item.id));
      }

      // Apply pagination
      const skipValue = skip || 0;
      const takeValue = 20;
      const results = filtered.slice(skipValue, skipValue + takeValue);

      return {
        results,
        totalCount: filtered.length,
      };
    } finally {
      ${loadingName}.value = false;
    }
  }`;
      });

    return asyncSelectors.join("\n\n");
  }

  /**
   * Generate return statements for async selectors
   */
  private generateAsyncSelectorsReturn(fields: Field[]): string {
    const returns = fields
      .filter(field => field.as === "VcSelect")
      .map(field => {
        const functionName = this.generateAsyncSelectorName(field.key);
        const loadingName = `${functionName}Loading`;
        return `    ${functionName},
    ${loadingName}: computed(() => ${loadingName}.value),`;
      });

    return returns.length > 0 ? "\n" + returns.join("\n") : "";
  }

  /**
   * Generate async selector function name from field key
   * productId -> fetchProducts
   * parentId -> fetchParents
   */
  private generateAsyncSelectorName(fieldKey: string): string {
    // Remove "Id" suffix if present
    const baseName = fieldKey.replace(/Id$/, "");
    // Convert to plural and camelCase
    const plural = this.pluralize(baseName);
    return `fetch${this.capitalizeFirst(plural)}`;
  }

  /**
   * Generate result type for selector
   */
  private generateSelectorResultType(fieldKey: string): string {
    const baseName = fieldKey.replace(/Id$/, "");
    const plural = this.pluralize(baseName);
    return this.capitalizeFirst(plural.slice(0, -1)); // Remove 's' and capitalize
  }

  /**
   * Simple pluralization (basic implementation)
   */
  private pluralize(word: string): string {
    if (word.endsWith("y")) {
      return word.slice(0, -1) + "ies";
    } else if (word.endsWith("s") || word.endsWith("x") || word.endsWith("z")) {
      return word + "es";
    } else {
      return word + "s";
    }
  }

  /**
   * Capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

