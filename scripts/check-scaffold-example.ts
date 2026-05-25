import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const scaffoldRoot = join(root, "examples/scaffold");
const generatorTemplateRoot = join(root, "cli/create-vc-app/src/templates/module");

const requiredFiles = [
  "README.md",
  "package.json",
  "tsconfig.json",
  "src/env.d.ts",
  "src/modules/orders/index.ts",
  "src/modules/orders/pages/index.ts",
  "src/modules/orders/pages/orders-list.vue",
  "src/modules/orders/pages/order-details.vue",
  "src/modules/orders/composables/index.ts",
  "src/modules/orders/composables/useOrdersList.ts",
  "src/modules/orders/composables/useOrderDetails.ts",
  "src/modules/orders/locales/index.ts",
  "src/modules/orders/locales/en.json",
];

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

for (const file of requiredFiles) {
  assert(existsSync(join(scaffoldRoot, file)), `examples/scaffold is missing ${file}`);
}

assert(
  existsSync(join(generatorTemplateRoot, "index.ts.ejs")),
  "create-vc-app module template is missing index.ts.ejs",
);
assert(
  existsSync(join(generatorTemplateRoot, "pages/list.vue.ejs")),
  "create-vc-app module template is missing pages/list.vue.ejs",
);
assert(
  existsSync(join(generatorTemplateRoot, "pages/details.vue.ejs")),
  "create-vc-app module template is missing pages/details.vue.ejs",
);

const moduleIndex = read("examples/scaffold/src/modules/orders/index.ts");
const listBlade = read("examples/scaffold/src/modules/orders/pages/orders-list.vue");
const detailsBlade = read("examples/scaffold/src/modules/orders/pages/order-details.vue");

assert(moduleIndex.includes("defineAppModule"), "orders module must use defineAppModule");
assert(
  moduleIndex.includes("blades") && moduleIndex.includes("locales"),
  "orders module must register blades and locales",
);
assert(listBlade.includes("defineBlade({"), "orders list page must use defineBlade");
assert(detailsBlade.includes("defineBlade({"), "orders details page must use defineBlade");
assert(!listBlade.includes("defineOptions({"), "orders list page must not use defineOptions for blade metadata");
assert(!detailsBlade.includes("defineOptions({"), "orders details page must not use defineOptions for blade metadata");
assert(listBlade.includes("isWorkspace: true"), "orders list page must remain the workspace blade example");
assert(listBlade.includes("menuItem:"), "orders list page must show menu item registration");
assert(
  detailsBlade.includes('name: "OrderDetails"') && !detailsBlade.includes("isWorkspace: true"),
  "orders details page must remain a child blade example",
);

console.log("examples/scaffold matches the expected module scaffold contracts.");
