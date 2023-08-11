export const kebabToCamel = (str: string) => str.replace(/-./g, (x) => x[1].toUpperCase());

export function kebabToPascal(str: string) {
  const camelCase = kebabToCamel(str);
  const pascalCase = camelCase[0].toUpperCase() + camelCase.substr(1);
  return pascalCase;
}
