import type { UserConfig } from "@commitlint/types";
import { RuleConfigSeverity } from "@commitlint/types";

const Configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: "conventional-changelog-angular",
  formatter: "@commitlint/format",
  rules: {
    "subject-case": [2, "never", ["upper-case", "pascal-case", "start-case"]],
    "footer-max-line-length": [RuleConfigSeverity.Error, "always", 200] as const,
    "body-max-line-length": [RuleConfigSeverity.Error, "always", 400] as const,
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "release", // Added for Lerna releases
        "revert",
        "style",
        "test",
      ],
    ],
  },
  // ...
};

export default Configuration;
