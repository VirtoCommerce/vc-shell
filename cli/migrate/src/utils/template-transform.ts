/**
 * String-based template attribute removal utility.
 * Removes specific attributes from Vue template tags without full AST parsing.
 */

/**
 * Remove a list of attribute patterns from a specific tag in a template string.
 * Each pattern is matched as a regex against attributes on the given tag.
 */
export function removeAttributesFromTag(template: string, tagName: string, attributePatterns: RegExp[]): string {
  // Find the opening tag (handles multi-line)
  const tagRegex = new RegExp(`(<${tagName}\\b)([^>]*?)(\\s*/?>)`, "gs");

  return template.replace(tagRegex, (match, open, attrs, close) => {
    let cleaned = attrs as string;
    for (const pattern of attributePatterns) {
      cleaned = cleaned.replace(pattern, "");
    }
    // Collapse multiple spaces/newlines into single space within attributes
    cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
    if (cleaned) cleaned = " " + cleaned;
    return `${open}${cleaned}${close}`;
  });
}

/**
 * Remove blade boilerplate attributes from <VcBlade> in a template string.
 */
export function removeBladeBoilerplateFromTemplate(template: string): string {
  const patterns = [
    /:expanded="expanded"/g,
    /:closable="closable"/g,
    /@close="\$emit\('close:blade'\)"/g,
    /@expand="\$emit\('expand:blade'\)"/g,
    /@collapse="\$emit\('collapse:blade'\)"/g,
  ];

  return removeAttributesFromTag(template, "VcBlade", patterns);
}
