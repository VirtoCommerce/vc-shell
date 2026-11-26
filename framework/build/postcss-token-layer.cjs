/**
 * Puts vc-shell's design token declarations in the `vc-shell` cascade layer.
 *
 * A token rule is one whose selectors are all `:root`, optionally with attributes
 * (`:root[data-theme="dark"]`), and whose declarations are all custom properties. An app's
 * own, unlayered `:root { --token: ... }` then wins whatever order the stylesheets load in,
 * so it needs no `:root:root` or `!important`. Inside the layer the framework's rules keep
 * their usual order and specificity, so the dark theme still overrides the defaults.
 */
const ROOT_ONLY = /^:root(\[[^\]]+\])*$/;

function isTokenRule(rule) {
  if (rule.parent?.type === "atrule") return false;
  if (!rule.selectors.every((s) => ROOT_ONLY.test(s.trim()))) return false;
  let hasDecl = false;
  for (const node of rule.nodes) {
    if (node.type === "comment") continue;
    if (node.type !== "decl" || !node.prop.startsWith("--")) return false;
    hasDecl = true;
  }
  return hasDecl;
}

module.exports = () => ({
  postcssPlugin: "vc-shell-token-layer",
  OnceExit(root, { AtRule }) {
    root.walkRules((rule) => {
      if (!isTokenRule(rule)) return;
      const layer = new AtRule({ name: "layer", params: "vc-shell" });
      rule.replaceWith(layer);
      layer.append(rule);
    });
  },
});
module.exports.postcss = true;
