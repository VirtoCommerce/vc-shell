const isPrerelease =
  !!process.env.PRERELEASE_CHANNEL && process.env.PRERELEASE_CHANNEL !== "none";

/** @type {import("release-it").Config} */
module.exports = {
  git: {
    requireCleanWorkingDir: true,
    requireBranch: ["main"],
    requireUpstream: true,
    requireCommits: true,
    tagName: "v${version}",
    commitMessage: "release: v${version}",
    tagAnnotation: "v${version}",
  },
  npm: {
    publish: false,
  },
  github: {
    release: false,
  },
  plugins: {
    "@release-it/conventional-changelog": {
      preset: { name: "angular" },
      ...(isPrerelease
        ? {}
        : {
            infile: "CHANGELOG.md",
            header: "# Changelog",
          }),
    },
  },
  hooks: {
    "before:release": "tsx scripts/release-hooks.ts before-release ${version}",
    "after:bump":
      "tsx scripts/release-hooks.ts after-bump ${version} && yarn install",
    "before:stage": isPrerelease
      ? "git add cli/ configs/ packages/ framework/package.json apps/ yarn.lock"
      : "git add cli/ configs/ packages/ framework/package.json apps/ CHANGELOG.md yarn.lock",
  },
};
