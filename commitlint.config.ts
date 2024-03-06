import type { UserConfig } from "@commitlint/types";
import { RuleConfigSeverity } from "@commitlint/types";

const Configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: "conventional-changelog-angular",
  formatter: "@commitlint/format",
  rules: {
    "subject-case": [2, "never", ["upper-case", "pascal-case", "start-case"]],
    "footer-max-line-length": [RuleConfigSeverity.Error, "always", 200] as const,
  },
  // ...
};

export default Configuration;
